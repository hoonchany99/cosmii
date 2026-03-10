"use client";

import { useMemo } from "react";

export function CosmicBg({ accent = "indigo" }: { accent?: "indigo" | "amber" | "emerald" }) {
  const colors: Record<string, string> = {
    indigo: "rgba(99,102,241,0.12)",
    amber: "rgba(245,158,11,0.10)",
    emerald: "rgba(16,185,129,0.10)",
  };

  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      delay: Math.random() * 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 40%, ${colors[accent]}, transparent 70%), radial-gradient(ellipse 40% 30% at 30% 70%, rgba(139,92,246,0.06), transparent 60%), #050510`,
        }}
      />
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-[pulse_3s_ease-in-out_infinite]"
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
