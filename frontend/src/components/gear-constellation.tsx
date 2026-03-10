"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState, useEffect } from "react";

interface P3 { x: number; y: number; z: number }

function seededRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

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
/*  Gear shape generator                                               */
/* ------------------------------------------------------------------ */

interface GearLayout {
  outlineStars: P3[];
  fillStars: P3[];
  holeStars: P3[];
}

function gearRadius(angle: number): number {
  const TEETH = 6;
  const OUTER_R = 4.2;
  const INNER_R = 2.8;
  const raw = Math.cos(TEETH * angle);
  const flat = Math.sign(raw) * Math.pow(Math.abs(raw), 0.45);
  const t = flat * 0.5 + 0.5;
  return INNER_R + (OUTER_R - INNER_R) * t;
}

function generateGearLayout(seed = 42): GearLayout {
  const rand = seededRNG(seed);
  const HOLE_R = 1.35;
  const SCALE = 1.0;

  const outlineStars: P3[] = [];
  const fillStars: P3[] = [];
  const holeStars: P3[] = [];

  const jitter = (v: number) => v + (rand() - 0.5) * 0.1;
  const zJitter = () => (rand() - 0.5) * 0.6;

  const OUTLINE_COUNT = 320;
  for (let i = 0; i < OUTLINE_COUNT; i++) {
    const angle = (i / OUTLINE_COUNT) * Math.PI * 2;
    const r = gearRadius(angle);
    outlineStars.push({
      x: jitter(Math.cos(angle) * r * SCALE),
      y: jitter(Math.sin(angle) * r * SCALE),
      z: zJitter() * 0.8,
    });
  }

  const holeOutlineCount = 55;
  for (let i = 0; i < holeOutlineCount; i++) {
    const angle = (i / holeOutlineCount) * Math.PI * 2;
    outlineStars.push({
      x: jitter(Math.cos(angle) * HOLE_R * SCALE),
      y: jitter(Math.sin(angle) * HOLE_R * SCALE),
      z: zJitter() * 0.6,
    });
  }

  const fillCount = 220;
  for (let i = 0; i < fillCount; i++) {
    const angle = rand() * Math.PI * 2;
    const maxR = gearRadius(angle) - 0.2;
    const minR = HOLE_R + 0.25;
    if (minR >= maxR) continue;
    const r = minR + rand() * (maxR - minR);
    fillStars.push({
      x: Math.cos(angle) * r * SCALE + (rand() - 0.5) * 0.12,
      y: Math.sin(angle) * r * SCALE + (rand() - 0.5) * 0.12,
      z: (rand() - 0.5) * 1.4,
    });
  }

  const holeCenterCount = 14;
  for (let i = 0; i < holeCenterCount; i++) {
    const angle = (i / holeCenterCount) * Math.PI * 2 + rand() * 0.25;
    const r = rand() * HOLE_R * 0.55;
    holeStars.push({
      x: Math.cos(angle) * r * SCALE,
      y: Math.sin(angle) * r * SCALE,
      z: (rand() - 0.5) * 0.6,
    });
  }

  return { outlineStars, fillStars, holeStars };
}

/* ------------------------------------------------------------------ */
/*  Star components                                                    */
/* ------------------------------------------------------------------ */

function GearStar({ position, coreScale, glowScale, color, delay, twinkleSpeed }: {
  position: P3; coreScale: number; glowScale: number; color: string;
  delay: number; twinkleSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const elapsed = useRef(0);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (!groupRef.current || !coreRef.current) return;

    const tw = 0.5 + 0.5 * Math.sin(elapsed.current * twinkleSpeed + delay * 10);
    const cm = coreRef.current.material as THREE.SpriteMaterial;
    cm.opacity = 0.5 + tw * 0.4;
    coreRef.current.scale.setScalar(coreScale * (0.9 + tw * 0.2));

    if (glowRef.current) {
      const gm = glowRef.current.material as THREE.SpriteMaterial;
      gm.opacity = 0.08 + tw * 0.08;
      glowRef.current.scale.setScalar(glowScale * (0.9 + tw * 0.15));
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <sprite ref={glowRef}>
        <spriteMaterial map={glowTex} color={color} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={coreRef}>
        <spriteMaterial map={coreTex} color={color} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function BackgroundStars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const rand = seededRNG(99);
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
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function GearScene({ layout, animate = true }: { layout: GearLayout; animate?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && animate) {
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={animate}
        autoRotate={animate}
        autoRotateSpeed={0.2}
        minDistance={5}
        maxDistance={25}
      />

      <color attach="background" args={["#060612"]} />
      <BackgroundStars />

      <group ref={groupRef}>
        {layout.outlineStars.map((p, i) => (
          <GearStar
            key={`o${i}`}
            position={p}
            coreScale={0.3}
            glowScale={0.8}
            color="#8B9CF7"
            delay={i * 0.005}
            twinkleSpeed={0.8 + (i % 5) * 0.15}
          />
        ))}

        {layout.fillStars.map((p, i) => {
          const h = Math.sin(i * 2.71) * 0.5 + 0.5;
          return (
            <GearStar
              key={`f${i}`}
              position={p}
              coreScale={0.12 + h * 0.12}
              glowScale={0.35 + h * 0.3}
              color="#7B8DEF"
              delay={0.2 + h * 0.6}
              twinkleSpeed={0.4 + h * 1.0}
            />
          );
        })}

        {layout.holeStars.map((p, i) => (
          <GearStar
            key={`h${i}`}
            position={p}
            coreScale={0.4}
            glowScale={1.1}
            color="#A5B4FC"
            delay={0.5 + i * 0.04}
            twinkleSpeed={1.2}
          />
        ))}
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported component                                                 */
/* ------------------------------------------------------------------ */

export function GearConstellation({ animate = true }: { animate?: boolean } = {}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const layout = useMemo(() => generateGearLayout(42), []);

  if (!mounted) return <div className="w-full h-full bg-[#060612]" />;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        style={{ background: "#060612" }}
      >
        <GearScene layout={layout} animate={animate} />
      </Canvas>
    </div>
  );
}
