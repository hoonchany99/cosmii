"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Flame,
  Star,
  Award,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Settings,
  Camera,
  Check,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppStore, PRESET_AVATARS } from "@/lib/store";

const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

interface ProfileViewProps {
  totalBooks: number;
  completedLessons: number;
  totalLessons: number;
  onBack: () => void;
  onOpenSettings: () => void;
}

function xpForLevel(level: number): number {
  return level * 200;
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-4 flex flex-col items-center gap-2"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <span className="text-white/50 text-[11px] uppercase tracking-[0.15em] font-bold">
        {label}
      </span>
      <span className={`${serif} text-[22px] font-bold text-white/90`}>{value}</span>
    </motion.div>
  );
}

function WeekStreak({ streakDays }: { streakDays: number }) {
  const t = useT();
  const days = [t("profile.dayMon"), t("profile.dayTue"), t("profile.dayWed"), t("profile.dayThu"), t("profile.dayFri"), t("profile.daySat"), t("profile.daySun")];
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-white/55" />
        <span className="text-white/70 text-[13px] font-semibold">{t("profile.weekStudy")}</span>
      </div>
      <div className="flex justify-between">
        {days.map((day, i) => {
          const isActive = i <= todayIdx && i > todayIdx - streakDays;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  i === todayIdx
                    ? "bg-white/[0.15] border-white/30"
                    : isActive
                      ? "bg-white/[0.08] border-white/[0.15]"
                      : "bg-white/[0.03] border-white/[0.07]"
                }`}
              >
                {isActive || i === todayIdx ? (
                  <Flame
                    size={15}
                    className={
                      i === todayIdx
                        ? "text-white/80 fill-white/80"
                        : "text-white/45 fill-white/45"
                    }
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                )}
              </motion.div>
              <span
                className={`text-[11px] font-semibold ${
                  i === todayIdx ? "text-white/70" : "text-white/35"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function ProfileView({
  totalBooks,
  completedLessons,
  totalLessons,
  onBack,
  onOpenSettings,
}: ProfileViewProps) {
  const stats = useAppStore((s) => s.stats);
  const profile = useAppStore((s) => s.profile);
  const setPresetAvatar = useAppStore((s) => s.setPresetAvatar);
  const t = useT();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const xpNeeded = xpForLevel(stats.level);
  const xpInLevel = stats.xp % xpNeeded;
  const xpPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  const lessonPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const displayName = profile.name || `Lv.${stats.level} ${t("profile.explorer")}`;

  const activeAvatar = PRESET_AVATARS.find((a) => a.id === profile.presetAvatar);
  const avatarSrc = activeAvatar?.src ?? null;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <ImageConstellation imageSrc="/cosmii-constellation.png" color="#6BC5A0" animate={false} dim dimOpacity={0.25} dimZoom={12} />
      </div>

      {/* Header */}
      <div className="absolute top-0 w-full pt-safe pb-3 px-5 flex items-center justify-between z-30 bg-[rgba(6,6,18,0.5)] border-b border-white/[0.04]">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={onBack}
            aria-label="Back"
            className="text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h2 className={`${serif} text-white/80 font-bold text-[18px] tracking-wide ml-1`}>
            {t("profile.title")}
          </h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onOpenSettings}
          aria-label="Settings"
          className="text-white/50 hover:text-white/80 p-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10] transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      </div>

      <div className="absolute inset-0 overflow-y-auto pb-20 z-10">
        <div className="w-full h-[220px]" />

        {/* Avatar + Name (overlapping hero) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="flex flex-col items-center gap-3 -mt-14 relative z-20 px-5"
        >
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="relative w-24 h-24 rounded-full border-[3px] border-[#0a0a1a] overflow-hidden group"
            >
              {avatarSrc ? (
                <div className="w-full h-full bg-white/[0.06] flex items-center justify-center p-4">
                  <Image src={avatarSrc} alt="Avatar" width={64} height={64} className="w-full h-full object-contain" />
                </div>
              ) : !profile.presetAvatar && profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover grayscale"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                  <span className={`${serif} text-white/60 text-[28px] font-bold`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white/70" />
              </div>
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -bottom-1 -right-1 bg-white/60 text-[#060612] text-[12px] font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0a0a1a]"
            >
              {stats.level}
            </motion.div>
          </div>

          <div className="text-center">
            <h1 className={`${serif} text-[24px] font-bold text-white tracking-tight`}>
              {displayName}
            </h1>
            {profile.email && (
              <p className="text-white/40 text-[12px] mt-0.5">{profile.email}</p>
            )}
            <p className="text-white/50 text-[13px] mt-1 font-medium">
              {stats.level <= 3 ? t("profile.levelTitle1") : stats.level <= 7 ? t("profile.levelTitle2") : stats.level <= 15 ? t("profile.levelTitle3") : t("profile.levelTitle4")}
            </p>
          </div>

          {/* XP Progress */}
          <div className="w-full max-w-[260px] mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/55 text-[11px] font-semibold flex items-center gap-1">
                <Star size={11} className="text-white/55 fill-white/55" />
                {xpInLevel} / {xpNeeded} XP
              </span>
              <span className="text-white/55 text-[11px] font-bold">Lv.{stats.level + 1}</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/50 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-5 mt-6">
          <WeekStreak streakDays={stats.streakDays} />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatCard
              icon={<Zap size={18} className="text-white/55 fill-white/55" />}
              label={t("profile.totalXP")}
              value={stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : `${stats.xp}`}
              color="bg-white/[0.06]"
              delay={0.15}
            />
            <StatCard
              icon={<Flame size={18} className="text-white/55 fill-white/55" />}
              label={t("profile.streak")}
              value={t("profile.streakDays", { days: stats.streakDays })}
              color="bg-white/[0.06]"
              delay={0.2}
            />
            <StatCard
              icon={<BookOpen size={18} className="text-white/55" />}
              label={t("profile.booksStudying")}
              value={`${totalBooks}`}
              color="bg-white/[0.06]"
              delay={0.25}
            />
            <StatCard
              icon={<Target size={18} className="text-white/55" />}
              label={t("profile.completedExplore")}
              value={`${completedLessons}`}
              color="bg-white/[0.06]"
              delay={0.3}
            />
          </div>

          {totalLessons > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-white/55" />
                  <span className="text-white/70 text-[13px] font-semibold">{t("profile.overallProgress")}</span>
                </div>
                <span className={`${serif} text-white/70 font-bold text-[15px]`}>
                  {lessonPct}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/50 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${lessonPct}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/45 text-[11px] font-medium">{t("profile.completed", { n: completedLessons })}</span>
                <span className="text-white/45 text-[11px] font-medium">{t("profile.outOf", { n: totalLessons })}</span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-white/55" />
              <span className="text-white/70 text-[13px] font-semibold">{t("profile.badges")}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: t("profile.badge1"), icon: "✦", unlockLevel: 1 },
                { name: t("profile.badge2"), icon: "◈", unlockLevel: 2 },
                { name: t("profile.badge3"), icon: "❋", unlockLevel: 3 },
                { name: t("profile.badge4"), icon: "✧", unlockLevel: 5 },
                { name: t("profile.badge5"), icon: "◇", unlockLevel: 7 },
                { name: t("profile.badge6"), icon: "△", unlockLevel: 10 },
                { name: t("profile.badge7"), icon: "⬡", unlockLevel: 15 },
                { name: t("profile.badge8"), icon: "⊹", unlockLevel: 20 },
              ].map((badge) => {
                const unlocked = stats.level >= badge.unlockLevel;
                return (
                  <motion.div
                    key={badge.name}
                    whileTap={unlocked ? { scale: 0.95 } : undefined}
                    className={`flex flex-col items-center gap-1.5 w-[72px] py-3 rounded-xl border transition-all ${
                      unlocked
                        ? "bg-white/[0.06] border-white/[0.12]"
                        : "bg-white/[0.02] border-white/[0.05] opacity-35"
                    }`}
                  >
                    <span className={`text-[20px] ${unlocked ? "text-white/70" : "text-white/15"}`}>
                      {badge.icon}
                    </span>
                    <span className={`text-[10px] font-bold leading-tight text-center px-1 ${unlocked ? "text-white/60" : "text-white/20"}`}>
                      {badge.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-[#0e0e1c] border-t border-white/[0.08] rounded-t-3xl px-6 pt-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`${serif} text-white/80 text-[17px] font-bold`}>
                  {t("profile.chooseAvatar")}
                </h3>
                <button onClick={() => setShowAvatarPicker(false)} className="text-white/40 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Google avatar option */}
                {profile.avatarUrl && (
                  <button
                    onClick={() => { setPresetAvatar(null); setShowAvatarPicker(false); }}
                    className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all ${
                      !profile.presetAvatar
                        ? "border-white/40 bg-white/[0.08]"
                        : "border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <Image
                      src={profile.avatarUrl}
                      alt="Google"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover grayscale"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                    {!profile.presetAvatar && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                        <Check size={12} className="text-[#0a0a1a]" />
                      </div>
                    )}
                  </button>
                )}

                {/* Initial option */}
                <button
                  onClick={() => { setPresetAvatar("initial"); setShowAvatarPicker(false); }}
                  className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all flex items-center justify-center ${
                    profile.presetAvatar === "initial"
                      ? "border-white/40 bg-white/[0.08]"
                      : "border-white/[0.08] bg-white/[0.03]"
                  }`}
                >
                  <span className={`${serif} text-white/60 text-[24px] font-bold`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  {profile.presetAvatar === "initial" && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                      <Check size={12} className="text-[#0a0a1a]" />
                    </div>
                  )}
                </button>

                {/* Preset avatars */}
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => { setPresetAvatar(avatar.id); setShowAvatarPicker(false); }}
                    className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all flex items-center justify-center p-3 ${
                      profile.presetAvatar === avatar.id
                        ? "border-white/40 bg-white/[0.08]"
                        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <Image src={avatar.src} alt={avatar.label} width={48} height={48} className="w-full h-full object-contain opacity-80" />
                    {profile.presetAvatar === avatar.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center">
                        <Check size={12} className="text-[#0a0a1a]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
