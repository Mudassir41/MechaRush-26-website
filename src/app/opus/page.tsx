"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Settings, Code, Wrench } from "lucide-react";

export default function OpusHub() {
    return (
        <div className="flex flex-col items-center min-h-[90vh] pb-24 overflow-hidden relative">
            <div className="fixed inset-0 z-[-1] pointer-events-none bg-background">
                <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-forge-red/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal/40 via-background to-background" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-5xl mx-auto px-6 pt-32 text-center"
            >
                <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-forge-red/10 border border-forge-red/30 mb-8 mx-auto self-center">
                    <Wrench size={32} className="text-forge-red" />
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                    The <span className="text-forge-red text-gradient">Opus</span> Labs
                </h1>
                <p className="text-metallic text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-16">
                    Welcome to the experimental phase. Here we are testing radically different, highly-interactive, and realistic mechanical simulations. Choose an experience below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mx-auto text-left">
                    <Link href="/opus/gears" className="group p-8 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/40 to-transparent z-0 group-hover:from-forge-red/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full">
                            <Settings className="text-forge-red mb-6" size={40} />
                            <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
                                Kinetic Gears
                            </h2>
                            <p className="text-metallic text-sm leading-relaxed mb-8 flex-1">
                                A highly realistic, scrolling-dependent interlocking planetary gear simulation.
                                Watch as the entire webpage mechanics grind and turn as you traverse the page.
                            </p>
                            <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-forge-red transition-colors mt-auto">
                                Enter Simulation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/opus/engine" className="group p-8 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-bl from-charcoal/40 to-transparent z-0 group-hover:from-forge-red/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full">
                            <Code className="text-forge-red mb-6" size={40} />
                            <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
                                3D CAD Engine
                            </h2>
                            <p className="text-metallic text-sm leading-relaxed mb-8 flex-1">
                                An interactive, photorealistic WebGL rendering of a mechanical engine block floating in the center of the viewport, rendered live via Three.js.
                            </p>
                            <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-forge-red transition-colors mt-auto">
                                Enter Simulation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/opus/ocean" className="group p-8 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent z-0 group-hover:from-forge-red/10 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-forge-red mb-6" style={{ fontSize: 40 }}>🌊</span>
                            <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground mb-3">
                                Liquid Metal
                            </h2>
                            <p className="text-metallic text-sm leading-relaxed mb-8 flex-1">
                                A photorealistic WebGL fluid simulation adapted from oceanic physics, rendering heavy metallic swells with dynamic foam streaking and subsurface scattering.
                            </p>
                            <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-forge-red transition-colors mt-auto">
                                Enter Simulation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/opus/forge" className="group p-8 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-orange-500/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent z-0 group-hover:from-orange-500/20 transition-colors" />
                        <div className="relative z-10 flex flex-col h-full">
                            <span className="text-orange-500 mb-6" style={{ fontSize: 40 }}>🔥</span>
                            <h2 className="text-3xl font-bold uppercase tracking-tight text-white mb-3">
                                The Forge
                            </h2>
                            <p className="text-metallic text-sm leading-relaxed mb-8 flex-1">
                                An interactive swarm of 10,000 thermodynamic metal particles. Raw WebGL shaders calculate convection currents and heat repulsion based on your mouse movements.
                            </p>
                            <div className="flex items-center gap-2 font-bold text-sm text-orange-500 group-hover:text-orange-400 transition-colors mt-auto">
                                Ignite Crucible <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
