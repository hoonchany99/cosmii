"use client";

import { useMemo, Suspense } from "react";
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
import dynamic from "next/dynamic";

const CosmiiConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.CosmiiConstellation),
  { ssr: false },
);

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
      <span className="text-white/35 text-[10px] uppercase tracking-[0.15em] font-bold">
        {label}
      </span>
      <span className={`${serif} text-[22px] font-bold text-white/90`}>{value}</span>
    </motion.div>
  );
}

function WeekStreak({ streakDays }: { streakDays: number }) {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
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
        <span className="text-white/60 text-[13px] font-semibold">이번 주 학습</span>
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
                className={`w-9 h-9 rounded-full flex items-center justify-center border ${
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
                className={`text-[10px] font-semibold ${
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

  const xpNeeded = xpForLevel(stats.level);
  const xpInLevel = stats.xp % xpNeeded;
  const xpPct = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  const lessonPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const displayName = profile.name || `Lv.${stats.level} 탐험가`;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="indigo" />

      {/* Header */}
      <div className="absolute top-14 w-full px-5 flex items-center justify-between z-30">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h2 className={`${serif} text-white/80 font-bold text-[18px] tracking-wide ml-2`}>
            내 프로필
          </h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onOpenSettings}
          className="text-white/50 hover:text-white/80 p-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10] transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      </div>

      <div className="absolute inset-0 overflow-y-auto pb-20 z-10">
        {/* Constellation Hero */}
        <div className="relative w-full h-[220px] overflow-hidden">
          <Suspense fallback={<div className="w-full h-full" />}>
            <div className="absolute inset-0 opacity-40">
              <CosmiiConstellation animate={false} />
            </div>
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]" />
        </div>

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
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
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
            <p className="text-indigo-300/50 text-[12px] mt-1 font-medium">
              {stats.level <= 3 ? "우주의 첫 발자국" : stats.level <= 7 ? "지식의 항해자" : stats.level <= 15 ? "별빛 수집가" : "코스믹 마스터"}
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
              label="총 XP"
              value={stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : `${stats.xp}`}
              color="bg-amber-500/15"
              delay={0.15}
            />
            <StatCard
              icon={<Flame size={18} className="text-orange-400 fill-orange-400" />}
              label="연속 학습"
              value={`${stats.streakDays}일`}
              color="bg-orange-500/15"
              delay={0.2}
            />
            <StatCard
              icon={<BookOpen size={18} className="text-indigo-400" />}
              label="학습 중인 책"
              value={`${totalBooks}`}
              color="bg-indigo-500/15"
              delay={0.25}
            />
            <StatCard
              icon={<Target size={18} className="text-emerald-400" />}
              label="완료한 탐험"
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
                  <span className="text-white/60 text-[13px] font-semibold">전체 학습 진도</span>
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
                <span className="text-white/30 text-[11px] font-medium">{completedLessons}개 완료</span>
                <span className="text-white/30 text-[11px] font-medium">{totalLessons}개 중</span>
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
              <span className="text-white/60 text-[13px] font-semibold">달성 뱃지</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: "첫 발자국", icon: "🚀", unlockLevel: 1 },
                { name: "열정의 불꽃", icon: "🔥", unlockLevel: 2 },
                { name: "지식의 씨앗", icon: "🌱", unlockLevel: 3 },
                { name: "별빛 수집가", icon: "⭐", unlockLevel: 5 },
                { name: "우주 탐험가", icon: "🌌", unlockLevel: 7 },
                { name: "지혜의 문", icon: "🏛️", unlockLevel: 10 },
                { name: "코스믹 마스터", icon: "👑", unlockLevel: 15 },
                { name: "전설의 독서가", icon: "📚", unlockLevel: 20 },
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
                    <span className={`text-[9px] font-bold leading-tight text-center px-1 ${unlocked ? "text-white/60" : "text-white/20"}`}>
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
