"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { Plus } from "lucide-react";
import { getBookColorById } from "@/lib/colors";
import type { BookInfo, UploadingBook } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface BookNode {
  id: string;
  type: "book" | "uploading";
  label: string;
  color: string;
}

const PANEL_WIDTH = 360;
const CAM_FOV = 55;
const ORBIT_RADIUS = 14;

interface BrainCanvas3DProps {
  books: BookInfo[];
  uploadingBooks: UploadingBook[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onUploadClick: () => void;
}

/* ------------------------------------------------------------------ */
/*  Deterministic solar-system layout                                  */
/* ------------------------------------------------------------------ */

function computeBookPositions(bookNodes: BookNode[]): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  positions.set("__brain__", [0, 0, 0]);

  const count = bookNodes.length;
  if (count === 0) return positions;

  bookNodes.forEach((b, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.set(b.id, [Math.cos(angle) * ORBIT_RADIUS, Math.sin(angle) * ORBIT_RADIUS, 0]);
  });

  return positions;
}

/* ------------------------------------------------------------------ */
/*  Camera goal — shift LEFT so brain sits in remaining visible area   */
/* ------------------------------------------------------------------ */

function computeCameraGoal(
  _bookNodes: BookNode[],
  selectedBookId: string | null,
): { target: [number, number, number] } {
  if (!selectedBookId) return { target: [0, 0, 0] };

  const screenW = typeof window !== "undefined" ? window.innerWidth : 1400;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 900;
  const aspect = screenW / screenH;
  const halfFov = THREE.MathUtils.degToRad(CAM_FOV / 2);
  const radius = ORBIT_RADIUS;
  const span = (radius + 4) * 2;
  const camZ = Math.max(span / 2 / Math.tan(halfFov), 14);
  const worldW = 2 * Math.tan(halfFov) * camZ * aspect;
  const panelWorldW = (PANEL_WIDTH / screenW) * worldW;

  return { target: [panelWorldW / 2, 0, 0] };
}

/* ------------------------------------------------------------------ */
/*  Camera controller                                                  */
/* ------------------------------------------------------------------ */

function CameraController({
  goal, controlsRef,
}: {
  goal: { target: [number, number, number] };
  controlsRef: React.RefObject<any>;
}) {
  const goalTarget = useRef(new THREE.Vector3(...goal.target));

  useEffect(() => {
    goalTarget.current.set(...goal.target);
  }, [goal]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;
    const speed = Math.min(1, delta * 3);
    controlsRef.current.target.lerp(goalTarget.current, speed);
    controlsRef.current.update();
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  AI Brain — nucleus style (core + inner glow + outer shell + rings) */
/* ------------------------------------------------------------------ */

function BrainSphere({ absorbing }: { absorbing: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      const base = absorbing ? 1.08 : 1.0;
      coreRef.current.scale.setScalar(base + Math.sin(t * (absorbing ? 1.6 : 0.7)) * (absorbing ? 0.06 : 0.025));
    }
    if (shellRef.current) {
      shellRef.current.scale.setScalar(1.0 + Math.sin(t * 0.5) * 0.015);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.15;
      ring1Ref.current.rotation.x = Math.PI * 0.35;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.12;
      ring2Ref.current.rotation.y = Math.PI * 0.3;
    }
  });

  return (
    <group>
      {/* Core — bright hot center */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[2.0, 5]} />
        <meshPhysicalMaterial
          color="#a5b4fc" emissive="#818cf8"
          emissiveIntensity={absorbing ? 3.0 : 1.6}
          roughness={0.1} metalness={0.2}
          clearcoat={1} clearcoatRoughness={0.05}
          transparent opacity={0.95}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[2.6, 24, 24]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={absorbing ? 1.4 : 0.6} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      {/* Outer shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.3} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Orbital ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3.0, 0.04, 8, 80]} />
        <meshStandardMaterial color="#a5b4fc" emissive="#818cf8" emissiveIntensity={1.5} transparent opacity={absorbing ? 0.6 : 0.25} />
      </mesh>
      {/* Orbital ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.4, 0.03, 8, 80]} />
        <meshStandardMaterial color="#c7d2fe" emissive="#a5b4fc" emissiveIntensity={1.0} transparent opacity={absorbing ? 0.4 : 0.15} />
      </mesh>
      {/* Always-visible label */}
      <Billboard position={[0, 4.8, 0]}>
        <Html center style={{ pointerEvents: "none" }}>
          <div className="text-center whitespace-nowrap">
            <div className="text-sm font-bold text-white/60">Book-Mind</div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Book sphere — glass marble style                                   */
/* ------------------------------------------------------------------ */

function BookSphere({ node, position, isSelected, onClick, fullTitle }: {
  node: BookNode; position: [number, number, number]; isSelected: boolean; onClick: () => void; fullTitle: string;
}) {
  const isUp = node.type === "uploading";
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered && !isUp ? "pointer" : "auto";
    return () => { document.body.style.cursor = "auto"; };
  }, [hovered, isUp]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 0.9 + position[0] * 0.5) * 0.02;
    meshRef.current.scale.setScalar(s);
  });

  const col = new THREE.Color(node.color);
  const lighterCol = col.clone().lerp(new THREE.Color("#ffffff"), 0.25);

  return (
    <group position={position}>
      {/* Main marble sphere */}
      <mesh ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (!isUp) onClick(); }}
        onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshPhysicalMaterial
          color={lighterCol}
          emissive={node.color}
          emissiveIntensity={isSelected ? 1.6 : hovered ? 0.8 : 0.4}
          roughness={0.05} metalness={0.15}
          clearcoat={1} clearcoatRoughness={0.03}
          transparent opacity={isUp ? 0.45 : 0.92}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Selection glow ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.0, 0.05, 8, 48]} />
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={2.0} transparent opacity={0.5} />
        </mesh>
      )}
      {/* Always-visible label */}
      <Billboard position={[0, 2.4, 0]}>
        <Html center style={{ pointerEvents: "none" }}>
          <div className="text-center whitespace-nowrap">
            <div className={`text-[11px] font-semibold drop-shadow-[0_0_4px_rgba(0,0,0,0.8)] ${isSelected ? "text-white" : "text-white/80"}`}>
              {fullTitle.length > 24 ? fullTitle.slice(0, 24) + "…" : fullTitle}
            </div>
            {isUp && <div className="text-[9px] text-white/40">Uploading…</div>}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Energy pulse along edge — refined glow stream                      */
/* ------------------------------------------------------------------ */

function EnergyPulse({ from, to, color }: {
  from: [number, number, number]; to: [number, number, number]; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  const dir = useMemo(() => {
    const d = new THREE.Vector3(
      to[0] - from[0], to[1] - from[1], to[2] - from[2],
    );
    return d;
  }, [from, to]);

  const length = useMemo(() => dir.length(), [dir]);
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    return q;
  }, [dir]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.35) % 1;
    if (meshRef.current) {
      meshRef.current.position.set(
        from[0] + dir.x * t,
        from[1] + dir.y * t,
        from[2] + dir.z * t,
      );
      const fade = Math.sin(t * Math.PI);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = fade * 0.9;
      meshRef.current.scale.setScalar(0.6 + fade * 0.4);
    }
    const t2 = (clock.getElapsedTime() * 0.35 + 0.5) % 1;
    if (trailRef.current) {
      trailRef.current.position.set(
        from[0] + dir.x * t2,
        from[1] + dir.y * t2,
        from[2] + dir.z * t2,
      );
      const fade2 = Math.sin(t2 * Math.PI);
      (trailRef.current.material as THREE.MeshStandardMaterial).opacity = fade2 * 0.6;
      trailRef.current.scale.setScalar(0.4 + fade2 * 0.3);
    }
  });

  return (
    <group>
      {/* Glowing beam along edge */}
      <mesh position={[from[0] + dir.x * 0.5, from[1] + dir.y * 0.5, from[2] + dir.z * 0.5]} quaternion={quat}>
        <cylinderGeometry args={[0.02, 0.02, length, 4, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} transparent opacity={0.15} />
      </mesh>
      {/* Pulse sphere 1 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.0} transparent opacity={0.8} />
      </mesh>
      {/* Pulse sphere 2 (trailing) */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Brain-book edge                                                    */
/* ------------------------------------------------------------------ */

function BrainBookEdge({ from, to, selected }: {
  from: [number, number, number]; to: [number, number, number]; selected: boolean;
}) {
  const pts = useMemo(() => new Float32Array([...from, ...to]), [from, to]);
  return (
    <lineSegments>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pts, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#6366f1" transparent opacity={selected ? 0.5 : 0.12} />
    </lineSegments>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbit ring                                                         */
/* ------------------------------------------------------------------ */

function OrbitRing() {
  const pts = useMemo(() => {
    const segments = 128;
    const arr = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (2 * Math.PI * i) / segments;
      arr[i * 3] = Math.cos(angle) * ORBIT_RADIUS;
      arr[i * 3 + 1] = Math.sin(angle) * ORBIT_RADIUS;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);

  return (
    <line>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pts, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.08} />
    </line>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function Scene({ bookNodes, positions, books, selectedBookId, onSelectBook, controlsRef, cameraGoal }: {
  bookNodes: BookNode[];
  positions: Map<string, [number, number, number]>;
  books: BookInfo[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  controlsRef: React.RefObject<any>;
  cameraGoal: { target: [number, number, number] };
}) {
  const brainPos: [number, number, number] = [0, 0, 0];

  return (
    <>
      <CameraController goal={cameraGoal} controlsRef={controlsRef} />

      <ambientLight intensity={0.35} />
      <pointLight position={[30, 30, 30]} intensity={0.8} />
      <pointLight position={[-20, -20, -20]} intensity={0.25} />
      <Stars radius={120} depth={80} count={1500} factor={3} saturation={0.1} fade speed={0.3} />

      <OrbitRing />

      {bookNodes.map((node) => {
        const bookPos = positions.get(node.id) ?? brainPos;
        const isSelected = node.id === selectedBookId;
        return (
          <group key={`edge-${node.id}`}>
            <BrainBookEdge from={bookPos} to={brainPos} selected={isSelected} />
            {isSelected && <EnergyPulse from={bookPos} to={brainPos} color={node.color} />}
          </group>
        );
      })}

      {bookNodes.map((node) => {
        const pos = positions.get(node.id) ?? brainPos;
        const isSelected = node.id === selectedBookId;
        const book = books.find((b) => b.book_id === node.id);
        return (
          <BookSphere key={node.id} node={node} position={pos} isSelected={isSelected}
            onClick={() => onSelectBook(isSelected ? null : node.id)} fullTitle={book?.title ?? node.label} />
        );
      })}

      <BrainSphere absorbing={selectedBookId !== null} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

export function BrainCanvas3D({
  books, uploadingBooks, selectedBookId, onSelectBook, onUploadClick,
}: BrainCanvas3DProps) {
  const controlsRef = useRef<any>(null);

  const bookNodes: BookNode[] = useMemo(() => [
    ...books.map((b, i) => ({
      id: b.book_id, type: "book" as const,
      label: b.title.length > 18 ? b.title.slice(0, 18) + "…" : b.title,
      color: getBookColorById(b.book_id),
    })),
    ...uploadingBooks.map((u, i) => ({
      id: u.tempId, type: "uploading" as const,
      label: u.filename.replace(/\.[^.]+$/, "").slice(0, 14),
      color: getBookColorById(u.tempId),
    })),
  ], [books, uploadingBooks]);

  const positions = useMemo(() => computeBookPositions(bookNodes), [bookNodes]);

  const cameraGoal = useMemo(
    () => computeCameraGoal(bookNodes, selectedBookId),
    [bookNodes, selectedBookId],
  );

  const halfFov = THREE.MathUtils.degToRad(CAM_FOV / 2);
  const screenW = typeof window !== "undefined" ? window.innerWidth : 1400;
  const screenH = typeof window !== "undefined" ? window.innerHeight : 900;
  const radius = bookNodes.length > 0 ? ORBIT_RADIUS : 0;
  const span = (radius + 4) * 2;
  const initDist = Math.max(span / 2 / Math.tan(halfFov), span / 2 / (Math.tan(halfFov) * (screenW / screenH)), 14);
  const initialPos = useRef<[number, number, number]>([0, initDist * 0.06, initDist]);

  return (
    <div style={{ position: "absolute", inset: 0, touchAction: "none" }}>
      <Canvas
        camera={{ position: initialPos.current, fov: CAM_FOV, near: 0.1, far: 500 }}
        onPointerMissed={() => onSelectBook(null)}
      >
        <OrbitControls
          ref={controlsRef} makeDefault
          enablePan enableZoom enableRotate={false}
          minDistance={2} maxDistance={300}
        />
        <Scene
          bookNodes={bookNodes} positions={positions} books={books}
          selectedBookId={selectedBookId} onSelectBook={onSelectBook}
          controlsRef={controlsRef} cameraGoal={cameraGoal}
        />
      </Canvas>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <button className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#060612]/90 text-sm font-medium text-white/70 hover:text-white hover:border-white/25 transition-colors shadow-lg"
          onClick={onUploadClick}>
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>
    </div>
  );
}
