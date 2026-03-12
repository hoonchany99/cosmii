"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Award, Trophy, Zap, RotateCcw, Map } from "lucide-react";
import { PrimaryButton } from "@/components/ui/glass-panel";
import { CosmicBg } from "@/components/cosmic-bg";
import { useIsMobile } from "@/lib/utils";
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

interface SessionCompleteProps {
  correctRate: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  streakDays: number;
  levelUp: boolean;
  onNextLesson: () => void;
  onGoHome: () => void;
  onRetry?: () => void;
  onGoToList?: () => void;
}

function RisingParticle({ delay, x }: { delay: number; x: number }) {
  const color = useMemo(() => ["#fbbf24", "#34d399", "#818cf8", "#f472b6"][Math.floor(Math.random() * 4)], []);
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        background: color,
        left: `${x}%`,
        bottom: "10%",
        filter: "blur(1px)",
      }}
      animate={{ y: -200 - Math.random() * 200, opacity: [0.8, 0], scale: [1, 0.3] }}
      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

export function SessionComplete({
  correctRate,
  correctCount,
  totalQuestions,
  xpEarned,
  streakDays,
  levelUp,
  onNextLesson,
  onGoHome,
  onRetry,
  onGoToList,
}: SessionCompleteProps) {
  const mobile = useIsMobile();
  const allWrong = totalQuestions > 0 && correctCount === 0;
  const t = useT();
  const particles = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({ delay: Math.random() * 2, x: 20 + Math.random() * 60 })),
    [],
  );

  return (
    <div className="w-full h-full relative overflow-hidden text-white flex flex-col items-center justify-center">
      <CosmicBg accent={allWrong ? "amber" : "emerald"} />

      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {particles.map((p, i) => (
          <RisingParticle key={i} delay={p.delay} x={p.x} />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="z-20 flex flex-col items-center gap-5 px-8 w-full max-w-[380px] relative"
      >
        {/* Cosmii celebrating */}
        <motion.div
          className="relative mb-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className={`absolute inset-0 ${allWrong ? "bg-amber-400/20" : "bg-teal-400/20"} rounded-full blur-[40px] scale-150`} />
          <img
            src={
              allWrong
                ? (mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp")
                : (mobile ? "/cosmii/dancing-mobile.webp" : "/cosmii/dancing-desktop.webp")
            }
            alt="Cosmii"
            className={`w-[110px] h-auto relative z-10 ${allWrong ? "drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]" : "drop-shadow-[0_0_30px_rgba(45,212,191,0.4)]"}`}
            draggable={false}
          />
        </motion.div>

        <h1 className={`${serif} text-[30px] font-bold tracking-tight text-white drop-shadow-lg`}>
          {allWrong ? t("complete.reviewAgain") : t("complete.done")}
        </h1>
        {allWrong && (
          <p className="text-white/45 text-[14px] -mt-2 text-center">
            {t("complete.encouragement")}
          </p>
        )}

        {/* Level up banner */}
        <AnimatePresence>
          {levelUp && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 250, damping: 15 }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/40 px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              <Zap size={18} className="text-amber-400 fill-amber-400" />
              <span className={`${serif} text-amber-300 font-bold text-[15px] tracking-wide`}>{t("complete.levelUp")}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center gap-2"
          >
            <Trophy size={22} className="text-emerald-400" />
            <span className="text-white/35 text-[10px] uppercase tracking-[0.15em] font-bold">{t("complete.accuracy")}</span>
            <span className={`${serif} text-[28px] font-bold ${
              correctRate >= 80 ? "text-emerald-300" : correctRate >= 50 ? "text-amber-300" : "text-red-300"
            }`}>
              {correctRate}%
            </span>
            <span className="text-white/40 text-[12px]">{correctCount}/{totalQuestions}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center gap-2"
          >
            <Award size={22} className="text-amber-400 fill-amber-400" />
            <span className="text-white/35 text-[10px] uppercase tracking-[0.15em] font-bold">{t("complete.xpEarned")}</span>
            <span className={`${serif} text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-500`}>
              +{xpEarned}
            </span>
            <span className="text-white/40 text-[12px]">{t("complete.xpUnit")}</span>
          </motion.div>
        </div>

        {/* Streak */}
        {streakDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg mt-1"
          >
            <Flame size={17} className="text-orange-400 fill-orange-400" />
            <span className="text-orange-300/90 font-bold text-[13px]">{t("complete.streakMsg", { days: streakDays })}</span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 mt-5">
          {allWrong && onRetry ? (
            <>
              <PrimaryButton onClick={onRetry} className="py-4 text-[16px] flex items-center justify-center gap-2">
                <RotateCcw size={18} />
                {t("complete.retry")}
              </PrimaryButton>
              <div className="flex items-center gap-3 w-full">
                {onGoToList && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={onGoToList}
                    className="flex-1 flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 font-semibold py-2.5 transition-colors text-[14px] active:text-white/90"
                  >
                    <Map size={14} />
                    {t("complete.lessonList")}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={onGoHome}
                  className="flex-1 text-white/35 hover:text-white/70 font-semibold py-2.5 transition-colors text-[14px] active:text-white/90"
                >
                  {t("complete.goHome")}
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <PrimaryButton onClick={onNextLesson} className="py-4 text-[16px]">
                {t("complete.nextLesson")}
              </PrimaryButton>
              <div className="flex items-center gap-3 w-full">
                {onGoToList && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={onGoToList}
                    className="flex-1 flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 font-semibold py-2.5 transition-colors text-[14px] active:text-white/90"
                  >
                    <Map size={14} />
                    {t("complete.lessonList")}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={onGoHome}
                  className="flex-1 text-white/35 hover:text-white/70 font-semibold py-2.5 transition-colors text-[14px] active:text-white/90"
                >
                  {t("complete.goHome")}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
