"use client";

import { useEffect, useState, useRef } from "react";
import { useHUDStore } from "../store/hudStore";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NOMINAL_POOL = [
  "[OK] Chamber pressure stable @ 3.2 MPa",
  "[NET] Ping -> Crescent.Edu : 12ms",
  "[SYS] Memory re-allocation complete.",
  "[INFO] Gyro stabilization active.",
  "[OK] Core temperature within bounds.",
  "[INFO] Thermal venting nominal.",
  "[SYS] AI subsystem heartbeat OK.",
];

const CHAOTIC_POOL = [
  "[CRIT] PRESSURE DROP DETECTED IN SECTOR 4!",
  "[WARN] GIMBAL LOCK ENCOUNTERED!",
  "[CRIT] THERMAL RUNAWAY IMMINENT!",
  "[WARN] Combustion instability detected!",
  "[CRIT] Hull breach probability: 12.4%",
];

export default function GlobalHUD() {
  const { telemetry, setTelemetry, ignitionDone } = useHUDStore();
  const pathname = usePathname();
  const [logLine, setLogLine] = useState("[SYS] Telemetry link established. All systems nominal.");
  const lockedChaosMessage = useRef("");

  // Rotate log messages
  useEffect(() => {
    // Immediate swap to a chaotic message and stick to it
    if (telemetry === "CHAOTIC") {
      lockedChaosMessage.current = CHAOTIC_POOL[Math.floor(Math.random() * CHAOTIC_POOL.length)];
      setLogLine(lockedChaosMessage.current);
      return; // DO NOT set interval during chaos
    }

    // Nominal state rotates messages slowly
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

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 pointer-events-none transition-colors duration-500 flex items-center justify-between px-4 font-mono text-[10px] sm:text-xs overflow-hidden ${
        isChaotic ? "bg-[#ff3b30]/15 border-t border-[#ff3b30]/40" : "bg-black/80 backdrop-blur-md border-t border-white/10"
      }`}
      style={{ height: "36px" }}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isChaotic ? "bg-[#ff3b30] animate-pulse" : "bg-[#00ff9d]"
          }`}
        />

        {/* Timestamp */}
        <span className={`flex-shrink-0 font-bold ${isChaotic ? "text-[#ff3b30] animate-pulse" : "text-white/30"}`}>
          {isChaotic ? "CRITICAL" : telemetry}
        </span>

        {/* Separator */}
        <span className="text-white/20">│</span>

        {/* Log message - Shakes constantly when chaotic */}
        <motion.span
          animate={isChaotic ? { x: [-2, 2, -1, 1, -2, 2, 0] } : { x: 0 }}
          transition={isChaotic ? { repeat: Infinity, duration: 0.3 } : {}}
          className={`truncate transition-colors duration-300 font-bold ${
            isChaotic ? "text-[#ff3b30]" : "text-white/50"
          }`}
        >
          {logLine}
        </motion.span>
      </div>

      {/* Right side: system label */}
      <span className="flex-shrink-0 text-white/20 hidden sm:block font-bold">
        mecharush-core v4.2.0
      </span>
    </div>
  );
}
