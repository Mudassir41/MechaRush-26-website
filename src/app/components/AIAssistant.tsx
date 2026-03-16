"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Cpu, CircuitBoard, Phone, X, Loader2 } from "lucide-react";

type AIState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [aiState, setAiState] = useState<AIState>("idle");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"text" | "voice" | "call">("text");
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Guard to prevent voice useEffect from firing on text submits
  const isTextSubmitRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiState]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onend = () => {
        setAiState(prev => {
           if (prev === "listening") return "processing"; 
           return prev;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setAiState("idle");
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice path ONLY: when speech recognition ends and sets aiState to "processing"
  useEffect(() => {
    // Skip if this was triggered by text submit
    if (isTextSubmitRef.current) {
      isTextSubmitRef.current = false;
      return;
    }

    if (aiState === "processing" && transcript.trim() !== "") {
      const userMsg = transcript;
      setTranscript("");
      const updated = [...messages, { role: "user" as const, content: userMsg }];
      setMessages(updated);
      sendToAPI(updated);
    } else if (aiState === "processing" && transcript.trim() === "") {
      // False alarm from voice recognition — no actual text captured
      setAiState("idle");
    }
  }, [aiState]);

  const toggleChat = () => setChatOpen(!chatOpen);

  const startListening = async () => {
    if (!recognitionRef.current) {
      setMessages(prev => [...prev, { role: "assistant", content: "SYSTEM ERROR: Voice recognition is not supported in this browser (please use Chrome/Edge)." }]);
      return;
    }

    try {
      // Request mic permission first so it doesn't fail silently
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript("");
      setAiState("listening");
      recognitionRef.current?.start();
    } catch (e: any) {
      console.error("Mic access error:", e);
      setAiState("idle");
      setMessages(prev => [...prev, { role: "assistant", content: "SYSTEM ERROR: Microphone access denied or unavailable." }]);
    }
  };

  // Text submit: completely separate from voice path
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiState === "processing") return;
    
    if (aiState === "listening") {
      try { recognitionRef.current?.stop(); } catch (e) {}
    }
    
    const userText = chatInput;
    setChatInput("");

    // Set guard so voice useEffect doesn't fire
    isTextSubmitRef.current = true;
    
    const updated = [...messages, { role: "user" as const, content: userText }];
    setMessages(updated);
    setAiState("processing");
    sendToAPI(updated);
  };

  // Shared API call — takes the full messages array as argument, no setState inside
  const sendToAPI = async (currentMessages: ChatMessage[]) => {
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });
      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: `SYSTEM ERROR: ${data.error}` }]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: `NETWORK ERROR: ${err.message}` }]);
    } finally {
      setAiState("idle");
    }
  };

  // TTS: use native browser SpeechSynthesis API
  const speakMessage = (text: string, idx: number) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.85;
    utterance.volume = 1.0;
    
    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) 
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    
    setSpeakingIdx(idx);
    
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    
    window.speechSynthesis.speak(utterance);
  };

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
                <span className="text-white font-bold text-xs tracking-widest uppercase">Forge-AI</span>
              </div>
              <button onClick={toggleChat} className="text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-white/5 bg-black/40">
              <button onClick={() => setChatMode("text")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${chatMode === "text" ? "text-[#e62e2d] bg-[#e62e2d]/10" : "text-white/40 hover:text-white/60"}`}>TEXT</button>
              <button onClick={() => setChatMode("voice")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase border-x border-white/5 transition-colors ${chatMode === "voice" ? "text-[#e62e2d] bg-[#e62e2d]/10" : "text-white/40 hover:text-white/60"}`}>VOICE</button>
              <button onClick={() => setChatMode("call")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${chatMode === "call" ? "text-green-400 bg-green-400/10" : "text-white/40 hover:text-white/60"}`}>CALL</button>
            </div>

            {/* Content Area */}
            <div className="p-4 min-h-[200px] max-h-[400px] flex flex-col justify-end">
              <div className="flex-1 overflow-y-auto w-full mb-4 space-y-2 pr-1">
                {messages.length === 0 && aiState === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                    <CircuitBoard size={28} className="text-[#e62e2d]/50 mb-3" />
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Forge-AI Online</p>
                    <p className="text-white/25 text-[9px] mt-1">Ask about MechaRush events, schedule, or anything.</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  msg.role === "user" ? (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-white/10">
                      <p className="text-white/80 text-xs">{msg.content}</p>
                    </div>
                  ) : (
                    <div key={idx} className="bg-[#e62e2d]/10 p-3 rounded-lg w-fit max-w-[90%] border border-[#e62e2d]/20">
                      <div className="flex items-start gap-2">
                        <Cpu size={14} className="text-[#e62e2d] mt-0.5 flex-shrink-0" />
                        <p className="text-white/90 text-[11px] whitespace-pre-wrap leading-relaxed flex-1">{msg.content}</p>
                      </div>
                      {/* TTS Play Button — uses native browser SpeechSynthesis */}
                      {!msg.content.startsWith("SYSTEM ERROR") && !msg.content.startsWith("NETWORK ERROR") && (
                        <button
                          onClick={() => speakMessage(msg.content, idx)}
                          disabled={speakingIdx !== null}
                          className="mt-2 flex items-center gap-1.5 text-[9px] text-white/30 hover:text-[#e62e2d] transition-colors disabled:opacity-30"
                          title="Read aloud"
                        >
                          {speakingIdx === idx ? (
                            <Volume2 size={11} className="animate-pulse text-[#e62e2d]" />
                          ) : (
                            <Volume2 size={11} />
                          )}
                          <span className="uppercase tracking-wider">{speakingIdx === idx ? "Speaking..." : "Play"}</span>
                        </button>
                      )}
                    </div>
                  )
                ))}
                
                {aiState === "listening" && transcript && (
                  <div className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-green-500/30">
                    <p className="text-white/50 text-xs italic">{transcript}</p>
                  </div>
                )}
                
                {aiState === "processing" && (
                    <div className="bg-[#e62e2d]/5 p-3 rounded-lg w-fit border border-[#e62e2d]/10 flex items-center gap-2">
                        <Cpu size={14} className="text-[#e62e2d] opacity-50" />
                        <div className="flex gap-1 items-center opacity-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse delay-75"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e62e2d] animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {chatMode === "call" ? (
                <div className="flex flex-col items-center justify-center py-4 gap-4 border-t border-white/10 mt-2 pt-6">
                  <button onClick={startListening} disabled={aiState === "listening" || aiState === "processing"} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${aiState === "listening" ? "bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse" : aiState === "speaking" ? "bg-[#e62e2d]/20 shadow-[0_0_20px_rgba(230,46,45,0.4)]" : "bg-white/5 hover:bg-white/10"}`}>
                    <Phone className={aiState === "listening" ? "text-green-400" : aiState === "speaking" ? "text-[#e62e2d]" : "text-white/30"} size={28} />
                  </button>
                  <div className="text-center font-mono text-[10px] text-white/50 uppercase tracking-widest">
                    {aiState === "listening" ? "Listening..." : aiState === "speaking" ? "Agent Speaking..." : aiState === "processing" ? "Processing..." : "Tap to Call"}
                  </div>
                </div>
              ) : chatMode === "text" ? (
                <form onSubmit={handleTextSubmit} className="flex gap-2 w-full mt-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message Forge-AI..."
                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e62e2d]/50 transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || aiState === "processing"}
                    className="bg-[#e62e2d] text-black px-4 py-2 rounded text-xs font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    SEND
                  </button>
                </form>
              ) : (
                <button 
                  onClick={startListening}
                  disabled={aiState === "listening" || aiState === "processing"}
                  className="w-full flex items-center justify-center gap-2 bg-[#e62e2d]/10 border border-[#e62e2d]/30 text-[#e62e2d] py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#e62e2d]/20 transition-all disabled:opacity-50 mt-2"
                >
                  {aiState === "listening" ? <><Mic size={14} className="animate-pulse" /> Listening...</> : <><Mic size={14} /> Tap to Speak</>}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button
        onClick={toggleChat}
        className={`pointer-events-auto h-12 px-4 rounded-lg flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 border ${chatOpen ? "bg-[#e62e2d] border-[#e62e2d] text-white" : "bg-black/60 backdrop-blur-md border border-white/20 text-white/70 hover:text-white"}`}
        title="Initialize AI Assistant"
      >
        <CircuitBoard size={18} className={aiState === "listening" || aiState === "processing" ? "animate-pulse text-[#e62e2d]" : ""} />
        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:block">Forge-AI</span>
      </button>

    </div>
  );
}
