"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Cpu, Cog, Phone, X, Loader2 } from "lucide-react";
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
      setMessages(prev => [...prev, { role: "assistant", content: "SYSTEM ERROR: Microphone access denied or unavailable. (Note: Browsers require HTTPS for microphone access)." }]);
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

  const handleSuggestionClick = (text: string) => {
    isTextSubmitRef.current = true;
    const updated = [...messages, { role: "user" as const, content: text }];
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
    
    // Strip markdown formatting characters for cleaner audio reading
    const cleanText = text.replace(/[*_#>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => setSpeakingIdx(idx);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      setSpeakingIdx(null);
    };

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
            className="mb-4 w-[320px] sm:w-[380px] bg-black/90 border border-[#00e5ff]/30 rounded-2xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-[#111] px-4 py-3 border-b border-[#00e5ff]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cog className="text-[#00e5ff] animate-[spin_10s_linear_infinite]" size={16} />
                <span className="text-white font-bold text-xs tracking-widest uppercase">MechaMind</span>
              </div>
              <button onClick={toggleChat} className="text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex border-b border-white/5 bg-black/40">
              <button onClick={() => setChatMode("text")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${chatMode === "text" ? "text-[#00e5ff] bg-[#00e5ff]/10" : "text-white/40 hover:text-white/60"}`}>TEXT</button>
              <button onClick={() => setChatMode("voice")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase border-x border-white/5 transition-colors ${chatMode === "voice" ? "text-[#00e5ff] bg-[#00e5ff]/10" : "text-white/40 hover:text-white/60"}`}>VOICE</button>
              <button onClick={() => setChatMode("call")} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${chatMode === "call" ? "text-green-400 bg-green-400/10" : "text-white/40 hover:text-white/60"}`}>CALL</button>
            </div>

            {/* Content Area */}
            <div className="p-4 min-h-[200px] max-h-[400px] flex flex-col justify-end">
              <div ref={scrollRef} className="flex-1 overflow-y-auto w-full mb-4 space-y-2 pr-1">
                {messages.length === 0 && aiState === "idle" && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-50">
                    <Cog size={28} className="text-[#00e5ff]/50 mb-3 animate-[spin_20s_linear_infinite]" />
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">MechaMind Online</p>
                    <p className="text-white/25 text-[9px] mt-1">Ask about Events, Timing, or Logistics.</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  msg.role === "user" ? (
                    <div key={idx} className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-white/10 shadow-sm relative">
                      <p className="text-white/80 text-xs shadow-black/20 text-shadow-sm">{msg.content}</p>
                    </div>
                  ) : (
                    <div key={idx} className="bg-[#00e5ff]/10 p-3 pt-5 rounded-lg w-fit max-w-[95%] border border-[#00e5ff]/20 backdrop-blur-sm shadow-lg shadow-[#00e5ff]/5 relative group pr-8">
                      {!msg.content.startsWith("SYSTEM ERROR") && !msg.content.startsWith("NETWORK ERROR") && (
                        <button
                          onClick={() => speakMessage(msg.content, idx)}
                          disabled={speakingIdx !== null && speakingIdx !== idx}
                          className="absolute top-2 right-2 text-white/30 hover:text-[#00e5ff] transition-colors disabled:opacity-30 p-1"
                          title="Read aloud"
                        >
                          {speakingIdx === idx ? (
                            <Volume2 size={12} className="animate-pulse text-[#00e5ff]" />
                          ) : (
                            <Volume2 size={12} />
                          )}
                        </button>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <Cog size={14} className="text-[#00e5ff] mt-1 flex-shrink-0 animate-[spin_10s_linear_infinite]" />
                        <div className="text-white/95 text-[11px] leading-relaxed flex-1 prose-invert prose-p:my-0 prose-headings:my-1 prose-headings:text-[#00e5ff] prose-strong:text-[#00e5ff] prose-strong:font-black prose-code:bg-black/40 prose-code:px-1 prose-code:rounded prose-code:text-[#00e5ff]">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                ul: ({node, ...props}) => <ul className="flex flex-wrap gap-2 mt-3 p-0 m-0" {...props} />,
                                li: ({node, ...props}) => (
                                  <li 
                                    className="list-none inline-block bg-[#00e5ff]/10 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/30 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-colors shadow-sm"
                                    onClick={() => handleSuggestionClick(String(props.children))}
                                  >
                                    {props.children}
                                  </li>
                                )
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                
                {aiState === "listening" && transcript && (
                  <div className="bg-white/5 p-3 rounded-lg ml-auto w-fit max-w-[85%] border border-green-500/30">
                    <p className="text-white/50 text-xs italic">{transcript}</p>
                  </div>
                )}
                
                {aiState === "processing" && (
                    <div className="bg-[#00e5ff]/5 p-3 rounded-lg w-fit border border-[#00e5ff]/10 flex items-center gap-2">
                        <Cpu size={14} className="text-[#00e5ff] opacity-50" />
                        <div className="flex gap-1 items-center opacity-50">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse delay-75"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse delay-150"></span>
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
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#00e5ff]/50 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || aiState === "processing"}
                      className="bg-[#00e5ff] text-white p-2 rounded-lg hover:bg-[#00ccff] transition-colors disabled:opacity-30"
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${aiState === "listening" ? "bg-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.4)]" : "bg-white/5 border border-white/10"}`}
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

      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.6)] transition-all duration-300 ${chatOpen ? "bg-white rotate-90" : "bg-[#00e5ff] hover:bg-[#00ccff]"}`}
      >
        {chatOpen ? (
          <X className="text-black" size={28} />
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            <Cog className="text-white relative z-10 animate-[spin_8s_linear_infinite]" size={32} />
            
            {/* Glowing inner rings to draw attention */}
            <motion.div 
               animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 rounded-full border-2 border-white/40"
            />
            <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full blur-[2px]"
            />
          </div>
        )}
      </motion.button>
    </div>
  );
}
