"use client";

import { motion } from "framer-motion";
import { Star, Flame, Award } from "lucide-react";
import { PrimaryButton } from "@/components/ui/glass-panel";

interface SessionCompleteProps {
  correctRate: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  streakDays: number;
  levelUp: boolean;
  onNextLesson: () => void;
  onGoHome: () => void;
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
}: SessionCompleteProps) {
  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden text-white flex flex-col items-center justify-center">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_60%)] animate-[pulse_3s_ease-in-out_infinite]" />

      {/* Extra particles */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-amber-300/60 rounded-full blur-[2px]"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${50 + (Math.random() * 60 - 30)}%`,
              top: `${50 + (Math.random() * 60 - 30)}%`,
            }}
            animate={{
              y: [-10, -100],
              scale: [1, 0],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="z-20 flex flex-col items-center gap-6 px-8 w-full relative"
      >
        {/* Glowing star */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-amber-500 rounded-full blur-[60px] opacity-40 animate-pulse" />
          <div className="absolute inset-4 bg-yellow-400 rounded-full blur-[30px] opacity-50" />
          <div className="absolute inset-8 bg-white rounded-full blur-[10px] opacity-80" />
          <Star size={72} className="text-white fill-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-white mb-2 drop-shadow-md">
          레슨 완료!
        </h1>

        {/* Stats */}
        <div className="flex gap-4 items-center bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-0.5">정답률</span>
            <span className="text-emerald-300 font-bold">{correctRate}%</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-0.5">정답</span>
            <span className="text-white/80 font-bold">{correctCount}/{totalQuestions}</span>
          </div>
        </div>

        {/* XP */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mt-4 mb-2 flex items-center justify-center gap-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          <Award size={28} className="text-amber-400 fill-amber-400" />
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-500">
            +{xpEarned} XP
          </span>
        </motion.div>

        {/* Streak */}
        {streakDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-5 py-2.5 rounded-full backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
          >
            <Flame size={18} className="text-orange-500 fill-orange-500" />
            <span className="text-orange-400 font-bold text-sm">{streakDays}일 연속 학습 달성!</span>
          </motion.div>
        )}

        <div className="w-full h-px bg-white/10 my-4" />

        {/* Actions */}
        <div className="w-full flex flex-col gap-4 mt-4 max-w-[340px]">
          <PrimaryButton
            onClick={onNextLesson}
            className="py-5 text-lg shadow-[0_10px_30px_rgba(99,102,241,0.3)]"
          >
            다음 레슨
          </PrimaryButton>
          <button
            onClick={onGoHome}
            className="text-white/40 hover:text-white/80 font-semibold py-3 transition-colors"
          >
            홈으로
          </button>
        </div>
      </motion.div>
    </div>
  );
}
