"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useAppStore } from "@/lib/store";
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
      className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-4 flex flex-col items-center gap-2"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <span className="text-white/35 text-[11px] uppercase tracking-[0.15em] font-bold">
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
      className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-orange-400" />
        <span className="text-white/60 text-[13px] font-semibold">{t("profile.weekStudy")}</span>
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
                    ? "bg-orange-500/25 border-orange-400/50 shadow-[0_0_16px_rgba(245,158,11,0.3)]"
                    : isActive
                      ? "bg-orange-500/15 border-orange-500/30"
                      : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                {isActive || i === todayIdx ? (
                  <Flame
                    size={15}
                    className={
                      i === todayIdx
                        ? "text-orange-400 fill-orange-400"
                        : "text-orange-400/70 fill-orange-400/70"
                    }
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                )}
              </motion.div>
              <span
                className={`text-[11px] font-semibold ${
                  i === todayIdx ? "text-orange-400" : "text-white/25"
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
  const t = useT();

  const xpNeeded = xpForLevel(stats.level);
  const xpInLevel = stats.xp % xpNeeded;
  const xpPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  const lessonPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const displayName = profile.name || `Lv.${stats.level} ${t("profile.explorer")}`;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="indigo" />

      {/* Header */}
      <div className="absolute top-0 w-full pt-safe pb-3 px-5 flex items-center justify-between z-30 bg-[rgba(5,5,16,0.4)] backdrop-blur-xl border-b border-white/[0.04]">
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
            <div className="w-24 h-24 rounded-full border-[3px] border-[#0a0a1a] shadow-[0_0_40px_rgba(99,102,241,0.25)] overflow-hidden">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                  <span className={`${serif} text-white/60 text-[28px] font-bold`}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -bottom-1 -right-1 bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[12px] font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0a0a1a] shadow-lg"
            >
              {stats.level}
            </motion.div>
          </div>

          <div className="text-center">
            <h1 className={`${serif} text-[24px] font-bold text-white tracking-tight`}>
              {displayName}
            </h1>
            {profile.email && (
              <p className="text-white/25 text-[12px] mt-0.5">{profile.email}</p>
            )}
            <p className="text-indigo-300/50 text-[13px] mt-1 font-medium">
              {stats.level <= 3 ? t("profile.levelTitle1") : stats.level <= 7 ? t("profile.levelTitle2") : stats.level <= 15 ? t("profile.levelTitle3") : t("profile.levelTitle4")}
            </p>
          </div>

          {/* XP Progress */}
          <div className="w-full max-w-[260px] mt-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/40 text-[11px] font-semibold flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                {xpInLevel} / {xpNeeded} XP
              </span>
              <span className="text-indigo-400/70 text-[11px] font-bold">Lv.{stats.level + 1}</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full"
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
              icon={<Zap size={18} className="text-amber-400 fill-amber-400" />}
              label={t("profile.totalXP")}
              value={stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : `${stats.xp}`}
              color="bg-amber-500/15"
              delay={0.15}
            />
            <StatCard
              icon={<Flame size={18} className="text-orange-400 fill-orange-400" />}
              label={t("profile.streak")}
              value={t("profile.streakDays", { days: stats.streakDays })}
              color="bg-orange-500/15"
              delay={0.2}
            />
            <StatCard
              icon={<BookOpen size={18} className="text-indigo-400" />}
              label={t("profile.booksStudying")}
              value={`${totalBooks}`}
              color="bg-indigo-500/15"
              delay={0.25}
            />
            <StatCard
              icon={<Target size={18} className="text-emerald-400" />}
              label={t("profile.completedExplore")}
              value={`${completedLessons}`}
              color="bg-emerald-500/15"
              delay={0.3}
            />
          </div>

          {totalLessons > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span className="text-white/60 text-[13px] font-semibold">{t("profile.overallProgress")}</span>
                </div>
                <span className={`${serif} text-emerald-400 font-bold text-[15px]`}>
                  {lessonPct}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${lessonPct}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/30 text-[11px] font-medium">{t("profile.completed", { n: completedLessons })}</span>
                <span className="text-white/30 text-[11px] font-medium">{t("profile.outOf", { n: totalLessons })}</span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-violet-400" />
              <span className="text-white/60 text-[13px] font-semibold">{t("profile.badges")}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: t("profile.badge1"), icon: "🚀", unlockLevel: 1 },
                { name: t("profile.badge2"), icon: "🔥", unlockLevel: 2 },
                { name: t("profile.badge3"), icon: "🌱", unlockLevel: 3 },
                { name: t("profile.badge4"), icon: "⭐", unlockLevel: 5 },
                { name: t("profile.badge5"), icon: "🌌", unlockLevel: 7 },
                { name: t("profile.badge6"), icon: "🏛️", unlockLevel: 10 },
                { name: t("profile.badge7"), icon: "👑", unlockLevel: 15 },
                { name: t("profile.badge8"), icon: "📚", unlockLevel: 20 },
              ].map((badge) => {
                const unlocked = stats.level >= badge.unlockLevel;
                return (
                  <motion.div
                    key={badge.name}
                    whileTap={unlocked ? { scale: 0.95 } : undefined}
                    className={`flex flex-col items-center gap-1.5 w-[72px] py-3 rounded-xl border transition-all ${
                      unlocked
                        ? "bg-violet-500/10 border-violet-400/25"
                        : "bg-white/[0.02] border-white/[0.04] opacity-30"
                    }`}
                  >
                    <span className="text-[22px]" style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
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
    </div>
  );
}
