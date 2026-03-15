"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Phone, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useViewMode } from "../context/ViewModeContext";

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
}

export default function EventCard({
    title,
    description,
    coordinators,
    coordinatorsPhones,
    rules,
    sponsors,
    linkUrl,
    linkText,
    imageIcon,
    imageUrl,
    delay = 0
}: EventCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { viewMode } = useViewMode();

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay }}
                onClick={() => setIsModalOpen(true)}
                className="group relative flex flex-col justify-between glass-panel p-6 sm:p-8 rounded-xl overflow-hidden hover:border-forge-red/50 transition-colors duration-500 bg-charcoal/40 cursor-pointer"
            >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-forge-red/0 to-forge-red/0 group-hover:from-forge-red/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

                <div>
                    {viewMode === "image" && imageUrl ? (
                        <div className="w-full h-48 mb-6 rounded-lg overflow-hidden relative shadow-lg group-hover:shadow-[0_0_25px_rgba(230,46,45,0.2)] transition-shadow">
                            <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-colors z-10" />
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    ) : (
                        <div className="w-14 h-14 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center text-forge-red mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {imageIcon}
                        </div>
                    )}

                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-forge-red transition-colors">
                        {title}
                    </h3>

                    <p className="text-metallic text-sm leading-relaxed tracking-wide mb-6">
                        {description}
                    </p>

                    {coordinators && coordinators.length > 0 && (
                        <div className="mb-6 space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/50 border-b border-foreground/5 pb-1">Coordinators</h4>
                            <ul className="text-sm text-foreground/80 space-y-1">
                                {coordinators.map((name, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <User size={14} className="text-forge-red/80" /> {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-forge-red w-max transition-colors mt-auto">
                    View Details & Register <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>

            {/* Event Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col pointer-events-auto"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                                className="absolute top-6 right-6 p-2 rounded-full z-10 bg-background/50 backdrop-blur-md border border-foreground/10 hover:bg-foreground/10 transition-colors text-foreground"
                            >
                                <X size={20} />
                            </button>

                            {viewMode === "image" && imageUrl ? (
                                <div className="w-full h-48 sm:h-64 -mt-6 -mx-6 mb-8 rounded-t-2xl overflow-hidden relative sm:w-[calc(100%+3rem)]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent z-10" />
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-6 left-6 sm:left-10 z-20">
                                        <div className="w-12 h-12 rounded-lg bg-background/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-2 shadow-inner">
                                            {imageIcon}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-forge-red mb-6 shadow-inner mt-2">
                                    {imageIcon}
                                </div>
                            )}

                            <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mb-4 ${viewMode === "image" && imageUrl ? 'mt-2' : ''}`}>
                                {title}
                            </h2>

                            <p className="text-metallic text-base sm:text-lg mb-8">
                                {description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Rulebook */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-forge-red border-b border-forge-red/20 pb-2">
                                        <ShieldAlert size={16} /> Rulebook
                                    </h4>
                                    <ul className="space-y-3 text-sm text-foreground/80 list-disc list-inside">
                                        {rules ? rules.map((rule, idx) => (
                                            <li key={idx} className="leading-relaxed">{rule}</li>
                                        )) : (
                                            <>
                                                <li className="leading-relaxed">Teams map consist of 2-4 members.</li>
                                                <li className="leading-relaxed">Judge's decision is final.</li>
                                                <li className="leading-relaxed">Use of malpractices will lead to immediate disqualification.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                {/* Coordinators & Connect */}
                                <div className="space-y-8">
                                    {coordinators && coordinators.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-forge-red border-b border-forge-red/20 pb-2">
                                                <User size={16} /> Coordinators
                                            </h4>
                                            <ul className="space-y-3 text-sm text-foreground/80">
                                                {coordinators.map((name, idx) => (
                                                    <li key={idx} className="flex flex-col">
                                                        <span className="font-medium text-foreground">{name}</span>
                                                        <span className="flex items-center gap-2 text-metallic mt-1">
                                                            <Phone size={12} /> {coordinatorsPhones?.[idx] || "+91 98765 43210"}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {sponsors && sponsors.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/50 border-b border-foreground/10 pb-2">
                                                Event Sponsor
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {sponsors.map((sponsor, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-foreground/5 border border-foreground/10 rounded-md text-sm text-foreground/80">
                                                        {sponsor}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-foreground/10 flex justify-end">
                                <a
                                    href={linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-forge-red text-white font-bold rounded-lg shadow-lg hover:bg-forge-red-hover transition-colors flex items-center gap-2"
                                >
                                    {linkText} <ArrowRight size={18} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
