"use client";

import { useEffect, useRef, useState } from "react";
import { useHUDStore } from "../store/hudStore";

// ═══════════════════════════════════════════════════════════
//  SPARK PARTICLE FIELD
//  Persistent ember/spark + floating micro-gear particles
//  Uses requestAnimationFrame canvas for performance
//  Pauses when offscreen via IntersectionObserver
// ═══════════════════════════════════════════════════════════

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  baseVx: number; baseVy: number; // calm-state velocities — scaled by multiplier each frame
  size: number;
  life: number; maxLife: number;
  type: "ember" | "spark" | "gear";
  rotation: number; rotSpeed: number;
  color: string;
}

const EMBER_COLORS = ["#e62e2d", "#ff5a1f", "#f59e0b", "#ff8c00", "#ff4500"];
const SPARK_COLORS = ["#fff", "#ffeedd", "#ffcc88", "#ffaa44"];
const MAGMA_EMBER_COLORS = ["#ff3b30", "#ff5a1f", "#ff0000", "#cc0000", "#ff2a00"];
const MAGMA_SPARK_COLORS = ["#fff", "#ffddcc", "#ffbb99", "#ff9966"];

function drawGear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, teeth: number, rot: number, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgba(230, 46, 45, ${alpha * 0.4})`;
  ctx.lineWidth = 0.8;

  // Outer gear
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const outerR = i % 2 === 0 ? r : r * 0.75;
    const px = Math.cos(angle) * outerR;
    const py = Math.sin(angle) * outerR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner hole
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

interface Props {
  density?: number; // 0-1 base density
}

export default function SparkParticleField({ density = 0.6 }: Props) {
  const { telemetry } = useHUDStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const visibleRef = useRef(true);
  const [mounted, setMounted] = useState(false);

  // Smooth target for max particles so it ramps up 10x
  const targetMultiplier = useRef(1);

  useEffect(() => { setMounted(true); }, []);

  // Update target multiplier based on telemetry
  useEffect(() => {
    targetMultiplier.current = telemetry === "CHAOTIC" ? 10 : 1;
  }, [telemetry]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = document.documentElement.scrollHeight;

    const resize = () => {
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    // Recalculate height periodically (page content can change)
    const heightInterval = setInterval(() => {
      const newH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      if (Math.abs(newH - height) > 100) {
        height = newH;
        canvas.height = height;
      }
    }, 2000);

    const baseMaxParticles = Math.floor(80 * density);
    const particles = particlesRef.current;
    let currentMultiplier = 1;

    function spawn(maxAllowed: number) {
      if (particles.length >= maxAllowed) return;

      // Palette flips to magma when chaotic, but speed is always stored calm — scaled live in animate
      const isChaotic = currentMultiplier > 2;
      const r = Math.random();
      const type = r < 0.05 ? "gear" : r < (isChaotic ? 0.65 : 0.3) ? "spark" : "ember";

      // Calm-state base velocities — multiplied by speedScale each frame
      const baseVx = (Math.random() - 0.5) * 0.4;
      const baseVy = -(0.15 + Math.random() * 0.45);

      const p: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        size: type === "gear" ? 8 + Math.random() * 14 : type === "spark" ? 1 + Math.random() * 2.5 : 1.5 + Math.random() * 3.5,
        life: 0,
        maxLife: type === "gear" ? 400 + Math.random() * 600 : 70 + Math.random() * 160,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: type === "gear" ? (isChaotic ? "#ff4400" : "#e62e2d")
             : type === "spark" ? (isChaotic ? MAGMA_SPARK_COLORS : SPARK_COLORS)[Math.floor(Math.random() * (isChaotic ? MAGMA_SPARK_COLORS : SPARK_COLORS).length)]
             : (isChaotic ? MAGMA_EMBER_COLORS : EMBER_COLORS)[Math.floor(Math.random() * (isChaotic ? MAGMA_EMBER_COLORS : EMBER_COLORS).length)],
      };
      particles.push(p);
    }

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!visibleRef.current || !ctx) return;

      // Ramp up fast on chaos, drain slower on return — particles decelerate live
      if (currentMultiplier < targetMultiplier.current) {
        currentMultiplier = Math.min(currentMultiplier + 0.35, targetMultiplier.current);
      } else if (currentMultiplier > targetMultiplier.current) {
        currentMultiplier = Math.max(currentMultiplier - 0.015, targetMultiplier.current);
      }

      ctx.clearRect(0, 0, width, height);

      const dynamicMax = Math.floor(baseMaxParticles * currentMultiplier);

      // When multiplier is draining back, let particles die naturally — don't force-kill
      const spawnRate = currentMultiplier > 2 ? 10 : 2;
      for (let i = 0; i < spawnRate; i++) spawn(dynamicMax);

      // Speed scale: calm=1x, full chaos=4x horizontally / 6x vertically for dramatic streaks
      const speedScale = Math.max(1, currentMultiplier * 0.6);

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply live speed — existing particles accelerate/decelerate with the multiplier
        p.vx = p.baseVx * speedScale + (Math.random() - 0.5) * 0.02 * speedScale;
        p.vy = p.baseVy * speedScale;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.rotation += p.rotSpeed * Math.max(1, speedScale * 0.5);

        const progress = p.life / p.maxLife;
        if (progress >= 1 || p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = progress < 0.1 ? progress / 0.1
                    : progress > 0.7 ? (1 - progress) / 0.3
                    : 1;

        if (p.type === "gear") {
          drawGear(ctx, p.x, p.y, p.size, 6 + Math.floor(p.size / 4), p.rotation, alpha * 0.15);
        } else if (p.type === "spark") {
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = targetMultiplier.current > 2 ? 8 : 4; // Glow more when chaotic
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Ember
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = targetMultiplier.current > 2 ? 15 : 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
    }
    animate();

    // IntersectionObserver to pause when tab not visible
    const onVisChange = () => { visibleRef.current = !document.hidden; };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisChange);
      clearInterval(heightInterval);
    };
  }, [mounted, density]);

  if (!mounted) return null;

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
