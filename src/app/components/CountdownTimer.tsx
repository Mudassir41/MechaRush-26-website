"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET = new Date("2026-04-07T09:00:00+05:30").getTime();

function Ring({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const R = 36, C = 2 * Math.PI * R;
  const off = C * (1 - Math.max(0, Math.min(1, value / max)));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[88px] h-[88px] flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <motion.circle cx="44" cy="44" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={off}
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 0.8s ease, stroke 0.6s" }} />
        </svg>
        <span className="text-xl font-black tabular-nums text-white" style={{ fontFamily: "monospace" }}>
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] tracking-[0.35em] uppercase font-bold text-white/25">{label}</span>
    </div>
  );
}

interface Props { accent?: string }

export default function CountdownTimer({ accent = "#e62e2d" }: Props) {
  const [diff, setDiff] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setDiff(Math.max(0, TARGET - Date.now()));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="flex flex-col items-center">
      <div className="text-[9px] tracking-[0.4em] uppercase font-bold mb-5 transition-colors duration-500" style={{ color: `${accent}60` }}>
        ⚡ T-Minus
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        <Ring value={days}    max={365} label="Days"    color={accent} />
        <div className="text-xl font-black -mt-6 transition-colors duration-500" style={{ color: `${accent}50` }}>:</div>
        <Ring value={hours}   max={24}  label="Hours"   color={accent} />
        <div className="text-xl font-black -mt-6 transition-colors duration-500" style={{ color: `${accent}50` }}>:</div>
        <Ring value={minutes} max={60}  label="Minutes" color={accent} />
        <div className="text-xl font-black -mt-6 transition-colors duration-500" style={{ color: `${accent}50` }}>:</div>
        <Ring value={seconds} max={60}  label="Seconds" color={accent} />
      </div>
    </motion.div>
  );
}
