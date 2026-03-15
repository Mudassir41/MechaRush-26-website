"use client";

import { useEffect, useRef } from "react";

// Renders animated fire GIF + smoke particles on top of everything
export default function FireSmokeOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smoke particles are CSS-driven, no canvas needed
  useEffect(() => {
    // Add hammer-click flash on every click
    const handleClick = (e: MouseEvent) => {
      const flash = document.createElement("div");
      flash.className = "hammer-flash";
      const xPct = ((e.clientX / window.innerWidth) * 100).toFixed(1) + "%";
      const yPct = ((e.clientY / window.innerHeight) * 100).toFixed(1) + "%";
      flash.style.setProperty("--cx", xPct);
      flash.style.setProperty("--cy", yPct);
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 300);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
      {/* Smoke particles */}
      {Array.from({ length: 12 }).map((_, i) => {
        const left  = 5 + (i * 8.2) % 90;
        const delay = (i * 0.55) % 3.5;
        const dur   = 3 + (i % 4) * 0.8;
        const dx    = i % 2 === 0 ? 20 : -20;
        return (
          <div
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left:  `${left}%`,
              width: 40 + (i % 5) * 24,
              height: 40 + (i % 5) * 24,
              background: "radial-gradient(circle, rgba(220,220,210,0.14) 0%, rgba(180,180,170,0.04) 60%, transparent 100%)",
              filter: "blur(8px)",
              animationName: "smoke-rise",
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
              animationTimingFunction: "ease-out",
              animationIterationCount: "infinite",
              ["--sdx" as string]: `${dx}px`,
            }}
          />
        );
      })}

      {/* Bottom fire glow — simulates fire beneath without a GIF blocking the ocean */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(230,46,45,0.12) 0%, rgba(255,90,31,0.05) 50%, transparent 100%)",
          animationName: "fire-flicker",
          animationDuration: "0.6s",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationTimingFunction: "ease-in-out",
        }}
      />

      {/* Left edge ember glow */}
      <div
        className="absolute left-0 top-1/3 w-24 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at left, rgba(255,60,0,0.07) 0%, transparent 70%)",
          animationName: "fire-flicker",
          animationDuration: "0.9s",
          animationDelay: "0.3s",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationTimingFunction: "ease-in-out",
        }}
      />

      {/* Right edge ember glow */}
      <div
        className="absolute right-0 top-1/3 w-24 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at right, rgba(255,60,0,0.07) 0%, transparent 70%)",
          animationName: "fire-flicker",
          animationDuration: "1.1s",
          animationDelay: "0.15s",
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationTimingFunction: "ease-in-out",
        }}
      />
    </div>
  );
}
