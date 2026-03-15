"use client";

import { useMemo } from "react";

export function CosmicBg({ accent = "indigo" }: { accent?: "indigo" | "amber" | "emerald" }) {
  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.2 + 0.04,
      delay: Math.random() * 6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.015), transparent 70%), #060612",
        }}
      />
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-[pulse_5s_ease-in-out_infinite]"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
