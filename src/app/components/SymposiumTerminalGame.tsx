"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Wrench, Cpu, Rocket } from "lucide-react";

type StoryNode = {
  id: string;
  text: string[];
  choices?: { text: string; next: string; stat?: { key: 'tech' | 'guts' | 'design'; val: number } }[];
  endRank?: string;
  endColor?: string;
};

const STORY: Record<string, StoryNode> = {
  boot: {
    id: "boot",
    text: [
      "> INITIALIZING MECHARUSH '26 MAINFRAME...",
      "> WELCOME, ENGINEERING INITIATE.",
      "> LOG: You have entered the ultimate mechanical symposium.",
      "> MISSION: Survive the main events and earn the title of Grand Master.",
      "> ARE YOU READY TO BEGIN THE SIMULATION?"
    ],
    choices: [
      { text: "YES [Y]", next: "pathfinder" },
      { text: "NO [N]", next: "coward" }
    ]
  },
  coward: {
    id: "coward",
    text: [
      "> SIMULATION ABORTED.",
      "> You return to the library to study thermodynamics instead.",
      "> RANK: THE THEORIST"
    ],
    endRank: "THE THEORIST",
    endColor: "text-gray-400"
  },
  pathfinder: {
    id: "pathfinder",
    text: [
      "========================================",
      "EVENT 1: PATHFINDER ROBOT",
      "========================================",
      "> The arena is a brutal mud-pit filled with debris.",
      "> You have 5 minutes to finalize your bot's configuration.",
      "> Do you optimize for speed to beat the clock, or heavy armor to survive the hits?"
    ],
    choices: [
      { text: "Lighter chassis, speed treads", next: "pitshop", stat: { key: "design", val: 1 } },
      { text: "Heavy plating, torque motors", next: "pitshop", stat: { key: "guts", val: 1 } }
    ]
  },
  pitshop: {
    id: "pitshop",
    text: [
      "========================================",
      "EVENT 2: PITSHOP ENGINE REBUILD",
      "========================================",
      "> Your hands are covered in grease. The judge yells 'GO!'",
      "> You need to completely strip and rebuild a 4-cylinder engine block.",
      "> The team next to you is already pulling ahead.",
      "> Strategy?"
    ],
    choices: [
      { text: "Rush it! Use the impact wrench blindly.", next: "pitshop_rush", stat: { key: "guts", val: 1 } },
      { text: "Stay calm. Follow the torque spec sheet.", next: "pitshop_slow", stat: { key: "tech", val: 1 } }
    ]
  },
  pitshop_rush: {
    id: "pitshop_rush",
    text: [
      "> *SNAP!* You sheared a head bolt.",
      "> You manage to extract it, but lost valuable time. You finish 3rd.",
      "> Let's hope the next event goes better."
    ],
    choices: [
      { text: "Continue to Venture Vault", next: "venture" }
    ]
  },
  pitshop_slow: {
    id: "pitshop_slow",
    text: [
      "> Precision pays off. The engine turns over on the first try with a perfect purr.",
      "> The judges are highly impressed by your flawless workmanship.",
      "> You take 1st place in the Pitshop!"
    ],
    choices: [
      { text: "Continue to Venture Vault", next: "venture", stat: { key: "tech", val: 1 } }
    ]
  },
  venture: {
    id: "venture",
    text: [
      "========================================",
      "FINAL EVENT: VENTURE VAULT",
      "========================================",
      "> It's the Mech Tank. You are standing before industry investors.",
      "> Your laptop is plugged in. The slide deck is ready.",
      "> What are you pitching?"
    ],
    choices: [
      { text: "A safe, profitable automated farming tool.", next: "end_safe", stat: { key: "tech", val: 1 } },
      { text: "A radical, untested plasma-fusion engine.", next: "end_crazy", stat: { key: "guts", val: 2 } }
    ]
  },
  end_safe: {
    id: "end_safe",
    text: [
      "> The investors nod approvingly. It's solid, but boring.",
      "> You secure $50,000 in seed funding.",
      "> SIMULATION COMPLETE. CALCULATING FINAL SCORE..."
    ],
    choices: [
      { text: "View Results", next: "results" }
    ]
  },
  end_crazy: {
    id: "end_crazy",
    text: [
      "> Half the investors laugh. The other half stare in awe.",
      "> It's impossible. But if it works, it changes the world.",
      "> You don't get funding, but you get a job offer from a secret lab.",
      "> SIMULATION COMPLETE. CALCULATING FINAL SCORE..."
    ],
    choices: [
      { text: "View Results", next: "results" }
    ]
  },
  results: {
    id: "results",
    text: [
      "> MECHARUSH '26 TRANSCRIPT GENERATED.",
    ],
  }
};

export default function SymposiumTerminalGame() {
  const [currentNode, setCurrentNode] = useState("boot");
  const [lines, setLines] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [stats, setStats] = useState({ tech: 0, guts: 0, design: 0 });
  const [showChoices, setShowChoices] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNode(currentNode);
  }, [currentNode]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, showChoices]);

  const startNode = async (nodeId: string) => {
    const node = STORY[nodeId];
    setTyping(true);
    setShowChoices(false);

    if (nodeId === "boot") {
      setLines([]);
      setStats({ tech: 0, guts: 0, design: 0 });
    }

    // Type lines one by one
    for (let i = 0; i < node.text.length; i++) {
      let currentString = "";
      const fullString = node.text[i];
      
      setLines(prev => [...prev, ""]); // Add empty line
      
      for (let j = 0; j < fullString.length; j++) {
        currentString += fullString[j];
        setLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = currentString;
          return newLines;
        });
        await new Promise(r => setTimeout(r, 15)); // Typing speed
      }
      await new Promise(r => setTimeout(r, 200)); // Pause between lines
    }

    if (nodeId === "results") {
      generateResults();
    } else {
      setTyping(false);
      setShowChoices(true);
    }
  };

  const generateResults = async () => {
    await new Promise(r => setTimeout(r, 500));
    
    // Determine Rank
    let rank = "PARTICIPANT";
    let color = "text-white";
    if (stats.guts > stats.tech && stats.guts > 1) {
      rank = "MAD SCIENTIST";
      color = "text-red-500";
    } else if (stats.tech > stats.guts && stats.tech > 1) {
      rank = "MASTER ENGINEER";
      color = "text-emerald-500";
    } else if (stats.design > 0 && stats.tech > 0) {
      rank = "INNOVATOR";
      color = "text-blue-500";
    }

    setLines(prev => [...prev, ""]);
    setLines(prev => [...prev, `TECH SCORE: [${"=".repeat(stats.tech)}${".".repeat(3-stats.tech)}]`]);
    setLines(prev => [...prev, `GUTS SCORE: [${"=".repeat(stats.guts)}${".".repeat(3-stats.guts)}]`]);
    
    await new Promise(r => setTimeout(r, 800));
    
    setLines(prev => [...prev, ""]);
    setLines(prev => [...prev, `> TERMINAL CLASSIFICATION: << ${rank} >>`]);
    
    setTyping(false);
    setShowChoices(true);
  };

  const handleChoice = (index: number) => {
    const node = STORY[currentNode];
    if (!node.choices) return;
    
    const choice = node.choices[index];
    
    // Add user choice to terminal history
    setLines(prev => [...prev, "", `> EXECUTE: ${choice.text}`]);
    
    if (choice.stat) {
      setStats(prev => ({ ...prev, [choice.stat!.key]: prev[choice.stat!.key] + choice.stat!.val }));
    }

    setTimeout(() => {
      setCurrentNode(choice.next);
    }, 400);
  };

  const resetTerminal = () => {
    setCurrentNode("boot");
  };

  return (
    <section className="relative w-full py-20 overflow-hidden" style={{ background: "#06080c" }}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header Content */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3 text-[#e62e2d]/50">
            <div className="w-10 h-px bg-[#e62e2d]/30" />
            SYMPOSIUM SIMULATOR
            <div className="w-10 h-px bg-[#e62e2d]/30" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
            The MechaRush <span className="text-[#e62e2d]">Initiative</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            Experience the symposium before it happens. Make critical engineering decisions and discover your ranking.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="relative w-full rounded-lg overflow-hidden border border-[#00ff00]/20 font-mono"
             style={{ textShadow: "0 0 5px rgba(0,255,0,0.5)" }}>
          
          {/* Terminal Header */}
          <div className="bg-[#0a1a0a] border-b border-[#00ff00]/20 px-4 py-2 flex items-center justify-between">
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>
             <div className="text-[#00ff00]/50 text-xs flex items-center gap-2">
                <Terminal size={14} /> TTY_MECHARUSH_MAIN
             </div>
          </div>

          {/* Terminal Screen */}
          <div 
             ref={terminalRef}
             className="relative h-[400px] sm:h-[450px] p-4 sm:p-6 overflow-y-auto text-[#00ff00] text-sm sm:text-base scrollbar-thin scrollbar-thumb-[#00ff00]/20"
          >
             {/* Scanlines Overlay */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 mix-blend-overlay"></div>

             {/* Output Lines */}
             <div className="relative z-20 flex flex-col gap-1">
                {lines.map((line, i) => (
                   <span key={i} className={line.includes("<<") ? "text-xl font-bold text-white uppercase drop-shadow-[0_0_10px_#fff]" : ""}>
                     {line}
                   </span>
                ))}
                
                {/* Blinking Cursor */}
                {typing && (
                   <span className="inline-block w-2 h-4 bg-[#00ff00] animate-pulse ml-1 transform translate-y-1"></span>
                )}
             </div>

             {/* Choices */}
             {!typing && showChoices && STORY[currentNode]?.choices && (
                <div className="relative z-20 mt-6 flex flex-col gap-3">
                   {STORY[currentNode].choices!.map((choice, i) => (
                      <button 
                         key={i}
                         onClick={() => handleChoice(i)}
                         className="group text-left p-3 border border-[#00ff00]/30 hover:border-[#00ff00] hover:bg-[#00ff00]/10 transition-colors flex items-center justify-between"
                      >
                         <span>{`[${i+1}] ${choice.text}`}</span>
                         <span className="opacity-0 group-hover:opacity-100 transition-opacity">↵</span>
                      </button>
                   ))}
                </div>
             )}

             {/* Replay Button */}
             {!typing && showChoices && !STORY[currentNode]?.choices && (
                <div className="relative z-20 mt-8">
                   <button 
                      onClick={resetTerminal}
                      className="px-6 py-2 border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-colors font-bold tracking-widest uppercase"
                   >
                      [ REBOOT SYSTEM ]
                   </button>
                </div>
             )}
          </div>
        </div>

      </div>
    </section>
  );
}
