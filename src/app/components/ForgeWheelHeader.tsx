"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

function SpinningWheel() {
    const rimRef = useRef<THREE.Mesh>(null);
    const sparksRef = useRef<THREE.Points>(null);
    const pointerRef = useRef({ x: 0, y: 0 });
    const speedRef = useRef(1.5);
    const groupRef = useRef<THREE.Group>(null);

    const sparkCount = 600;
    const sparkPositions = useMemo(() => {
        const pos = new Float32Array(sparkCount * 3);
        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 3;
            pos[i * 3] = Math.cos(angle) * r;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 2] = Math.sin(angle) * r;
        }
        return pos;
    }, []);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []);

    useFrame((state, delta) => {
        if (!rimRef.current || !sparksRef.current || !groupRef.current) return;
        const pointer = pointerRef.current;
        const time = state.clock.elapsedTime;

        // Gentle tracking
        const targetSpeed = 1.5 + new THREE.Vector2(pointer.x, pointer.y).length() * 2.0;
        speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, delta * 2.0);

        // Keep it nicely anchored to the top right mostly, with slight bobbing and mouse tracking
        const basePosX = 3.5 + pointer.x * 0.5;
        const basePosY = 2.5 + pointer.y * 0.5;

        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, basePosY + Math.sin(time) * 0.2, delta * 2);
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, basePosX + Math.cos(time * 0.8) * 0.2, delta * 2);

        rimRef.current.rotation.z += delta * speedRef.current;

        // Gentle tilt tracking
        const targetRotX = Math.PI / 2 + 0.3 + pointer.y * 0.2;
        const targetRotY = -0.4 + pointer.x * 0.2;

        rimRef.current.rotation.x = THREE.MathUtils.lerp(rimRef.current.rotation.x, targetRotX, delta * 3.0);
        rimRef.current.rotation.y = THREE.MathUtils.lerp(rimRef.current.rotation.y, targetRotY, delta * 3.0);

        // Animate sparks
        const positions = sparksRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
            positions[i * 3 + 1] -= delta * speedRef.current * 1.5;
            positions[i * 3] += Math.sin(time * 8 + i) * delta * speedRef.current * 0.3;
            if (positions[i * 3 + 1] < -4) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * 2;
                positions[i * 3] = Math.cos(angle) * r;
                positions[i * 3 + 1] = 4 + Math.random() * 2;
                positions[i * 3 + 2] = Math.sin(angle) * r;
            }
        }
        sparksRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group ref={groupRef}>
            <pointLight position={[0, 0, 3]} distance={18} intensity={50} color="#ff5500" />
            <ambientLight intensity={0.5} />

            <mesh ref={rimRef}>
                <torusGeometry args={[2, 0.4, 16, 32]} />
                <meshStandardMaterial color="#aaa" emissive="#220000" metalness={0.9} roughness={0.2} wireframe={true} />

                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 5]}>
                        <cylinderGeometry args={[0.08, 0.08, 3.8]} />
                        <meshStandardMaterial color="#e0e0e0" emissive="#331100" metalness={0.8} roughness={0.3} />
                    </mesh>
                ))}
            </mesh>

            <points ref={sparksRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={sparkCount} args={[sparkPositions, 3]} />
                </bufferGeometry>
                <pointsMaterial color="#ff5500" size={0.06} blending={THREE.AdditiveBlending} transparent opacity={0.85} />
            </points>
        </group>
    );
}

export default function ForgeWheelHeader() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[50] overflow-hidden pointer-events-none mix-blend-screen">
            <Canvas
                gl={{ antialias: false, powerPreference: "default", alpha: true }}
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 10], fov: 45 }}
                style={{ background: 'transparent', width: '100%', height: '100%' }}
            >
                <SpinningWheel />
            </Canvas>
        </div>
    );
}

