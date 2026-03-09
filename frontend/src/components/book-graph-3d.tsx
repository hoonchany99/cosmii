"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import type { GraphData } from "@/lib/types";
import { shortenLabel } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FOV = 45;
const SPHERE_RADIUS = 8;
const NODE_RADIUS = 0.18;
const DEFAULT_NODE_COLOR = "#6366f1";
const NODE_COLOR_DIM = "#334155";
const EDGE_RADIUS = 0.04;

const animatedBooks = new Set<string>();

/* ------------------------------------------------------------------ */
/*  Fibonacci sphere distribution                                      */
/* ------------------------------------------------------------------ */

function fibonacciSphere(count: number, radius: number, seed = 42): [number, number, number][] {
  let rng = seed;
  const rand = () => { rng = (rng * 16807 + 0) % 2147483647; return (rng & 0x7fffffff) / 0x7fffffff; };

  const pts: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    const rJitter = radius * (0.88 + rand() * 0.24);
    const aJitter = (rand() - 0.5) * 0.35;
    const yJitter = y + (rand() - 0.5) * 0.12;

    pts.push([
      r * Math.cos(theta + aJitter) * rJitter,
      yJitter * rJitter,
      r * Math.sin(theta + aJitter) * rJitter,
    ]);
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/*  Layout: nodes on sphere surface, edges from graph data             */
/* ------------------------------------------------------------------ */

interface LayoutResult {
  nodes: { id: string; label: string; position: [number, number, number] }[];
  edges: { source: string; target: string; relation: string }[];
  adjacency: Map<string, Set<string>>;
}

function computeLayout(graphData: GraphData, bookId: string): LayoutResult {
  const bookNodes = graphData.nodes.filter((n) => n.book_ids.includes(bookId));
  const nodeIds = new Set(bookNodes.map((n) => n.id));
  const bookEdges = graphData.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  if (bookNodes.length === 0) return { nodes: [], edges: [], adjacency: new Map() };

  const adjacency = new Map<string, Set<string>>();
  bookNodes.forEach((n) => adjacency.set(n.id, new Set()));
  bookEdges.forEach((e) => {
    adjacency.get(e.source)?.add(e.target);
    adjacency.get(e.target)?.add(e.source);
  });

  // BFS order starting from the most-connected node so neighbors cluster together
  const startNode = bookNodes.reduce((best, n) =>
    (adjacency.get(n.id)?.size ?? 0) > (adjacency.get(best.id)?.size ?? 0) ? n : best,
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
      (a, b) => (adjacency.get(b)?.size ?? 0) - (adjacency.get(a)?.size ?? 0),
    );
    for (const nb of neighbors) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  for (const n of bookNodes) {
    if (!visited.has(n.id)) ordered.push(n);
  }

  const positions = fibonacciSphere(ordered.length, SPHERE_RADIUS);

  return {
    nodes: ordered.map((n, i) => ({ id: n.id, label: shortenLabel(n.label), position: positions[i] })),
    edges: bookEdges,
    adjacency,
  };
}

/* ------------------------------------------------------------------ */
/*  Camera controller — focus then release                             */
/* ------------------------------------------------------------------ */

function SlideTo({ focusPoint, controlsRef }: {
  focusPoint: [number, number, number] | null;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const startDir = useRef(new THREE.Vector3());
  const endDir = useRef(new THREE.Vector3());
  const dist = useRef(20);
  const progress = useRef(1);
  const animating = useRef(false);

  useEffect(() => {
    dist.current = camera.position.length() || 20;
    startDir.current.copy(camera.position).normalize();
    if (focusPoint) {
      endDir.current.set(...focusPoint).normalize();
    } else {
      endDir.current.set(0, 0, 1);
    }
    progress.current = 0;
    animating.current = true;
  }, [focusPoint, camera]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !animating.current) return;

    controlsRef.current.target.set(0, 0, 0);
    progress.current = Math.min(1, progress.current + delta * 1.2);
    const t = 1 - Math.pow(1 - progress.current, 3);

    const pos = new THREE.Vector3().copy(startDir.current).lerp(endDir.current, t).normalize().multiplyScalar(dist.current);
    camera.position.copy(pos);
    controlsRef.current.update();

    if (progress.current >= 1) {
      animating.current = false;
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Initial auto-fit camera                                            */
/* ------------------------------------------------------------------ */

function InitialFit({ nodeCount }: { nodeCount: number }) {
  const { camera } = useThree();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || nodeCount === 0) return;
    done.current = true;
    const halfFov = THREE.MathUtils.degToRad(FOV / 2);
    const dist = (SPHERE_RADIUS * 1.6) / Math.tan(halfFov);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [nodeCount, camera]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Wireframe sphere guide                                             */
/* ------------------------------------------------------------------ */

function GuideSphere() {
  return (
    <mesh>
      <sphereGeometry args={[SPHERE_RADIUS, 32, 32]} />
      <meshStandardMaterial color="#e2e8f0" transparent opacity={0.04} wireframe />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Entity node                                                        */
/* ------------------------------------------------------------------ */

function EntityNode({
  id, label, position, highlight, dim, selected, onClick, onHover, delay, nodeColor,
}: {
  id: string; label: string; position: [number, number, number];
  highlight: boolean; dim: boolean; selected: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
  delay: number; nodeColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const appeared = useRef(false);
  const elapsed = useRef(0);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered]);

  const targetOpacity = dim ? 0.15 : 1;
  const targetEmissive = selected ? 1.8 : highlight ? 1.2 : hovered ? 0.6 : 0.2;
  const color = dim ? NODE_COLOR_DIM : nodeColor;

  const skipAnim = delay < 0;
  const fadeIn = useRef(skipAnim ? 0 : 1);

  useFrame((_, delta) => {
    elapsed.current += delta;

    if (groupRef.current && !appeared.current) {
      if (skipAnim) {
        groupRef.current.scale.setScalar(1);
        appeared.current = true;
      } else {
        const t = Math.max(0, elapsed.current - delay);
        const progress = Math.min(1, t / 0.2);
        const ease = 1 - Math.pow(1 - progress, 3);
        groupRef.current.scale.setScalar(ease);
        if (progress >= 1) appeared.current = true;
      }
    }

    if (skipAnim && fadeIn.current < 1) {
      fadeIn.current = Math.min(1, fadeIn.current + delta * 2.5);
    }

    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const opTarget = skipAnim ? targetOpacity * fadeIn.current : targetOpacity;
    mat.opacity += (opTarget - mat.opacity) * Math.min(1, delta * 6);
    mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * Math.min(1, delta * 6);
  });

  return (
    <group ref={groupRef} position={position} scale={skipAnim ? [1, 1, 1] : [0, 0, 0]}>
      <mesh ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(id); }}
        onPointerOver={() => { setHovered(true); onHover(id); }}
        onPointerOut={() => { setHovered(false); onHover(null); }}
      >
        <sphereGeometry args={[NODE_RADIUS, 18, 18]} />
        <meshStandardMaterial
          color={color} emissive={nodeColor}
          emissiveIntensity={0.2}
          roughness={0.25} metalness={0.1}
          transparent opacity={skipAnim ? 0 : 1}
        />
      </mesh>
      {selected && (
        <mesh>
          <sphereGeometry args={[NODE_RADIUS * 2.2, 16, 16]} />
          <meshStandardMaterial color={nodeColor} transparent opacity={0.08} />
        </mesh>
      )}
      {(hovered || selected) && (
        <Billboard position={[0, NODE_RADIUS + 0.35, 0]}>
          <Html center style={{ pointerEvents: "none" }}>
            <div className="rounded-lg bg-gray-900/90 border border-white/10 px-2.5 py-1 text-center whitespace-nowrap shadow-xl backdrop-blur">
              <div className="text-[10px] font-medium text-white">{label}</div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Edge (cylinder) with animated visibility                           */
/* ------------------------------------------------------------------ */

function Edge({ from, to, visible, introDelay, fadeOutStart, edgeColor }: {
  from: [number, number, number]; to: [number, number, number];
  visible: boolean; introDelay: number; fadeOutStart: number; edgeColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const skipAnim = introDelay < 0;
  const phase = useRef<"wait" | "grow" | "hold" | "fadeout" | "idle">(skipAnim ? "idle" : "wait");

  const fromVec = useMemo(() => new THREE.Vector3(...from), [from]);
  const toVec = useMemo(() => new THREE.Vector3(...to), [to]);
  const direction = useMemo(() => toVec.clone().sub(fromVec), [fromVec, toVec]);
  const fullLength = useMemo(() => direction.length(), [direction]);
  const dirNorm = useMemo(() => direction.clone().normalize(), [direction]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
    return q;
  }, [dirNorm]);

  const GROW_DUR = 0.5;
  const HOLD_DUR = 0.15;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    elapsed.current += delta;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const t = elapsed.current;

    if (phase.current === "wait") {
      if (t >= introDelay) phase.current = "grow";
      else return;
    }

    if (phase.current === "grow") {
      const p = Math.min(1, (t - introDelay) / GROW_DUR);
      const ease = 1 - Math.pow(1 - p, 2);
      const len = fullLength * ease;
      const center = fromVec.clone().add(dirNorm.clone().multiplyScalar(len / 2));
      meshRef.current.position.copy(center);
      meshRef.current.quaternion.copy(quat);
      meshRef.current.scale.set(1, ease || 0.001, 1);
      mat.opacity = 0.15;
      meshRef.current.visible = true;
      if (p >= 1) phase.current = "hold";
      return;
    }

    if (phase.current === "hold") {
      if (t >= fadeOutStart) phase.current = "fadeout";
      return;
    }

    if (phase.current === "fadeout") {
      const p = Math.min(1, (t - fadeOutStart) / 1.2);
      mat.opacity = 0.15 * (1 - p);
      if (p >= 1) {
        phase.current = "idle";
        mat.opacity = 0;
        meshRef.current.visible = false;
      }
      return;
    }

    // idle — controlled by selection
    const target = visible ? 0.7 : 0;
    mat.opacity += (target - mat.opacity) * Math.min(1, delta * 6);
    meshRef.current.visible = mat.opacity > 0.01;
  });

  const midPos = useMemo(() => {
    if (skipAnim) {
      return fromVec.clone().add(toVec).multiplyScalar(0.5).toArray() as [number, number, number];
    }
    return fromVec.clone().toArray() as [number, number, number];
  }, [fromVec, toVec, skipAnim]);

  return (
    <mesh ref={meshRef} position={midPos} quaternion={quat} scale={skipAnim ? [1, 1, 1] : [1, 0.001, 1]} visible={false}>
      <cylinderGeometry args={[EDGE_RADIUS, EDGE_RADIUS, fullLength, 6, 1]} />
      <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={0.5} transparent opacity={0} depthWrite={false} roughness={0.4} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function GraphScene({ graphData, bookId, bookColor }: { graphData: GraphData; bookId: string; bookColor: string }) {
  const skipIntro = useMemo(() => {
    if (animatedBooks.has(bookId)) return true;
    animatedBooks.add(bookId);
    return false;
  }, [bookId]);

  const { nodes, edges, adjacency } = useMemo(() => computeLayout(graphData, bookId), [graphData, bookId]);
  const posMap = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    nodes.forEach((n) => m.set(n.id, n.position));
    return m;
  }, [nodes]);

  const nodeDelays = useMemo(() => {
    if (skipIntro) return new Array<number>(nodes.length).fill(-1);
    const order = nodes.map((_, i) => i);
    let seed = 123;
    for (let i = order.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const delays = new Array<number>(nodes.length);
    order.forEach((origIdx, rank) => { delays[origIdx] = rank * 0.003; });
    return delays;
  }, [nodes, skipIntro]);

  const edgeDelays = useMemo(() => {
    if (skipIntro) return new Array<number>(edges.length).fill(-1);
    const maxNodeDelay = nodes.length * 0.003;
    const order = edges.map((_, i) => i);
    let seed = 456;
    for (let i = order.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    const delays = new Array<number>(edges.length);
    order.forEach((origIdx, rank) => { delays[origIdx] = maxNodeDelay + 0.05 + rank * 0.004; });
    return delays;
  }, [nodes.length, edges, skipIntro]);

  const fadeOutStart = useMemo(() => {
    if (skipIntro || edgeDelays.length === 0) return -1;
    return Math.max(...edgeDelays) + 0.5 + 0.3;
  }, [edgeDelays, skipIntro]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const highlightedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    adjacency.get(selectedId)?.forEach((id) => set.add(id));
    return set;
  }, [selectedId, adjacency]);

  const visibleEdges = useMemo(() => {
    if (!selectedId) return new Set<number>();
    const set = new Set<number>();
    edges.forEach((e, i) => {
      if (e.source === selectedId || e.target === selectedId) set.add(i);
    });
    return set;
  }, [selectedId, edges]);

  const focusPoint = useMemo((): [number, number, number] | null => {
    if (!selectedId) return null;
    const pts = [...highlightedIds].map((id) => posMap.get(id)).filter(Boolean) as [number, number, number][];
    if (pts.length === 0) return null;
    const c = pts.reduce(
      (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]] as [number, number, number],
      [0, 0, 0] as [number, number, number],
    );
    return [c[0] / pts.length, c[1] / pts.length, c[2] / pts.length];
  }, [selectedId, highlightedIds, posMap]);

  const handleClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const hasSelection = selectedId !== null;

  return (
    <>
      <InitialFit nodeCount={nodes.length} />
      <SlideTo focusPoint={focusPoint} controlsRef={controlsRef} />

      <OrbitControls ref={controlsRef} makeDefault enablePan={false} enableZoom enableRotate minDistance={3} maxDistance={80} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 10, 8]} intensity={0.5} />
      <directionalLight position={[-5, -5, -5]} intensity={0.15} />

      {/* Nodes — staggered entrance */}
      {nodes.map((n, i) => {
        const isSelected = n.id === selectedId;
        const isHighlighted = highlightedIds.has(n.id);
        const isDim = hasSelection && !isHighlighted;
        const delay = nodeDelays[i];
        return (
          <EntityNode
            key={n.id} id={n.id} label={n.label} position={n.position}
            highlight={isHighlighted} dim={isDim} selected={isSelected}
            onClick={handleClick} onHover={setHoveredId}
            delay={delay} nodeColor={bookColor}
          />
        );
      })}

      {/* Edges — staggered entrance after nodes, then highlight on click */}
      {edges.map((e, i) => {
        const p1 = posMap.get(e.source);
        const p2 = posMap.get(e.target);
        if (!p1 || !p2) return null;
        const introDelay = edgeDelays[i];
        return <Edge key={i} from={p1} to={p2} visible={visibleEdges.has(i)} introDelay={introDelay} fadeOutStart={fadeOutStart} edgeColor={bookColor} />;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

export function BookGraph3D({ graphData, bookId, bookColor = DEFAULT_NODE_COLOR }: { graphData: GraphData; bookId: string; bookColor?: string }) {
  const nodeCount = useMemo(
    () => graphData.nodes.filter((n) => n.book_ids.includes(bookId)).length,
    [graphData, bookId],
  );

  if (nodeCount === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
        No graph data
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 25], fov: FOV, near: 0.1, far: 300 }}
        gl={{ alpha: false }}
        style={{ background: "#f8fafc" }}
        onPointerMissed={() => {}}
      >
        <color attach="background" args={["#f8fafc"]} />
        <GraphScene graphData={graphData} bookId={bookId} bookColor={bookColor} />
      </Canvas>
    </div>
  );
}
