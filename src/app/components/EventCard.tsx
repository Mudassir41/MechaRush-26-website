"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, X, ShieldAlert, Mail } from "lucide-react";
import { useState } from "react";

interface EventCardProps {
  title: string;
  description: string;
  coordinators?: string[];
  coordinatorsPhones?: string[];
  rules?: string[];
  sponsors?: string[];
  linkUrl: string;
  linkText: string;
  imageIcon: React.ReactNode;
  imageUrl?: string;
  delay?: number;
  accent?: string;
  rulebookUrl?: string;
}

export default function EventCard({
  title, description, coordinators, coordinatorsPhones, rules, sponsors,
  linkUrl, linkText, imageIcon, imageUrl, delay = 0, accent = "#e62e2d", rulebookUrl
}: EventCardProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    const audio = new Audio("/audio/tab_open.mpeg");
    audio.volume = 1;
    audio.play().catch(e => console.log("Audio block", e));
    setOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = new Audio("/audio/tab_close.mpeg");
    audio.volume = 1;
    audio.play().catch(e => console.log("Audio block", e));
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay }}
        onClick={handleOpen}
        className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer"
        style={{
          background: "rgba(12,16,22,0.88)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          transition: "border-color 0.35s, box-shadow 0.35s",
        }}
        whileHover={{
          boxShadow: `0 0 0 1px ${accent}44, 0 8px 40px ${accent}22`,
          borderColor: `${accent}44`,
        }}
      >
        {/* Image or icon */}
        {imageUrl ? (
          <div className="relative w-full h-44 overflow-hidden">
            <div className="absolute inset-0 z-10"
              style={{ background: `linear-gradient(to bottom, transparent 40%, rgba(12,16,22,0.95) 100%)` }} />
            <img src={imageUrl} alt={title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            {/* Icon badge */}
            <div className="absolute bottom-3 left-4 z-20 w-9 h-9 rounded-lg flex items-center justify-center text-white"
              style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
              {imageIcon}
            </div>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-0">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
              style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
              {imageIcon}
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 p-6 pt-4">
          <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2.5 group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed mb-5 flex-1">{description}</p>

          {coordinators && coordinators.length > 0 && (
            <div className="mb-5 space-y-1.5">
              <div className="text-[9px] tracking-[0.35em] uppercase font-bold" style={{ color: `${accent}80` }}>
                Coordinators
              </div>
              {coordinators.map((name, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-white/50">
                  <User size={11} style={{ color: accent }} /> {name}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase mt-auto"
            style={{ color: `${accent}cc` }}>
            View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Hover top-bar accent */}
        <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", damping: 26, stiffness: 350 }}
              className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl pointer-events-auto"
              style={{ background: "#0c1016", border: `1px solid ${accent}30` }}
            >
              {/* Top accent line */}
              <div className="h-1 w-full rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88, transparent)` }} />

              {/* Close button */}
              <button 
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-black/20 hover:bg-black/50 border border-white/10 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Hero image */}
              {imageUrl && (
                <div className="relative w-full h-52 overflow-hidden">
                  <div className="absolute inset-0 z-10"
                    style={{ background: "linear-gradient(to bottom, transparent 30%, #0c1016 100%)" }} />
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6 sm:p-8">
                {!imageUrl && (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
                    {imageIcon}
                  </div>
                )}

                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-3">{title}</h2>
                <p className="text-white/50 text-base mb-8 leading-relaxed">{description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                  {/* Rules */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b"
                      style={{ color: accent, borderColor: `${accent}20` }}>
                      <ShieldAlert size={14} /> EVENT DETAILS
                    </h4>
                    <ul className="space-y-2.5 text-sm text-white/50 list-disc list-inside">
                      {rules ? rules.map((r, i) => <li key={i}>{r}</li>) : (
                        <>
                          <li>Teams must consist of 2–4 members.</li>
                          <li>Judge's decision is final.</li>
                          <li>Malpractice leads to disqualification.</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Coordinators */}
                  {coordinators && coordinators.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b"
                        style={{ color: accent, borderColor: `${accent}20` }}>
                        <User size={14} /> Coordinators
                      </h4>
                      <ul className="space-y-3 text-sm">
                        {coordinators.map((name, i) => (
                          <li key={i} className="flex flex-col">
                            <span className="font-semibold text-white/80">{name}</span>
                            {coordinatorsPhones?.[i] ? (
                              <a 
                                href={coordinatorsPhones[i].includes("@") ? `mailto:${coordinatorsPhones[i]}` : `tel:${coordinatorsPhones[i].replace(/\\s+/g, '')}`}
                                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs mt-0.5 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {coordinatorsPhones[i].includes("@") ? <Mail size={11} /> : <Phone size={11} />} 
                                {coordinatorsPhones[i]}
                              </a>
                            ) : (
                              <span className="flex items-center gap-1.5 text-white/30 text-xs mt-0.5">
                                <Phone size={11} /> —
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex flex-wrap items-center justify-end gap-3" style={{ borderColor: `${accent}15` }}>
                  <a href={rulebookUrl || "#"} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs tracking-wider uppercase text-white hover:bg-white/10 border border-white/20 transition-all active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Rulebook PDF
                  </a>
                  <a href={linkUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-xs tracking-wider uppercase text-black bg-white hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {linkText} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
