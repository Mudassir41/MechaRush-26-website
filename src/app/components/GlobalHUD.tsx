"use client";

import { useEffect, useState, useRef } from "react";
import { useHUDStore } from "../store/hudStore";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Flame, Zap, Skull } from "lucide-react";

// ── CRITICAL EVENT TYPES with distinct visual flavors ──
type CriticalType = "PRESSURE" | "THERMAL" | "BREACH" | "GIMBAL" | "INSTABILITY";

interface CriticalEvent {
  type: CriticalType;
  message: string;
  icon: typeof AlertTriangle;
  color: string;       // accent color
  label: string;       // short label
}

const CRITICAL_EVENTS: CriticalEvent[] = [
  { type: "PRESSURE",    message: "[CRIT] PRESSURE DROP DETECTED IN SECTOR 4!",  icon: AlertTriangle, color: "#ff3b30", label: "PRESSURE DROP" },
  { type: "THERMAL",     message: "[CRIT] THERMAL RUNAWAY IMMINENT!",            icon: Flame,         color: "#ff6b00", label: "THERMAL RUNAWAY" },
  { type: "BREACH",      message: "[CRIT] Hull breach probability: 12.4%",        icon: Skull,         color: "#ff2060", label: "HULL BREACH" },
  { type: "GIMBAL",      message: "[WARN] GIMBAL LOCK ENCOUNTERED!",             icon: Zap,           color: "#f59e0b", label: "GIMBAL LOCK" },
  { type: "INSTABILITY", message: "[WARN] Combustion instability detected!",      icon: Zap,           color: "#ff4500", label: "COMBUSTION" },
];

const NOMINAL_POOL = [
  "[OK] Chamber pressure stable @ 3.2 MPa",
  "[NET] Ping -> Crescent.Edu : 12ms",
  "[SYS] Memory re-allocation complete.",
  "[INFO] Gyro stabilization active.",
  "[OK] Core temperature within bounds.",
  "[INFO] Thermal venting nominal.",
  "[SYS] AI subsystem heartbeat OK.",
];

export default function GlobalHUD() {
  const { telemetry, setTelemetry, ignitionDone } = useHUDStore();
  const pathname = usePathname();
  const [logLine, setLogLine] = useState("[SYS] Telemetry link established. All systems nominal.");
  const [activeEvent, setActiveEvent] = useState<CriticalEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Rotate log messages
  useEffect(() => {
    if (telemetry === "CHAOTIC") {
      // Pick a random critical event type
      const event = CRITICAL_EVENTS[Math.floor(Math.random() * CRITICAL_EVENTS.length)];
      setActiveEvent(event);
      setLogLine(event.message);
      setShowBanner(true);
      // Auto-dismiss the banner after 1.5s so it's not annoying
      const bannerTimeout = setTimeout(() => setShowBanner(false), 1800);
      return () => clearTimeout(bannerTimeout);
    }

    // Nominal: clear active event
    setActiveEvent(null);
    setShowBanner(false);
    const interval = setInterval(() => {
      setLogLine(NOMINAL_POOL[Math.floor(Math.random() * NOMINAL_POOL.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, [telemetry]);

  // Global Anomaly Heartbeat
  useEffect(() => {
    if (!ignitionDone) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setTelemetry("CHAOTIC");
        setTimeout(() => setTelemetry("NOMINAL"), 2000 + Math.random() * 2500);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [ignitionDone, setTelemetry]);

  // Only render on home page
  if (pathname !== "/") return null;

  const isChaotic = telemetry === "CHAOTIC";
  const accentColor = activeEvent?.color || "#ff3b30";
  const EventIcon = activeEvent?.icon || AlertTriangle;

  return (
    <>
      {/* ── NON-BLOCKING UNDERLAY: Subtle edge vignette (behind content, z-[1]) ── */}
      <AnimatePresence>
        {isChaotic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[1] pointer-events-none"
          >
            {/* Edge vignette glow — NOT blocking, sits behind all content */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, transparent 50%, ${accentColor}18 75%, ${accentColor}30 100%)`,
              }}
            />
            {/* Top and bottom border glow strips */}
            <div className="absolute top-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`, boxShadow: `0 0 30px ${accentColor}60` }} />
            <div className="absolute bottom-12 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`, boxShadow: `0 0 30px ${accentColor}60` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SMALL NON-BLOCKING BANNER (top-right corner toast, auto-dismisses) ── */}
      <AnimatePresence>
        {isChaotic && showBanner && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-24 right-4 z-[40] pointer-events-none max-w-xs"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md border"
              style={{
                background: `rgba(0,0,0,0.75)`,
                borderColor: `${accentColor}50`,
                boxShadow: `0 0 30px ${accentColor}25`,
              }}
            >
              <EventIcon size={20} style={{ color: accentColor }} className="flex-shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: accentColor }}>
                  {activeEvent?.label || "ANOMALY"}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">Theme effect · device is fine</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM TELEMETRY BAR ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 flex items-center justify-between px-4 font-mono overflow-hidden ${
          isChaotic
            ? "border-t-2 h-12 sm:h-14 text-xs sm:text-sm backdrop-blur-md"
            : "bg-black/80 backdrop-blur-md border-t border-white/10 h-9 text-[10px] sm:text-xs"
        }`}
        style={isChaotic ? {
          background: `${accentColor}18`,
          borderColor: accentColor,
          boxShadow: `0 -15px 40px ${accentColor}20`,
        } : undefined}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Status indicator dot */}
          <span
            className={`rounded-full flex-shrink-0 transition-all ${
              isChaotic ? "w-3 h-3 animate-pulse" : "w-2 h-2 bg-[#00ff9d]"
            }`}
            style={isChaotic ? { backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` } : undefined}
          />

          {/* Status label */}
          <span
            className={`flex-shrink-0 font-bold tracking-widest ${isChaotic ? "animate-pulse" : "text-white/30"}`}
            style={isChaotic ? { color: accentColor } : undefined}
          >
            {isChaotic ? (activeEvent?.label || "CRITICAL") : telemetry}
          </span>

          {/* Separator */}
          <span style={{ color: isChaotic ? `${accentColor}40` : "rgba(255,255,255,0.2)" }}>│</span>

          {/* Log message — NO shake, just color change */}
          <span
            className={`truncate font-bold tracking-wider ${
              isChaotic ? "text-white" : "text-white/50"
            }`}
            style={isChaotic ? { textShadow: `0 0 8px ${accentColor}80` } : undefined}
          >
            {logLine}
          </span>
        </div>

        {/* Right side: system label */}
        <span className={`flex-shrink-0 hidden sm:block font-bold tracking-widest ${isChaotic ? "text-white/30" : "text-white/20"}`}>
          mecharush-core v4.2.0
        </span>
      </div>
    </>
  );
}
