"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Cpu, CircuitBoard, Phone, PhoneOff, X, Loader2, Signal } from "lucide-react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ────────────────────────────────────────────────────────────────────────────
//  LiveKit call UI — rendered only inside <LiveKitRoom>
// ────────────────────────────────────────────────────────────────────────────
function CallUI({ onDisconnect }: { onDisconnect: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-4 px-2">
      <RoomAudioRenderer />

      {/* Visualizer */}
      <div className="w-full h-20 rounded-lg overflow-hidden bg-black/30 border border-white/5 flex items-center justify-center">
        {audioTrack ? (
          <BarVisualizer
            state={state}
            barCount={24}
            trackRef={audioTrack}
            className="w-full h-full"
          />
        ) : (
          <div className="flex gap-1 items-center opacity-40">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-[4px] bg-[#e62e2d] rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.random() * 24}px`,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* State label */}
      <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white/50">
        <Signal size={10} className="text-green-400 animate-pulse" />
        {state === "speaking"
          ? "Agent transmitting..."
          : state === "listening"
          ? "Listening to you..."
          : state === "thinking"
          ? "Processing signal..."
          : "Channel open — speak, Commander"}
      </div>

      {/* Disconnect */}
      <button
        onClick={onDisconnect}
        className="mt-2 w-14 h-14 rounded-full bg-red-900/30 border border-red-500/40 hover:bg-red-500/20 transition-all flex items-center justify-center"
        title="End call"
      >
        <PhoneOff size={22} className="text-red-400" />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  Main component
// ────────────────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"text" | "call">("text");
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  // LiveKit call state
  const [lkToken, setLkToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  // WebWorker Initialization for Local TTS
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/ttsWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.onmessage = (e) => {
      const { status, payload } = e.data;
      if (status === 'complete') {
        playAudio(payload.audio, payload.sampling_rate);
        setSpeakingIdx(null); // Finished synthesizing
      } else if (status === 'error') {
        console.error("TTS Error:", payload);
        setSpeakingIdx(null);
      }
    };

    return () => {
      workerRef.current?.terminate();
      audioContextRef.current?.close();
    };
  }, []);

  const playAudio = (audioData: Float32Array, sampleRate: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const buffer = ctx.createBuffer(1, audioData.length, sampleRate);
    buffer.getChannelData(0).set(audioData);
    
    // Stop previous audio if playing (simple implementation ignores multiple simultaneous playback)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // ── Text submit ────────────────────────────────────────────────────────────
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userText = chatInput;
    setChatInput("");
    const updated = [...messages, { role: "user" as const, content: userText }];
    setMessages(updated);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `SYSTEM ERROR: ${data.error}` },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `NETWORK ERROR: ${err.message}` },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── LiveKit call connect ───────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: "mecharush-forge",
          participantName: `commander-${Math.floor(Math.random() * 9000) + 1000}`,
        }),
      });
      const { token, error } = await res.json();
      if (error) throw new Error(error);
      setLkToken(token);
      setCallConnected(true);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `CALL ERROR: ${err.message}` },
      ]);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const endCall = useCallback(() => {
    setLkToken(null);
    setCallConnected(false);
  }, []);

  // ── TTS for text messages ─────────────────────────────────────────────────
  const speakMessage = (text: string, idx: number) => {
    if (workerRef.current) {
      setSpeakingIdx(idx);
      // Clean up text for TTS (remove punctuation that might confuse the tiny model)
      const cleanText = text.replace(/[*#]/g, '').trim();
      workerRef.current.postMessage({ type: 'synthesize', text: cleanText });
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/85 backdrop-blur-xl border border-[#e62e2d]/30 rounded-xl w-[340px] pointer-events-auto shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#111] px-4 py-3 border-b border-[#e62e2d]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CircuitBoard className="text-[#e62e2d]" size={16} />
                <span className="text-white font-bold text-xs tracking-widest uppercase">
                  Forge-AI
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-white/5 bg-black/40">
              <button
                onClick={() => setChatMode("text")}
                className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  chatMode === "text"
                    ? "text-[#e62e2d] bg-[#e62e2d]/10"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                TEXT
              </button>
              <button
                onClick={() => setChatMode("call")}
                className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                  chatMode === "call"
                    ? "text-green-400 bg-green-400/10"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                CALL
              </button>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[200px] max-h-[420px] flex flex-col justify-end">

              {/* ── TEXT mode ── */}
              {chatMode === "text" && (
                <>
                  <div className="flex-1 overflow-y-auto w-full mb-4 space-y-2 pr-1">
                    {messages.length === 0 && !isProcessing && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                        <CircuitBoard size={28} className="text-[#e62e2d]/50 mb-3" />
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">
                          Forge-AI Online
                        </p>
                        <p className="text-white/25 text-[9px] mt-1">
                          Ask about MechaRush events, schedule, or anything.
                        </p>
                      </div>
                    )}

                    {messages.map((msg, idx) =>
                      msg.role === "user" ? (
                        <div
                          key={idx}
                          className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-white/10"
                        >
                          <p className="text-white/80 text-xs">{msg.content}</p>
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className="bg-[#e62e2d]/10 p-3 rounded-lg w-fit max-w-[90%] border border-[#e62e2d]/20"
                        >
                          <div className="flex items-start gap-2">
                            <Cpu size={14} className="text-[#e62e2d] mt-0.5 flex-shrink-0" />
                            <p className="text-white/90 text-[11px] whitespace-pre-wrap leading-relaxed flex-1">
                              {msg.content}
                            </p>
                          </div>
                          {!msg.content.startsWith("SYSTEM ERROR") &&
                            !msg.content.startsWith("NETWORK ERROR") && (
                              <button
                                onClick={() => speakMessage(msg.content, idx)}
                                disabled={speakingIdx !== null}
                                className="mt-2 flex items-center gap-1.5 text-[9px] text-white/30 hover:text-[#e62e2d] transition-colors disabled:opacity-30"
                                title="Read aloud"
                              >
                                <Volume2
                                  size={11}
                                  className={
                                    speakingIdx === idx ? "animate-pulse text-[#e62e2d]" : ""
                                  }
                                />
                                <span className="uppercase tracking-wider">
                                  {speakingIdx === idx ? "Speaking..." : "Play"}
                                </span>
                              </button>
                            )}
                        </div>
                      )
                    )}

                    {isProcessing && (
                      <div className="bg-[#e62e2d]/5 p-3 rounded-lg w-fit border border-[#e62e2d]/10 flex items-center gap-2">
                        <Cpu size={14} className="text-[#e62e2d] opacity-50" />
                        <div className="flex gap-1 items-center opacity-50">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse delay-75" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse delay-150" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleTextSubmit} className="flex gap-2 w-full mt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Message Forge-AI..."
                      className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e62e2d]/50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isProcessing}
                      className="bg-[#e62e2d] text-black px-4 py-2 rounded text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
                    >
                      SEND
                    </button>
                  </form>
                </>
              )}

              {/* ── CALL mode ── */}
              {chatMode === "call" && (
                <>
                  {callConnected && lkToken ? (
                    <LiveKitRoom
                      token={lkToken}
                      serverUrl={LIVEKIT_URL}
                      connect={true}
                      audio={true}
                      video={false}
                      onDisconnected={endCall}
                      className="w-full"
                    >
                      <CallUI onDisconnect={endCall} />
                    </LiveKitRoom>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-5 py-6">
                      <div className="text-center">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                          Orbital Comm Link
                        </p>
                        <p className="text-white/25 text-[9px]">
                          Connect to speak live with Forge-AI voice agent.
                        </p>
                      </div>
                      <button
                        onClick={startCall}
                        disabled={isConnecting}
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 bg-green-500/10 border border-green-500/40 hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
                      >
                        {isConnecting ? (
                          <Loader2 size={24} className="text-green-400 animate-spin" />
                        ) : (
                          <Phone size={24} className="text-green-400" />
                        )}
                      </button>
                      <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
                        {isConnecting ? "Connecting..." : "Tap to connect"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`pointer-events-auto h-12 px-4 rounded-lg flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 border ${
          chatOpen
            ? "bg-[#e62e2d] border-[#e62e2d] text-white"
            : "bg-black/60 backdrop-blur-md border border-white/20 text-white/70 hover:text-white"
        }`}
        title="Initialize AI Assistant"
      >
        <CircuitBoard size={18} className={isProcessing ? "animate-pulse text-[#e62e2d]" : ""} />
        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:block">
          Forge-AI
        </span>
      </button>
    </div>
  );
}
