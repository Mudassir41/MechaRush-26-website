"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Zap, AlertTriangle, ShieldCheck, Trophy, Heart, Sparkles, Activity } from "lucide-react";
import Leaderboard from "./Leaderboard";

// Particle system for the Forge Game
function spawnParticles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isPerfect: boolean,
  particleRef: React.MutableRefObject<any[]>,
  isConfetti: boolean = false
) {
  const count = isConfetti ? 150 : (isPerfect ? 40 : 15);
  const colors = isConfetti 
    ? ["#f59e0b", "#fbbf24", "#ffffff", "#e62e2d", "#10b981", "#3b82f6"] // Golden/Confetti mix
    : isPerfect 
      ? ["#10b981", "#34d399", "#ffffff", "#059669"] // Emeralds/White
      : ["#e62e2d", "#ff5a1f", "#f59e0b", "#ff4500"]; // Forge Reds/Oranges

  for (let i = 0; i < count; i++) {
    const angle = isConfetti ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
    const speed = isConfetti ? (Math.random() * 12 + 4) : ((Math.random() * (isPerfect ? 8 : 4)) + 2);
    particleRef.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isPerfect || isConfetti ? 3 : 0),
      life: 1,
      decay: isConfetti ? (Math.random() * 0.015 + 0.01) : (Math.random() * 0.05 + 0.02),
      size: isConfetti ? Math.random() * 5 + 2 : Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

// Mock Global Stats
const GLOBAL_PLAYS = 14208;

export default function InteractiveForgeGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [lastHit, setLastHit] = useState<"perfect" | "miss" | "milestone" | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<any[]>([]);
  
  // Game metrics
  const angleRef = useRef(-Math.PI);
  const directionRef = useRef(1);
  const speedRef = useRef(0.04);
  const targetAngleReF = useRef(-Math.PI / 2); // Top center
  const targetWidthRef = useRef(0.3); // Tolerance in radians
  const rafRef = useRef<number>(0);

  // Load High Score on Mount
  useEffect(() => {
    const saved = localStorage.getItem("mecharush_forge_hs");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Resize
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        // High DPI support, capped for mobile performance
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = parent.clientWidth * ratio;
        canvas.height = 300 * ratio;
        ctx.scale(ratio, ratio);
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `300px`;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 1.5));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 1.5));
      const cx = w / 2;
      const cy = h - 40;
      const radius = Math.min(w * 0.4, 200);

      // Dark background
      ctx.fillStyle = "#06080c";
      ctx.fillRect(0, 0, w, h);

      // Draw Grid overlay
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for(let i=0; i<w; i+=20) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
      for(let i=0; i<h; i+=20) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

      if (gameState === "playing") {
        // Update physics
        angleRef.current += speedRef.current * directionRef.current;
        if (angleRef.current >= 0) {
          angleRef.current = 0;
          directionRef.current = -1;
        } else if (angleRef.current <= -Math.PI) {
          angleRef.current = -Math.PI;
          directionRef.current = 1;
        }
      }

      // 1. Draw Gauge Arc (Background)
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI, 0);
      ctx.lineWidth = 15;
      ctx.strokeStyle = "rgba(255,40,40,0.1)";
      ctx.stroke();

      // 2. Draw Target Zone (Green/Gold)
      const tStart = targetAngleReF.current - targetWidthRef.current;
      const tEnd = targetAngleReF.current + targetWidthRef.current;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, tStart, tEnd);
      ctx.lineWidth = 15;
      const targetColor = (streak >= 5 && streak < 10) ? "#f59e0b" : (streak >= 10 ? "#3b82f6" : "#10b981");
      ctx.strokeStyle = targetColor;
      // ShadowBlur is extremely expensive on phones. Faux glow:
      if (streak >= 5) {
         ctx.save();
         ctx.lineWidth = 25;
         ctx.strokeStyle = `${targetColor}40`;
         ctx.stroke();
         ctx.restore();
      }
      ctx.stroke();

      // 3. Draw Needle
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const nx = cx + Math.cos(angleRef.current) * (radius - 5);
      const ny = cy + Math.sin(angleRef.current) * (radius - 5);
      ctx.lineTo(nx, ny);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      // Faux needle glow
      ctx.save();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.stroke();
      ctx.restore();
      ctx.stroke();

      // 4. Draw Center Hub
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#0c1016";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#e62e2d";
      ctx.stroke();

      // 5. Update & Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // Skip particle shadowBlur completely to boost framerate
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameState, streak]);

  // Handle User Interaction
  const handleLock = () => {
    if (gameState !== "playing") return;

    // Check hit
    const dist = Math.abs(angleRef.current - targetAngleReF.current);
    const w = canvasRef.current?.clientWidth || window.innerWidth;
    const px = w / 2 + Math.cos(angleRef.current) * (Math.min(w * 0.4, 200));
    const py = 300 - 40 + Math.sin(angleRef.current) * (Math.min(w * 0.4, 200));
    const cx = w / 2;
    const cy = 300 - 40;
    const ctx = canvasRef.current?.getContext("2d");

    if (dist <= targetWidthRef.current) {
      // Perfect Hit!
      const newStreak = streak + 1;
      const isMilestone = newStreak % 5 === 0; // Every 5 hits is a milestone
      
      const points = 100 * multiplier + (isMilestone ? 500 : 0);
      setScore(s => s + points);
      setStreak(newStreak);
      setMultiplier(m => Math.min(m + 0.5, 10.0)); // Max 10x multiplier
      setLastHit(isMilestone ? "milestone" : "perfect");
      
      // Speed up slightly and randomize target
      speedRef.current = Math.min(speedRef.current + 0.006, 0.15); // Faster max speed
      targetWidthRef.current = Math.max(targetWidthRef.current - 0.015, 0.08); // Shrink target tighter
      targetAngleReF.current = -Math.PI * 0.9 + Math.random() * (Math.PI * 0.8);

      if (ctx) {
         if (isMilestone) {
            // Massive confetti explosion from center
            spawnParticles(ctx, cx, cy, true, particlesRef, true);
         } else {
            spawnParticles(ctx, px, py, true, particlesRef, false);
         }
      }

      // Screen shake
      if (containerRef.current) {
        containerRef.current.animate([
          { transform: 'translate(0, 0)' },
          { transform: `translate(-${isMilestone ? 10 : 5}px, ${isMilestone ? 10 : 5}px)` },
          { transform: `translate(${isMilestone ? 10 : 5}px, -${isMilestone ? 10 : 5}px)` },
          { transform: 'translate(0, 0)' }
        ], { duration: isMilestone ? 250 : 150 });
      }

    } else {
      // Miss!
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      setMultiplier(1);
      setLastHit("miss");
      speedRef.current = Math.max(speedRef.current - 0.01, 0.03); // Slow down slightly
      
      if (ctx) spawnParticles(ctx, px, py, false, particlesRef);
      
      if (containerRef.current) {
        containerRef.current.animate([
          { transform: 'translate(0, 0)' },
          { transform: 'translate(-10px, 0)' },
          { transform: 'translate(10px, 0)' },
          { transform: 'translate(0, 0)' }
        ], { duration: 250 });
      }

      // Game Over check
      if (newLives <= 0) {
        setTimeout(() => {
           setGameState("gameover");
           if (score > highScore) {
              setHighScore(score);
              localStorage.setItem("mecharush_forge_hs", score.toString());
           }
        }, 300);
      }
    }
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setLives(3);
    setLastHit(null);
    speedRef.current = 0.03;
    targetWidthRef.current = 0.3;
    targetAngleReF.current = -Math.PI / 2;
    particlesRef.current = [];
  };

  return (
    <section className="relative w-full py-20 overflow-hidden" style={{ background: "#06080c" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e62e2d]/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6" ref={containerRef}>
        
        {/* Header Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3 text-[#e62e2d]/50">
            <div className="w-10 h-px bg-[#e62e2d]/30" />
            ARCADE OVERRIDE
            <div className="w-10 h-px bg-[#e62e2d]/30" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
            Reactor <span className="text-[#e62e2d]">Calibration</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto mb-2">
            Test your reflexes. Lock the pressure needle in the green zone to calibrate the main forge reactor. Missing the zone destabilizes identical cores.
          </p>
        </div>

        {/* Global Stats / Leaderboard preview (when idle) */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Trophy size={16} className="text-[#f59e0b]" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Global Best: 24,500</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Activity size={16} className="text-[#3b82f6]" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{GLOBAL_PLAYS.toLocaleString()} Calibrations</span>
           </div>
           {highScore > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#e62e2d]/10 border border-[#e62e2d]/30 rounded-full">
                 <Target size={16} className="text-[#e62e2d]" />
                 <span className="text-xs font-bold text-[#e62e2d] uppercase tracking-widest">Your Best: {highScore.toLocaleString()}</span>
              </div>
           )}
        </div>

        {/* Game Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10"
             style={{ background: "#0c1016" }}>
          
          {/* Top HUD */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start z-10 pointer-events-none">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Power Core Score</span>
              <span className="text-3xl font-black font-mono text-white tracking-tight">{score.toLocaleString()}</span>
              {/* Lives Display */}
              <div className="flex gap-1 mt-1">
                 {[1, 2, 3].map((l) => (
                    <div key={l} className={`transition-all duration-300 ${l <= lives ? 'text-[#e62e2d] drop-shadow-[0_0_5px_rgba(230,46,45,0.8)]' : 'text-white/10 scale-75'}`}>
                       <Heart size={18} fill={l <= lives ? "currentColor" : "none"} />
                    </div>
                 ))}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">Multiplier</span>
              <span className={`text-xl font-black font-mono transition-colors duration-300 ${multiplier >= 5 ? 'text-[#3b82f6]' : multiplier > 2 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                {multiplier.toFixed(1)}x
              </span>
              <span className="text-[10px] font-bold text-white/30 uppercase mt-1">Streak: {streak}</span>
            </div>
          </div>

          {/* Central Notification/Hit Text */}
          <AnimatePresence>
            {lastHit && gameState === "playing" && (
              <motion.div
                key={Date.now() + Math.random()}
                initial={{ opacity: 0, scale: 0.5, y: -20, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-[35%] left-1/2 z-20 pointer-events-none flex flex-col items-center"
              >
                {lastHit === "milestone" ? (
                  <>
                    <Sparkles size={40} className="text-[#f59e0b] mb-1 animate-pulse" />
                    <span className="text-3xl font-black tracking-widest uppercase text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                      OVERDRIVE!
                    </span>
                    <span className="text-sm font-bold uppercase text-white mt-1 bg-black/80 px-3 py-1 rounded-full border border-[#f59e0b]/50">
                      {streak}x COMBO BONUS
                    </span>
                  </>
                ) : lastHit === "perfect" ? (
                  <>
                    <ShieldCheck size={32} className="text-[#10b981] mb-1" />
                    <span className="text-xl font-black tracking-widest uppercase text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      LOCKED
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={32} className="text-[#e62e2d] mb-1" />
                    <span className="text-xl font-black tracking-widest uppercase text-[#e62e2d] drop-shadow-[0_0_10px_rgba(230,46,45,0.5)]">
                      CORE DESTABILIZED
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <canvas ref={canvasRef} className="w-full block cursor-crosshair" onClick={handleLock} />

          {/* Underlays / Start Screen */}
          <AnimatePresence>
            {gameState === "idle" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#e62e2d]/20 border border-[#e62e2d]/50 flex items-center justify-center mb-6 text-[#e62e2d]">
                  <Zap size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase text-white mb-2">Initialize Reactor</h3>
                <p className="text-white/50 text-sm mb-6 text-center max-w-xs">
                  Tap or click when the needle hits the colored bracket. Miss 3 times and the reactor fails.
                </p>
                <button 
                  onClick={startGame}
                  className="px-8 py-3 bg-[#e62e2d] text-white font-bold tracking-widest uppercase rounded-lg hover:scale-105 transition-transform active:scale-95"
                >
                  Start Sequence
                </button>
              </motion.div>
            )}

            {gameState === "gameover" && (
               <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center"
             >
               <h3 className="text-4xl font-black uppercase text-[#e62e2d] mb-2 drop-shadow-[0_0_15px_rgba(230,46,45,0.5)]">Reactor Failed</h3>
               
               <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-sm mb-6 mt-4">
                  <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Final Score</div>
                  <div className="text-5xl font-mono font-black text-white mb-2">{score.toLocaleString()}</div>
                  {score >= highScore && score > 0 && (
                     <div className="inline-block bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase animate-pulse">
                        New High Score!
                     </div>
                  )}
               </div>

               <button 
                 onClick={startGame}
                 className="px-8 py-3 bg-white text-black font-black tracking-widest uppercase rounded-lg hover:bg-gray-200 transition-colors active:scale-95 w-full max-w-sm"
               >
                 Recalibrate (Retry)
               </button>
             </motion.div>
            )}
          </AnimatePresence>
          
          {/* Bottom Control Bar */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
            {gameState === "playing" && (
               <button 
                 onClick={handleLock}
                 className="pointer-events-auto px-10 py-4 rounded-full font-black text-lg tracking-widest uppercase text-white transition-transform active:scale-90 border border-white/30"
                 style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))", backdropFilter: "blur(10px)" }}
               >
                 <span className="flex items-center gap-2"><Target size={22} /> LOCK</span>
               </button>
            )}
          </div>

        </div>

        {/* Leaderboard Section */}
        <div className="mt-12">
          <Leaderboard 
            gameKey="reactor_calibration" 
            title="Reactor Hall of Fame"
            currentScore={gameState === "gameover" ? score : undefined}
          />
        </div>

      </div>
    </section>
  );
}
