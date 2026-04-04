"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Cpu, ChevronRight, Zap, Target, Wrench, BrainCircuit } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Leaderboard from "./Leaderboard";

type Phase = "menu" | "playing" | "end" | "leaderboard_entry";
type Theme = "mars" | "f1" | "factory";

interface Line {
  text: string;
  type: "system" | "ai" | "user" | "error" | "divider";
}

const THEME_DATA = {
  mars: {
    color: "#e62e2d",
    aiName: "ORACLE-7",
    sub: "BEYONDER HAB MAINFRAME",
    boot: [
      { text: "ORACLE-7 ONBOARD AI // BEYONDER HAB — SOL 214", type: "system" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "MARS DATE: 14-APR-2029 | LOCAL TIME: 21:43 MST", type: "system" as const },
      { text: "HABITAT STATUS: CRITICAL FAILURE DETECTED", type: "error" as const },
      { text: "3 SYSTEMS COMPROMISED — CREW SURVIVAL: T-MINUS 30 MIN", type: "error" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "LEAD SYSTEMS ENGINEER REQUIRED. ASSUME COMMAND?", type: "system" as const },
    ]
  },
  f1: {
    color: "#00ff60",
    aiName: "RACE-LINK",
    sub: "SCUDERIA MECHARUSH PIT WALL",
    boot: [
      { text: "RACE-LINK SCUDERIA AI // MONACO GRAND PRIX", type: "system" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "LAP 52/56 | TRACK TEMP: 31°C | TELEMETRY: ACTIVE", type: "system" as const },
      { text: "CAR STATUS: MULITPLE MECHANICAL ANOMALIES DETECTED", type: "error" as const },
      { text: "LEAD DEFENSE COMPROMISED — PODIUM AT RISK", type: "error" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "CHIEF RACE ENGINEER REQUIRED. ASSUME COMMAND?", type: "system" as const },
    ]
  },
  factory: {
    color: "#ffaa00",
    aiName: "CORE-SYS",
    sub: "HEAVY MANUFACTURING FLOOR 3",
    boot: [
      { text: "CORE-SYS AUTOMATION CONTROL // NIGHT SHIFT", type: "system" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "PLANT STATUS: CNC SECTOR 4 | FOUNDRY LEVEL 1", type: "system" as const },
      { text: "INDUSTRIAL ALARM TRIGGERED: MULTIPLE CATASTROPHIC FAILURES", type: "error" as const },
      { text: "PLANT INTEGRITY COMPROMISED — EVACUATION T-MINUS 12 MIN", type: "error" as const },
      { text: "─────────────────────────────────────────────", type: "divider" as const },
      { text: "LEAD PLANT ENGINEER REQUIRED. ASSUME COMMAND?", type: "system" as const },
    ]
  }
};

export default function AIEscapeRoom() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [theme, setTheme] = useState<Theme>("mars");
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTheme = THEME_DATA[theme];
  const tc = activeTheme.color; // Theme color

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, loading]);

  // Boot sequence typewriter
  useEffect(() => {
    if (phase !== "playing") return;
    
    let cancelled = false;
    const run = async () => {
      setLines([]);
      for (const line of activeTheme.boot) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 80));
        setLines(prev => [...prev, line]);
      }
      setBootDone(true);
      inputRef.current?.focus();
    };
    run();
    return () => { cancelled = true; };
  }, [phase, activeTheme]);

  const addLine = useCallback((text: string, type: Line["type"]) => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userLine = `> ${userText.toUpperCase()}`;
    addLine(userLine, "user");
    setInput("");
    setLoading(true);

    const updatedMessages: { role: "user" | "assistant"; content: string }[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/escape-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, theme }),
      });
      const data = await res.json();

      if (data.response) {
        const aiText: string = data.response;
        setMessages(prev => [...prev, { role: "assistant", content: aiText }]);

        // Stream lines one by one for dramatic effect
        const responseLines = aiText.split("\n").filter(Boolean);
        for (const l of responseLines) {
          await new Promise(r => setTimeout(r, 60));
          const isEval = l.includes(activeTheme.aiName + " EVAL") || l.includes("STELLAR") || l.includes("NOMINAL") || l.includes("CRITICAL ERROR");
          const isRank = l.includes("MISSION COMMANDER") || l.includes("SYSTEMS ENGINEER") || l.includes("SURVIVOR") || l.includes("MISSION FAILED") || l.includes("FINAL RANK");
          const lineType: Line["type"] = isEval ? "error" : isRank ? "error" : "ai";
          setLines(prev => [...prev, { text: l, type: lineType }]);
        }

        if (aiText.includes("MISSION COMMANDER") || aiText.includes("SURVIVOR") || aiText.includes("SYSTEMS ENGINEER") || aiText.includes("MISSION FAILED")) {
          // Assign score based on text
          let currentScore = 0;
          if (aiText.includes("MISSION COMMANDER")) currentScore = 10000;
          else if (aiText.includes("SYSTEMS ENGINEER")) currentScore = 7500;
          else if (aiText.includes("SURVIVOR")) currentScore = 3000;
          
          setFinalScore(currentScore);
          setPhase("end");
        }
      } else if (data.error) {
        console.error("Escape Room Backend Error:", data.error);
        addLine(`${activeTheme.aiName}: [SYS_ERR] ${data.error}`, "error");
      } else {
        addLine(`${activeTheme.aiName}: SIGNAL LOST. RETRY.`, "error");
      }
    } catch (err: any) {
      addLine(`${activeTheme.aiName}: [COMM ERROR] — ${err.message || "Relay link severed."}`, "error");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, messages, addLine, theme, activeTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStartThemeSelect = () => {
    // Free flow logic: randomly pick a domain immediately
    const themes: Theme[] = ["mars", "f1", "factory"];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setTheme(randomTheme);
    setPhase("playing");
    setMessages([]);
    setBootDone(false);

    // Initial dramatic SFX
    const audio = new Audio("/audio/among_us_role_reveal.mpeg");
    audio.play().catch(e => console.log("Audio dropped:", e));
  };

  const handleReboot = () => {
    setPhase("menu");
    setLines([]);
    setMessages([]);
    setBootDone(false);
    setInput("");
    setLoading(false);
  };

  function lineClass(type: Line["type"]): string {
    switch (type) {
      case "system":  return `text-[${tc}]/70 text-xs leading-relaxed`;
      case "ai":      return `text-[${tc}] text-sm leading-relaxed font-medium`;
      case "user":    return "text-white/90 text-sm leading-relaxed italic";
      case "error":   return "text-[#ff4444] text-xs leading-relaxed font-bold";
      case "divider": return `text-[${tc}]/20 text-xs`;
      default:        return `text-[${tc}]/50 text-xs`;
    }
  }

  return (
    <section className="relative w-full py-20 overflow-hidden" style={{ background: "#06080c" }}>
      {/* Subtle starfield */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: `radial-gradient(circle, ${tc} 1px, transparent 1px)`, backgroundSize: "80px 80px", transition: "background-image 1s ease" }} />

      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3" style={{ color: `${tc}80` }}>
            <div className="w-10 h-px" style={{ backgroundColor: `${tc}50` }} />
            AI-POWERED ESCAPE ROOM
            <div className="w-10 h-px" style={{ backgroundColor: `${tc}50` }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
            Crisis <span style={{ color: tc }}>Simulator</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Three escalating engineering disasters. One human brain to solve them. Pick your domain, type your solutions, and outsmart the AI Game Master.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="relative w-full rounded-lg overflow-hidden border font-mono transition-colors duration-500"
          style={{ 
            borderColor: `${tc}33`, 
            boxShadow: `0 0 40px ${tc}0A, inset 0 0 40px rgba(0,0,0,0.8)`, 
            textShadow: `0 0 4px ${tc}66` 
          }}>

          {/* Terminal Header Bar */}
          <div className="bg-[#080e08] border-b px-4 py-2.5 flex items-center justify-between transition-colors duration-500" style={{ borderColor: `${tc}33` }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${tc}66` }} />
            </div>
            <div className="text-xs flex items-center gap-2 transition-colors duration-500" style={{ color: `${tc}80` }}>
              <Cpu size={12} />
              {phase === "menu" ? "MECHARUSH SIMULATOR CORE" : `${activeTheme.aiName} // ${activeTheme.sub}`}
            </div>
            {phase !== "menu" && (
              <button onClick={handleReboot} className="text-white/20 hover:text-white transition-colors" title="Abort mission">
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Screen */}
          <div
            ref={terminalRef}
            className="relative h-[440px] sm:h-[500px] p-5 sm:p-6 overflow-y-auto text-sm scrollbar-thin transition-colors duration-500"
            style={{ 
              background: "linear-gradient(180deg, #020a04 0%, #030c05 100%)",
              color: tc,
              scrollbarColor: `${tc}33 transparent`
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* CRT Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-50 mix-blend-multiply" />

            <div className="relative z-20 flex flex-col gap-1.5">
              <AnimatePresence mode="popLayout">

                {/* Menu State */}
                {phase === "menu" && (
                  <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1.5">
                    {[
                      { text: "╔══════════════════════════════════════════╗", type: "divider" as const },
                      { text: "║      MECHARUSH '26 CRISIS SIMULATOR      ║", type: "system" as const },
                      { text: "║     POWERED BY CEREBRAS QWEN-235B AI     ║", type: "system" as const },
                      { text: "╚══════════════════════════════════════════╝", type: "divider" as const },
                      { text: " ", type: "divider" as const },
                      { text: "  ████   ██████  ██  ██████  ██  ██████", type: "ai" as const },
                      { text: " ██  ██  ██   ██ ██ ██       ██ ██     ", type: "ai" as const },
                      { text: " ██      ██████  ██  █████   ██  █████ ", type: "ai" as const },
                      { text: " ██  ██  ██   ██ ██      ██  ██      ██", type: "ai" as const },
                      { text: "  ████   ██   ██ ██ ██████   ██ ██████ ", type: "ai" as const },
                      { text: " ", type: "divider" as const },
                      { text: "  STATUS: ONLINE & READY.", type: "system" as const },
                      { text: " ", type: "divider" as const },
                      { text: "  This is an unscripted, free-form engineering game.", type: "system" as const },
                      { text: "  Instead of guessing multiple choice answers, you must", type: "system" as const },
                      { text: "  type out actual, brilliant mechanical solutions.", type: "system" as const },
                    ].map((l, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={lineClass(l.type)}
                      >
                        {l.text}
                      </motion.span>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="mt-6 flex flex-col sm:flex-row gap-3"
                    >
                      <button
                        onClick={handleStartThemeSelect}
                        className="flex items-center gap-2 px-6 py-3 border transition-all font-bold tracking-widest uppercase text-sm group"
                        style={{ borderColor: tc, color: tc, backgroundColor: "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tc; e.currentTarget.style.color = "#000"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = tc; }}
                      >
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        ACCESS SIMULATOR
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Playing State */}
                {phase === "playing" && lines.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={lineClass(l.type)}
                  >
                    <div className={`flex items-start gap-3 ${l.type === "ai" ? "p-3 rounded-lg border" : ""}`} style={{ backgroundColor: l.type === "ai" ? `${tc}0a` : "transparent", borderColor: l.type === "ai" ? `${tc}20` : "transparent" }}>
                        {l.type === "ai" && (
                           <div className="mt-0.5 p-1 rounded-md bg-black border shadow-sm" style={{ borderColor: `${tc}40`, boxShadow: `0 0 10px ${tc}30` }}>
                             <BrainCircuit size={16} className="animate-pulse" style={{ color: tc }} />
                           </div>
                        )}
                        {l.type === "user" && <ChevronRight size={14} className="mt-1 flex-shrink-0" style={{ color: tc }} />}
                        
                        <div className={`leading-relaxed whitespace-pre-wrap ${
                          l.type === "system" ? "opacity-60 italic text-[10px]" : 
                          l.type === "error" ? "text-red-500 font-bold" : 
                          l.type === "ai" ? "flex-1 prose-invert prose-p:my-0 prose-strong:text-white prose-strong:font-bold prose-code:bg-white/10 prose-code:px-1 prose-code:rounded" : ""
                        }`} style={{ color: l.type === "divider" ? `${tc}33` : tc }}>
                          {l.type === "ai" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {l.text}
                            </ReactMarkdown>
                          ) : l.text}
                        </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2" style={{ color: `${tc}99` }}>
                    <span className="text-xs">[{activeTheme.aiName} PROCESSING]</span>
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1 h-3 animate-pulse" style={{ backgroundColor: `${tc}99`, animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </span>
                  </motion.div>
                )}

                {/* End state extra */}
                {phase === "end" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                  >
                    <button onClick={handleReboot}
                      className="px-6 py-2 border transition-colors font-bold tracking-widest uppercase text-sm"
                      style={{ borderColor: tc, color: tc, backgroundColor: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tc; e.currentTarget.style.color = "#000"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = tc; }}
                    >
                      [ REBOOT {activeTheme.aiName} ]
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* Blinking cursor */}
              {!loading && phase === "playing" && (
                <span className="inline-block w-2 h-4 animate-pulse ml-1 translate-y-0.5" style={{ backgroundColor: tc }} />
              )}
            </div>
          </div>

          {/* Input Bar */}
          {phase === "playing" && bootDone && (
            <form onSubmit={handleSubmit}
              className="border-t flex items-center gap-0 bg-[#030a04] transition-colors duration-500" style={{ borderColor: `${tc}26` }}>
              <span className="text-sm pl-4 pr-2 font-mono select-none" style={{ color: `${tc}80` }}>ENGR@{theme.toUpperCase()}:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                placeholder="Type your mechanical solution (or 'hint')..."
                className="flex-1 bg-transparent text-sm py-3.5 pr-3 focus:outline-none disabled:opacity-50"
                style={{ color: tc }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-3.5 disabled:opacity-20 transition-colors"
                style={{ color: tc }}
              >
                <Send size={15} />
              </button>
            </form>
          )}
        </div>

        {/* Leaderboard Section */}
        <div className="mt-12">
          <Leaderboard 
            gameKey="ai_escape_room" 
            title="Crisis Simulator Ranks"
            accent={activeTheme.color}
            currentScore={phase === "end" ? finalScore : undefined}
          />
        </div>
      </div>
    </section>
  );
}
