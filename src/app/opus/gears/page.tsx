"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowDown } from "lucide-react";

// Inline SVG for a mechanical gear
const GearSVG = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M50 10C53.3137 10 56 12.6863 56 16V18.1718C59.6009 18.9416 63.0035 20.2526 66.1158 22.046L67.6515 20.5103C69.9946 18.1672 73.7936 18.1672 76.1368 20.5103C78.4799 22.8535 78.4799 26.6525 76.1368 28.9956L74.6011 30.5313C76.3945 33.6436 77.7055 37.0462 78.4753 40.6471H80.6471C83.9608 40.6471 86.6471 43.3334 86.6471 46.6471V53.3529C86.6471 56.6666 83.9608 59.3529 80.6471 59.3529H78.4753C77.7055 62.9538 76.3945 66.3564 74.6011 69.4687L76.1368 71.0044C78.4799 73.3475 78.4799 77.1465 76.1368 79.4897C73.7936 81.8328 69.9946 81.8328 67.6515 79.4897L66.1158 77.954C63.0035 79.7474 59.6009 81.0584 56 81.8282V84C56 87.3137 53.3137 90 50 90H43.3529C40.0392 90 37.3529 87.3137 37.3529 84V81.8282C33.752 81.0584 30.3494 79.7474 27.2372 77.954L25.7015 79.4897C23.3583 81.8328 19.5593 81.8328 17.2162 79.4897C14.873 77.1465 14.873 73.3475 17.2162 71.0044L18.7519 69.4687C16.9585 66.3564 15.6475 62.9538 14.8776 59.3529H12.7059C9.39218 59.3529 6.70589 56.6666 6.70589 53.3529V46.6471C6.70589 43.3334 9.39218 40.6471 12.7059 40.6471H14.8776C15.6475 37.0462 16.9585 33.6436 18.7519 30.5313L17.2162 28.9956C14.873 26.6525 14.873 22.8535 17.2162 20.5103C19.5593 18.1672 23.3583 18.1672 25.7015 20.5103L27.2372 22.046C30.3494 20.2526 33.752 18.9416 37.3529 18.1718V16C37.3529 12.6863 40.0392 10 43.3529 10H50ZM46.6765 33.3529C39.3161 33.3529 33.3529 39.3161 33.3529 46.6765C33.3529 54.0369 39.3161 60 46.6765 60C54.0369 60 60 54.0369 60 46.6765C60 39.3161 54.0369 33.3529 46.6765 33.3529Z"
        />
    </svg>
);

export default function KineticGears() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress through the massive container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Calculate rotations. They run inversely to simulate interlocking
    const rotationCW = useTransform(scrollYProgress, [0, 1], [0, 1440]);
    const rotationCCW = useTransform(scrollYProgress, [0, 1], [15, -1425]); // offset by 15deg so teeth interlock

    // Massive scaling gear that overtakes the screen
    const scaleMain = useTransform(scrollYProgress, [0, 0.5, 1], [1, 2, 4]);
    const opacityMain = useTransform(scrollYProgress, [0, 0.8, 1], [0.1, 0.2, 0.5]);

    return (
        <div ref={containerRef} className="relative w-full h-[300vh] bg-background">
            {/* Fixed UI Layer */}
            <div className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/opus" className="flex items-center gap-2 text-metallic hover:text-white transition-colors group glass-panel px-4 py-2 rounded-full">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                </div>
                <div className="text-right glass-panel px-4 py-2 rounded-full pointer-events-auto">
                    <h1 className="text-sm font-black tracking-widest text-foreground">
                        Kinetic <span className="text-forge-red">Gears</span>
                    </h1>
                </div>
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 text-metallic animate-bounce pointer-events-none">
                <span className="text-xs uppercase font-bold tracking-widest text-foreground/50">Scroll to Initiate</span>
                <ArrowDown size={24} className="text-forge-red" />
            </div>

            {/* Experimental Scene Layer */}
            <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none flex items-center justify-center">

                {/* Background ambient light */}
                <div className="absolute inset-0 z-[-1]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal/40 via-background to-background" />
                </div>

                {/* Central Interlocking Mechanism */}
                <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto">

                    {/* The Main Gear (Center) */}
                    <motion.div
                        style={{ rotate: rotationCW, scale: scaleMain, opacity: opacityMain }}
                        className="absolute text-forge-red mix-blend-screen"
                    >
                        <GearSVG className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] drop-shadow-[0_0_30px_rgba(230,46,45,0.3)]" />
                    </motion.div>

                    {/* Top Left Planetary Gear */}
                    <motion.div
                        style={{ rotate: rotationCCW }}
                        className="absolute top-[10%] left-[10%] md:top-[15%] md:left-[25%] text-metallic/40"
                    >
                        <GearSVG className="w-[200px] h-[200px]" />
                    </motion.div>

                    {/* Bottom Right Planetary Gear */}
                    <motion.div
                        style={{ rotate: rotationCCW }}
                        className="absolute bottom-[10%] right-[10%] md:bottom-[15%] md:right-[25%] text-metallic/40"
                    >
                        <GearSVG className="w-[250px] h-[250px]" />
                    </motion.div>

                    {/* Small Middle Right Transfer Gear */}
                    <motion.div
                        style={{ rotate: rotationCW }}
                        className="absolute top-[45%] right-[5%] md:right-[15%] text-forge-red/30"
                    >
                        <GearSVG className="w-[120px] h-[120px]" />
                    </motion.div>

                    {/* Small Bottom Left Transfer Gear */}
                    <motion.div
                        style={{ rotate: rotationCW }}
                        className="absolute bottom-[25%] left-[5%] md:left-[15%] text-forge-red/30"
                    >
                        <GearSVG className="w-[150px] h-[150px]" />
                    </motion.div>
                </div>

                {/* Scrolling text overlay */}
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                    <motion.div
                        style={{
                            y: useTransform(scrollYProgress, [0, 1], [0, -400]),
                            opacity: useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 0, 0])
                        }}
                        className="text-center"
                    >
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-foreground mix-blend-difference">
                            Frictionless Motion
                        </h2>
                    </motion.div>

                    <motion.div
                        style={{
                            y: useTransform(scrollYProgress, [0, 0.5, 1], [400, 0, -400]),
                            opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0])
                        }}
                        className="text-center absolute"
                    >
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-foreground mix-blend-difference">
                            Torque Scaling
                        </h2>
                    </motion.div>

                    <motion.div
                        style={{
                            y: useTransform(scrollYProgress, [0.5, 1], [400, 0]),
                            opacity: useTransform(scrollYProgress, [0.7, 0.9, 1], [0, 1, 1])
                        }}
                        className="text-center absolute"
                    >
                        <h2 className="text-5xl md:text-8xl font-black uppercase text-forge-red mix-blend-screen drop-shadow-2xl">
                            Maximum Output
                        </h2>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
