"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

interface Props {
  gameKey: string;
  currentScore?: number;
  onClose?: () => void;
  accent?: string;
  title?: string;
}

export default function Leaderboard({ gameKey, currentScore, onClose, accent = "#e62e2d", title = "Leaderboard" }: Props) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [name, setName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`mechrush_${gameKey}_scores`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScores(parsed.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score).slice(0, 10));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, [gameKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || currentScore === undefined) return;

    const newScore: ScoreEntry = {
      name: name.trim().slice(0, 15).toUpperCase(),
      score: currentScore,
      date: new Date().toISOString()
    };

    const newScores = [...scores, newScore].sort((a, b) => b.score - a.score).slice(0, 10);
    setScores(newScores);
    localStorage.setItem(`mechrush_${gameKey}_scores`, JSON.stringify(newScores));
    setHasSubmitted(true);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between" style={{ backgroundColor: `${accent}15` }}>
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: accent }} />
          <h3 className="font-bold tracking-widest uppercase text-white">{title}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            ✕
          </button>
        )}
      </div>

      <div className="p-5">
        {currentScore !== undefined && !hasSubmitted && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="text-xs text-center uppercase tracking-widest text-[#e62e2d] mb-2 font-bold">New High Score: {currentScore}</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER NAME"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                maxLength={15}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#e62e2d]/50 transition-colors uppercase"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#e62e2d] text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-[#e62e2d]/80 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm italic font-mono">No records found. Be the first.</div>
          ) : (
            <AnimatePresence>
              {scores.map((entry, i) => (
                <motion.div
                  key={`${entry.name}-${entry.score}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-bold text-lg" style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.2)" }}>
                      {i === 0 ? <Crown size={18} className="mx-auto" /> : i === 1 ? <Medal size={16} className="mx-auto" /> : i === 2 ? <Medal size={16} className="mx-auto" /> : `#${i + 1}`}
                    </div>
                    <span className="font-mono font-bold text-white/90">{entry.name}</span>
                  </div>
                  <span className="font-mono text-[#e62e2d] font-bold">{entry.score.toLocaleString()}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
