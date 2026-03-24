"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Cpu, CircuitBoard, Phone, X, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTextSubmitRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const result = event.results[i][0].transcript;
            
            // Only trigger if this wasn't from a text submit guard
            if (!isTextSubmitRef.current) {
              const updated = [...messages, { role: "user" as const, content: result }];
              setMessages(updated);
              setAiState("processing");
              sendToAPI(updated);
              setTranscript("");
            }
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setAiState("idle");
      };
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  const toggleChat = () => setChatOpen(!chatOpen);

  const startListening = async () => {
    isTextSubmitRef.current = false;
    try {
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
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.85;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) 
                   || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeakingIdx(idx);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[320px] sm:w-[380px] bg-black/90 border border-[#e62e2d]/30 rounded-2xl shadow-[0_0_40px_rgba(230,46,45,0.2)] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-[#111] px-4 py-3 border-b border-[#e62e2d]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CircuitBoard className="text-[#e62e2d]" size={16} />
                <span className="text-white font-bold text-xs tracking-widest uppercase">MechaMind</span>
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
              <div ref={scrollRef} className="flex-1 overflow-y-auto w-full mb-4 space-y-2 pr-1">
                {messages.length === 0 && aiState === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                    <CircuitBoard size={28} className="text-[#e62e2d]/50 mb-3" />
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">MechaMind Online</p>
                    <p className="text-white/25 text-[9px] mt-1">Ask about MechaRush events, schedule, or anything.</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  msg.role === "user" ? (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-white/10 shadow-sm">
                      <p className="text-white/80 text-xs shadow-black/20 text-shadow-sm">{msg.content}</p>
                    </div>
                  ) : (
                    <div key={idx} className="bg-[#e62e2d]/10 p-3 rounded-lg w-fit max-w-[95%] border border-[#e62e2d]/20 backdrop-blur-sm shadow-lg shadow-[#e62e2d]/5">
                      <div className="flex items-start gap-2">
                        <Cpu size={14} className="text-[#e62e2d] mt-1 flex-shrink-0" />
                        <div className="text-white/95 text-[11px] leading-relaxed flex-1 prose-invert prose-p:my-0 prose-headings:my-1 prose-headings:text-[#e62e2d] prose-strong:text-[#e62e2d] prose-strong:font-black prose-ul:list-disc prose-ul:ml-4 prose-code:bg-black/40 prose-code:px-1 prose-code:rounded prose-code:text-[#e62e2d]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
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
              </div>

              {/* Input Control */}
              <div className="pt-2">
                {chatMode === "text" ? (
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#e62e2d]/50 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || aiState === "processing"}
                      className="bg-[#e62e2d] text-white p-2 rounded-lg hover:bg-[#ff3e3d] transition-colors disabled:opacity-30"
                    >
                      <Loader2 className={aiState === "processing" ? "animate-spin" : ""} size={14} />
                    </button>
                  </form>
                ) : chatMode === "voice" ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={aiState === "listening" ? () => recognitionRef.current?.stop() : startListening}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${aiState === "listening" ? "bg-[#e62e2d] shadow-[0_0_20px_rgba(230,46,45,0.4)]" : "bg-white/5 border border-white/10"}`}
                    >
                      <Mic className={aiState === "listening" ? "text-white" : "text-white/30"} size={24} />
                    </motion.button>
                    <span className="text-[10px] text-white/30 tracking-widest uppercase font-bold">
                        {aiState === "listening" ? "Listening..." : "Tap to Speak"}
                    </span>
                  </div>
                ) : (
                    <div className="bg-green-400/5 border border-green-400/20 p-4 rounded-xl text-center">
                        <Phone className="text-green-400 mx-auto mb-2" size={24} />
                        <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Direct Link Active</p>
                        <p className="text-white/40 text-[9px] mt-1 italic">Vocal relay engaged. speak normally.</p>
                        <button className="mt-4 w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-colors border border-green-400/20">End Transmission</button>
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${chatOpen ? "bg-white rotate-90" : "bg-[#e62e2d] hover:bg-[#ff3e3d]"}`}
      >
        {chatOpen ? (
          <X className="text-black" size={24} />
        ) : (
          <div className="relative">
            <Cpu className="text-white" size={24} />
            <motion.div 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-[2px]"
            />
          </div>
        )}
      </motion.button>
    </div>
  );
}
