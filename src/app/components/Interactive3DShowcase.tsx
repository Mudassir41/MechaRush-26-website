"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { RotateCw, ZoomIn, ZoomOut, Eye, Box, RotateCcw, Maximize2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  INTERACTIVE 3D SHOWCASE
//  Rotating mechanical gear assembly with side controls
//  Mobile: button controls. Desktop: mouse orbit + buttons.
// ═══════════════════════════════════════════════════════════

const ACCENT = "#e62e2d";

export default function Interactive3DShowcase() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    gears: THREE.Group;
    clock: THREE.Clock;
    frameId: number;
    cleanup: () => void;
  } | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [mounted, setMounted] = useState(false);
  const wireframeRef = useRef(false);
  const explodedRef = useRef(false);
  const autoRotateRef = useRef(true);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { wireframeRef.current = wireframe; }, [wireframe]);
  useEffect(() => { explodedRef.current = exploded; }, [exploded]);
  useEffect(() => { autoRotateRef.current = autoRotate; }, [autoRotate]);

  // Programmatic orbit controls
  const orbitLeft = () => {
    if (!sceneRef.current) return;
    setAutoRotate(false);
    const c = sceneRef.current.camera;
    const angle = Math.atan2(c.position.x, c.position.z) + 0.3;
    const dist = Math.sqrt(c.position.x ** 2 + c.position.z ** 2);
    c.position.x = Math.sin(angle) * dist;
    c.position.z = Math.cos(angle) * dist;
    c.lookAt(0, 0, 0);
  };

  const orbitRight = () => {
    if (!sceneRef.current) return;
    setAutoRotate(false);
    const c = sceneRef.current.camera;
    const angle = Math.atan2(c.position.x, c.position.z) - 0.3;
    const dist = Math.sqrt(c.position.x ** 2 + c.position.z ** 2);
    c.position.x = Math.sin(angle) * dist;
    c.position.z = Math.cos(angle) * dist;
    c.lookAt(0, 0, 0);
  };

  const zoomIn = () => {
    if (!sceneRef.current) return;
    const c = sceneRef.current.camera;
    c.position.multiplyScalar(0.85);
    c.lookAt(0, 0, 0);
  };

  const zoomOut = () => {
    if (!sceneRef.current) return;
    const c = sceneRef.current.camera;
    c.position.multiplyScalar(1.18);
    c.lookAt(0, 0, 0);
  };

  const resetView = () => {
    if (!sceneRef.current) return;
    setAutoRotate(true);
    const c = sceneRef.current.camera;
    c.position.set(5, 3, 5);
    c.lookAt(0, 0, 0);
  };

  const buildScene = useCallback(() => {
    if (!mountRef.current) return;

    // Tear down old
    if (sceneRef.current) {
      sceneRef.current.cleanup();
      sceneRef.current.renderer.dispose();
      while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const rect = mountRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0x222222, 2));
    const key = new THREE.DirectionalLight(0xff6a00, 3);
    key.position.set(5, 8, 3);
    scene.add(key);
    const rim = new THREE.PointLight(0xe62e2d, 4, 20);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    const fill = new THREE.PointLight(0x4466ff, 1.5, 15);
    fill.position.set(3, -2, 4);
    scene.add(fill);

    // Enhanced Materials with Environment Mapping
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    // Create a simple procedural environment map for reflections (Forge Studio style)
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111111);
    const envLight1 = new THREE.DirectionalLight(0xffffff, 5);
    envLight1.position.set(5, 5, 0);
    envScene.add(envLight1);
    const envLight2 = new THREE.DirectionalLight(0xff6a00, 10); // Forge orange glow
    envLight2.position.set(-5, -5, 0);
    envScene.add(envLight2);
    
    // Render environment map
    const envCamera = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
    envCamera.position.z = 1;
    const pmremTarget = pmremGenerator.fromScene(envScene);
    const envMap = pmremTarget.texture;
    scene.environment = envMap;
    // No need to call renderer.setRenderTarget(null) because PMREMGenerator resets it automatically or we just don't need it.

    // Build gear assembly
    const gears = new THREE.Group();

    function createGear(innerR: number, outerR: number, teeth: number, thickness: number, color: number, isCopper = false): THREE.Mesh {
      const shape = new THREE.Shape();
      const toothSize = (outerR - innerR) * 0.6;
      const step = (Math.PI * 2) / (teeth * 2);

      for (let i = 0; i < teeth * 2; i++) {
        const angle = i * step;
        const r = i % 2 === 0 ? outerR : outerR - toothSize;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();

      // Center hole
      const hole = new THREE.Path();
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const x = Math.cos(angle) * innerR;
        const y = Math.sin(angle) * innerR;
        if (i === 0) hole.moveTo(x, y);
        else hole.lineTo(x, y);
      }
      shape.holes.push(hole);

      const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 });
      
      // Photorealistic material
      const mat = new THREE.MeshPhysicalMaterial({ 
        color, 
        metalness: 1.0, 
        roughness: isCopper ? 0.2 : 0.35,
        clearcoat: isCopper ? 0.8 : 0.3,
        clearcoatRoughness: 0.2,
        envMap,
        envMapIntensity: 2.5
      });
      return new THREE.Mesh(geo, mat);
    }

    // Main gear (large, dark steel)
    const mainGear = createGear(0.3, 1.5, 16, 0.3, 0x555555);
    mainGear.name = "mainGear";
    gears.add(mainGear);

    // Secondary gear (medium, meshed, copper/bronze)
    const secGear = createGear(0.2, 0.8, 10, 0.3, 0xb87333, true);
    secGear.position.set(2.2, 0, 0);
    secGear.name = "secGear";
    gears.add(secGear);

    // Small gear (dark steel)
    const smallGear = createGear(0.1, 0.5, 8, 0.25, 0x444444);
    smallGear.position.set(2.2, 1.3, 0);
    smallGear.name = "smallGear";
    gears.add(smallGear);

    // Axle shafts
    const axleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16);
    const axleMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.1 });

    const axle1 = new THREE.Mesh(axleGeo, axleMat);
    axle1.position.set(0, 0, 0.15);
    axle1.rotation.x = Math.PI / 2;
    axle1.name = "axle1";
    gears.add(axle1);

    const axle2 = new THREE.Mesh(axleGeo.clone(), axleMat.clone());
    axle2.position.set(2.2, 0, 0.15);
    axle2.rotation.x = Math.PI / 2;
    axle2.name = "axle2";
    gears.add(axle2);

    // Center the group
    gears.position.set(-1, 0, 0);

    scene.add(gears);

    // Grid helper (subtle)
    const grid = new THREE.GridHelper(10, 20, 0x1a0505, 0x0d0d0d);
    grid.position.y = -1.5;
    scene.add(grid);

    // Mouse drag orbit (desktop)
    let isDragging = false;
    let dragX = 0, dragY = 0;
    const onDown = (e: MouseEvent) => { isDragging = true; dragX = e.clientX; dragY = e.clientY; renderer.domElement.style.cursor = "grabbing"; };
    const onUp = () => { isDragging = false; renderer.domElement.style.cursor = "grab"; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      autoRotateRef.current = false;
      setAutoRotate(false);
      const dx = (e.clientX - dragX) * 0.005;
      const dy = (e.clientY - dragY) * 0.005;
      const angle = Math.atan2(camera.position.x, camera.position.z) + dx;
      const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      camera.position.x = Math.sin(angle) * dist;
      camera.position.z = Math.cos(angle) * dist;
      camera.position.y = Math.max(-2, Math.min(8, camera.position.y - dy * 2));
      camera.lookAt(0, 0, 0);
      dragX = e.clientX; dragY = e.clientY;
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.multiplyScalar(e.deltaY > 0 ? 1.05 : 0.95);
      camera.lookAt(0, 0, 0);
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const clock = new THREE.Clock();
    let frameId = 0;

    // Explode positions
    const explodeOffsets: Record<string, THREE.Vector3> = {
      mainGear: new THREE.Vector3(0, 0, -0.5),
      secGear:  new THREE.Vector3(0.8, 0, 0.5),
      smallGear: new THREE.Vector3(0, 0.5, 0.5),
      axle1:    new THREE.Vector3(0, 0, -1),
      axle2:    new THREE.Vector3(0, 0, 1),
    };

    const originalPositions: Record<string, THREE.Vector3> = {};
    gears.children.forEach(c => { originalPositions[c.name] = c.position.clone(); });

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Auto rotate
      if (autoRotateRef.current) {
        const angle = t * 0.3;
        camera.position.x = Math.sin(angle) * 6;
        camera.position.z = Math.cos(angle) * 6;
        camera.position.y = 3 + Math.sin(t * 0.2) * 0.5;
        camera.lookAt(0, 0, 0);
      }

      // Rotate gears
      gears.children.forEach(c => {
        if (c.name === "mainGear") c.rotation.z = t * 0.5;
        if (c.name === "secGear") c.rotation.z = -t * 0.8;
        if (c.name === "smallGear") c.rotation.z = t * 1.2;
      });

      // Wireframe toggle
      gears.children.forEach(c => {
        if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshStandardMaterial) {
          c.material.wireframe = wireframeRef.current;
        }
      });

      // Explode animation
      gears.children.forEach(c => {
        const orig = originalPositions[c.name];
        const offset = explodeOffsets[c.name];
        if (orig && offset) {
          const target = explodedRef.current ? orig.clone().add(offset) : orig;
          c.position.lerp(target, 0.05);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const cleanup = () => {
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
    };

    sceneRef.current = { renderer, scene, camera, gears, clock, frameId, cleanup };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    buildScene();
    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.frameId);
        sceneRef.current.cleanup();
        sceneRef.current.renderer.dispose();
        if (mountRef.current) {
          while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
    };
  }, [mounted, buildScene]);

  const btnClass = "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all hover:scale-105";
  const btnStyle = (active = false) => ({
    background: active ? `${ACCENT}30` : `${ACCENT}12`,
    border: `1px solid ${active ? ACCENT + "60" : ACCENT + "22"}`,
    color: active ? ACCENT : `${ACCENT}aa`,
  });

  if (!mounted) return null;

  return (
    <section className="relative w-full max-w-5xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.4em] uppercase font-bold mb-3" style={{ color: `${ACCENT}55` }}>
            <div className="w-8 h-px" style={{ background: `${ACCENT}35` }} /> Interactive
            <div className="w-8 h-px" style={{ background: `${ACCENT}35` }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Gear{" "}
            <span style={{
              background: `linear-gradient(135deg, ${ACCENT}, #ff5a1f)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent"
            }}>Assembly</span>
          </h2>
          <p className="text-white/30 text-sm mt-2">Drag to orbit • Scroll to zoom • Use controls on mobile</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 rounded-2xl overflow-hidden"
          style={{ background: "rgba(6,8,12,0.9)", border: `1px solid ${ACCENT}18` }}>

          {/* 3D Viewport */}
          <div className="relative" style={{ height: 400 }}>
            <div ref={mountRef} className="absolute inset-0" />
            {/* HUD overlay corners */}
            <div className="absolute top-3 left-3 text-[9px] font-mono tracking-widest" style={{ color: `${ACCENT}40` }}>
              VIEWPORT // 3D
            </div>
            <div className="absolute bottom-3 right-3 text-[9px] font-mono" style={{ color: `${ACCENT}30` }}>
              {wireframe ? "WIREFRAME" : "SOLID"} • {exploded ? "EXPLODED" : "ASSEMBLED"}
            </div>
          </div>

          {/* Side Controls Panel */}
          <div className="flex flex-col gap-2 p-4 border-t md:border-t-0 md:border-l" style={{ borderColor: `${ACCENT}12` }}>
            <div className="text-[9px] tracking-[0.3em] uppercase font-bold mb-1" style={{ color: `${ACCENT}50` }}>Controls</div>

            {/* Orbit buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={orbitLeft} className={btnClass} style={btnStyle()}>
                <RotateCcw size={12} /> Left
              </button>
              <button onClick={orbitRight} className={btnClass} style={btnStyle()}>
                <RotateCw size={12} /> Right
              </button>
            </div>

            {/* Zoom */}
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={zoomIn} className={btnClass} style={btnStyle()}>
                <ZoomIn size={12} /> In
              </button>
              <button onClick={zoomOut} className={btnClass} style={btnStyle()}>
                <ZoomOut size={12} /> Out
              </button>
            </div>

            <div className="w-full h-px my-1" style={{ background: `${ACCENT}10` }} />

            {/* Toggle controls */}
            <button onClick={() => setWireframe(w => !w)} className={btnClass} style={btnStyle(wireframe)}>
              <Eye size={12} /> {wireframe ? "Solid" : "Wireframe"}
            </button>

            <button onClick={() => setExploded(e => !e)} className={btnClass} style={btnStyle(exploded)}>
              <Box size={12} /> {exploded ? "Assemble" : "Explode"}
            </button>

            <button onClick={() => setAutoRotate(a => !a)} className={btnClass} style={btnStyle(autoRotate)}>
              <RotateCw size={12} /> Auto {autoRotate ? "On" : "Off"}
            </button>

            <div className="w-full h-px my-1" style={{ background: `${ACCENT}10` }} />

            <button onClick={resetView} className={btnClass} style={btnStyle()}>
              <Maximize2 size={12} /> Reset
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
