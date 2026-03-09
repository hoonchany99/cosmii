"use client";

import { Flame, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function HudOverlay() {
  const stats = useAppStore((s) => s.stats);

  return (
    <div className="absolute top-12 w-full px-6 flex justify-between items-center z-30 pointer-events-none">
      {/* Logo */}
      <h1 className="text-white/70 text-[20px] font-bold tracking-widest pointer-events-auto">
        COSMII
      </h1>

      {/* Stats */}
      <div className="flex gap-3 pointer-events-auto">
        {/* Streak */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full backdrop-blur-md">
          <Flame size={14} className="text-orange-500" />
          <span className="text-orange-500 text-xs font-semibold">{stats.streakDays}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full backdrop-blur-md">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-amber-400 text-xs font-semibold">
            {stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : stats.xp} XP
          </span>
        </div>

        {/* Level */}
        <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
          Lv.{stats.level}
        </div>
      </div>
    </div>
  );
}
