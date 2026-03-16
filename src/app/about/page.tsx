"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Cpu, Activity, Linkedin, Terminal, Radio, Zap, Wifi, Server, Users } from "lucide-react";

// ── Typing text with blinking cursor, no sound ──────────────────────────────
const TypingText = ({ text, delay = 0, speed = 18 }: { text: string; delay?: number; speed?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span>
      {displayText}
      {started && displayText.length < text.length && (
        <span className="animate-pulse text-[#e62e2d]">█</span>
      )}
    </span>
  );
};

// ── Global Scanning Line ─────────────────────────────────────────────
const ScanningLine = () => {
  const [delay, setDelay] = useState(5000);

  useEffect(() => {
    const next = () => setDelay(Math.floor(Math.random() * 8000) + 4000);
    const interval = setInterval(next, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ top: "110%" }}
      animate={{ top: "-10%" }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        repeatDelay: delay / 1000,
        ease: "linear"
      }}
      className="fixed left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e62e2d] to-transparent z-[45] opacity-40 shadow-[0_0_15px_rgba(230,46,45,0.8)] pointer-events-none"
    />
  );
};

// ── Blinking status indicator ────────────────────────────────────────────────
const Blink = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`animate-pulse ${className}`}>{children}</span>
);

// ── Readout tile ─────────────────────────────────────────────────────────────
const Readout = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <div className="relative overflow-hidden border border-[#e62e2d]/20 bg-black/60 p-3 flex flex-col gap-1">
    <span className="text-[9px] tracking-[0.25em] text-white/30 uppercase">{label}</span>
    <span className={`text-sm font-bold ${accent ? "text-[#00ff9d] animate-pulse" : "text-white"}`}>{value}</span>
  </div>
);

export default function AboutControlPanel() {
  const [logLines, setLogLines] = useState([
    { text: "[BOOT] MECHARUSH-26 AXIS CONTROLLER ONLINE", color: "text-white" },
    { text: "[NET] Uplink to crescent.edu ... SECURE", color: "text-[#e62e2d]/60" },
    { text: "[AUTH] Root access verified — guest session", color: "text-[#e62e2d]/60" },
    { text: "[SYS] Loading event protocols into memory ...", color: "text-[#e62e2d]/60" },
    { text: "[SENSOR] Chamber pressure: NOMINAL", color: "text-[#e62e2d]/60" },
    { text: "[AI] Forge-AI VAD engine armed", color: "text-[#00ff9d]" },
    { text: "[WRN] Thermal spike @ sector-4 vents — monitoring", color: "text-yellow-500" },
    { text: "[OK] All streams nominal. Awaiting ignition.", color: "text-[#00ff9d] animate-pulse" },
  ]);

  // Simulate a live log tick
  useEffect(() => {
    const TICKS = [
      "[SYS] Heartbeat: 72 bpm — stable",
      "[NET] Packet loss: 0.0%",
      "[AI] Context window: 8192 tokens",
      "[SENSOR] Gimbal angle: 0.00°",
      "[FUEL] Propellant reserve: 94.3%",
      "[OPT] Compiling shader pack ...",
      "[SYS] GC sweep complete — 0 leaks",
    ];
    const iv = setInterval(() => {
      setLogLines(prev => [
        ...prev.slice(-12),
        { text: TICKS[Math.floor(Math.random() * TICKS.length)], color: "text-[#e62e2d]/50" },
      ]);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#e62e2d] font-mono p-4 sm:p-8 pt-32 sm:pt-40 relative overflow-hidden">

      {/* Global CRT Scanning Line */}
      <ScanningLine />

      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.15]" 
           style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)" }} />

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]" />

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex justify-between items-center border-b border-[#e62e2d]/30 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Terminal size={28} className="text-[#e62e2d]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-white uppercase">
              MISSION CONTROL <span className="text-[#e62e2d]">//</span> ABOUT
            </h1>
            <p className="text-[10px] text-[#e62e2d]/50 tracking-[0.4em] uppercase">
              MechaRush '26 · Apollo Dashboard · BSA Crescent Institute
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 border border-[#e62e2d]/30 text-[#e62e2d] hover:bg-[#e62e2d] hover:text-black transition-all text-xs tracking-widest"
        >
          <ArrowLeft size={14} /> RETURN
        </Link>
      </header>

      {/* ── TELEMETRY BAR ─────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Readout label="ORG" value="Crescent Mech" />
        <Readout label="SCALE" value="National Level" />
        <Readout label="EVENTS" value="11 Verified" />
        <Readout label="DATE" value="APR 07 2026" />
        <Readout label="UPTIME" value="T+00:00:00" accent />
        <Readout label="STATUS" value="● LIVE" accent />
      </div>

      {/* ── MAIN 3-COL GRID ───────────────────────────────────────────────── */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Panel 01 — Mission Briefing (wide) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden border border-[#e62e2d]/40 bg-[#0a0000]/90 p-6"
        >
          <div className="absolute top-0 left-0 bg-[#e62e2d] text-black text-[9px] font-black tracking-[0.3em] px-3 py-0.5 uppercase">
            PANEL 01 // MISSION BRIEFING
          </div>
          <h2 className="text-base text-white mt-5 mb-4 flex items-center gap-3 border-b border-[#e62e2d]/15 pb-3">
            <Radio size={16} className="text-[#e62e2d]" />
            <span className="tracking-widest">MECHARUSH '26 SYMPOSIUM</span>
            <Blink><span className="w-2 h-3 bg-[#e62e2d] inline-block" /></Blink>
          </h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <p className="text-[#e62e2d]/90">
              <TypingText
                text="NATIONAL LEVEL SYMPOSIUM — hosted by the Department of Mechanical Engineering, B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur, Chennai."
                delay={400} speed={14}
              />
            </p>
            <p className="text-[#e62e2d]/70">
              <TypingText
                text="Mission objective: bridge theoretical knowledge and practical engineering. We forge the next generation of technologists through structural design challenges, mechanical demonstrations, and high-stakes technical debates."
                delay={3500} speed={12}
              />
            </p>
            <p className="text-[#e62e2d]/50 text-xs">
              <TypingText
                text="11 Events · 2 Domains · 1 Day · April 07, 2026 · All branches welcome."
                delay={8000} speed={20}
              />
            </p>
          </div>

          {/* Coordinates-style footer */}
          <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-white/20 border-t border-[#e62e2d]/10 pt-3">
            <span>LAT: 12.8691° N</span>
            <span>LNG: 80.0421° E</span>
            <span>ALT: 12m ASL</span>
            <span className="ml-auto text-[#00ff9d]/50">SIGNAL LOCKED</span>
          </div>
        </motion.div>

        {/* Panel 02 — Architecture */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="relative overflow-hidden border border-[#e62e2d]/40 bg-[#0a0000]/90 p-6 flex flex-col gap-5"
        >
          <div className="absolute top-0 right-0 bg-[#e62e2d]/15 text-[#e62e2d] text-[9px] font-black tracking-[0.3em] px-3 py-0.5 uppercase">
            PANEL 02 // ARCHITECTURE
          </div>
          <h2 className="text-base text-white mt-5 flex items-center gap-2 border-b border-[#e62e2d]/15 pb-3">
            <Cpu size={16} className="text-[#e62e2d]" /> SYSTEMS
          </h2>

          {/* Dev */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase mb-2">WEB DEVELOPMENT</p>
            <span className="text-base font-black text-white">MUDASSIR</span>
            <a
              href="https://linkedin.com/in/mohammedmudassirbasha/"
              target="_blank" rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 px-2 py-1 border border-[#e62e2d]/30 bg-[#e62e2d]/5 hover:bg-[#e62e2d] hover:text-black transition-all text-[10px] w-fit group"
            >
              <Linkedin size={12} />
              <span className="font-bold tracking-widest uppercase">Connectivity Matrix</span>
            </a>
          </div>

          {/* Coordinators */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase mb-2">EVENT COORDINATORS</p>
            <div className="space-y-1">
              {[
                { name: "Sathick. A.S", role: "Technical Head" },
                { name: "Mudassir", role: "Tech Secretary / Web Admin" },
                { name: "Susikaran V", role: "Non-Technical Head" },
                { name: "Ajmal", role: "Non-Tech Secretary" },
              ].map(c => (
                <div key={c.name} className="flex justify-between items-center border-b border-white/5 py-1">
                  <span className="text-xs font-bold text-white">{c.name}</span>
                  <span className="text-[9px] text-[#e62e2d]/50">{c.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stack */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase mb-2">TECH STACK</p>
            <div className="flex flex-wrap gap-1.5">
              {["Next.js 15", "React 19", "Tailwind", "Framer Motion", "Groq AI", "Web Audio"].map(t => (
                <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] text-white/70">{t}</span>
              ))}
            </div>
          </div>

          {/* Modules */}
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/30 uppercase mb-2">MODULES</p>
            <div className="space-y-1 text-[10px] text-[#e62e2d]/70">
              {["Global Telemetry HUD", "Web Audio Synthesizer", "Real-time Leaderboards", "Forge-AI VAD Engine", "Particle Field Engine"].map(m => (
                <p key={m} className="flex items-center gap-2"><Zap size={9} className="text-[#e62e2d]/40" />{m}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Panel 03 — Live Logs (full width) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 relative overflow-hidden border border-[#e62e2d]/40 bg-[#0a0000]/90 p-4 h-52 flex flex-col"
        >
          <div className="flex items-center gap-3 border-b border-[#e62e2d]/15 pb-2 mb-2">
            <Activity size={14} className="text-[#e62e2d]" />
            <span className="text-[10px] font-black tracking-[0.35em] text-white uppercase">PANEL 03 // LIVE SYSTEM LOGS</span>
            <Blink><span className="text-[#00ff9d] text-[10px] ml-auto">● REC</span></Blink>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-none">
            <AnimatePresence>
              {logLines.map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-[10px] font-mono leading-5 ${l.color}`}
                >
                  {l.text}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
