"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

function TrussBridge() {
    const pointsRef = useRef<THREE.LineSegments>(null);

    const { nodes, links } = useMemo(() => {
        const nodes: [number, number, number][] = [];
        const links: [number, number][] = [];
        const segments = 15;
        const width = 12;

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * width - (width / 2);
            nodes.push([x, -1, 1]);
            nodes.push([x, -1, -1]);
            const archY = Math.sin((i / segments) * Math.PI) * 2 - 1;
            nodes.push([x, archY, 0]);
        }

        for (let i = 0; i < segments; i++) {
            const base = i * 3;
            links.push([base, base + 3]);
            links.push([base + 1, base + 4]);
            links.push([base, base + 4]);
            if (i < segments) {
                links.push([base + 2, base + 5]);
                links.push([base, base + 2]);
                links.push([base + 1, base + 2]);
                links.push([base + 3, base + 2]);
                links.push([base + 4, base + 2]);
            }
        }
        return { nodes, links };
    }, []);

    const positions = useMemo(() => {
        const arr = new Float32Array(links.length * 6);
        links.forEach((link, i) => {
            const n1 = nodes[link[0]];
            const n2 = nodes[link[1]];
            arr[i * 6] = n1[0]; arr[i * 6 + 1] = n1[1]; arr[i * 6 + 2] = n1[2];
            arr[i * 6 + 3] = n2[0]; arr[i * 6 + 4] = n2[1]; arr[i * 6 + 5] = n2[2];
        });
        return arr;
    }, [nodes, links]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        // Just a gentle hovering bob effect
        pointsRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    });

    return (
        <group>
            <lineSegments ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={positions.length / 3} args={[positions, 3]} />
                </bufferGeometry>
                {/* Bridge color set to forge red to stand out */}
                <lineBasicMaterial color="#e62e2d" opacity={0.9} transparent linewidth={2} />
            </lineSegments>
        </group>
    );
}

export default function InlineBridgeShowcase() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas
                gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
                dpr={[1, 1.5]}
                camera={{ position: [0, 2, 8], fov: 45 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} />
                <TrussBridge />
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    maxDistance={15}
                    minDistance={3}
                />
            </Canvas>
            {/* Small instructional overlay */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-mono tracking-widest text-metallic uppercase pointer-events-none">
                3D Interactive
            </div>
        </div>
    );
}
