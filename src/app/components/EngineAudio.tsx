"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useHUDStore } from "../store/hudStore";

export default function EngineAudio() {
  const [muted, setMuted] = useState(true); // Default muted to comply with browser autoplay policies until toggled
  const { telemetry, ignitionDone } = useHUDStore();
  const pathname = usePathname();

  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Nodes
  const rootDroneRef = useRef<OscillatorNode | null>(null);
  const padOscRef = useRef<OscillatorNode | null>(null);
  const chaosOscRef = useRef<OscillatorNode | null>(null);
  
  const droneGainRef = useRef<GainNode | null>(null);
  const padGainRef = useRef<GainNode | null>(null);
  const chaosGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Audio
  useEffect(() => {
    if (muted) {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
      }
      return;
    }
    
    if (!audioCtxRef.current && ignitionDone) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.value = 800; // Muffled cinematic feel
      masterFilter.connect(ctx.destination);
      filterRef.current = masterFilter;

      // 1. Deep Atmospheric Sub-Drone (Boss foundation)
      const drone = ctx.createOscillator();
      drone.type = "sawtooth";
      drone.frequency.value = 45; 
      
      const dGain = ctx.createGain();
      dGain.gain.value = 0.05;
      
      const droneLfo = ctx.createOscillator();
      droneLfo.frequency.value = 0.2; // Slow breathing swell
      const dLfoGain = ctx.createGain();
      dLfoGain.gain.value = 5;
      droneLfo.connect(dLfoGain);
      dLfoGain.connect(drone.frequency);
      
      drone.connect(dGain);
      dGain.connect(masterFilter);
      drone.start();
      droneLfo.start();

      rootDroneRef.current = drone;
      droneGainRef.current = dGain;

      // 2. High Cinematic Pad 
      const pad = ctx.createOscillator();
      pad.type = "sine";
      pad.frequency.value = 220; // A3

      const pGain = ctx.createGain();
      pGain.gain.value = 0.02;

      pad.connect(pGain);
      pGain.connect(masterFilter);
      pad.start();

      padOscRef.current = pad;
      padGainRef.current = pGain;

      // 3. Chaos / Anomaly Alarm
      const chaos = ctx.createOscillator();
      chaos.type = "square";
      chaos.frequency.value = 150; // Harsh low-mid buzz

      const cGain = ctx.createGain();
      cGain.gain.value = 0; // Off by default

      const chaosLfo = ctx.createOscillator();
      chaosLfo.frequency.value = 6; // Fast stutter
      const cLfoGain = ctx.createGain();
      cLfoGain.gain.value = 0.04;
      chaosLfo.connect(cLfoGain);
      cLfoGain.connect(cGain.gain);

      chaos.connect(cGain);
      cGain.connect(masterFilter);
      chaos.start();
      chaosLfo.start();

      chaosOscRef.current = chaos;
      chaosGainRef.current = cGain;
    }

    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, [muted, ignitionDone]);

  // Handle Dynamic Scene/Theme Changes
  useEffect(() => {
    if (!audioCtxRef.current || !droneGainRef.current || !padGainRef.current || !chaosGainRef.current || !filterRef.current) return;
    
    const now = audioCtxRef.current.currentTime;
    
    // Anomaly Overrides Everything
    if (telemetry === "CHAOTIC") {
      droneGainRef.current.gain.setTargetAtTime(0.15, now, 0.1); 
      if (rootDroneRef.current) rootDroneRef.current.frequency.setTargetAtTime(55, now, 0.1); // Pitch up structural strain
      
      padGainRef.current.gain.setTargetAtTime(0.08, now, 0.5);
      if (padOscRef.current) padOscRef.current.frequency.setTargetAtTime(440, now, 0.5); // A4 siren
      
      chaosGainRef.current.gain.setTargetAtTime(0.03, now, 0.05); // Enable harsh alarm
      filterRef.current.frequency.setTargetAtTime(2000, now, 0.2); // Open filter fully
      return; 
    }

    // Nominal State - vary by Region
    if (pathname === "/") {
      // Home: The Forge Core (Heavy, brooding) - Volume Reduced
      droneGainRef.current.gain.setTargetAtTime(0.03, now, 1.0);
      if (rootDroneRef.current) rootDroneRef.current.frequency.setTargetAtTime(45, now, 2.0);
      padGainRef.current.gain.setTargetAtTime(0.01, now, 1.0);
      if (padOscRef.current) padOscRef.current.frequency.setTargetAtTime(220, now, 2.0); // A3
      filterRef.current.frequency.setTargetAtTime(800, now, 1.0);

    } else if (pathname === "/tech-events") {
      // Tech Events: Combat/Engineering Setup - Volume Reduced
      droneGainRef.current.gain.setTargetAtTime(0.02, now, 1.0);
      if (rootDroneRef.current) rootDroneRef.current.frequency.setTargetAtTime(65.41, now, 2.0); // C2
      padGainRef.current.gain.setTargetAtTime(0.015, now, 1.0);
      if (padOscRef.current) padOscRef.current.frequency.setTargetAtTime(261.63, now, 2.0); // C4
      filterRef.current.frequency.setTargetAtTime(1200, now, 1.0);

    } else if (pathname === "/non-tech-events") {
      // Non-Tech Events: Lighter, more relaxed ambiance - Volume Reduced
      droneGainRef.current.gain.setTargetAtTime(0.01, now, 1.0);
      if (rootDroneRef.current) rootDroneRef.current.frequency.setTargetAtTime(55, now, 2.0); // A1
      padGainRef.current.gain.setTargetAtTime(0.02, now, 1.0);
      if (padOscRef.current) padOscRef.current.frequency.setTargetAtTime(329.63, now, 2.0); // E4 melodic
      filterRef.current.frequency.setTargetAtTime(600, now, 1.0);

    } else if (pathname === "/about") {
      // About Page: Data terminal / quiet - Volume Reduced
      droneGainRef.current.gain.setTargetAtTime(0.005, now, 1.0);
      if (rootDroneRef.current) rootDroneRef.current.frequency.setTargetAtTime(40, now, 2.0);
      padGainRef.current.gain.setTargetAtTime(0.005, now, 1.0);
      filterRef.current.frequency.setTargetAtTime(400, now, 1.0); // Muffled
    }

    // Always ensure chaos alarm is off during nominal
    chaosGainRef.current.gain.setTargetAtTime(0, now, 0.5);

  }, [pathname, telemetry]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  if (!ignitionDone) return null; // Don't show play icon until ignition completes

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
