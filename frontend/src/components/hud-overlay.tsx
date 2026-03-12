"use client";

import { motion } from "framer-motion";
import { Flame, Star, User } from "lucide-react";
import { useAppStore } from "@/lib/store";

const serif = "font-[var(--font-serif)]";

interface HudOverlayProps {
  onOpenProfile?: () => void;
}

export function HudOverlay({ onOpenProfile }: HudOverlayProps) {
  const stats = useAppStore((s) => s.stats);

  return (
    <div className="absolute top-0 pt-safe w-full px-5 flex justify-between items-center z-30 pointer-events-none">
      <h1 className={`${serif} text-white/80 text-[20px] font-bold tracking-[0.02em] pointer-events-auto`}>
        Cosmii
      </h1>

      <div className="flex gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.12] px-3.5 py-2 rounded-full backdrop-blur-md min-h-[36px]">
          <Flame size={16} className="text-orange-400 fill-orange-400" />
          <span className="text-orange-400 text-[13px] font-bold">{stats.streakDays}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.12] px-3.5 py-2 rounded-full backdrop-blur-md min-h-[36px]">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-amber-400 text-[13px] font-bold">
            {stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : stats.xp}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onOpenProfile}
          aria-label="Profile"
          className="bg-indigo-500/15 border border-indigo-400/30 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center active:bg-indigo-500/30 transition-colors"
        >
          <User size={16} className="text-indigo-300" />
        </motion.button>
      </div>
    </div>
  );
}
