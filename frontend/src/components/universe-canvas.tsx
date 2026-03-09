"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  type RefObject,
} from "react";
import type { BookInfo, GraphData, UploadingBook } from "@/lib/types";
import { UPLOAD_STAGE_LABELS, UPLOAD_STAGES, type UploadStage } from "@/lib/types";
import { getBookColor, getBookColorById } from "@/lib/colors";
import { shortenLabel, useIsMobile } from "@/lib/utils";


/* ================================================================ */
/*  Constants                                                        */
/* ================================================================ */

const FOV = 50;
const STAR_COUNT = 1800;
const BOOK_ORBIT_R = 8;
const GALAXY_R = 3.5;
const BOOK_STAR_R = 0.45;
const NODE_R = 0.14;
const EDGE_R = 0.025;
const GALAXY_CAM_DIST = 16;
const WAVE_CYCLE = 3.5;

/* ================================================================ */
/*  Helpers                                                          */
/* ================================================================ */

function fibSphere(
  count: number,
  radius: number,
  seed = 42,
): THREE.Vector3[] {
  if (count === 0) return [];
  if (count === 1) return [new THREE.Vector3(0, 0, radius)];
  let rng = seed;
  const rand = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng & 0x7fffffff) / 0x7fffffff;
  };
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const rJ = radius * (0.88 + rand() * 0.24);
    const aJ = (rand() - 0.5) * 0.35;
    const yJ = y + (rand() - 0.5) * 0.1;
    pts.push(
      new THREE.Vector3(
        r * Math.cos(theta + aJ) * rJ,
        yJ * rJ,
        r * Math.sin(theta + aJ) * rJ,
      ),
    );
  }
  return pts;
}

/* ── Entity layout ── */

interface EntityLayout {
  nodes: {
    id: string;
    label: string;
    position: THREE.Vector3;
  }[];
  edges: {
    key: string;
    source: string;
    target: string;
    from: THREE.Vector3;
    to: THREE.Vector3;
  }[];
  adjacency: Map<string, Set<string>>;
}

function computeEntityLayout(
  graphData: GraphData,
  bookId: string,
  center: THREE.Vector3,
  radius = GALAXY_R,
): EntityLayout {
  const bookNodes = graphData.nodes.filter((n) => n.book_ids.includes(bookId));
  const nodeIds = new Set(bookNodes.map((n) => n.id));
  const bookEdges = graphData.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );
  if (bookNodes.length === 0)
    return { nodes: [], edges: [], adjacency: new Map() };

  const adjacency = new Map<string, Set<string>>();
  bookNodes.forEach((n) => adjacency.set(n.id, new Set()));
  bookEdges.forEach((e) => {
    adjacency.get(e.source)?.add(e.target);
    adjacency.get(e.target)?.add(e.source);
  });

  const startNode = bookNodes.reduce((best, n) =>
    (adjacency.get(n.id)?.size ?? 0) > (adjacency.get(best.id)?.size ?? 0)
      ? n
      : best,
  );
  const visited = new Set<string>();
  const ordered: typeof bookNodes = [];
  const queue: string[] = [startNode.id];
  visited.add(startNode.id);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const node = bookNodes.find((n) => n.id === cur);
    if (node) ordered.push(node);
    const neighbors = [...(adjacency.get(cur) ?? [])].sort(
      (a, b) =>
        (adjacency.get(b)?.size ?? 0) - (adjacency.get(a)?.size ?? 0),
    );
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  for (const n of bookNodes) {
    if (!visited.has(n.id)) ordered.push(n);
  }

  const positions = fibSphere(ordered.length, radius, 777);
  const posMap = new Map<string, THREE.Vector3>();
  const layoutNodes = ordered.map((n, i) => {
    const pos = positions[i].clone().add(center);
    posMap.set(n.id, pos);
    return { id: n.id, label: shortenLabel(n.label), position: pos };
  });

  const layoutEdges = bookEdges
    .filter((e) => posMap.has(e.source) && posMap.has(e.target))
    .map((e, i) => ({
      key: `${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      from: posMap.get(e.source)!,
      to: posMap.get(e.target)!,
    }));

  return { nodes: layoutNodes, edges: layoutEdges, adjacency };
}

/* ================================================================ */
/*  Light textures (shared singletons)                               */
/* ================================================================ */

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

/* ================================================================ */
/*  StarField                                                        */
/* ================================================================ */

function StarField({ lite = false, dimmed = false }: { lite?: boolean; dimmed?: boolean }) {
  const ref1 = useRef<THREE.Points>(null!);
  const ref2 = useRef<THREE.Points>(null!);
  const farOpacity = useRef(0.45);
  const nearOpacity = useRef(0.65);

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
    const farCount = lite ? 600 : STAR_COUNT;
    const nearCount = lite ? 150 : 400;
    return [mkGeo(farCount, 50, 120), mkGeo(nearCount, 22, 50)];
  }, [lite]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref1.current) ref1.current.rotation.y = t * 0.002;
    if (ref2.current) ref2.current.rotation.y = t * 0.005;

    const farTarget = dimmed ? 0.08 : 0.45;
    const nearTarget = dimmed ? 0.12 : 0.65;
    farOpacity.current = THREE.MathUtils.lerp(farOpacity.current, farTarget, 0.04);
    nearOpacity.current = THREE.MathUtils.lerp(nearOpacity.current, nearTarget, 0.04);
    if (ref1.current) (ref1.current.material as THREE.PointsMaterial).opacity = farOpacity.current;
    if (ref2.current) (ref2.current.material as THREE.PointsMaterial).opacity = nearOpacity.current;
  });

  return (
    <>
      <points ref={ref1} geometry={farGeo}>
        <pointsMaterial
          color="#a0b4ff"
          size={0.08}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
      <points ref={ref2} geometry={nearGeo}>
        <pointsMaterial
          color="#dde0ff"
          size={0.18}
          sizeAttenuation
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </points>
    </>
  );
}

/* ================================================================ */
/*  BookStar                                                         */
/* ================================================================ */

function BookStar({
  book,
  position,
  color,
  isSelected,
  dimmed,
  onClick,
  scrubMode = false,
  scrubFocusProgress,
  scrubDimOpacity,
}: {
  book: BookInfo;
  position: THREE.Vector3;
  color: string;
  isSelected: boolean;
  dimmed: boolean;
  onClick: () => void;
  scrubMode?: boolean;
  scrubFocusProgress?: number;
  scrubDimOpacity?: number;
}) {
  const coreRef = useRef<THREE.Sprite>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const rayRef = useRef<THREE.Sprite>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const hitRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);
  const rayTex = useMemo(() => getRayTexture(), []);

  useEffect(() => {
    document.body.style.cursor = hovered && !dimmed ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dimmed]);

  useFrame(({ clock }) => {
    if (!coreRef.current || !groupRef.current) return;

    if (scrubMode) {
      const cm = coreRef.current.material as THREE.SpriteMaterial;
      const focusP = THREE.MathUtils.clamp(scrubFocusProgress ?? 0, 0, 1);
      const hasFocusTimeline = scrubFocusProgress !== undefined;
      const dimOp = scrubDimOpacity ?? 1;

      if (hasFocusTimeline) {
        const enlargeP = THREE.MathUtils.clamp(focusP / 0.55, 0, 1);
        const flashP = THREE.MathUtils.clamp(focusP / 0.45, 0, 1);
        const fadeP = THREE.MathUtils.clamp((focusP - 0.1) / 0.55, 0, 1);

        const easeEnlarge = 1 - Math.pow(1 - enlargeP, 3);
        const focusScale = 1 + easeEnlarge * 5;
        groupRef.current.scale.setScalar(focusScale);
        coreRef.current.scale.setScalar(2 + easeEnlarge * 1.5);

        cm.opacity = Math.max(0, Math.min(1, 1 - fadeP));

        if (glowRef.current) {
          const gm = glowRef.current.material as THREE.SpriteMaterial;
          gm.opacity = Math.max(0, Math.min(1, (0.35 + flashP * 0.65) * (1 - fadeP)));
          glowRef.current.scale.setScalar(4.5 + easeEnlarge * 8);
        }
        if (rayRef.current) {
          const rm = rayRef.current.material as THREE.SpriteMaterial;
          rm.opacity = Math.max(0, Math.min(1, (0.15 + flashP * 0.85) * (1 - fadeP)));
          rayRef.current.scale.setScalar(5.5 + easeEnlarge * 12);
          rayRef.current.material.rotation = 0;
        }
      } else {
        const targetOp = dimmed ? dimOp : isSelected ? 0 : 1;
        cm.opacity = targetOp;
        groupRef.current.scale.setScalar(1);
        coreRef.current.scale.setScalar(2);

        if (glowRef.current) {
          const gm = glowRef.current.material as THREE.SpriteMaterial;
          gm.opacity = 0.35 * targetOp;
          glowRef.current.scale.setScalar(6.5);
        }
        if (rayRef.current) {
          const rm = rayRef.current.material as THREE.SpriteMaterial;
          rm.opacity = 0.15 * targetOp;
          rayRef.current.scale.setScalar(8);
          rayRef.current.material.rotation = 0;
        }
      }
      return;
    }

    const t = clock.getElapsedTime();

    const pulse = 1 + Math.sin(t * 1.2 + position.x * 2) * 0.08;
    const base = hovered && !dimmed ? 1.15 : 1;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, base * pulse, 0.08),
    );

    const targetOp = dimmed ? 0 : isSelected ? 0 : 1;
    const cm = coreRef.current.material as THREE.SpriteMaterial;
    cm.opacity = THREE.MathUtils.lerp(cm.opacity, targetOp, dimmed ? 0.08 : isSelected ? 0.035 : 0.06);

    const coreScale = isSelected ? 2.8 : hovered ? 2.4 : 2;
    coreRef.current.scale.setScalar(
      THREE.MathUtils.lerp(coreRef.current.scale.x, coreScale, 0.08),
    );

    if (glowRef.current) {
      const gm = glowRef.current.material as THREE.SpriteMaterial;
      gm.opacity = THREE.MathUtils.lerp(
        gm.opacity,
        dimmed ? 0 : isSelected ? 0 : hovered ? 0.5 : 0.35,
        isSelected ? 0.035 : 0.08,
      );
      const gs = (isSelected ? 9 : hovered ? 8 : 6.5) * pulse;
      glowRef.current.scale.setScalar(
        THREE.MathUtils.lerp(glowRef.current.scale.x, gs, 0.08),
      );
    }

    if (rayRef.current) {
      const rm = rayRef.current.material as THREE.SpriteMaterial;
      rm.opacity = THREE.MathUtils.lerp(
        rm.opacity,
        dimmed ? 0 : isSelected ? 0 : hovered ? 0.3 : 0.15,
        isSelected ? 0.035 : 0.08,
      );
      const rs = (isSelected ? 12 : hovered ? 10 : 8) * pulse;
      rayRef.current.scale.setScalar(
        THREE.MathUtils.lerp(rayRef.current.scale.x, rs, 0.06),
      );
      rayRef.current.material.rotation = t * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible hit area for clicks */}
      <mesh
        ref={hitRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!dimmed) onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        visible={false}
      >
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* Light rays (outermost, rotating) */}
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

      {/* Soft glow halo */}
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

      {/* Bright core */}
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

      {!dimmed && !isSelected && (
        <Html
          position={[0, -1.8, 0]}
          center
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: "13px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.88)",
            textShadow: `0 0 14px ${color}60, 0 0 5px rgba(0,0,0,0.9)`,
            letterSpacing: "0.02em",
          }}
        >
          {book.title}
        </Html>
      )}
    </group>
  );
}

/* ================================================================ */
/*  UploadingStar                                                    */
/* ================================================================ */

function UploadingStar({
  uploading,
  position,
  isSelected,
  onClick,
}: {
  uploading: UploadingBook;
  position: THREE.Vector3;
  isSelected: boolean;
  onClick: () => void;
}) {
  const coreRef = useRef<THREE.Sprite>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const rayRef = useRef<THREE.Sprite>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);
  const rayTex = useMemo(() => getRayTexture(), []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  const p = uploading.progress;
  const stageIdx = p ? UPLOAD_STAGES.indexOf(p.stage as UploadStage) : 0;
  const pct = p
    ? Math.round(
        ((Math.max(0, stageIdx) + (p.total > 0 ? p.current / p.total : 0)) /
          UPLOAD_STAGES.length) *
          100,
      )
    : 0;
  const isError = p?.stage === "error";
  const isDone = p?.stage === "complete";
  const stageLabel = p
    ? isError
      ? p.message ?? "Error"
      : isDone
        ? "Complete"
        : UPLOAD_STAGE_LABELS[p.stage as UploadStage] ?? "Processing…"
    : "Preparing…";

  const displayName = uploading.filename.replace(/\.[^.]+$/, "");
  const color = BUILDING_COLOR;

  useFrame(({ clock }) => {
    if (!coreRef.current || !groupRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.2 + position.x * 2) * 0.08;

    const targetOp = isSelected ? 0 : 1;
    const cm = coreRef.current.material as THREE.SpriteMaterial;
    cm.opacity = THREE.MathUtils.lerp(cm.opacity, targetOp, isSelected ? 0.035 : 0.06);

    const base = hovered ? 1.15 : 1;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, base * pulse, 0.08),
    );

    const coreScale = isSelected ? 2.8 : hovered ? 2.4 : 2;
    coreRef.current.scale.setScalar(
      THREE.MathUtils.lerp(coreRef.current.scale.x, coreScale, 0.08),
    );

    if (glowRef.current) {
      const gm = glowRef.current.material as THREE.SpriteMaterial;
      gm.opacity = THREE.MathUtils.lerp(
        gm.opacity,
        isSelected ? 0 : hovered ? 0.5 : 0.35,
        isSelected ? 0.035 : 0.08,
      );
      const gs = (isSelected ? 9 : hovered ? 8 : 6.5) * pulse;
      glowRef.current.scale.setScalar(
        THREE.MathUtils.lerp(glowRef.current.scale.x, gs, 0.08),
      );
    }
    if (rayRef.current) {
      const rm = rayRef.current.material as THREE.SpriteMaterial;
      rm.opacity = THREE.MathUtils.lerp(
        rm.opacity,
        isSelected ? 0 : hovered ? 0.3 : 0.15,
        isSelected ? 0.035 : 0.08,
      );
      const rs = (isSelected ? 12 : hovered ? 10 : 8) * pulse;
      rayRef.current.scale.setScalar(
        THREE.MathUtils.lerp(rayRef.current.scale.x, rs, 0.06),
      );
      rayRef.current.material.rotation = t * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        visible={false}
      >
        <sphereGeometry args={[1.2, 8, 8]} />
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

      {!isSelected && (
        <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.88)",
                textShadow: "0 0 14px rgba(240,160,48,0.4), 0 0 5px rgba(0,0,0,0.9)",
                letterSpacing: "0.02em",
                maxWidth: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: isError
                  ? "rgba(248,113,113,0.8)"
                  : isDone
                    ? "rgba(52,211,153,0.8)"
                    : "rgba(255,255,255,0.5)",
              }}
            >
              {stageLabel}
            </span>
            {!isError && !isDone && (
              <div
                style={{
                  width: "72px",
                  height: "2.5px",
                  borderRadius: "1.5px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "1px",
                    background: "linear-gradient(90deg, #f0a030, #f5c060)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ================================================================ */
/*  GraphBuildingAnimation                                           */
/* ================================================================ */

const BUILDING_NODE_COUNT = 100;
const BUILDING_EDGE_COUNT = 75;
const BUILDING_COLOR = "#f0a030";

function GraphBuildingAnimation({ center, radius = GALAXY_R }: { center: THREE.Vector3; radius?: number }) {
  const layout = useMemo(() => {
    const positions = fibSphere(BUILDING_NODE_COUNT, radius, 999);

    let rng = 42;
    const rand = () => {
      rng = (rng * 16807) % 2147483647;
      return (rng & 0x7fffffff) / 0x7fffffff;
    };

    const nodes = positions.map((p, i) => ({
      id: `bld-${i}`,
      position: p.clone().add(center),
      phase: rand(),
    }));

    const edges: { key: string; from: THREE.Vector3; to: THREE.Vector3; fromIdx: number; toIdx: number }[] = [];
    for (let i = 0; i < BUILDING_EDGE_COUNT; i++) {
      const a = Math.floor(rand() * BUILDING_NODE_COUNT);
      const b = (a + 1 + Math.floor(rand() * (BUILDING_NODE_COUNT - 1))) % BUILDING_NODE_COUNT;
      edges.push({
        key: `be-${i}`,
        from: nodes[a].position,
        to: nodes[b].position,
        fromIdx: a,
        toIdx: b,
      });
    }

    return { nodes, edges };
  }, [center]);

  const nodeDelays = useMemo(() => {
    const distances = layout.nodes.map((n, i) => ({
      idx: i,
      dist: n.position.distanceTo(center),
    }));
    distances.sort((a, b) => a.dist - b.dist);
    const maxDist = distances[distances.length - 1]?.dist || 1;
    const d = new Array<number>(layout.nodes.length);
    distances.forEach(({ idx, dist }) => {
      d[idx] = 0.3 + (dist / maxDist) * 0.5;
    });
    return d;
  }, [layout, center]);

  const edgeDelaysArr = useMemo(() => {
    const maxND = nodeDelays.length > 0 ? Math.max(...nodeDelays) : 0;
    const n = layout.edges.length;
    const order = Array.from({ length: n }, (_, i) => i);
    let seed = 654;
    for (let i = n - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const d = new Array<number>(n);
    order.forEach((orig, rank) => {
      d[orig] = maxND + 0.1 + rank * 0.004;
    });
    return d;
  }, [layout, nodeDelays]);

  const edgePhases = useMemo(() => {
    return layout.edges.map((e) =>
      (layout.nodes[e.fromIdx].phase + layout.nodes[e.toIdx].phase) / 2,
    );
  }, [layout]);

  return (
    <>
      {layout.nodes.map((n, i) => (
        <EntityNode
          key={n.id}
          id={n.id}
          label=""
          position={n.position}
          origin={center}
          highlight={false}
          dim={false}
          selected={false}
          onClick={() => {}}
          onHover={() => {}}
          delay={nodeDelays[i]}
          color={BUILDING_COLOR}
          galaxyVisible={true}
          buildingWave={n.phase}
        />
      ))}
      {layout.edges.map((e, i) => (
        <GalaxyEdge
          key={e.key}
          from={e.from}
          to={e.to}
          visible={true}
          introDelay={edgeDelaysArr[i]}
          fadeOutStart={-1}
          color={BUILDING_COLOR}
          galaxyVisible={true}
          isThinking={true}
          buildingWave={edgePhases[i]}
          edgeCenter={center}
        />
      ))}
    </>
  );
}

/* ================================================================ */
/*  EntityNode (galaxy view)                                         */
/* ================================================================ */

function EntityNode({
  id,
  label,
  position,
  origin,
  highlight,
  dim,
  selected,
  onClick,
  onHover,
  delay,
  color,
  galaxyVisible,
  introProgress,
  introLabelOpacity,
  introLabelGlobalOpacity,
  showIntroLabel,
  exitDelay = 0,
  exitDuration = 0.8,
  buildingWave,
}: {
  id: string;
  label: string;
  position: THREE.Vector3;
  origin?: THREE.Vector3;
  highlight: boolean;
  dim: boolean;
  selected: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
  delay: number;
  color: string;
  galaxyVisible: boolean;
  introProgress?: number;
  introLabelOpacity?: number;
  introLabelGlobalOpacity?: number;
  showIntroLabel?: boolean;
  exitDelay?: number;
  exitDuration?: number;
  buildingWave?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const [hovered, setHovered] = useState(false);
  const appeared = useRef(false);
  const elapsed = useRef(0);
  const collapseProgress = useRef(0);
  const wasGalaxyVisible = useRef(galaxyVisible);
  const coreTex = useMemo(() => getCoreTexture(), []);
  const glowTex = useMemo(() => getGlowTexture(), []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  const targetOp = !galaxyVisible ? 0 : dim ? 0.12 : 1;

  useFrame((_, delta) => {
    if (!groupRef.current || !coreRef.current) return;
    elapsed.current += delta;
    const isScrollDriven = introProgress !== undefined;

    if (wasGalaxyVisible.current && !galaxyVisible) {
      collapseProgress.current = 0;
    }
    wasGalaxyVisible.current = galaxyVisible;

    if (!galaxyVisible && origin) {
      collapseProgress.current = Math.min(exitDelay + exitDuration, collapseProgress.current + delta);
      const localT = Math.max(0, collapseProgress.current - exitDelay) / exitDuration;
      const p = Math.min(1, localT);
      const ease = 1 - Math.pow(1 - p, 2);
      groupRef.current.position.lerpVectors(position, origin, ease);
      groupRef.current.scale.setScalar(Math.max(0.01, 1 - ease));
    } else if (isScrollDriven && delay >= 0) {
      const p = THREE.MathUtils.clamp((introProgress - delay) / 0.60, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      groupRef.current.scale.setScalar(0.3 + eased * 0.7);
      if (origin) {
        const startPos = origin.clone().lerp(position, 0.12);
        groupRef.current.position.lerpVectors(startPos, position, eased);
      }
    } else if (!appeared.current) {
      if (delay < 0) {
        groupRef.current.scale.setScalar(1);
        groupRef.current.position.copy(position);
        appeared.current = true;
      } else {
        const t = Math.max(0, elapsed.current - delay);
        const p = Math.min(1, t / 0.8);
        const eased = 1 - Math.pow(1 - p, 3);
        groupRef.current.scale.setScalar(eased);
        if (origin) {
          groupRef.current.position.lerpVectors(origin, position, eased);
        } else {
          groupRef.current.position.copy(position);
        }
        if (p >= 1) {
          groupRef.current.scale.setScalar(1);
          groupRef.current.position.copy(position);
          appeared.current = true;
        }
      }
    } else {
      groupRef.current.scale.setScalar(1);
      groupRef.current.position.copy(position);
    }

    const cm = coreRef.current.material as THREE.SpriteMaterial;
    const introGate =
      delay < 0 || !isScrollDriven
        ? 1
        : THREE.MathUtils.clamp((introProgress - delay) / 0.24, 0, 1);

    let waveMultiplier = 1;
    let flashScale = 1;
    if (buildingWave !== undefined) {
      const waveFront = (elapsed.current / WAVE_CYCLE) % 1;
      let dist = Math.abs(buildingWave - waveFront);
      if (dist > 0.5) dist = 1 - dist;
      const pulse = Math.max(0, 1 - dist / 0.15);
      waveMultiplier = 0.10 + pulse * 0.90;

      const flashCycle = 2.7 + buildingWave * 1.6;
      const flashT = (elapsed.current % flashCycle) / flashCycle;
      const flashPulse = flashT < 0.08 ? Math.sin(flashT / 0.08 * Math.PI) : 0;
      waveMultiplier = Math.min(1, waveMultiplier + flashPulse * 0.9);
      flashScale = 1 + flashPulse * 1.2;
    }

    if (isScrollDriven) {
      cm.opacity = targetOp * introGate * waveMultiplier;
    } else {
      const opLerp = !galaxyVisible ? delta * 2.5 : delta * 5;
      cm.opacity = THREE.MathUtils.lerp(
        cm.opacity,
        targetOp * introGate * waveMultiplier,
        Math.min(1, opLerp),
      );
    }

    const coreScale = (selected ? 0.7 : highlight ? 0.55 : hovered ? 0.5 : 0.35) * flashScale;
    if (isScrollDriven) {
      coreRef.current.scale.setScalar(coreScale);
    } else {
      coreRef.current.scale.setScalar(
        THREE.MathUtils.lerp(coreRef.current.scale.x, coreScale, 0.1),
      );
    }

    if (glowRef.current) {
      const gm = glowRef.current.material as THREE.SpriteMaterial;
      const targetGlow =
        (!galaxyVisible ? 0 : dim ? 0.05 : selected ? 0.5 : highlight ? 0.3 : hovered ? 0.25 : 0.12) *
        introGate * waveMultiplier;
      if (isScrollDriven) {
        gm.opacity = targetGlow;
      } else {
        const glowLerp = !galaxyVisible ? delta * 2.5 : delta * 5;
        gm.opacity = THREE.MathUtils.lerp(
          gm.opacity,
          targetGlow,
          Math.min(1, glowLerp),
        );
      }
      const gs = selected ? 2 : highlight ? 1.5 : hovered ? 1.3 : 0.9;
      if (isScrollDriven) {
        glowRef.current.scale.setScalar(gs);
      } else {
        glowRef.current.scale.setScalar(
          THREE.MathUtils.lerp(glowRef.current.scale.x, gs, 0.1),
        );
      }
    }

    groupRef.current.visible = cm.opacity > 0.01;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={delay < 0 ? [1, 1, 1] : [0, 0, 0]}
    >
      {/* Hit area */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
        onPointerOver={() => {
          setHovered(true);
          onHover(id);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
        visible={false}
      >
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* Glow */}
      <sprite ref={glowRef}>
        <spriteMaterial
          map={glowTex}
          color={dim ? "#667788" : color}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Core light */}
      <sprite ref={coreRef}>
        <spriteMaterial
          map={coreTex}
          color={dim ? "#667788" : color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {galaxyVisible &&
        showIntroLabel &&
        (introLabelOpacity ?? 0) > 0.01 &&
        (introLabelGlobalOpacity ?? 1) > 0.01 && (
        <Html
          position={[0, 0.5, 0]}
          center
          style={{
            pointerEvents: "none",
            opacity: (introLabelOpacity ?? 0) * (introLabelGlobalOpacity ?? 1),
          }}
        >
          <div className="rounded-lg bg-black/85 border border-white/10 px-3 py-1.5 text-center whitespace-nowrap shadow-xl backdrop-blur">
            <div className="text-xs font-medium text-white">{label}</div>
          </div>
        </Html>
      )}

      {galaxyVisible &&
        (showIntroLabel === false || introLabelOpacity === undefined) &&
        (hovered || selected) && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: "none" }}>
          <div className="rounded-lg bg-black/85 border border-white/10 px-3 py-1.5 text-center whitespace-nowrap shadow-xl backdrop-blur">
            <div className="text-xs font-medium text-white">{label}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ================================================================ */
/*  GalaxyEdge                                                       */
/* ================================================================ */

function GalaxyEdge({
  from,
  to,
  visible,
  introDelay,
  fadeOutStart,
  color,
  galaxyVisible,
  introProgress,
  isThinking,
  exitDelay = 0,
  exitDuration = 0.5,
  buildingWave,
  edgeCenter,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  visible: boolean;
  introDelay: number;
  fadeOutStart: number;
  color: string;
  galaxyVisible: boolean;
  introProgress?: number;
  isThinking?: boolean;
  exitDelay?: number;
  exitDuration?: number;
  buildingWave?: number;
  edgeCenter?: THREE.Vector3;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const randomOffset = useRef(Math.random());
  const thinkStartTime = useRef(-1);
  const wasThinking = useRef(false);
  const collapseT = useRef(0);
  const wasGalaxyVisible = useRef(galaxyVisible);
  const skipAnim = introDelay < 0;
  const phase = useRef<"wait" | "grow" | "hold" | "fadeout" | "idle">(
    skipAnim ? "idle" : "wait",
  );

  const direction = useMemo(() => to.clone().sub(from), [from, to]);
  const fullLength = useMemo(() => direction.length(), [direction]);
  const dirNorm = useMemo(() => direction.clone().normalize(), [direction]);
  const midPoint = useMemo(() => from.clone().add(to).multiplyScalar(0.5), [from, to]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
    return q;
  }, [dirNorm]);

  const GROW_DUR = 0.5;
  const SCRUB_GROW_DUR = 0.08;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    elapsed.current += delta;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    if (wasGalaxyVisible.current && !galaxyVisible) {
      collapseT.current = 0;
    }
    wasGalaxyVisible.current = galaxyVisible;

    if (!galaxyVisible) {
      collapseT.current = Math.min(exitDelay + exitDuration, collapseT.current + delta);
      const localT = Math.max(0, collapseT.current - exitDelay) / exitDuration;
      const p = Math.min(1, localT);
      const ease = 1 - Math.pow(1 - p, 2);
      const shrink = Math.max(0.001, 1 - ease);
      const len = fullLength * shrink;
      meshRef.current.position.copy(
        from.clone().add(dirNorm.clone().multiplyScalar(len / 2)),
      );
      meshRef.current.quaternion.copy(quat);
      meshRef.current.scale.set(1, shrink, 1);
      mat.opacity = 0.15 * shrink;
      (mat as any).emissiveIntensity = 0.6 * shrink;
      meshRef.current.visible = shrink > 0.01;
      return;
    }

    const t = elapsed.current;
    const isScrollDriven = introProgress !== undefined;

    if (isScrollDriven && introDelay >= 0) {
      const p = THREE.MathUtils.clamp(
        (introProgress - introDelay) / SCRUB_GROW_DUR,
        0,
        1,
      );
      const ease = 1 - Math.pow(1 - p, 2);
      const len = fullLength * ease;
      meshRef.current.position.copy(
        from.clone().add(dirNorm.clone().multiplyScalar(len / 2)),
      );
      meshRef.current.quaternion.copy(quat);
      meshRef.current.scale.set(1, Math.max(0.001, ease), 1);
      mat.opacity = 0.36 * ease;
      meshRef.current.visible = ease > 0.01;
      return;
    }

    if (phase.current === "wait") {
      if (t >= introDelay) phase.current = "grow";
      return;
    }
    if (phase.current === "grow") {
      const p = Math.min(1, (t - introDelay) / GROW_DUR);
      const ease = 1 - Math.pow(1 - p, 2);
      const len = fullLength * ease;
      meshRef.current.position.copy(
        from.clone().add(dirNorm.clone().multiplyScalar(len / 2)),
      );
      meshRef.current.quaternion.copy(quat);
      meshRef.current.scale.set(1, ease || 0.001, 1);
      mat.opacity = 0.15;
      meshRef.current.visible = true;
      if (p >= 1) phase.current = "hold";
      return;
    }
    if (phase.current === "hold") {
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.position.copy(from.clone().add(to).multiplyScalar(0.5));
      meshRef.current.quaternion.copy(quat);
      const fadeP = Math.min(1, (t - (introDelay + GROW_DUR)) / 0.6);
      mat.opacity = 0.15 * (1 - fadeP);
      meshRef.current.visible = mat.opacity > 0.01;
      if (fadeP >= 1) {
        phase.current = "idle";
        mat.opacity = 0;
      }
      return;
    }
    // idle — thinking grow/shrink or breathe pulse
    let targetOpacity: number;
    let targetScale: number;
    let targetEmissive: number;

    const thinkingNow = !!(isThinking && galaxyVisible);
    if (thinkingNow && !wasThinking.current) {
      thinkStartTime.current = elapsed.current;
    }
    wasThinking.current = thinkingNow;

    if (thinkingNow) {
      const rel = elapsed.current - thinkStartTime.current;
      const cycle = 3.0 + randomOffset.current * 2.0;
      const delay = randomOffset.current * 0.8;
      const t = Math.max(0, rel - delay);
      const localT = (t % cycle) / cycle;

      const growEnd = 0.35;
      const holdEnd = 0.55;
      const shrinkEnd = 0.9;

      let ease: number;
      if (localT < growEnd) {
        ease = localT / growEnd;
        ease = 1 - Math.pow(1 - ease, 2);
      } else if (localT < holdEnd) {
        ease = 1;
      } else if (localT < shrinkEnd) {
        ease = 1 - (localT - holdEnd) / (shrinkEnd - holdEnd);
        ease = ease * ease;
      } else {
        ease = 0;
      }

      targetOpacity = 0.35 * ease;
      targetScale = Math.max(0.001, ease);
      targetEmissive = 0.6 + ease * 1.5;
    } else {
      const breathe = 0.5 + Math.sin(elapsed.current * 1.0) * 0.5;
      targetOpacity = visible ? 0.6 : breathe * 0.2;
      targetScale = 1;
      targetEmissive = 0.6 + breathe * 0.4;
    }

    if (buildingWave !== undefined) {
      const waveFront = (elapsed.current / WAVE_CYCLE) % 1;
      let dist = Math.abs(buildingWave - waveFront);
      if (dist > 0.5) dist = 1 - dist;
      const pulse = Math.max(0, 1 - dist / 0.15);
      const wm = 0.10 + pulse * 0.90;
      targetOpacity *= wm;
      targetEmissive *= wm;
    }

    const lerpSpeed = Math.min(1, delta * 3);
    const curScale = meshRef.current.scale.y;
    const newScale = curScale + (targetScale - curScale) * lerpSpeed;
    meshRef.current.scale.set(1, Math.max(0.001, newScale), 1);

    const len = fullLength * newScale;
    meshRef.current.position.copy(
      from.clone().add(dirNorm.clone().multiplyScalar(len / 2)),
    );
    meshRef.current.quaternion.copy(quat);

    mat.opacity += (targetOpacity - mat.opacity) * lerpSpeed;
    (mat as any).emissiveIntensity += (targetEmissive - ((mat as any).emissiveIntensity ?? 0.6)) * lerpSpeed;
    meshRef.current.visible = mat.opacity > 0.01;
  });

  const midPos = useMemo(() => {
    if (skipAnim) return from.clone().add(to).multiplyScalar(0.5);
    return from.clone();
  }, [from, to, skipAnim]);

  return (
    <mesh
      ref={meshRef}
      position={midPos}
      quaternion={quat}
      scale={skipAnim ? [1, 1, 1] : [1, 0.001, 1]}
      visible={false}
    >
      <cylinderGeometry args={[EDGE_R, EDGE_R, fullLength, 6, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0}
        depthWrite={false}
        roughness={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ================================================================ */
/*  Camera Controller                                                */
/* ================================================================ */

function CameraController({
  selectedBookId,
  selectedUploadingId,
  bookPositions,
  books,
  uploading,
  controlsRef,
  scrollZoomProgress,
  scrollFocusBookId,
}: {
  selectedBookId: string | null;
  selectedUploadingId?: string | null;
  bookPositions: THREE.Vector3[];
  books: BookInfo[];
  uploading: UploadingBook[];
  controlsRef: RefObject<any>;
  scrollZoomProgress?: number;
  scrollFocusBookId?: string | null;
}) {
  const { camera } = useThree();
  const progress = useRef(1);
  const isZoomOut = useRef(false);
  const startPos = useRef(new THREE.Vector3());
  const goalPos = useRef(new THREE.Vector3(0, 2, 22));
  const startTarget = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const defaultPos = useMemo(() => new THREE.Vector3(0, 2, 22), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const demoCamOffset = useMemo(
    () => new THREE.Vector3(0, 1.2, GALAXY_CAM_DIST),
    [],
  );

  const uploadingRef = useRef(uploading);
  uploadingRef.current = uploading;

  useEffect(() => {
    if (scrollZoomProgress !== undefined) return;
    startPos.current.copy(camera.position);
    startTarget.current.copy(
      controlsRef.current?.target ?? new THREE.Vector3(),
    );

    const bookIdx = books.findIndex((b) => b.book_id === selectedBookId);
    const bookPos = bookIdx >= 0 ? bookPositions[bookIdx] : null;

    const ul = uploadingRef.current;
    const uploadIdx = ul.findIndex((u) => u.tempId === selectedUploadingId);
    const uploadPos = uploadIdx >= 0 ? bookPositions[books.length + uploadIdx] : null;

    const targetPos = bookPos ?? uploadPos;

    if (targetPos) {
      const dir = targetPos.clone().sub(startPos.current).normalize();
      goalPos.current.copy(targetPos).add(dir.multiplyScalar(GALAXY_CAM_DIST));
      goalTarget.current.copy(targetPos);
      isZoomOut.current = false;
    } else {
      goalPos.current.set(0, 2, 22);
      goalTarget.current.set(0, 0, 0);
      isZoomOut.current = true;
    }
    progress.current = 0;
  }, [selectedBookId, selectedUploadingId, books, bookPositions, camera, controlsRef, scrollZoomProgress]);

  useFrame((_, delta) => {
    if (scrollZoomProgress !== undefined && controlsRef.current) {
      const p = THREE.MathUtils.clamp(scrollZoomProgress, 0, 1);
      const t = 1 - Math.pow(1 - p, 3);
      let focusPos: THREE.Vector3 | null = null;
      if (scrollFocusBookId) {
        const idx = books.findIndex((b) => b.book_id === scrollFocusBookId);
        focusPos = idx >= 0 ? bookPositions[idx] ?? null : null;
      }
      if (focusPos) {
        const focusCamPos = focusPos.clone().add(demoCamOffset);
        camera.position.lerpVectors(defaultPos, focusCamPos, t);
        controlsRef.current.target.lerpVectors(defaultTarget, focusPos, t);
      } else {
        camera.position.copy(defaultPos);
        controlsRef.current.target.copy(defaultTarget);
      }
      controlsRef.current.update();
      return;
    }

    if (progress.current >= 1 || !controlsRef.current) return;
    const dur = isZoomOut.current ? 1.4 : 1.6;
    progress.current = Math.min(1, progress.current + delta / dur);
    const raw = progress.current;
    const t = isZoomOut.current
      ? 1 - Math.pow(1 - raw, 3)
      : raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    camera.position.lerpVectors(startPos.current, goalPos.current, t);
    controlsRef.current.target.lerpVectors(
      startTarget.current,
      goalTarget.current,
      t,
    );
    controlsRef.current.update();
  });

  return null;
}

/* ================================================================ */
/*  Galaxy animation tracking                                        */
/* ================================================================ */

/* ================================================================ */
/*  Universe Scene                                                   */
/* ================================================================ */

function UniverseScene({
  books,
  uploadingBooks,
  graphData,
  selectedBookId,
  selectedUploadingId,
  onSelectBook,
  onSelectUploading,
  onMissedRef,
  objectClickedRef,
  introProgress,
  demoProgress,
  demoFocusBookId,
  demoLabelFadeStart,
  isThinking,
  triggerDance,
  lite = false,
}: {
  books: BookInfo[];
  uploadingBooks?: UploadingBook[];
  graphData: GraphData | null;
  selectedBookId: string | null;
  selectedUploadingId?: string | null;
  onSelectBook: (id: string | null) => void;
  onSelectUploading?: (id: string | null) => void;
  onMissedRef: RefObject<() => void>;
  objectClickedRef: RefObject<boolean>;
  introProgress?: number;
  demoProgress?: number;
  demoFocusBookId?: string;
  demoLabelFadeStart?: number;
  isThinking?: boolean;
  triggerDance?: boolean;
  lite?: boolean;
}) {
  const controlsRef = useRef<any>(null);
  const uploading = uploadingBooks ?? [];
  const totalStarCount = books.length + uploading.length;
  const isDemo = demoProgress !== undefined;
  const bookPositions = useMemo(() => {
    const n = totalStarCount;
    if (n === 0) return [];
    if (isDemo) {
      if (n === 1) return [new THREE.Vector3(0, 0, 0)];
      const cols = 2;
      const rows = Math.ceil(n / cols);
      const gapX = lite ? 4.5 : 7;
      const gapY = lite ? 4 : 6;
      const pts: THREE.Vector3[] = [];
      let rng = 77;
      const rand = () => {
        rng = (rng * 16807) % 2147483647;
        return (rng & 0x7fffffff) / 0x7fffffff - 0.5;
      };
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const inRow = Math.min(cols, n - row * cols);
        const x = (col - (inRow - 1) / 2) * gapX + rand() * 0.8;
        const y = ((rows - 1) / 2 - row) * gapY + rand() * 0.6;
        const z = rand() * 1.5;
        pts.push(new THREE.Vector3(x, y, z));
      }
      return pts;
    }
    const r = lite ? BOOK_ORBIT_R * 0.45 : BOOK_ORBIT_R * 0.75;
    return fibSphere(n, r, 77);
  }, [totalStarCount, lite, isDemo]);

  const isScrollDemo = demoProgress !== undefined;
  const zoomProgress = isScrollDemo
    ? THREE.MathUtils.clamp((demoProgress - 0.16) / 0.24, 0, 1)
    : undefined;
  const scrubbedIntroProgress =
    demoProgress !== undefined
      ? THREE.MathUtils.clamp((demoProgress - 0.4) / 0.42, 0, 1)
      : introProgress;
  const focusBookId = demoFocusBookId ?? books[0]?.book_id ?? null;
  const effectiveSelectedBookId =
    demoProgress !== undefined
      ? (zoomProgress ?? 0) > 0.001
        ? focusBookId
        : null
      : selectedBookId;

  const selectedIdx = books.findIndex((b) => b.book_id === effectiveSelectedBookId);
  const selectedBookPos =
    selectedIdx >= 0 ? bookPositions[selectedIdx] : null;
  const isZoomed = effectiveSelectedBookId !== null || !!selectedUploadingId;

  const galaxyR = lite ? 2.5 : GALAXY_R;

  const entityLayout = useMemo(() => {
    if (!effectiveSelectedBookId || !graphData || !selectedBookPos) return null;
    return computeEntityLayout(graphData, effectiveSelectedBookId, selectedBookPos, galaxyR);
  }, [effectiveSelectedBookId, graphData, selectedBookPos, galaxyR]);

  const skipIntro = useMemo(() => {
    if (scrubbedIntroProgress !== undefined) {
      // Scroll-driven: animation is controlled by scroll position,
      // so never skip — delays must remain valid.
      return !effectiveSelectedBookId;
    }
    if (!effectiveSelectedBookId) return true;
    return false;
  }, [effectiveSelectedBookId, scrubbedIntroProgress]);

  const nodeDelays = useMemo(() => {
    if (!entityLayout || skipIntro)
      return new Array(entityLayout?.nodes.length ?? 0).fill(-1);
    const n = entityLayout.nodes.length;
    const isScrollDrivenIntro = scrubbedIntroProgress !== undefined;

    if (selectedBookPos) {
      const distances = entityLayout.nodes.map((node, i) => ({
        idx: i,
        dist: node.position.distanceTo(selectedBookPos),
      }));
      distances.sort((a, b) => a.dist - b.dist);
      const maxDist = distances[distances.length - 1]?.dist || 1;
      const d = new Array<number>(n);
      if (isScrollDrivenIntro) {
        distances.forEach(({ idx, dist }) => {
          d[idx] = 0.0 + (dist / maxDist) * 0.35;
        });
      } else {
        distances.forEach(({ idx, dist }) => {
          d[idx] = 0.3 + (dist / maxDist) * 0.5;
        });
      }
      return d;
    }

    const order = Array.from({ length: n }, (_, i) => i);
    let seed = 321;
    for (let i = n - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const d = new Array<number>(n);
    order.forEach((orig, rank) => {
      d[orig] = 0.6 + rank * 0.003;
    });
    return d;
  }, [entityLayout, skipIntro, scrubbedIntroProgress, selectedBookPos]);

  const edgeDelays = useMemo(() => {
    if (!entityLayout || skipIntro)
      return new Array(entityLayout?.edges.length ?? 0).fill(-1);
    const maxND = nodeDelays.length > 0 ? Math.max(...nodeDelays) : 0;
    const n = entityLayout.edges.length;
    const isScrollDrivenIntro = scrubbedIntroProgress !== undefined;

    if (isScrollDrivenIntro) {
      const allNodesSettled = maxND + 0.40;
      const d = new Array<number>(n);
      const edgeEnd = 0.92;
      const edgeSpread = Math.max(edgeEnd - allNodesSettled, 0.05);
      for (let i = 0; i < n; i++) {
        d[i] = allNodesSettled + (i / Math.max(n - 1, 1)) * edgeSpread;
      }
      return d;
    }

    const order = Array.from({ length: n }, (_, i) => i);
    let seed = 654;
    for (let i = n - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const d = new Array<number>(n);
    order.forEach((orig, rank) => {
      d[orig] = maxND + 0.1 + rank * 0.004;
    });
    return d;
  }, [entityLayout, nodeDelays, skipIntro, scrubbedIntroProgress]);

  const fadeOutStart = useMemo(() => {
    if (skipIntro || edgeDelays.length === 0) return -1;
    return Math.max(...edgeDelays.filter((d) => d >= 0)) + 0.5 + 0.3;
  }, [edgeDelays, skipIntro]);

  const EXIT_DUR = 0.8;

  const nodeExitDelays = useMemo(() => {
    if (!entityLayout) return [] as number[];
    const n = entityLayout.nodes.length;
    if (n === 0) return [] as number[];
    const validNodeDelays = nodeDelays.filter((d) => d >= 0);
    if (validNodeDelays.length === 0) return new Array(n).fill(0);
    const minD = Math.min(...validNodeDelays);
    const maxD = Math.max(...validNodeDelays);
    const range = maxD - minD || 1;
    const edgeExitSpan = 0.15;
    const nodeExitStart = edgeExitSpan + 0.05;
    const nodeExitSpan = 0.5;
    return nodeDelays.map((d) => {
      if (d < 0) return 0;
      const normD = (d - minD) / range;
      return nodeExitStart + (1 - normD) * nodeExitSpan;
    });
  }, [entityLayout, nodeDelays]);

  const edgeExitDelays = useMemo(() => {
    if (!entityLayout) return [] as number[];
    const n = entityLayout.edges.length;
    if (n === 0) return [] as number[];
    const edgeExitSpan = 0.15;
    return new Array(n).fill(0).map((_, i) => (i / Math.max(n - 1, 1)) * edgeExitSpan);
  }, [entityLayout]);

  /* Entity selection */
  const [entitySelectedId, setEntitySelectedId] = useState<string | null>(
    null,
  );
  const [, setEntityHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setEntitySelectedId(null);
    setEntityHoveredId(null);
  }, [effectiveSelectedBookId]);

  useEffect(() => {
    onMissedRef.current = () => {
      setEntitySelectedId(null);
    };
  }, [onMissedRef]);

  const entityAdj = entityLayout?.adjacency ?? new Map<string, Set<string>>();
  const highlightedIds = useMemo(() => {
    if (!entitySelectedId) return new Set<string>();
    const s = new Set<string>([entitySelectedId]);
    entityAdj.get(entitySelectedId)?.forEach((id) => s.add(id));
    return s;
  }, [entitySelectedId, entityAdj]);

  const visibleEdges = useMemo(() => {
    if (!entitySelectedId || !entityLayout) return new Set<number>();
    const s = new Set<number>();
    entityLayout.edges.forEach((e, i) => {
      if (e.source === entitySelectedId || e.target === entitySelectedId)
        s.add(i);
    });
    return s;
  }, [entitySelectedId, entityLayout]);

  const hasEntitySel = entitySelectedId !== null;
  const bookColor =
    selectedIdx >= 0
      ? (isScrollDemo ? getBookColor(selectedIdx) : getBookColorById(books[selectedIdx].book_id))
      : "#6366f1";
  const showIntroLabels = isScrollDemo && scrubbedIntroProgress !== undefined;
  const introEdgesFullyShownAt = edgeDelays.length
    ? Math.max(...edgeDelays.filter((d) => d >= 0)) + 0.08
    : 0.9;
  const introLabelHoldAfterEdges = 0.03;
  const introLabelFadeStartAt = introEdgesFullyShownAt + introLabelHoldAfterEdges;
  const introLabelFadeDur = 0.06;
  const scrollLabelFade =
    showIntroLabels && scrubbedIntroProgress !== undefined
      ? THREE.MathUtils.clamp(
          1 - (scrubbedIntroProgress - introLabelFadeStartAt) / introLabelFadeDur,
          0,
          1,
        )
      : 1;
  const labelFadeAt = demoLabelFadeStart ?? 0.93;
  const demoEndFade =
    isScrollDemo && demoProgress !== undefined
      ? THREE.MathUtils.clamp(1 - (demoProgress - labelFadeAt) / 0.07, 0, 1)
      : 1;
  const introLabelGlobalOpacity =
    showIntroLabels
      ? Math.min(scrollLabelFade, demoEndFade)
      : undefined;

  return (
    <>
      <CameraController
        selectedBookId={effectiveSelectedBookId}
        selectedUploadingId={selectedUploadingId}
        bookPositions={bookPositions}
        books={books}
        uploading={uploading}
        controlsRef={controlsRef}
        scrollZoomProgress={zoomProgress}
        scrollFocusBookId={focusBookId}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isScrollDemo}
        enablePan={false}
        enableZoom={isZoomed}
        enableRotate
        rotateSpeed={0.35}
        zoomSpeed={0.6}
        minDistance={5}
        maxDistance={40}
      />

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={0.4} distance={80} />

      <StarField lite={lite} dimmed={isZoomed} />

      {books.map((book, i) => {
        const pos = bookPositions[i];
        if (!pos) return null;
        const z = zoomProgress ?? 0;
        const isFocusBook = book.book_id === focusBookId;
        // Add a short hold after camera centers the focus book,
        // then start enlargement/fade progression.
        const focusFadeProgress =
          isScrollDemo && isFocusBook && demoProgress !== undefined
            ? THREE.MathUtils.clamp((demoProgress - 0.52) / 0.38, 0, 1)
            : undefined;
        const isSel = isScrollDemo
          ? isFocusBook && (focusFadeProgress ?? 0) > 0.3
          : book.book_id === effectiveSelectedBookId;
        const isDimmed = isScrollDemo
          ? !isFocusBook && z > 0.2
          : isZoomed && !isSel;
        const dimFadeOpacity = isScrollDemo && !isFocusBook
          ? 1 - THREE.MathUtils.clamp((z - 0.15) / 0.35, 0, 1)
          : undefined;
        return (
          <BookStar
            key={book.book_id}
            book={book}
            position={pos}
            color={isScrollDemo ? getBookColor(i) : getBookColorById(book.book_id)}
            isSelected={isSel}
            dimmed={isDimmed}
            scrubMode={isScrollDemo}
            scrubFocusProgress={focusFadeProgress}
            scrubDimOpacity={dimFadeOpacity}
            onClick={() => {
              objectClickedRef.current = true;
              if (!isScrollDemo) onSelectBook(book.book_id);
            }}
          />
        );
      })}

      {!isZoomed && uploading.map((u, i) => {
        const pos = bookPositions[books.length + i];
        if (!pos) return null;
        const isSel = u.tempId === selectedUploadingId;
        return (
          <UploadingStar
            key={u.tempId}
            uploading={u}
            position={pos}
            isSelected={isSel}
            onClick={() => {
              objectClickedRef.current = true;
              onSelectUploading?.(isSel ? null : u.tempId);
            }}
          />
        );
      })}

      {selectedUploadingId && (() => {
        const idx = uploading.findIndex((u) => u.tempId === selectedUploadingId);
        const pos = idx >= 0 ? bookPositions[books.length + idx] : null;
        return pos ? <GraphBuildingAnimation center={pos} radius={galaxyR} /> : null;
      })()}

      {entityLayout?.nodes.map((n, i) => {
        const isSel = n.id === entitySelectedId;
        const isHL = highlightedIds.has(n.id);
        const isDim = hasEntitySel && !isHL;
        const d = nodeDelays[i] ?? -1;
        const introLabelOpacity =
          showIntroLabels && d >= 0 && scrubbedIntroProgress !== undefined
            ? THREE.MathUtils.clamp((scrubbedIntroProgress - d) / 0.3, 0, 1)
            : undefined;
        const showIntroLabel = showIntroLabels ? i % 2 === 0 : undefined;
        return (
          <EntityNode
            key={n.id}
            id={n.id}
            label={n.label}
            position={n.position}
            origin={selectedBookPos ?? undefined}
            highlight={isHL}
            dim={isDim}
            selected={isSel}
            onClick={(id) => {
              objectClickedRef.current = true;
              setEntitySelectedId((prev) => (prev === id ? null : id));
            }}
            onHover={setEntityHoveredId}
            delay={nodeDelays[i] ?? -1}
            color={bookColor}
            galaxyVisible={isZoomed}
            introProgress={scrubbedIntroProgress}
            introLabelOpacity={introLabelOpacity}
            introLabelGlobalOpacity={introLabelGlobalOpacity}
            showIntroLabel={showIntroLabel}
            exitDelay={nodeExitDelays[i] ?? 0}
            exitDuration={EXIT_DUR}
          />
        );
      })}

      {entityLayout?.edges.map((e, i) => (
        <GalaxyEdge
          key={e.key}
          from={e.from}
          to={e.to}
          visible={visibleEdges.has(i)}
          introDelay={edgeDelays[i] ?? -1}
          fadeOutStart={fadeOutStart}
          color={bookColor}
          galaxyVisible={isZoomed}
          introProgress={scrubbedIntroProgress}
          isThinking={isThinking}
          exitDelay={edgeExitDelays[i] ?? 0}
          exitDuration={0.4}
        />
      ))}

    </>
  );
}

/* ================================================================ */
/*  Exported Component                                               */
/* ================================================================ */

export function UniverseCanvas({
  books,
  uploadingBooks,
  graphData,
  selectedBookId,
  selectedUploadingId,
  onSelectBook,
  onSelectUploading,
  introProgress,
  demoProgress,
  demoFocusBookId,
  demoLabelFadeStart,
  isThinking,
  triggerDance,
  lite: liteProp,
}: {
  books: BookInfo[];
  uploadingBooks?: UploadingBook[];
  graphData: GraphData | null;
  selectedBookId: string | null;
  selectedUploadingId?: string | null;
  onSelectBook: (id: string | null) => void;
  onSelectUploading?: (id: string | null) => void;
  introProgress?: number;
  demoProgress?: number;
  demoFocusBookId?: string;
  demoLabelFadeStart?: number;
  isThinking?: boolean;
  triggerDance?: boolean;
  lite?: boolean;
}) {
  const isScrollDemo = demoProgress !== undefined;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const missedRef = useRef<() => void>(() => {});
  const objectClickedRef = useRef(false);
  const mobile = useIsMobile();
  const lite = liteProp || mobile;

  const handleCanvasClick = useCallback(() => {
    if (objectClickedRef.current) {
      objectClickedRef.current = false;
      return;
    }
    missedRef.current?.();
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        touchAction: isScrollDemo ? "auto" : "none",
        pointerEvents: isScrollDemo ? "none" : "auto",
      }}
      onClick={isScrollDemo ? undefined : handleCanvasClick}
    >
      <Canvas
        camera={{ position: [0, 2, 22], fov: FOV, near: 0.1, far: 300 }}
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ alpha: true, antialias: !mobile }}
        style={{
          background: "transparent",
          ...(isScrollDemo ? { pointerEvents: "none", touchAction: "auto" } : {}),
        }}
      >
        <UniverseScene
          books={books}
          uploadingBooks={uploadingBooks}
          graphData={graphData}
          selectedBookId={selectedBookId}
          selectedUploadingId={selectedUploadingId}
          onSelectBook={onSelectBook}
          onSelectUploading={onSelectUploading}
          onMissedRef={missedRef}
          objectClickedRef={objectClickedRef}
          introProgress={introProgress}
          demoProgress={demoProgress}
          demoLabelFadeStart={demoLabelFadeStart}
          isThinking={isThinking}
          demoFocusBookId={demoFocusBookId}
          triggerDance={triggerDance}
          lite={lite}
        />
      </Canvas>
    </div>
  );
}
