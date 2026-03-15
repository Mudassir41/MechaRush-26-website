"use client";

import { useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════════════════
//  SPARK PARTICLE FIELD
//  Persistent ember/spark + floating micro-gear particles
//  Uses requestAnimationFrame canvas for performance
//  Pauses when offscreen via IntersectionObserver
// ═══════════════════════════════════════════════════════════

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number; maxLife: number;
  type: "ember" | "spark" | "gear";
  rotation: number; rotSpeed: number;
  color: string;
}

const EMBER_COLORS = ["#e62e2d", "#ff5a1f", "#f59e0b", "#ff8c00", "#ff4500"];
const SPARK_COLORS = ["#fff", "#ffeedd", "#ffcc88", "#ffaa44"];

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
  density?: number; // 0-1, controls particle count
}

export default function SparkParticleField({ density = 0.6 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const visibleRef = useRef(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

    const maxParticles = Math.floor(80 * density);
    const particles = particlesRef.current;

    function spawn() {
      if (particles.length >= maxParticles) return;
      const type = Math.random() < 0.08 ? "gear" : Math.random() < 0.3 ? "spark" : "ember";
      const p: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.2 + Math.random() * 0.6),
        size: type === "gear" ? 8 + Math.random() * 14 : type === "spark" ? 1 + Math.random() * 1.5 : 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: type === "gear" ? 400 + Math.random() * 600 : 60 + Math.random() * 120,
        type,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        color: type === "gear" ? "#e62e2d"
             : type === "spark" ? SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
             : EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
      };
      particles.push(p);
    }

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!visibleRef.current || !ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Spawn
      for (let i = 0; i < 2; i++) spawn();

      // Update & draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.rotation += p.rotSpeed;

        // Add slight sway
        p.vx += (Math.random() - 0.5) * 0.02;

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
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Ember
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
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
