"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

/* ── Texture generators (singleton cached) ── */

let _coreTex: THREE.CanvasTexture | null = null;
function getCoreTexture() {
  if (_coreTex) return _coreTex;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.05, "rgba(255,255,255,0.95)");
  g.addColorStop(0.15, "rgba(255,255,255,0.6)");
  g.addColorStop(0.35, "rgba(255,255,255,0.15)");
  g.addColorStop(0.6, "rgba(255,255,255,0.03)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _coreTex = new THREE.CanvasTexture(c);
  return _coreTex;
}

let _glowTex: THREE.CanvasTexture | null = null;
function getGlowTexture() {
  if (_glowTex) return _glowTex;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,0.4)");
  g.addColorStop(0.1, "rgba(255,255,255,0.15)");
  g.addColorStop(0.3, "rgba(255,255,255,0.04)");
  g.addColorStop(0.6, "rgba(255,255,255,0.01)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

let _rayTex: THREE.CanvasTexture | null = null;
function getRayTexture() {
  if (_rayTex) return _rayTex;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  const h = s / 2;
  ctx.clearRect(0, 0, s, s);
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(h, h);
    ctx.rotate((i * Math.PI) / 4);
    const lg = ctx.createLinearGradient(0, 0, h, 0);
    lg.addColorStop(0, "rgba(255,255,255,0.25)");
    lg.addColorStop(0.5, "rgba(255,255,255,0.03)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, -0.5, h, 1);
    ctx.fillRect(-h, -0.5, h, 1);
    ctx.restore();
  }
  _rayTex = new THREE.CanvasTexture(c);
  return _rayTex;
}

/* ── BookStar (display-only, no interaction) ── */

interface StarBook {
  title: string;
  color: string;
}

function BookStar({ book, position }: { book: StarBook; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Sprite>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const rayRef = useRef<THREE.Sprite>(null!);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);
  const rayTex = useMemo(() => getRayTexture(), []);

  const color = book.color;

  useFrame(({ clock }) => {
    if (!groupRef.current || !coreRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.2 + position[0] * 2) * 0.08;

    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, pulse, 0.08),
    );

    coreRef.current.scale.setScalar(
      THREE.MathUtils.lerp(coreRef.current.scale.x, 2, 0.08),
    );

    if (glowRef.current) {
      glowRef.current.scale.setScalar(
        THREE.MathUtils.lerp(glowRef.current.scale.x, 6.5 * pulse, 0.08),
      );
    }

    if (rayRef.current) {
      rayRef.current.scale.setScalar(
        THREE.MathUtils.lerp(rayRef.current.scale.x, 8 * pulse, 0.06),
      );
      rayRef.current.material.rotation = t * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <sprite ref={rayRef}>
        <spriteMaterial map={rayTex} color={color} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={glowRef}>
        <spriteMaterial map={glowTex} color={color} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite ref={coreRef}>
        <spriteMaterial map={coreTex} color={color} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <p
          className={`${serif} text-[12px] font-semibold`}
          style={{ color: "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.8)", letterSpacing: "0.02em" }}
        >
          {book.title}
        </p>
      </Html>
    </group>
  );
}

/* ── StarField ── */

function StarField() {
  const ref1 = useRef<THREE.Points>(null!);
  const ref2 = useRef<THREE.Points>(null!);

  const [farGeo, nearGeo] = useMemo(() => {
    const mkGeo = (count: number, rMin: number, rMax: number) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const r = rMin + Math.random() * (rMax - rMin);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return g;
    };
    return [mkGeo(800, 50, 120), mkGeo(200, 22, 50)];
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref1.current) ref1.current.rotation.y = t * 0.002;
    if (ref2.current) ref2.current.rotation.y = t * 0.005;
  });

  return (
    <>
      <points ref={ref1} geometry={farGeo}>
        <pointsMaterial color="#a0b4ff" size={0.08} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
      <points ref={ref2} geometry={nearGeo}>
        <pointsMaterial color="#dde0ff" size={0.18} sizeAttenuation transparent opacity={0.65} depthWrite={false} />
      </points>
    </>
  );
}

/* ── Scene ── */

const BOOKS: { titleKey: string; color: string; pos: [number, number, number] }[] = [
  { titleKey: "book.demian", color: "#6366f1", pos: [-2.5, 2, -1] },
  { titleKey: "book.cosmos", color: "#3b82f6", pos: [3.5, 3, -2] },
  { titleKey: "book.sapiens", color: "#10b981", pos: [1, 0.5, 0] },
  { titleKey: "book.hamlet", color: "#f43f5e", pos: [-3.5, -0.5, -1.5] },
  { titleKey: "book.divineComedy", color: "#f59e0b", pos: [0, -1.5, -0.5] },
];

function Scene() {
  const t = useT();
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={0.4} distance={80} />
      <StarField />
      {BOOKS.map((b) => (
        <BookStar key={b.titleKey} book={{ title: t(b.titleKey as any), color: b.color }} position={b.pos} />
      ))}
    </>
  );
}

export function UniverseMockupScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 14], fov: 50, near: 0.1, far: 300 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      className="absolute inset-0"
    >
      <Scene />
    </Canvas>
  );
}
