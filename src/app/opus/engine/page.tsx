"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Wireframe } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// A procedural, abstract "Mechanical Engine Core" using Three.js primitives
function EngineBlock() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Slow idle rotation
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main Crankcase */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[3, 1.5, 2]} />
                <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Cylinders (V4 Configuration) */}
            {[-0.8, 0.8].map((x, i) => (
                <group key={`bank-${i}`}>
                    <mesh position={[x, 0.8, -0.5]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
                        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
                        <meshStandardMaterial color="#e62e2d" metalness={0.5} roughness={0.5} />
                    </mesh>
                    <mesh position={[x, 0.8, 0.5]} rotation={[0, 0, x > 0 ? -0.3 : 0.3]}>
                        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
                        <meshStandardMaterial color="#e62e2d" metalness={0.5} roughness={0.5} />
                    </mesh>
                </group>
            ))}

            {/* Flywheel */}
            <mesh position={[0, -0.5, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 0.4, 32]} />
                <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Wireframe Overlay for "CAD Blueprint" aesthetic */}
            <mesh position={[0, 0, 0]} scale={1.05}>
                <boxGeometry args={[3.2, 3, 2.5]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

export default function EngineOpus() {
    return (
        <div className="w-full h-screen bg-background relative overflow-hidden flex flex-col">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-background/90 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/opus" className="flex items-center gap-2 text-metallic hover:text-white transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Labs
                    </Link>
                </div>
                <div className="text-right pointer-events-auto">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        Project: <span className="text-forge-red">Aegis Core</span>
                    </h1>
                    <p className="text-sm font-mono text-metallic">INTERACTIVE CAD SIMULATION v1.0</p>
                </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-6 glass-panel rounded-lg w-64 pointer-events-none hidden md:block"
            >
                <h3 className="font-bold text-forge-red mb-4 uppercase tracking-wider text-sm">System Specs</h3>
                <ul className="space-y-4 text-xs font-mono text-metallic">
                    <li className="flex justify-between border-b border-foreground/10 pb-1">
                        <span>Block Config</span> <span className="text-foreground">V4 Precision</span>
                    </li>
                    <li className="flex justify-between border-b border-foreground/10 pb-1">
                        <span>Material</span> <span className="text-foreground">Tungsten Alloy</span>
                    </li>
                    <li className="flex justify-between border-b border-foreground/10 pb-1">
                        <span>Status</span> <span className="text-green-500">Nominal Rendering</span>
                    </li>
                </ul>
            </motion.div>

            {/* Informational overlay to tell user how to interact */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
                <span className="px-4 py-2 rounded-full glass-panel text-xs text-metallic font-mono uppercase tracking-widest animate-pulse">
                    Click & Drag to Rotate • Scroll to Zoom
                </span>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 w-full relative cursor-move">
                <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#e62e2d" />

                    <EngineBlock />

                    <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
                    <Environment preset="city" />
                    <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={3} maxDistance={15} />
                </Canvas>
            </div>
        </div>
    );
}
