"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Power, Zap, AlertOctagon, Trophy } from "lucide-react";
import Leaderboard from "./Leaderboard";

const PAD_COLORS = [
  { id: 0, color: "#e62e2d", label: "Sector Alpha" },
  { id: 1, color: "#3b82f6", label: "Sector Beta" },
  { id: 2, color: "#10b981", label: "Sector Gamma" },
  { id: 3, color: "#f59e0b", label: "Sector Delta" },
];

const MOCK_GLOBAL_BEST = 42;

export default function CoreOverloadGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Visual feedback states
  const [activePad, setActivePad] = useState<number | null>(null);
  const [message, setMessage] = useState<{text: string, type: "info"|"action"|"error"}>({text: "INITIALIZE CORE", type: "info"});
  const [isComputersTurn, setIsComputersTurn] = useState(false);

  // Sound ref (mock)
  const beepTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("mechrush_core_hs");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    setIsComputersTurn(true);
    setMessage({ text: "MEMORIZE SEQUENCE", type: "info" });
    
    // Initial delay before showing
    await new Promise(r => setTimeout(r, 800));

    for (let i = 0; i < seq.length; i++) {
        setActivePad(seq[i]);
        // Sound could go here
        
        // Duration gets slightly faster as sequence grows
        const showDuration = Math.max(200, 600 - (seq.length * 15));
        await new Promise(r => setTimeout(r, showDuration));
        
        setActivePad(null);
        
        const gapDuration = Math.max(100, 300 - (seq.length * 10));
        await new Promise(r => setTimeout(r, gapDuration));
    }

    setIsComputersTurn(false);
    setMessage({ text: "AWAITING INPUT", type: "action" });
  }, []);

  const nextRound = useCallback(() => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...sequence, nextPad];
    setSequence(newSeq);
    setPlayerIdx(0);
    playSequence(newSeq);
  }, [sequence, playSequence]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setSequence([]);
    // Slight delay before first round
    setTimeout(() => {
       nextRound();
    }, 500);
  };

  const handlePadClick = (id: number) => {
    if (gameState !== "playing" || isComputersTurn) return;

    // Visual feedback
    setActivePad(id);
    clearTimeout(beepTimeout.current);
    beepTimeout.current = setTimeout(() => setActivePad(null), 200);

    // Check logic
    if (id === sequence[playerIdx]) {
      // Correct!
      if (playerIdx === sequence.length - 1) {
        // Round complete
        setScore(sequence.length);
        setMessage({ text: "SEQUENCE ACCEPTED", type: "info" });
        setIsComputersTurn(true);
        setTimeout(() => nextRound(), 800);
      } else {
        setPlayerIdx(idx => idx + 1);
      }
    } else {
      // Wrong!
      setMessage({ text: "SYSTEM FAILURE", type: "error" });
      setGameState("gameover");
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("mechrush_core_hs", score.toString());
      }
    }
  };

  return (
    <section className="relative w-full py-20 overflow-hidden" style={{ background: "#06080c" }}>
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3b82f6]/20 border border-[#3b82f6]/50 mb-6 text-[#3b82f6]">
            <Cpu size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
            Core <span className="text-[#3b82f6]">Overload</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto mb-6">
            Memorize the AI's diagnostic flash sequence to stabilize the core. One mistake triggers a system shutdown.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <Trophy size={16} className="text-[#f59e0b]" />
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Global Best: {MOCK_GLOBAL_BEST} Rounds</span>
             </div>
             {highScore > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-full">
                   <Zap size={16} className="text-[#3b82f6]" />
                   <span className="text-xs font-bold text-[#3b82f6] uppercase tracking-widest">Your Best: {highScore}</span>
                </div>
             )}
          </div>
        </div>

        {/* Game Area */}
        <div className="relative w-full max-w-2xl mx-auto bg-[#0a0d14] rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           
           {/* HUD Grid */}
           <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">Stable Rounds</span>
               <span className="text-3xl font-black font-mono text-white tracking-tight">{score}</span>
             </div>
             <motion.div 
                animate={{ opacity: message.type === "error" ? [1, 0.5, 1] : 1, color: message.type === "error" ? "#e62e2d" : message.type === "action" ? "#10b981" : "#ffffff" }}
                transition={{ duration: 0.5, repeat: message.type === "error" ? Infinity : 0 }}
                className="text-[11px] font-bold tracking-[0.4em] uppercase bg-black/50 px-4 py-2 rounded-full border border-white/10"
              >
               {message.text}
             </motion.div>
           </div>

           {/* Central Simon Grid */}
           <div className="grid grid-cols-2 gap-4 mt-16 max-w-sm mx-auto aspect-square relative z-10 p-4">
             {PAD_COLORS.map((pad) => {
                const isActive = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    disabled={gameState !== "playing" || isComputersTurn}
                    onClick={() => handlePadClick(pad.id)}
                    className="relative rounded-2xl overflow-hidden transition-all duration-150 active:scale-95"
                    style={{
                      backgroundColor: isActive ? pad.color : `${pad.color}30`,
                      boxShadow: isActive ? `0 0 30px ${pad.color}` : `inset 0 0 20px rgba(0,0,0,0.5)`,
                      border: `1px solid ${isActive ? pad.color : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <span className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-widest transition-opacity ${isActive ? 'text-white' : 'text-white/20'}`}>
                      {pad.label}
                    </span>
                  </button>
                );
             })}

             {/* Center Hub */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#0a0d14] border-[4px] border-white/5 flex items-center justify-center pointer-events-none z-20">
               <Power size={24} className={gameState === "playing" ? "text-[#3b82f6] animate-pulse" : "text-white/20"} />
             </div>
           </div>

           {/* Game Over / Start Overlays */}
           <AnimatePresence>
             {gameState === "idle" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-3xl"
                >
                  <button 
                    onClick={startGame}
                    className="px-8 py-4 bg-[#3b82f6] text-white font-black tracking-widest uppercase rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  >
                    Initiate Boot Sequence
                  </button>
                </motion.div>
             )}

             {gameState === "gameover" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center rounded-3xl border border-[#e62e2d]/50"
                >
                  <AlertOctagon size={48} className="text-[#e62e2d] mb-4" />
                  <h3 className="text-3xl font-black uppercase text-[#e62e2d] mb-2 drop-shadow-[0_0_15px_rgba(230,46,45,0.5)]">System Override</h3>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-xs mb-6 mt-4">
                     <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Rounds Survived</div>
                     <div className="text-5xl font-mono font-black text-white mb-2">{score}</div>
                     {score >= highScore && score > 0 && (
                        <div className="inline-block bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase animate-pulse">
                           Sector Record!
                        </div>
                     )}
                  </div>

                  <button 
                    onClick={startGame}
                    className="px-8 py-3 bg-white text-black font-black tracking-widest uppercase rounded-lg hover:bg-gray-200 transition-colors active:scale-95 w-full max-w-xs"
                  >
                    Reboot Terminal
                  </button>
                </motion.div>
             )}
           </AnimatePresence>

        </div>

        {/* Leaderboard Section */}
        <div className="mt-12">
          <Leaderboard 
            gameKey="core_overload" 
            title="Diagnostics Hall of Fame"
            accent="#3b82f6"
            currentScore={gameState === "gameover" ? score : undefined}
          />
        </div>

      </div>
    </section>
  );
}
