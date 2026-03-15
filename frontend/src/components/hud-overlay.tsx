"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Flame, Star, User } from "lucide-react";
import { useAppStore, PRESET_AVATARS } from "@/lib/store";

const serif = "font-[var(--font-serif)]";

interface HudOverlayProps {
  onOpenProfile?: () => void;
}

export function HudOverlay({ onOpenProfile }: HudOverlayProps) {
  const stats = useAppStore((s) => s.stats);
  const profile = useAppStore((s) => s.profile);

  const activeAvatar = PRESET_AVATARS.find((a) => a.id === profile.presetAvatar);
  const showGooglePhoto = !profile.presetAvatar && profile.avatarUrl;

  return (
    <div className="absolute top-0 pt-safe w-full px-5 flex justify-between items-center z-30 pointer-events-none">
      <h1 className={`${serif} font-brand text-white/70 text-[20px] font-bold tracking-[0.02em] pointer-events-auto`}>
        Cosmii
      </h1>

      <div className="flex gap-2 pointer-events-auto items-center">
        <div className="flex items-center gap-1.5 px-2 py-2">
          <Flame size={15} className="text-white/30" />
          <span className="text-white/40 text-[13px] font-bold">{stats.streakDays}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-2">
          <Star size={15} className="text-white/30" />
          <span className="text-white/40 text-[13px] font-bold">
            {stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : stats.xp}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={onOpenProfile}
          aria-label="Profile"
          className="rounded-full w-9 h-9 flex items-center justify-center active:bg-white/[0.06] transition-colors overflow-hidden"
        >
          {activeAvatar ? (
            <Image src={activeAvatar.src} alt="Avatar" width={22} height={22} className="w-[22px] h-[22px] object-contain opacity-50" />
          ) : showGooglePhoto ? (
            <Image
              src={profile.avatarUrl!}
              alt="Profile"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover grayscale opacity-60"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : profile.presetAvatar === "initial" && profile.name ? (
            <span className="text-white/40 text-[14px] font-bold font-[var(--font-serif)]">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={16} className="text-white/35" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
