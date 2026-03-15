"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useIsMobile } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/store";

const serif = "font-[var(--font-serif)]";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
}

interface ActiveSession {
  book: Book;
  completedLessons: number;
  totalLessons: number;
}

interface HomeViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  activeSession?: ActiveSession | null;
  onContinueLearning?: () => void;
}

/* ── Texture generators (singleton) ── */

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

/* ── BookStar ── */

function BookStar({
  book,
  position,
  onClick,
  isSingle,
}: {
  book: Book;
  position: [number, number, number];
  onClick: () => void;
  isSingle: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Sprite>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const rayRef = useRef<THREE.Sprite>(null!);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressTime = useRef(0);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);
  const rayTex = useMemo(() => getRayTexture(), []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  const color = book.color || "#6366f1";

  useFrame(({ clock }) => {
    if (!groupRef.current || !coreRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.2 + position[0] * 2) * 0.08;

    const now = performance.now() / 1000;
    const elapsed = now - pressTime.current;
    const tapBounce = pressed
      ? 0.82
      : elapsed < 0.3
        ? 1 + Math.sin(elapsed * Math.PI / 0.3) * 0.18
        : 1;

    const base = (hovered ? 1.15 : 1) * tapBounce;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, base * pulse, pressed ? 0.25 : 0.08),
    );

    const coreScale = isSingle ? (hovered ? 3.2 : 2.8) : (hovered ? 2.4 : 2);
    coreRef.current.scale.setScalar(
      THREE.MathUtils.lerp(coreRef.current.scale.x, coreScale, 0.08),
    );

    const opacityBoost = pressed ? 1.6 : (elapsed < 0.25 ? 1 + (1 - elapsed / 0.25) * 0.5 : 1);
    if (coreRef.current.material) {
      (coreRef.current.material as THREE.SpriteMaterial).opacity = Math.min(1, opacityBoost);
    }

    if (glowRef.current) {
      const gs = (isSingle ? 9 : (hovered ? 8 : 6.5)) * pulse;
      glowRef.current.scale.setScalar(
        THREE.MathUtils.lerp(glowRef.current.scale.x, gs, 0.08),
      );
      (glowRef.current.material as THREE.SpriteMaterial).opacity = Math.min(0.6, 0.35 * opacityBoost);
    }

    if (rayRef.current) {
      const rs = (isSingle ? 12 : (hovered ? 10 : 8)) * pulse;
      rayRef.current.scale.setScalar(
        THREE.MathUtils.lerp(rayRef.current.scale.x, rs, 0.06),
      );
      rayRef.current.material.rotation = t * 0.08;
    }
  });

  const handlePointerDown = () => {
    setPressed(true);
  };

  const handlePointerUp = () => {
    setPressed(false);
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setPressed(false);
    pressTime.current = performance.now() / 1000;
    onClick();
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setPressed(false)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => { setHovered(false); setPressed(false); }}
        visible={false}
      >
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      <sprite ref={rayRef}>
        <spriteMaterial
          map={rayTex}
          color={color}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <sprite ref={glowRef}>
        <spriteMaterial
          map={glowTex}
          color={color}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <sprite ref={coreRef}>
        <spriteMaterial
          map={coreTex}
          color={color}
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div className="text-center">
          <p
            className={`${serif} text-[14px] font-semibold`}
            style={{
              color: "rgba(255,255,255,0.88)",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              letterSpacing: "0.02em",
            }}
          >
            {book.title}
          </p>
          {book.author && (
            <p className="text-white/40 text-[11px] mt-0.5">{book.author}</p>
          )}
        </div>
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
    return [mkGeo(1200, 50, 120), mkGeo(300, 22, 50)];
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

function Scene({ books, onSelectBook }: HomeViewProps) {
  const isSingle = books.length === 1;

  const bookPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = books.length;
    if (count === 0) return positions;

    if (count === 1) {
      positions.push([0, 1.5, 0]);
    } else {
      const radius = Math.max(2.2, count * 0.8);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const r = radius + Math.sin(i * 1.5) * 0.4;
        positions.push([
          Math.cos(angle) * r,
          Math.sin(angle) * r * 0.4 + 1.5,
          -1.5 + Math.random() * 1.5,
        ]);
      }
    }
    return positions;
  }, [books.length]);

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={0.4} distance={80} />
      <StarField />
      {books.map((book, i) => (
        <BookStar
          key={book.id}
          book={book}
          position={bookPositions[i] || [0, 0, 0]}
          onClick={() => onSelectBook(book)}
          isSingle={isSingle}
        />
      ))}
    </>
  );
}

/* ── HomeView ── */

export function HomeView({ books, onSelectBook, activeSession, onContinueLearning }: HomeViewProps) {
  const mobile = useIsMobile();
  const t = useT();
  const language = useSettingsStore((s) => s.language);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const n = Math.floor(Math.random() * 5) + 1;
    const period = h < 6 ? "Night" : h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
    return {
      title: t(`home.greet${period}${n}` as any),
      sub: t(`home.greet${period}Sub${n}` as any),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateStr = useMemo(() => {
    const d = new Date();
    const locale = language === "ko" ? "ko-KR" : "en-US";
    return d.toLocaleDateString(locale, { month: "long", day: "numeric", weekday: "short" });
  }, [language]);

  const progress = activeSession
    ? Math.round((activeSession.completedLessons / Math.max(activeSession.totalLessons, 1)) * 100)
    : 0;

  return (
    <div className="w-full h-full relative overflow-hidden">
      <CosmicBg accent="indigo" />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3, 22], fov: 50, near: 0.1, far: 300 }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ alpha: true, antialias: !mobile }}
        className="absolute inset-0"
        style={{ background: "transparent", zIndex: 1 }}
      >
        <Scene books={books} onSelectBook={onSelectBook} />
      </Canvas>

      {/* Top: Date + Greeting */}
      <motion.div
        className="absolute top-[108px] left-0 right-0 z-20 px-7"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-white/25 text-[12px] font-semibold tracking-[0.15em] uppercase">
          {dateStr}
        </p>
        <h1 className={`${serif} text-white/90 text-[28px] font-bold mt-1.5 leading-tight`}>
          {greeting.title}
        </h1>
        <p className="text-white/40 text-[14px] mt-0.5 font-medium">
          {greeting.sub}
        </p>
      </motion.div>

      {/* Bottom gradient for legibility */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "50%",
          background: "linear-gradient(to top, rgba(6,6,18,0.95) 0%, rgba(6,6,18,0.6) 40%, transparent 100%)",
        }}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-safe-lg flex flex-col items-center">
        {/* Recently Read Book Card */}
        {activeSession && onContinueLearning && activeSession.totalLessons > 0 && activeSession.completedLessons > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[340px] mb-3.5"
          >
            <p className="text-white/25 text-[11px] font-bold tracking-[0.14em] uppercase mb-2 pl-1">
              {t("home.recentBooks")}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onContinueLearning}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden active:bg-white/[0.05] transition-colors select-none"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0 text-left">
                  <p className={`${serif} text-white/90 text-[15px] font-bold truncate`}>{activeSession.book.title}</p>
                  {activeSession.book.author && (
                    <p className="text-white/30 text-[11px] mt-0.5">{activeSession.book.author}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
              </div>
              <div className="px-4 pb-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/30 text-[11px] font-semibold">{t("home.progress")}</span>
                  <span className="text-white/40 text-[11px] font-bold tabular-nums">{progress}%</span>
                </div>
                <div className="w-full h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-white/20 text-[11px] mt-1.5 tabular-nums">
                  {t("home.sessionsComplete", { done: activeSession.completedLessons, total: activeSession.totalLessons })}
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* Empty state hint — hidden when no recent session */}

      </div>
    </div>
  );
}
