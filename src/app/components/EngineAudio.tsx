"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useHUDStore } from "../store/hudStore";

export default function EngineAudio() {
  const [muted, setMuted] = useState(false); // Play auto on gesture
  const { telemetry, ignitionDone, ignitionAudioStarted } = useHUDStore();
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);
  const reactorAudioRef = useRef<HTMLAudioElement | null>(null);
  const meltdownAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!themeAudioRef.current) {
        themeAudioRef.current = new Audio("/audio/bg_main.mpeg");
        themeAudioRef.current.loop = true;
        reactorAudioRef.current = new Audio("/audio/bg_reactor_noise.mpeg");
        reactorAudioRef.current.loop = true;
        meltdownAudioRef.current = new Audio("/audio/error_reactor_meltdown.mpeg");
        meltdownAudioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (!themeAudioRef.current || !reactorAudioRef.current || !meltdownAudioRef.current) return;
    
    // Auto-disable mute if ignition started 
    if (ignitionAudioStarted && !ignitionDone && muted) {
       setMuted(false);
    }

    if (muted) {
        themeAudioRef.current.pause();
        reactorAudioRef.current.pause();
        meltdownAudioRef.current.pause();
        return;
    }

    if (telemetry === "CHAOTIC") {
        themeAudioRef.current.pause();
        reactorAudioRef.current.pause();
        meltdownAudioRef.current.volume = 0.6;
        meltdownAudioRef.current.play().catch(e => console.log(e));
    } else {
        meltdownAudioRef.current.pause();
        meltdownAudioRef.current.currentTime = 0;
        
        if (ignitionAudioStarted && !ignitionDone) {
            themeAudioRef.current.volume = 0.15; // Suppressed precisely as user wanted
            reactorAudioRef.current.volume = 0.05;
        } else if (ignitionDone) {
            themeAudioRef.current.volume = 0.45; // Normal main volume
            reactorAudioRef.current.volume = 0.15; // Mixed reactor trace
        } else {
            // Idle state before ignition
            themeAudioRef.current.volume = 0.35;
            reactorAudioRef.current.volume = 0.0; // Reactor silent until ignition
        }

        const playTheme = () => {
            if (!themeAudioRef.current) return;
            themeAudioRef.current.play().catch(e => console.log("EngineAudio blocked by browser, waiting for interaction..."));
        };
        const playReactor = () => {
            if (!reactorAudioRef.current) return;
            reactorAudioRef.current.play().catch(e => console.log(e));
        };

        // Try playing immediately (will work if user previously clicked)
        playTheme();
        
        // Add a one-time global click listener to unlock audio policy before they click 'initiate'
        const unlockAudio = () => { playTheme(); document.removeEventListener('click', unlockAudio); };
        document.addEventListener('click', unlockAudio);

        if (ignitionAudioStarted || ignitionDone) {
            playReactor();
        }

        return () => { document.removeEventListener('click', unlockAudio); };
    }
  }, [telemetry, ignitionDone, ignitionAudioStarted, muted]);

  // Keep button hidden during ignition screen to keep it cinematic
  if (!ignitionDone) return null;

  return (
    <button 
      onClick={() => setMuted(!muted)}
      className="fixed bottom-6 lg:bottom-10 left-6 lg:left-10 z-[100] p-4 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-[#e62e2d] hover:text-white hover:bg-[#e62e2d]/20 hover:border-[#e62e2d]/50 transition-all shadow-xl hover:scale-110 active:scale-95 group"
      aria-label={muted ? "Enable Ambient Audio" : "Disable Ambient Audio"}
      title="Toggle Core Audio Synthesizer"
    >
      <div className="absolute inset-0 bg-[#e62e2d]/20 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
    </button>
  );
}
