"use client";

import { useRef, useEffect, useCallback } from "react";

interface WarpOverlayProps {
  active: boolean;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
}

const STAR_COUNT = 200;
const DURATION_MS = 1400;
const MIDPOINT = 0.42;

export function WarpOverlay({ active, onMidpoint, onComplete }: WarpOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const midpointFired = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const onMidpointRef = useRef(onMidpoint);
  onMidpointRef.current = onMidpoint;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const initStars = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const z = Math.random() * 1500 + 200;
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z,
        prevZ: z,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    initStars();
    startRef.current = performance.now();
    midpointFired.current = false;

    const draw = (now: number) => {
      if (!activeRef.current) return;

      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / DURATION_MS);

      if (t >= MIDPOINT && !midpointFired.current) {
        midpointFired.current = true;
        onMidpointRef.current?.();
      }

      if (t >= 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onCompleteRef.current?.();
        return;
      }

      /* ── Phase-based speed ── */
      // 0-0.4: accelerate,  0.4-0.6: peak,  0.6-1.0: decelerate to 0
      let speed: number;
      if (t < 0.4) {
        speed = 20 + 140 * (t / 0.4);
      } else if (t < 0.6) {
        speed = 160;
      } else {
        const decel = (t - 0.6) / 0.4;
        speed = 160 * (1 - decel * decel);
      }

      /* ── Background opacity ── */
      // Fade in → fully opaque around midpoint → fade out
      let bgAlpha: number;
      if (t < 0.08) {
        bgAlpha = t / 0.08;
      } else if (t < 0.7) {
        bgAlpha = 1;
      } else if (t < 0.88) {
        bgAlpha = 1 - (t - 0.7) / 0.18 * 0.3;
      } else {
        bgAlpha = 0.7 * (1 - (t - 0.88) / 0.12);
      }

      /* ── Star streak visibility ── */
      const streakAlpha = t < 0.06
        ? t / 0.06
        : t > 0.85
          ? (1 - t) / 0.15
          : 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      ctx.fillStyle = `rgba(6,6,18,${bgAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw star streaks
      for (const star of starsRef.current) {
        star.prevZ = star.z;
        star.z -= speed;

        if (star.z <= 1) {
          star.z = 1500;
          star.prevZ = 1500;
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          continue;
        }

        const sx = (star.x / star.z) * 400 + cx;
        const sy = (star.y / star.z) * 400 + cy;
        const px = (star.x / star.prevZ) * 400 + cx;
        const py = (star.y / star.prevZ) * 400 + cy;

        const brightness = Math.min(1, (1500 - star.z) / 1200);
        const alpha = brightness * streakAlpha;
        const lineWidth = Math.max(0.5, (1 - star.z / 1500) * 2.5);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(200,210,255,${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        const dotR = Math.max(0.8, (1 - star.z / 1500) * 2);
        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,225,255,${alpha * 0.9})`;
        ctx.fill();
      }

      /* ── Arrival flash: full-screen bloom at t > 0.75 ── */
      if (t > 0.75) {
        const flashT = (t - 0.75) / 0.25;
        const flashIntensity = flashT < 0.2
          ? flashT / 0.2
          : 1 - (flashT - 0.2) / 0.8;
        const maxAlpha = flashIntensity;

        const diag = Math.sqrt(cx * cx + cy * cy);
        const radius = diag * (1.2 + flashT * 0.6);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(220,230,255,${maxAlpha})`);
        grad.addColorStop(0.3, `rgba(190,205,255,${maxAlpha * 0.8})`);
        grad.addColorStop(0.6, `rgba(150,170,245,${maxAlpha * 0.45})`);
        grad.addColorStop(0.85, `rgba(120,140,230,${maxAlpha * 0.15})`);
        grad.addColorStop(1, `rgba(100,120,220,${maxAlpha * 0.05})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, initStars]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
      }}
    />
  );
}
