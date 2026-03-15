"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

const waterVertexShader = `
    uniform float uTime;
    uniform vec4 uWaves[8]; 

    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vJacobian;
    varying float vElevation;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal, inout float jacobian, float chaos) {
        float steepness = wave.z * chaos;
        float wavelength = wave.w;
        float k = 2.0 * 3.14159 / wavelength;
        float c = sqrt(9.8 / k);
        vec2 d = normalize(wave.xy);
        float f = k * (dot(d, p.xz) - c * uTime * 0.8);
        float a = steepness / k;

        float cosf = cos(f);
        float sinf = sin(f);

        tangent += vec3(
            -d.x * d.x * (steepness * sinf),
            d.x * (steepness * cosf),
            -d.x * d.y * (steepness * sinf)
        );

        binormal += vec3(
            -d.x * d.y * (steepness * sinf),
            d.y * (steepness * cosf),
            -d.y * d.y * (steepness * sinf)
        );

        jacobian -= steepness * cosf;

        return vec3(d.x * (a * cosf), a * sinf, d.y * (a * cosf));
    }

    void main() {
        vec3 gridPoint = position;
        vec3 tangent = vec3(1.0, 0.0, 0.0);
        vec3 binormal = vec3(0.0, 0.0, 1.0);
        vec3 p = gridPoint;
        float jacobian = 1.0;

        float chaos = smoothstep(0.3, 0.7, noise(gridPoint.xz * 0.01 + uTime * 0.05));
        chaos = mix(0.7, 1.2, chaos); 

        for(int i = 0; i < 8; i++) {
            p += gerstnerWave(uWaves[i], gridPoint, tangent, binormal, jacobian, chaos);
        }

        vec3 normal = normalize(cross(binormal, tangent));

        float isBreaking = smoothstep(0.3, 0.0, jacobian);
        float crestRoughness = noise(p.xz * 10.0 + uTime * 5.0) * isBreaking;
        p.y += crestRoughness * 0.4; 
        
        vec4 worldPosition = modelMatrix * vec4(p, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
        vJacobian = jacobian;
        vElevation = p.y;

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const waterFragmentShader = `
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform vec3 uSunColor;
    
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vJacobian;
    varying float vElevation;

    // Liquid Metal mechanical colors
    vec3 depthColor = vec3(0.02, 0.02, 0.02); // Dark iron
    vec3 waterColor = vec3(0.15, 0.16, 0.17); // Silver steel
    vec3 scatterColor = vec3(0.6, 0.2, 0.2);  // Red Forge SSS

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i=0; i<4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
    }

    vec3 getSky(vec3 dir) {
        float y = max(dir.y, 0.0);
        vec3 sunDir = normalize(uSunPosition);
        
        // Industrial Red/Black sky
        vec3 sky = mix(vec3(0.1, 0.0, 0.0), vec3(0.02, 0.02, 0.02), pow(y, 0.6));
        
        float sunDot = max(dot(dir, sunDir), 0.0);
        sky += uSunColor * pow(sunDot, 2048.0) * 40.0;  
        sky += uSunColor * pow(sunDot, 256.0) * 4.0;    
        sky += vec3(0.8, 0.2, 0.1) * pow(sunDot, 16.0); 
        
        return sky;
    }

    void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 lightDir = normalize(uSunPosition);
        
        vec2 uv = vWorldPosition.xz * 0.1;
        vec2 windDir = vec2(0.7, 0.3);
        float time = uTime * 0.6;
        
        float bump1 = fbm(uv + windDir * time);
        float bump2 = fbm(uv * 2.0 - windDir * time * 0.8);
        
        vec3 microNormal = normalize(vec3((bump1 - bump2) * 0.15, 1.0, (bump2 - bump1) * 0.15));
        
        vec3 normal = normalize(vNormal + microNormal * 0.6);
        vec3 halfVector = normalize(lightDir + viewDir);

        float nDotV = max(dot(normal, viewDir), 0.0);
        float f0 = 0.4; // High IOR for Metal
        float fresnel = f0 + (1.0 - f0) * pow(1.0 - nDotV, 5.0);

        float elevationMask = smoothstep(-3.0, 5.0, vElevation);
        vec3 albedo = mix(depthColor, waterColor, elevationMask);
        
        float sssIntensity = max(0.0, dot(viewDir, -lightDir));
        sssIntensity = pow(sssIntensity, 4.0) * smoothstep(0.0, 4.0, vElevation);
        vec3 sss = scatterColor * sssIntensity * 2.0;

        float pinch = smoothstep(0.3, 0.0, vJacobian); 
        vec2 foamUV = vWorldPosition.xz * 0.25;
        
        vec2 warp = vec2(
            fbm(foamUV + uTime * 0.2),
            fbm(foamUV + vec2(5.2, 1.3) - uTime * 0.2)
        );
        
        float fluidNoise = fbm(foamUV + warp * 2.5 - windDir * uTime * 0.8);
        fluidNoise = smoothstep(0.4, 0.8, fluidNoise);
        
        float trailMask = smoothstep(-1.0, 3.0, vElevation) * 0.3;
        float foamMask = max(pinch, trailMask * fluidNoise);
        float foam = foamMask * fluidNoise;
        
        float foamBreakup = fbm(vWorldPosition.xz * 1.5);
        foam *= mix(0.5, 1.0, foamBreakup);
        foam = clamp(foam, 0.0, 1.0);

        vec3 reflectedRay = reflect(-viewDir, normal);
        vec3 reflection = getSky(reflectedRay);
        
        float specPower = 800.0;
        float specTerm = pow(max(dot(normal, halfVector), 0.0), specPower);
        
        float waterSurfaceMask = 1.0 - foam;
        fresnel *= waterSurfaceMask;
        vec3 specular = uSunColor * specTerm * 10.0 * waterSurfaceMask;

        vec3 finalColor = albedo * (1.0 - fresnel) + sss; 
        finalColor += reflection * fresnel;               
        finalColor += specular;                           
        
        // Sparks / White heat foam color instead of white ocean
        vec3 baseFoamColor = mix(vec3(1.0, 0.6, 0.4), vec3(1.0, 0.9, 0.8), 0.8);
        finalColor = mix(finalColor, baseFoamColor, foam);

        float dist = length(cameraPosition - vWorldPosition);
        float fogFactor = smoothstep(50.0, 800.0, dist);
        finalColor = mix(finalColor, getSky(viewDir), fogFactor);

        gl_FragColor = vec4(finalColor, 1.0);
        
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
`;

export default function LiquidMetalOcean() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [webGlError, setWebGlError] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
            camera.position.set(0, 15, 50);

            // Test if WebGL works before initializing heavy scene
            const canvasTest = document.createElement("canvas");
            const gl = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
            if (!gl) {
                setWebGlError(true);
                return;
            }

            const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.1;
            mountRef.current.appendChild(renderer.domElement);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.03;
            controls.maxPolarAngle = Math.PI / 2 - 0.02;
            controls.minDistance = 2.0;
            controls.maxDistance = 300.0;

            const sunPosition = new THREE.Vector3(120, 20, -200).normalize();

            const waterUniforms = {
                uTime: { value: 0 },
                uSunPosition: { value: sunPosition },
                uSunColor: { value: new THREE.Color(0xffe0b5) },
                uWaves: {
                    value: [
                        new THREE.Vector4(1.0, 0.2, 0.15, 70.0),
                        new THREE.Vector4(0.7, 0.6, 0.12, 45.0),
                        new THREE.Vector4(-0.2, 1.0, 0.10, 30.0),
                        new THREE.Vector4(-0.6, -0.4, 0.08, 20.0),
                        new THREE.Vector4(0.4, -0.8, 0.06, 12.0),
                        new THREE.Vector4(-0.8, 0.3, 0.05, 8.0),
                        new THREE.Vector4(0.6, -0.3, 0.03, 5.0),
                        new THREE.Vector4(-0.4, -0.8, 0.02, 3.0)
                    ]
                }
            };

            const waterMaterial = new THREE.ShaderMaterial({
                vertexShader: waterVertexShader,
                fragmentShader: waterFragmentShader,
                uniforms: waterUniforms,
                side: THREE.FrontSide
            });

            const waterGeometry = new THREE.PlaneGeometry(1500, 1500, 512, 512);
            waterGeometry.rotateX(-Math.PI / 2);

            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            scene.add(water);

            const skyGeo = new THREE.SphereGeometry(1000, 32, 32);
            const skyMat = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec3 vWorldPosition;
                    void main() {
                        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                        vWorldPosition = worldPosition.xyz;
                        gl_Position = projectionMatrix * viewMatrix * worldPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 uSunPosition;
                    uniform vec3 uSunColor;
                    varying vec3 vWorldPosition;

                    void main() {
                        vec3 dir = normalize(vWorldPosition);
                        float y = max(dir.y, 0.0);
                        vec3 sunDir = normalize(uSunPosition);
                        
                        vec3 sky = mix(vec3(0.1, 0.0, 0.0), vec3(0.02, 0.02, 0.02), pow(y, 0.6));
                        
                        float sunDot = max(dot(dir, sunDir), 0.0);
                        sky += uSunColor * pow(sunDot, 2048.0) * 40.0;  
                        sky += uSunColor * pow(sunDot, 256.0) * 4.0;    
                        sky += vec3(0.8, 0.2, 0.1) * pow(sunDot, 16.0); 
                        
                        gl_FragColor = vec4(sky, 1.0);
                        
                        #include <tonemapping_fragment>
                        #include <colorspace_fragment>
                    }
                `,
                uniforms: {
                    uSunPosition: { value: sunPosition },
                    uSunColor: { value: new THREE.Color(0xffe0b5) }
                },
                side: THREE.BackSide
            });
            const sky = new THREE.Mesh(skyGeo, skyMat);
            scene.add(sky);

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);

            const clock = new THREE.Clock();
            let animationFrameId: number;

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                waterUniforms.uTime.value = clock.getElapsedTime();
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(animationFrameId);
                renderer.dispose();
                if (mountRef.current && renderer.domElement) {
                    mountRef.current.removeChild(renderer.domElement);
                }
            };
        } catch (e) {
            console.error("WebGL failed to initialize:", e);
            setWebGlError(true);
        }
    }, []);

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <Link href="/opus" className="flex items-center gap-2 text-metallic hover:text-white transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Labs
                    </Link>
                </div>
                <div className="text-right pointer-events-auto">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-white">
                        Project: <span className="text-forge-red">Ferrofluid</span>
                    </h1>
                    <p className="text-sm font-mono text-metallic">LIQUID METAL THERMODYNAMICS v2.0</p>
                </div>
            </div>

            {webGlError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-charcoal">
                    <AlertCircle size={48} className="text-forge-red mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Hardware Acceleration Disabled</h2>
                    <p className="text-metallic text-sm max-w-md">
                        Your browser could not create a WebGL context, so this advanced shader simulation cannot run.
                        Please enable Hardware Acceleration or try a different browser.
                    </p>
                </div>
            ) : (
                <div ref={mountRef} className="flex-1 w-full relative cursor-move" />
            )}
        </div>
    );
}
