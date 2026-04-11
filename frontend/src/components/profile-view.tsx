"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Award,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Settings,
  Smartphone,
  Download,
  Pencil,
  Shuffle,
  ChevronDown,
} from "lucide-react";
import { useAppStore, useSettingsStore, generateCosmiiName } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CosmiiAvatar } from "./cosmii-avatar";

const serif = "font-[var(--font-serif)]";

interface ReadingBook {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
  completedLessons: number;
  totalLessons: number;
}

interface ProfileViewProps {
  totalBooks: number;
  readingBooks: ReadingBook[];
  onOpenSettings: () => void;
  isTab?: boolean;
}

/* ── StatCard ── */

function StatCard({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-4 flex flex-col items-center gap-2 flex-1"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.06]">
        {icon}
      </div>
      <span className={`${serif} text-white/50 text-[11px] uppercase tracking-[0.15em] font-bold`}>
        {label}
      </span>
      <span className={`${serif} text-[22px] text-white/90`}>{value}</span>
    </motion.div>
  );
}

/* ── WeekStreak ── */

function WeekStreak({ streakDays }: { streakDays: number }) {
  const t = useT();
  const days = [
    t("profile.dayMon"), t("profile.dayTue"), t("profile.dayWed"),
    t("profile.dayThu"), t("profile.dayFri"), t("profile.daySat"), t("profile.daySun"),
  ];
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-white/55" />
        <span className={`${serif} text-white/70 text-[13px] font-semibold`}>
          {t("profile.weekStudy")}
        </span>
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
                      i === todayIdx ? "text-white/80 fill-white/80" : "text-white/45 fill-white/45"
                    }
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                )}
              </motion.div>
              <span
                className={`${serif} text-[11px] font-semibold ${
                  i === todayIdx ? "text-white/70" : "text-white/35"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ── */

export function ProfileView({
  totalBooks,
  readingBooks,
  onOpenSettings,
  isTab = false,
}: ProfileViewProps) {
  const stats = useAppStore((s) => s.stats);
  const profile = useAppStore((s) => s.profile);
  const setName = useAppStore((s) => s.setName);
  const language = useSettingsStore((s) => s.language);
  const t = useT();

  const [showNameSheet, setShowNameSheet] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  useEffect(() => { setPortalRoot(document.body); }, []);

  const completedLessons = useMemo(() => readingBooks.reduce((s, b) => s + b.completedLessons, 0), [readingBooks]);
  const totalLessons = useMemo(() => readingBooks.reduce((s, b) => s + b.totalLessons, 0), [readingBooks]);
  const lessonPct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const displayName = profile.name || `Lv.${stats.level} ${t("profile.explorer")}`;
  const levelTitle =
    stats.level <= 3 ? t("profile.levelTitle1")
    : stats.level <= 7 ? t("profile.levelTitle2")
    : stats.level <= 15 ? t("profile.levelTitle3")
    : t("profile.levelTitle4");

  const handleOpenNameSheet = useCallback(() => {
    setDraftName(profile.name ?? "");
    setShowNameSheet(true);
  }, [profile.name]);

  const handleSaveName = useCallback(() => {
    const trimmed = draftName.trim();
    if (trimmed.length === 0) return;
    setName(trimmed);
    setShowNameSheet(false);
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: trimmed }),
    }).catch(() => {});
  }, [draftName, setName]);

  const handleRandomName = useCallback(() => {
    setDraftName(generateCosmiiName(language));
  }, [language]);

  const badges = [
    { name: t("profile.badge1"), icon: "✦", unlockLevel: 1 },
    { name: t("profile.badge2"), icon: "◈", unlockLevel: 2 },
    { name: t("profile.badge3"), icon: "❋", unlockLevel: 3 },
    { name: t("profile.badge4"), icon: "✧", unlockLevel: 5 },
    { name: t("profile.badge5"), icon: "◇", unlockLevel: 7 },
    { name: t("profile.badge6"), icon: "△", unlockLevel: 10 },
    { name: t("profile.badge7"), icon: "⬡", unlockLevel: 15 },
    { name: t("profile.badge8"), icon: "⊹", unlockLevel: 20 },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden text-white bg-[#060612]">
      {/* Header */}
      <div className="absolute top-0 w-full h-14 px-3 flex items-center justify-between z-30 bg-[rgba(6,6,18,0.85)] border-b border-white/[0.04] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className={`${serif} text-white/80 font-bold text-[18px] tracking-wide ml-1`}>
            {t("profile.title")}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.3)] text-[rgba(165,180,252,0.9)] text-[11px] font-semibold tracking-wide">Beta</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onOpenSettings}
          aria-label="Settings"
          className="text-white/50 hover:text-white/80 p-2.5 rounded-xl"
        >
          <Settings size={20} />
        </motion.button>
      </div>

      <div className={`absolute inset-0 overflow-y-auto z-10 pt-14 ${isTab ? "pb-[100px]" : "pb-20"}`}>
        {/* ── Avatar Showcase ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center mt-6 mb-2"
        >
          <div className="relative w-[220px] h-[220px] rounded-full overflow-hidden flex items-center justify-center">
            <CosmiiAvatar
              size={220}
              avatarId={profile.presetAvatar}
              accessoryId={profile.accessory}
              blink
            />
          </div>

          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors"
          >
            <Smartphone size={12} className="text-white/35" />
            <span className={`${serif} text-white/35 text-[11px] font-semibold`}>
              {t("profile.customizeInApp")}
            </span>
          </a>
        </motion.div>

        {/* ── Name + Level ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-1 px-5"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenNameSheet}
            className="flex items-center gap-1.5"
          >
            <span className={`${serif} text-[22px] text-white tracking-tight`}>
              {displayName}
            </span>
            <Pencil size={14} className="text-white/30" />
          </motion.button>
          <span className={`${serif} text-white/50 text-[13px] font-medium`}>
            Lv.{stats.level} · {levelTitle}
          </span>
        </motion.div>

        {/* ── Stats Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="px-5 mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-white/55" />
            <span className={`${serif} text-white/70 text-[14px] font-semibold`}>
              {t("profile.myRecord")}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <WeekStreak streakDays={stats.streakDays} />

            <div className="flex gap-3">
              <StatCard
                icon={<Zap size={18} className="text-white/55 fill-white/55" />}
                label={t("profile.totalXP")}
                value={stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : `${stats.xp}`}
                delay={0.05}
              />
              <StatCard
                icon={<Flame size={18} className="text-white/55 fill-white/55" />}
                label={t("profile.streak")}
                value={t("profile.streakDays", { days: stats.streakDays })}
                delay={0.1}
              />
            </div>

            <div className="flex gap-3">
              <StatCard
                icon={<BookOpen size={18} className="text-white/55" />}
                label={t("profile.booksStudying")}
                value={`${totalBooks}`}
                delay={0.15}
              />
              <StatCard
                icon={<Target size={18} className="text-white/55" />}
                label={t("profile.completedExplore")}
                value={`${completedLessons}`}
                delay={0.2}
              />
            </div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5"
            >
              {totalLessons > 0 ? (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between"
                    onClick={() => setProgressOpen((v) => !v)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <TrendingUp size={16} className="text-white/55 flex-shrink-0" />
                      <span className={`${serif} text-white/70 text-[13px] font-semibold truncate`}>
                        {t("profile.overallProgress")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`${serif} text-white/70 text-[15px]`}>
                        {lessonPct}%
                      </span>
                      <motion.div
                        animate={{ rotate: progressOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown size={14} className="text-white/40" />
                      </motion.div>
                    </div>
                  </button>

                  <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden mt-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: "rgba(139,92,246,0.5)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${lessonPct}%` }}
                      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className={`${serif} text-white/45 text-[11px] font-medium`}>
                      {t("profile.completed", { n: completedLessons })}
                    </span>
                    <span className={`${serif} text-white/45 text-[11px] font-medium`}>
                      {t("profile.outOf", { n: totalLessons })}
                    </span>
                  </div>

                  <AnimatePresence>
                    {progressOpen && readingBooks.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col gap-3.5">
                          {readingBooks.map((book) => {
                            const pct = book.totalLessons > 0
                              ? Math.round((book.completedLessons / book.totalLessons) * 100)
                              : 0;
                            return (
                              <div key={book.id}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: book.color || "rgba(139,92,246,0.5)" }}
                                    />
                                    <span className={`${serif} text-white/60 text-[12px] font-medium truncate`}>
                                      {book.title}
                                    </span>
                                  </div>
                                  <span className={`${serif} text-white/50 text-[12px] ml-2 flex-shrink-0`}>
                                    {book.completedLessons}/{book.totalLessons}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: book.color || "rgba(139,92,246,0.5)", opacity: 0.6 }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-white/30" />
                  </div>
                  <div>
                    <p className={`${serif} text-white/50 text-[13px] font-semibold`}>{t("profile.noProgress")}</p>
                    <p className={`${serif} text-white/40 text-[11px] mt-0.5`}>{t("profile.noProgressSub")}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Badges */}
            <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className="text-white/55" />
                <span className={`${serif} text-white/70 text-[13px] font-semibold`}>
                  {t("profile.badges")}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {badges.map((badge) => {
                  const unlocked = stats.level >= badge.unlockLevel;
                  return (
                    <div
                      key={badge.name}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border ${
                        unlocked
                          ? "bg-white/[0.06] border-white/[0.12]"
                          : "bg-white/[0.02] border-white/[0.05] opacity-35"
                      }`}
                    >
                      <span className={`text-[20px] ${unlocked ? "text-white/70" : "text-white/15"}`}>
                        {badge.icon}
                      </span>
                      <span
                        className={`${serif} text-[10px] font-bold leading-tight text-center px-1 ${
                          unlocked ? "text-white/60" : "text-white/30"
                        }`}
                      >
                        {badge.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* App Download */}
            <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Smartphone size={18} className="text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${serif} text-white/70 text-[14px] font-semibold`}>{t("profile.getApp")}</p>
                  <p className="text-white/30 text-[12px] mt-0.5">{t("profile.getAppSub")}</p>
                </div>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.10] text-white/60 text-[13px] font-semibold hover:bg-white/[0.12] active:bg-white/[0.16] transition-colors flex-shrink-0"
                >
                  <Download size={13} />
                  {t("profile.getAppBtn")}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Overlays rendered via portal to escape transform containment */}
      {portalRoot && createPortal(
        <>
          {/* ── Name Edit Dialog ── */}
          <AnimatePresence>
            {showNameSheet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-8"
                onClick={() => setShowNameSheet(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-full max-w-sm bg-[#14142a] rounded-2xl p-6 border border-white/[0.10]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className={`${serif} text-white/90 text-[18px] font-bold text-center mb-4`}>
                    {t("profile.editName")}
                  </h3>

                  <div className="flex items-center bg-white/[0.06] rounded-xl border border-white/[0.10] px-3.5 h-12 mb-3">
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder={t("profile.editNamePlaceholder")}
                      maxLength={30}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className={`${serif} flex-1 bg-transparent text-white/90 text-[16px] outline-none placeholder:text-white/25`}
                    />
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRandomName}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 mb-4"
                  >
                    <Shuffle size={14} className="text-white/45" />
                    <span className={`${serif} text-white/45 text-[13px] font-semibold`}>
                      {t("profile.randomName")}
                    </span>
                  </motion.button>

                  <div className="flex gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNameSheet(false)}
                      className="flex-1 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center"
                    >
                      <span className={`${serif} text-white/50 text-[15px] font-semibold`}>
                        {t("profile.cancel")}
                      </span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveName}
                      className={`flex-1 h-11 rounded-xl flex items-center justify-center ${
                        draftName.trim().length > 0
                          ? "bg-indigo-400/90"
                          : "bg-indigo-400/30"
                      }`}
                    >
                      <span
                        className={`${serif} text-[15px] font-bold ${
                          draftName.trim().length > 0 ? "text-white" : "text-white/40"
                        }`}
                      >
                        {t("profile.save")}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </>,
        portalRoot,
      )}
    </div>
  );
}
