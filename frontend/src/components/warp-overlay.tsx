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
const DURATION_MS = 1000;
const MIDPOINT = 0.4;

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

      let speed: number;
      if (t < 0.35) {
        speed = 5 + 45 * (t / 0.35);
      } else if (t < 0.55) {
        speed = 50;
      } else {
        const decel = (t - 0.55) / 0.45;
        speed = 50 * (1 - decel * decel);
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

        const brightness = Math.min(0.6, (1500 - star.z) / 1200);
        const alpha = brightness * streakAlpha;
        const lineWidth = Math.max(0.4, (1 - star.z / 1500) * 1.8);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(180,190,220,${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        const dotR = Math.max(0.6, (1 - star.z / 1500) * 1.5);
        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,190,220,${alpha * 0.7})`;
        ctx.fill();
      }

      if (t > 0.8) {
        const flashT = (t - 0.8) / 0.2;
        const flashAlpha = Math.sin(flashT * Math.PI) * 0.15;
        ctx.fillStyle = `rgba(200,210,230,${flashAlpha})`;
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
