"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase =
  | "idle"        // waiting for user
  | "pressurizing" // button pressed, fuel pumps start
  | "spooling"    // turbine rising
  | "launching"   // flash + transition
  | "done";       // gone

const TOTAL_CRANK_MS = 3200;

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    nodesRef.current.forEach((n) => {
      try { (n as OscillatorNode).stop?.(); } catch { /* ok */ }
    });
    nodesRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const playIgnition = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    // Custom Ignition Audio from WhatsApp
    const ignitionAudio = new Audio("/assets/ignition_sequence.mpeg");
    ignitionAudio.play().catch(e => console.log("Audio play blocked", e));
    audioRef.current = ignitionAudio;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0, now);
    master.gain.linearRampToValueAtTime(0.85, now + 0.3);
    master.gain.linearRampToValueAtTime(0.5,  now + 2.0);
    master.gain.linearRampToValueAtTime(1.0,  now + 3.0);
    master.connect(ctx.destination);

    // Turbine high-pitch spool whine
    const turbine = ctx.createOscillator();
    const turbineGain = ctx.createGain();
    turbine.type = "sine";
    // Sweep from low whine to extremely high pitch
    turbine.frequency.setValueAtTime(200, now);
    turbine.frequency.exponentialRampToValueAtTime(4500, now + TOTAL_CRANK_MS / 1000);
    turbineGain.gain.setValueAtTime(0.0, now);
    turbineGain.gain.linearRampToValueAtTime(0.15, now + 1.0);
    turbineGain.gain.linearRampToValueAtTime(0.4, now + TOTAL_CRANK_MS / 1000);
    turbine.connect(turbineGain);
    turbineGain.connect(master);
    turbine.start(now);
    turbine.stop(now + TOTAL_CRANK_MS / 1000 + 0.5);
    nodesRef.current.push(turbine);

    // Pressurized fluid/gas hiss
    const bufSize = Math.floor(ctx.sampleRate * (TOTAL_CRANK_MS / 1000));
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
    const hissSrc = ctx.createBufferSource();
    const hissFlt = ctx.createBiquadFilter();
    const hissGain = ctx.createGain();
    hissSrc.buffer = buf;
    hissFlt.type = "highpass";
    hissFlt.frequency.value = 2000;
    // Hiss starts quiet, gets loud as pressure builds
    hissGain.gain.setValueAtTime(0, now);
    hissGain.gain.linearRampToValueAtTime(0.3, now + TOTAL_CRANK_MS / 1000);
    hissSrc.connect(hissFlt);
    hissFlt.connect(hissGain);
    hissGain.connect(master);
    hissSrc.start(now);
    nodesRef.current.push(hissSrc);

    // Rumble sub (the heavy rocket booster shaking)
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(30, now);
    rumble.frequency.linearRampToValueAtTime(65, now + TOTAL_CRANK_MS / 1000);
    rumbleGain.gain.setValueAtTime(0.2, now);
    rumbleGain.gain.linearRampToValueAtTime(0.8, now + TOTAL_CRANK_MS / 1000);
    rumble.connect(rumbleGain);
    rumbleGain.connect(master);
    rumble.start(now);
    rumble.stop(now + TOTAL_CRANK_MS / 1000 + 0.5);
    nodesRef.current.push(rumble);

    // Main Engine Ignition Roar burst at end
    const roar = ctx.createOscillator();
    const roarGain = ctx.createGain();
    roar.type = "sawtooth";
    roar.frequency.setValueAtTime(150, now + TOTAL_CRANK_MS / 1000 - 0.2);
    roar.frequency.exponentialRampToValueAtTime(600, now + TOTAL_CRANK_MS / 1000 + 0.6);
    roarGain.gain.setValueAtTime(0.0, now + TOTAL_CRANK_MS / 1000 - 0.2);
    roarGain.gain.linearRampToValueAtTime(1.0, now + TOTAL_CRANK_MS / 1000 + 0.1);
    roarGain.gain.linearRampToValueAtTime(0.0, now + TOTAL_CRANK_MS / 1000 + 0.8);
    roar.connect(roarGain);
    roarGain.connect(master);
    roar.start(now + TOTAL_CRANK_MS / 1000 - 0.2);
    roar.stop(now + TOTAL_CRANK_MS / 1000 + 1.0);
    nodesRef.current.push(roar);

    return ctx;
  }, []);

  return { playIgnition, cleanup };
}

export default function IgnitionScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [thrust, setThrust] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { playIgnition, cleanup } = useAudioEngine();
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Animated log lines for the cockpit HUD
  const LOG_SEQUENCE = [
    { t: 100,  msg: "SYS: Initializing Orbital Forge-Drive™ v26.4.7..." },
    { t: 450,  msg: "SYS: Pressurizing fuel manifolds..." },
    { t: 800,  msg: "SYS: Turbine spool-up confirmed..." },
    { t: 1200, msg: "SYS: Ignition sequence engaged..." },
    { t: 1700, msg: "WARN: Core thermal output nominal at 4200°C" },
    { t: 2200, msg: "SYS: Thrust threshold approaching..." },
    { t: 2700, msg: "SYS: All systems GREEN — LAUNCHING" },
  ];

  const handleIgnite = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("pressurizing");
    playIgnition();

    startRef.current = performance.now();

    // Schedule log messages
    LOG_SEQUENCE.forEach(({ t, msg }) => {
      setTimeout(() => setLogs((prev) => [...prev, msg]), t);
    });

    // Animate Thrust %
    const animThrust = (now: number) => {
      const elapsed = Math.max(0, now - startRef.current);
      const progress = Math.min(elapsed / TOTAL_CRANK_MS, 1);
      // Ease-in curve so it feels like a real engine spooling
      const eased = Math.pow(progress, 0.6);
      setThrust(Math.min(Math.round(eased * 105), 100)); // Peaks at 100%

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animThrust);
      } else {
        setThrust(100);
        setPhase("spooling");
        setTimeout(() => setPhase("launching"), 400);
        setTimeout(() => { cleanup(); onComplete(); }, 1300);
      }
    };
    rafRef.current = requestAnimationFrame(animThrust);
  }, [phase, playIgnition, cleanup, onComplete]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanup();
    };
  }, [cleanup]);

  // Thrust gauge arc path
  const GAUGE_R = 88;
  const GAUGE_CX = 100;
  const GAUGE_CY = 100;
  const START_ANGLE = 135;
  const END_ANGLE   = 405;
  const TOTAL_ARC   = END_ANGLE - START_ANGLE;
  const thrustFraction = thrust / 100;
  const currentArcDeg = thrustFraction * TOTAL_ARC;

  function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const s = polarToXY(cx, cy, r, startDeg);
    const e = polarToXY(cx, cy, r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const trackD  = describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, START_ANGLE, END_ANGLE);
  const fillD   = currentArcDeg > 0.5
    ? describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, START_ANGLE, START_ANGLE + currentArcDeg)
    : "";

  const thrustColor = thrust > 85 ? "#ff5a1f" : thrust > 50 ? "#f59e0b" : "#e62e2d";

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="ignition"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeIn" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 60%, #0f0a06 0%, #080a0c 100%)" }}
        >
          {/* Animated scan line */}
          {phase !== "idle" && (
            <div
              className="absolute inset-x-0 h-px z-10 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(230,46,45,0.6), transparent)",
                animation: "scan-line 1.8s linear infinite",
              }}
            />
          )}

          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(230,46,45,1) 1px, transparent 1px), linear-gradient(90deg, rgba(230,46,45,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Corner accents */}
          {["tl", "tr", "bl", "br"].map((pos) => (
            <div
              key={pos}
              className="absolute w-16 h-16 pointer-events-none"
              style={{
                top:    pos.startsWith("t") ? 24 : undefined,
                bottom: pos.startsWith("b") ? 24 : undefined,
                left:   pos.endsWith("l")   ? 24 : undefined,
                right:  pos.endsWith("r")   ? 24 : undefined,
                borderTop:    pos.startsWith("t") ? "2px solid rgba(230,46,45,0.5)" : undefined,
                borderBottom: pos.startsWith("b") ? "2px solid rgba(230,46,45,0.5)" : undefined,
                borderLeft:   pos.endsWith("l")   ? "2px solid rgba(230,46,45,0.5)" : undefined,
                borderRight:  pos.endsWith("r")   ? "2px solid rgba(230,46,45,0.5)" : undefined,
              }}
            />
          ))}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center mb-10"
          >
            <div className="text-xs font-bold tracking-[0.4em] text-[#e62e2d]/60 mb-2 uppercase">
              B.S. Abdur Rahman Crescent Institute
            </div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white" style={{ textShadow: "0 0 40px rgba(230,46,45,0.4)" }}>
              MECHA<span style={{ color: "#e62e2d" }}>RUSH</span> <span className="text-[#e62e2d]/60">'26</span>
            </h1>
            <div className="text-sm text-white/30 mt-2 tracking-widest font-medium uppercase">
              The Ultimate Mechanical Symposium
            </div>
          </motion.div>

          {/* Main cockpit panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12"
          >
            {/* RPM Gauge */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 12px rgba(230,46,45,0.3))" }}>
                {/* Tick marks */}
                {Array.from({ length: 19 }).map((_, i) => {
                  const angle = START_ANGLE + (i / 18) * TOTAL_ARC;
                  const inner = polarToXY(GAUGE_CX, GAUGE_CY, i % 3 === 0 ? 72 : 76, angle);
                  const outer = polarToXY(GAUGE_CX, GAUGE_CY, 82, angle);
                  return (
                    <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                      stroke={i === 15 || i === 16 || i === 17 || i === 18 ? "#ff5a1f" : "rgba(255,255,255,0.15)"}
                      strokeWidth={i % 3 === 0 ? 2 : 1} />
                  );
                })}
                {/* Track */}
                <path d={trackD} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
                {/* Fill */}
                {fillD && (
                  <path d={fillD} fill="none" stroke={thrustColor} strokeWidth="8" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${thrustColor})`, transition: "stroke 0.3s" }} />
                )}
                {/* Needle tip dot */}
                {fillD && (() => {
                  const pt = polarToXY(GAUGE_CX, GAUGE_CY, GAUGE_R, START_ANGLE + currentArcDeg);
                  return <circle cx={pt.x} cy={pt.y} r="4" fill={thrustColor} style={{ filter: `drop-shadow(0 0 6px ${thrustColor})` }} />;
                })()}
                {/* 100% label */}
                <text x="164" y="68" fontSize="5.5" fill="#ff5a1f" opacity="0.7" fontFamily="monospace">MAX</text>
              </svg>
              {/* Center readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <div className="text-4xl font-black tabular-nums tracking-tighter" style={{ color: thrustColor }}>
                  {thrust}
                </div>
                <div className="text-[10px] text-white/40 tracking-widest font-bold uppercase">Thrust %</div>
              </div>
            </div>

            {/* System log terminal */}
            <div className="w-72 sm:w-80 hud-panel rounded-lg p-4 font-mono text-xs space-y-1.5 min-h-[140px]">
              <div className="text-[#e62e2d]/60 text-[10px] tracking-[0.3em] uppercase mb-3 border-b border-[#e62e2d]/15 pb-2">
                FORGE-DRIVE™ SYSTEM LOG
              </div>
              {logs.length === 0 && (
                <div className="text-white/20 animate-pulse">Awaiting ignition command...</div>
              )}
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] leading-relaxed"
                  style={{ color: log.startsWith("WARN") ? "#f59e0b" : log.includes("GREEN") ? "#4ade80" : "rgba(255,255,255,0.55)" }}
                >
                  {log}
                </motion.div>
              ))}
              {phase !== "idle" && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="inline-block w-2 h-3 bg-[#e62e2d] ml-0.5"
                />
              )}
            </div>
          </motion.div>

          {/* Ignite button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12"
          >
            {phase === "idle" ? (
              <button
                onClick={handleIgnite}
                className="btn-ignite px-10 py-5 text-lg rounded-lg tracking-widest sm:px-14"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                INITIATE LAUNCH
              </button>
            ) : phase === "pressurizing" || phase === "spooling" ? (
              <div className="flex items-center gap-3 text-white/50 text-sm tracking-widest uppercase font-bold">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-[#e62e2d] border-t-transparent"
                />
                Spooling up...
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: [0, 1, 0], scale: [1.5, 1, 0.5] }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-black tracking-widest text-white"
                style={{ textShadow: "0 0 40px #fff" }}
              >
                LAUNCH
              </motion.div>
            )}
          </motion.div>

          {/* Flash overlay for launch */}
          <AnimatePresence>
            {phase === "launching" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 z-50 pointer-events-none"
                style={{ background: "white" }}
              />
            )}
          </AnimatePresence>

          {/* Date pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute bottom-8 text-xs text-white/20 tracking-[0.3em] uppercase font-mono"
          >
            April 7, 2026 · Vandalur, Chennai
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
