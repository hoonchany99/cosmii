"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { PrimaryButton } from "@/components/ui/glass-panel";
import dynamic from "next/dynamic";

const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";
const ease = [0.22, 1, 0.36, 1] as const;

interface SessionCompleteProps {
  correctRate: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  streakDays: number;
  levelUp: boolean;
  isLastLesson?: boolean;
  completedLessons?: number;
  totalLessons?: number;
  onNextLesson: () => void;
  onGoHome: () => void;
  onRetry?: () => void;
  onGoToList?: () => void;
}

export function SessionComplete({
  correctRate,
  correctCount,
  totalQuestions,
  xpEarned,
  streakDays,
  levelUp,
  isLastLesson = false,
  completedLessons,
  totalLessons,
  onNextLesson,
  onGoHome,
  onRetry,
  onGoToList,
}: SessionCompleteProps) {
  const allWrong = totalQuestions > 0 && correctCount === 0;
  const t = useT();

  const emotionalMsg = useMemo(() => {
    const key = allWrong
      ? "complete.msgAllWrong"
      : correctRate >= 80
        ? "complete.msgGreat"
        : correctRate >= 50
          ? "complete.msgGood"
          : "complete.msgTryAgain";
    const idx = Math.floor(Math.random() * 8);
    return t(`${key}.${idx}` as Parameters<typeof t>[0]);
  }, [allWrong, correctRate, t]);

  return (
    <div className="w-full h-full relative overflow-hidden text-white flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <ImageConstellation imageSrc="/cosmii-constellation.png" color="#6BC5A0" animate={false} dim dimOpacity={0.3} dimZoom={10} />
      </div>

      <div className="z-20 flex flex-col items-center px-10 w-full max-w-[400px] relative">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease }}
          className={`${serif} text-[34px] font-normal tracking-tight text-white`}
        >
          {allWrong ? t("complete.reviewAgain") : t("complete.done")}
        </motion.h1>

        {/* Cosmii's warm words */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease }}
          className={`${serif} italic text-[15px] text-white/50 text-center mt-4 leading-relaxed max-w-[280px]`}
        >
          {emotionalMsg}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.8, ease }}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mt-10 mb-8"
        />

        {/* XP + Streak */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease }}
          className="flex flex-col items-center gap-2"
        >
          <span className={`${serif} text-[30px] font-normal text-white/80`}>
            +{xpEarned}
          </span>
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">
            {t("complete.xpEarned")}
          </span>
          {streakDays > 0 && (
            <span className="text-[12px] text-white/35 mt-2">
              {t("complete.streakMsg", { days: streakDays })}
            </span>
          )}
        </motion.div>

        {/* Book progress */}
        {completedLessons != null && totalLessons != null && totalLessons > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1, ease }}
            className="w-full mt-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/30 text-[11px] font-semibold">
                {t("home.progress")}
              </span>
              <span className="text-white/40 text-[11px] font-bold tabular-nums">
                {completedLessons}/{totalLessons}
              </span>
            </div>
            <div className="w-full h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white/40"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((completedLessons / totalLessons) * 100)}%` }}
                transition={{ delay: 1.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {!isLastLesson && !allWrong && (
              <p className="text-white/20 text-[11px] mt-2 text-center">
                {t("complete.nextEasy")}
              </p>
            )}
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.2, ease }}
          className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mt-8 mb-6"
        />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease }}
          className="w-full flex flex-col gap-3 pb-safe"
        >
          {allWrong && onRetry ? (
            <>
              <PrimaryButton onClick={onRetry} className="py-4 text-[15px] flex items-center justify-center gap-2">
                <RotateCcw size={16} />
                {t("complete.retry")}
              </PrimaryButton>
              <div className="flex items-center gap-3 w-full">
                {onGoToList && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15, ease }}
                    onClick={onGoToList}
                    className="flex-1 text-white/25 hover:text-white/50 font-medium py-3 transition-colors duration-300 text-[14px] min-h-[44px]"
                  >
                    {t("complete.lessonList")}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15, ease }}
                  onClick={onGoHome}
                  className="flex-1 text-white/25 hover:text-white/50 font-medium py-3 transition-colors duration-300 text-[14px] min-h-[44px]"
                >
                  {t("complete.goHome")}
                </motion.button>
              </div>
            </>
          ) : isLastLesson && !allWrong ? (
            <>
              <div className="flex flex-col items-center gap-1 mb-4">
                <span className={`${serif} text-[16px] text-white/60 font-medium`}>
                  {t("complete.bookDone")}
                </span>
                <span className="text-[13px] text-white/30">
                  {t("complete.bookDoneSub")}
                </span>
              </div>
              <a
                href="#app-download"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/90 text-[#060612] text-[15px] font-bold hover:bg-white/80 active:bg-white/70 transition-colors"
              >
                <Download size={16} />
                {t("complete.moreBooks")}
              </a>
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease }}
                onClick={onGoHome}
                className="text-white/25 hover:text-white/50 font-medium py-3 transition-colors duration-300 text-[14px] min-h-[44px]"
              >
                {t("complete.goHome")}
              </motion.button>
            </>
          ) : (
            <>
              <PrimaryButton onClick={onNextLesson} className="py-4 text-[15px]">
                {t("complete.nextLesson")}
              </PrimaryButton>
              <div className="flex items-center gap-3 w-full">
                {onGoToList && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15, ease }}
                    onClick={onGoToList}
                    className="flex-1 text-white/25 hover:text-white/50 font-medium py-3 transition-colors duration-300 text-[14px] min-h-[44px]"
                  >
                    {t("complete.lessonList")}
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15, ease }}
                  onClick={onGoHome}
                  className="flex-1 text-white/25 hover:text-white/50 font-medium py-3 transition-colors duration-300 text-[14px] min-h-[44px]"
                >
                  {t("complete.goHome")}
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
