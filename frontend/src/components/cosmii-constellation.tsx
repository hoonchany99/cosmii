"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface P3 { x: number; y: number; z: number }

interface SampledLayout {
  edgeStars: P3[];
  interiorStars: P3[];
  eyes: P3[];
}

/* ------------------------------------------------------------------ */
/*  Seeded RNG                                                         */
/* ------------------------------------------------------------------ */

function seededRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

/* ------------------------------------------------------------------ */
/*  Sprite textures (same approach as universe-canvas.tsx)              */
/* ------------------------------------------------------------------ */

let _coreTex: THREE.CanvasTexture | null = null;
function getCoreTexture() {
  if (_coreTex) return _coreTex;
  const s = 128, c = document.createElement("canvas");
  c.width = s; c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.05, "rgba(255,255,255,0.95)");
  g.addColorStop(0.15, "rgba(255,255,255,0.6)");
  g.addColorStop(0.35, "rgba(255,255,255,0.15)");
  g.addColorStop(0.6, "rgba(255,255,255,0.03)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  _coreTex = new THREE.CanvasTexture(c);
  return _coreTex;
}

let _glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (_glowTex) return _glowTex;
  const s = 128, c = document.createElement("canvas");
  c.width = s; c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,0.4)");
  g.addColorStop(0.1, "rgba(255,255,255,0.15)");
  g.addColorStop(0.3, "rgba(255,255,255,0.04)");
  g.addColorStop(0.6, "rgba(255,255,255,0.01)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

/* ------------------------------------------------------------------ */
/*  Image → pixel analysis → star layout                               */
/* ------------------------------------------------------------------ */

function analyzeImage(imageData: ImageData, imgW: number, imgH: number, edgeN = 450, interiorN = 160): SampledLayout {
  const { data } = imageData;
  const filled: boolean[][] = [];
  const edgePx: [number, number][] = [];
  const interiorPx: [number, number][] = [];
  const eyePx: [number, number][] = [];

  for (let y = 0; y < imgH; y++) {
    filled[y] = [];
    for (let x = 0; x < imgW; x++) {
      const i = (y * imgW + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const bright = (r + g + b) / 3;
      filled[y][x] = data[i + 3] > 100 && bright < 220;
    }
  }

  const allFilled: [number, number][] = [];
  for (let y = 0; y < imgH; y++) {
    for (let x = 0; x < imgW; x++) {
      if (filled[y][x]) allFilled.push([x, y]);
    }
  }

  let darkCount = 0;
  for (const [x, y] of allFilled) {
    const i = (y * imgW + x) * 4;
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 100) darkCount++;
  }
  const mostlyDark = allFilled.length > 0 && darkCount / allFilled.length > 0.5;

  for (const [x, y] of allFilled) {
    const i = (y * imgW + x) * 4;
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

    if (!mostlyDark && brightness < 100) {
      eyePx.push([x, y]);
      continue;
    }

    let neighbors = 0;
    if (filled[y - 1]?.[x]) neighbors++;
    if (filled[y + 1]?.[x]) neighbors++;
    if (filled[y]?.[x - 1]) neighbors++;
    if (filled[y]?.[x + 1]) neighbors++;

    if (neighbors <= 2) edgePx.push([x, y]);
    else interiorPx.push([x, y]);
  }

  const SCALE_X = 9;
  const aspect = imgH / imgW;
  const SCALE_Y = SCALE_X * aspect;

  const rand = seededRNG(42);

  const toWorld = (px: number, py: number, zScale: number, jitter: number): P3 => ({
    x: (px / imgW - 0.5) * SCALE_X + (rand() - 0.5) * jitter,
    y: -(py / imgH - 0.5) * SCALE_Y + (rand() - 0.5) * jitter,
    z: (rand() - 0.5) * 2 * zScale,
  });

  const sampleRandom = (arr: [number, number][], n: number, seed: number) => {
    if (arr.length <= n) return [...arr];
    const r = seededRNG(seed);
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  };

  const edgeStars = sampleRandom(edgePx, edgeN, 777).map(([x, y]) => toWorld(x, y, 0.3, 0.06));
  const interiorStars = sampleRandom(interiorPx, interiorN, 314).map(([x, y]) => toWorld(x, y, 0.7, 0.08));

  const eyes: P3[] = [];
  if (eyePx.length > 2) {
    const midX = eyePx.reduce((s, [x]) => s + x, 0) / eyePx.length;
    for (const side of [eyePx.filter(([x]) => x < midX), eyePx.filter(([x]) => x >= midX)]) {
      if (side.length === 0) continue;
      const cx = side.reduce((s, [x]) => s + x, 0) / side.length;
      const cy = side.reduce((s, [, y]) => s + y, 0) / side.length;
      eyes.push({ x: (cx / imgW - 0.5) * SCALE_X, y: -(cy / imgH - 0.5) * SCALE_Y, z: 0.15 });
    }
  }

  return { edgeStars, interiorStars, eyes };
}

/* ------------------------------------------------------------------ */
/*  Background stars (white/silver — plain universe)                   */
/* ------------------------------------------------------------------ */

function BackgroundStars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const rand = seededRNG(77);
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 50;
      pos[i * 3 + 1] = (rand() - 0.5) * 50;
      pos[i * 3 + 2] = (rand() - 0.5) * 50;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#e0e8ff" size={0.06} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Star sprite (core + glow)                                          */
/* ------------------------------------------------------------------ */

function ConstellationStar({ position, coreScale, glowScale, color, delay, twinkleSpeed, animate = true }: {
  position: P3; coreScale: number; glowScale: number; color: string;
  delay: number; twinkleSpeed: number; animate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const elapsed = useRef(0);
  const appeared = useRef(!animate);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!groupRef.current || !coreRef.current) return;

    let fade = 1;
    if (animate) {
      groupRef.current.scale.setScalar(1);
      const t = Math.max(0, elapsed.current - delay);
      const fadeIn = Math.min(1, t / 0.4);
      fade = fadeIn * fadeIn;
      if (!appeared.current && fadeIn >= 1) appeared.current = true;
    }

    const tw = 0.5 + 0.5 * Math.sin(elapsed.current * twinkleSpeed + delay * 10);
    const cm = coreRef.current.material as THREE.SpriteMaterial;
    cm.opacity = (0.5 + tw * 0.4) * fade;
    coreRef.current.scale.setScalar(coreScale * (0.9 + tw * 0.2));

    if (glowRef.current) {
      const gm = glowRef.current.material as THREE.SpriteMaterial;
      gm.opacity = (0.08 + tw * 0.08) * fade;
      glowRef.current.scale.setScalar(glowScale * (0.9 + tw * 0.15));
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} scale={animate ? 0 : 1}>
      <sprite ref={glowRef}>
        <spriteMaterial
          map={glowTex}
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={coreRef}>
        <spriteMaterial
          map={coreTex}
          color={color}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Eye sprite (dark green, breathing)                                 */
/* ------------------------------------------------------------------ */

function EyeStar({ position, delay = 0.6, animate = true }: { position: P3; delay?: number; animate?: boolean }) {
  const coreRef = useRef<THREE.Sprite>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const elapsed = useRef(0);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);

  useEffect(() => {
    if (coreRef.current) coreRef.current.scale.setScalar(0.7);
    if (glowRef.current) glowRef.current.scale.setScalar(1.8);
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    let fade = 1;
    if (animate) {
      const t = Math.max(0, elapsed.current - delay);
      const fadeIn = Math.min(1, t / 0.4);
      fade = fadeIn * fadeIn;
    }
    const breathe = 0.92 + 0.08 * Math.sin(elapsed.current * 1.2);

    if (coreRef.current) {
      (coreRef.current.material as THREE.SpriteMaterial).opacity = 1.0 * fade;
      coreRef.current.scale.setScalar(0.7 * breathe);
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.SpriteMaterial).opacity = 0.3 * fade;
      glowRef.current.scale.setScalar(1.8 * breathe);
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <sprite ref={glowRef}>
        <spriteMaterial
          map={glowTex}
          color="#3DD9A0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={coreRef}>
        <spriteMaterial
          map={coreTex}
          color="#50E8B8"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene (shared by both ImageConstellation and CosmiiConstellation)   */
/* ------------------------------------------------------------------ */

function SpinGroup({ speed, children }: { speed: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function OscillateGroup({ active, children }: { active: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current || !active) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * 0.25) * 0.12;
    ref.current.rotation.x = Math.sin(t * 0.18 + 1.3) * 0.06;
  });
  return <group ref={ref}>{children}</group>;
}

function ConstellationScene({ layout, animate = true, color = "#6BC5A0", dim = false, spinZ = 0, edgeBold = false }: {
  layout: SampledLayout; animate?: boolean; color?: string; dim?: boolean; spinZ?: number; edgeBold?: boolean;
}) {
  const eCoreScale = edgeBold ? 1.2 : 0.35;
  const eGlowScale = edgeBold ? 3.2 : 0.9;
  const iCoreMul = edgeBold ? 1.2 : 1;
  const iGlowMul = edgeBold ? 1.2 : 1;
  const useOscillation = !spinZ;

  return (
    <>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={!dim}
        autoRotate={false}
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={25}
      />

      <color attach="background" args={["#060612"]} />

      <BackgroundStars />

      <OscillateGroup active={useOscillation}>
      <SpinGroup speed={spinZ}>
        {layout.edgeStars.map((p, i) => (
          <ConstellationStar
            key={`e${i}`}
            position={p}
            coreScale={eCoreScale}
            glowScale={eGlowScale}
            color={color}
            delay={i * 0.012}
            twinkleSpeed={1.0 + (i % 5) * 0.2}
            animate={animate}
          />
        ))}

        {layout.interiorStars.map((p, i) => {
          const h = Math.sin(i * 3.17) * 0.5 + 0.5;
          return (
            <ConstellationStar
              key={`i${i}`}
              position={p}
              coreScale={(0.15 + h * 0.15) * iCoreMul}
              glowScale={(0.4 + h * 0.35) * iGlowMul}
              color={color}
              delay={0.15 + h * 0.7}
              twinkleSpeed={0.4 + h * 1.2}
              animate={animate}
            />
          );
        })}

        {layout.eyes.map((p, i) => (
          <EyeStar key={`eye${i}`} position={p} animate={animate} />
        ))}
      </SpinGroup>
      </OscillateGroup>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Image loading hook (shared)                                        */
/* ------------------------------------------------------------------ */

function useImageLayout(imageSrc: string, edgeN = 450, interiorN = 160) {
  const [layout, setLayout] = useState<SampledLayout | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      try {
        const SAMPLE_W = 128;
        const SAMPLE_H = Math.round(SAMPLE_W * (img.height / img.width));
        const c = document.createElement("canvas");
        c.width = SAMPLE_W;
        c.height = SAMPLE_H;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
        const data = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
        setLayout(analyzeImage(data, SAMPLE_W, SAMPLE_H, edgeN, interiorN));
      } catch (e) {
        console.error("Failed to analyze constellation image:", e);
      }
    };
    img.onerror = () => console.error(`Failed to load constellation: ${imageSrc}`);
    img.src = imageSrc;
  }, [imageSrc, edgeN, interiorN]);

  return layout;
}

/* ------------------------------------------------------------------ */
/*  ImageConstellation — generic, accepts any silhouette PNG            */
/* ------------------------------------------------------------------ */

export function ImageConstellation({
  imageSrc,
  animate = true,
  dim = false,
  dimOpacity,
  dimZoom,
  color = "#6BC5A0",
  spinZ = 0,
  edgeBold = false,
  starDensity,
}: {
  imageSrc: string;
  animate?: boolean;
  dim?: boolean;
  dimOpacity?: number;
  dimZoom?: number;
  color?: string;
  spinZ?: number;
  edgeBold?: boolean;
  starDensity?: { edge: number; interior: number };
}) {
  const layout = useImageLayout(imageSrc, starDensity?.edge, starDensity?.interior);

  if (!layout) {
    return <div className="w-full h-full bg-[#060612]" />;
  }

  const cameraZ = dim ? (dimZoom ?? 16) : 7;

  const finalOpacity = dim ? (dimOpacity ?? 0.4) : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: finalOpacity }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`relative w-full h-full overflow-hidden ${dim ? "pointer-events-none" : ""}`}
      style={{ touchAction: dim ? "auto" : "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        style={{ background: "#060612" }}
      >
        <ConstellationScene layout={layout} animate={animate} color={color} dim={dim} spinZ={spinZ} edgeBold={edgeBold} />
      </Canvas>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  CosmiiConstellation — wrapper with Cosmii logo                     */
/* ------------------------------------------------------------------ */

export function CosmiiConstellation({
  animate = true,
  dim = false,
  dimOpacity,
  dimZoom,
}: {
  animate?: boolean;
  dim?: boolean;
  dimOpacity?: number;
  dimZoom?: number;
} = {}) {
  return (
    <ImageConstellation
      imageSrc="/cosmii-constellation.png"
      animate={animate}
      dim={dim}
      dimOpacity={dimOpacity}
      dimZoom={dimZoom}
      color="#6BC5A0"
    />
  );
}
