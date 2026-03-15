"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";

// A custom shader material for thermodynamic metal particles
const particleVertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  attribute float size;
  attribute float temperature;
  varying float vTemp;

  void main() {
    vTemp = temperature;
    vec3 pos = position;

    // React to mouse proximity
    float dist = distance(pos, uMouse);
    float influence = smoothstep(3.0, 0.0, dist);
    
    // Convection / Heat rise
    pos.y += sin(uTime * 2.0 + pos.x * 10.0) * 0.1 * temperature;
    
    // Repulsion from mouse
    if (dist < 2.0) {
      vec3 dir = normalize(pos - uMouse);
      pos += dir * influence * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + influence);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying float vTemp;

  void main() {
    // Distance from center of point for soft circle
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Heat colors: Cold metal -> Red hot -> White hot
    vec3 colorCold = vec3(0.2, 0.2, 0.3);
    vec3 colorHot = vec3(1.0, 0.2, 0.0);
    vec3 colorWhite = vec3(1.0, 0.9, 0.6);

    vec3 finalColor = mix(colorCold, colorHot, smoothstep(0.0, 0.5, vTemp));
    finalColor = mix(finalColor, colorWhite, smoothstep(0.5, 1.0, vTemp));

    // Soft glow edge
    float alpha = smoothstep(0.5, 0.1, dist);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function ThermodynamicSwarm() {
    const count = 10000;
    const meshRef = useRef<THREE.Points>(null);
    const { mouse, viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3() }
    }), []);

    const [positions, sizes, temperatures] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const size = new Float32Array(count);
        const temp = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Cylindrical distribution simulating a furnace or crucible
            const radius = 2 + Math.random() * 6;
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 10;

            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = height;
            pos[i * 3 + 2] = Math.sin(angle) * radius;

            size[i] = Math.random() * 0.5 + 0.1;

            // Hotter near the bottom/center
            const distFromCenter = Math.sqrt(pos[i * 3] * pos[i * 3] + pos[i * 3 + 2] * pos[i * 3 + 2]);
            temp[i] = Math.max(0, 1.0 - (distFromCenter / 8.0)) * (height < 0 ? 1 : 0.2);
        }
        return [pos, size, temp];
    }, [count]);

    useFrame((state) => {
        if (meshRef.current) {
            // Slow rotation of the entire swarm
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;

            // Update uniforms
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;

            // Map 2D mouse to 3D space loosely
            material.uniforms.uMouse.value.set(
                (mouse.x * viewport.width) / 2,
                (mouse.y * viewport.height) / 2,
                0
            );
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} args={[sizes, 1]} />
                <bufferAttribute attach="attributes-temperature" count={count} array={temperatures} itemSize={1} args={[temperatures, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function ForgeParticles() {
    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex flex-col cursor-crosshair">
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/opus" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                </div>
                <div className="text-right pointer-events-none">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3 justify-end">
                        <Flame className="text-orange-500 animate-pulse" /> The Crucible
                    </h1>
                    <p className="text-xs font-mono text-white/50">THERMODYNAMIC PARTICLE SWARM</p>
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none select-none">
                <h2 className="text-[10vw] font-black tracking-tighter text-white/5 mix-blend-overlay">FORGE</h2>
            </div>

            <div className="flex-1 w-full relative">
                <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: false, alpha: false }}>
                    <color attach="background" args={['#050505']} />
                    <ThermodynamicSwarm />
                </Canvas>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <p className="text-xs font-mono text-white/30 tracking-widest uppercase">Move mouse to disturb thermal equilibrium</p>
            </div>
        </div>
    );
}
