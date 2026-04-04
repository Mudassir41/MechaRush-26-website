"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import InteractiveForgeGame from "../components/InteractiveForgeGame";
import AIEscapeRoom from "../components/AIEscapeRoom";
import CoreOverloadGame from "../components/CoreOverloadGame";
import NavBar from "../components/NavBar";
import FireSmokeOverlay from "../components/FireSmokeOverlay";
import SparkParticleField from "../components/SparkParticleField";
import GearDivider from "../components/GearDivider";
import { Gamepad2 } from "lucide-react";

export default function ArcadePage() {
  useEffect(() => {
    const audio = new Audio("/audio/bg_reactor_noise.mpeg");
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Arcade bg audio blocked:", e));
    return () => { audio.pause(); };
  }, []);

  return (
    <main className="min-h-screen bg-[#06080c] text-white selection:bg-[#e62e2d]/30 font-sans overflow-x-hidden pt-20">
      <NavBar />
      <FireSmokeOverlay />
      <SparkParticleField />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e62e2d]/20 border border-[#e62e2d]/50 mb-6"
          >
            <Gamepad2 className="text-[#e62e2d]" size={32} />
          </motion.div>
          <div className="flex items-center gap-4 text-[10px] sm:text-xs tracking-[0.4em] uppercase font-bold text-white/50 mb-4">
            <div className="w-10 h-px bg-white/15" />
            Mecharush '26
            <div className="w-10 h-px bg-white/15" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter mb-4 text-white">
            The <span className="text-[#e62e2d]">Arcade</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-light">
            Test your mechanical reflexes and engineering intellect in our custom symposium mini-games.
          </p>
        </div>

        {/* Action Game */}
        <div className="mb-8">
           <InteractiveForgeGame />
        </div>

        <GearDivider />

        {/* Narrative Game */}
        <div className="mt-8">
           <AIEscapeRoom />
        </div>

        <GearDivider />

        {/* Memory Sequence Game */}
        <div className="mt-8 mb-16">
           <CoreOverloadGame />
        </div>

      </div>
    </main>
  );
}
