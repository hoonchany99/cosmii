"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, Award, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/components/ui/glass-panel";
import { CosmicBg } from "@/components/cosmic-bg";

const serif = "font-[var(--font-serif)]";

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizViewProps {
  quizzes: Quiz[];
  progressPercent: number;
  onBack: () => void;
  onComplete: (score: number, total: number, correct: number) => void;
}

type FeedbackState = null | "correct" | "wrong";

function ConfettiParticle({ delay }: { delay: number }) {
  const x = useMemo(() => (Math.random() - 0.5) * 200, []);
  const color = useMemo(() => ["#34d399", "#fbbf24", "#818cf8", "#f472b6", "#22d3ee"][Math.floor(Math.random() * 5)], []);
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ left: "50%", top: "50%", background: color }}
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x, y: -(80 + Math.random() * 120), scale: 0.3, rotate: Math.random() * 360 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    />
  );
}

export function QuizView({ quizzes, progressPercent, onBack, onComplete }: QuizViewProps) {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const quiz = quizzes[currentQuiz];
  const isLast = currentQuiz >= quizzes.length - 1;
  const quizPct = Math.round(((currentQuiz + (feedback ? 1 : 0)) / Math.max(quizzes.length, 1)) * 100);

  const handleSelect = (idx: number) => {
    if (feedback) return;
    setSelectedOption(idx);
  };

  const handleCheck = useCallback(() => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === quiz.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
  }, [selectedOption, quiz]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalCorrect = correctCount + (feedback === "correct" ? 0 : 0);
      const score = Math.round((finalCorrect / quizzes.length) * 100);
      onComplete(score, quizzes.length, finalCorrect);
    } else {
      setCurrentQuiz((prev) => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [isLast, correctCount, feedback, quizzes.length, onComplete]);

  const optionLabel = (i: number) => String.fromCharCode(65 + i);

  const getOptionStyle = (i: number) => {
    if (!feedback) {
      return i === selectedOption
        ? "bg-indigo-500/12 border-2 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        : "bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/20";
    }
    if (i === selectedOption && feedback === "wrong") {
      return "bg-red-500/10 border-2 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
    }
    if (i === quiz.correctIndex) {
      return "bg-emerald-500/10 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
    }
    return "bg-white/[0.02] border border-white/[0.05] opacity-30";
  };

  const getBadgeStyle = (i: number) => {
    if (!feedback) {
      return i === selectedOption
        ? "bg-indigo-500 text-white border-indigo-400"
        : "bg-white/[0.08] text-white/40 border-white/[0.12]";
    }
    if (i === quiz.correctIndex) return "bg-emerald-500 text-white border-emerald-400";
    if (i === selectedOption && feedback === "wrong") return "bg-red-500 text-white border-red-400";
    return "bg-white/[0.04] text-white/20 border-white/[0.08]";
  };

  return (
    <div className="w-full h-full relative overflow-hidden text-white flex flex-col">
      <CosmicBg accent={feedback === "correct" ? "emerald" : feedback === "wrong" ? "amber" : "indigo"} />

      {/* Header */}
      <div className="pt-14 px-5 flex items-center gap-3 z-20 relative">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="flex-1 h-[4px] bg-white/[0.08] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
            animate={{ width: `${quizPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-white/40 text-[12px] font-semibold min-w-[36px] text-right">
          {currentQuiz + 1}/{quizzes.length}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 pt-10 px-6 flex flex-col z-10 relative">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentQuiz}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`${serif} text-white/95 font-bold text-[22px] leading-snug mb-10`}
          >
            {quiz.question}
          </motion.h2>
        </AnimatePresence>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {quiz.options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={!!feedback}
              whileTap={!feedback ? { scale: 0.97, transition: { type: "spring", stiffness: 500, damping: 25 } } : undefined}
              animate={
                feedback && i === selectedOption
                  ? { scale: [1, 1.03, 1] }
                  : {}
              }
              transition={{ duration: 0.2 }}
              className={`w-full min-h-[56px] rounded-2xl flex items-center px-4 gap-3 backdrop-blur-md text-left transition-all select-none ${getOptionStyle(i)}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border flex-shrink-0 transition-all ${getBadgeStyle(i)}`}>
                {feedback && i === quiz.correctIndex ? (
                  <Check size={15} strokeWidth={3} />
                ) : feedback && i === selectedOption && feedback === "wrong" ? (
                  <X size={15} strokeWidth={3} />
                ) : (
                  optionLabel(i)
                )}
              </span>
              <span className={`font-medium flex-1 text-[15px] ${
                feedback && i === quiz.correctIndex
                  ? "text-emerald-200"
                  : feedback && i === selectedOption && feedback === "wrong"
                    ? "text-white/80"
                    : "text-white/80"
              }`}>
                {opt}
              </span>
            </motion.button>
          ))}
        </div>

        {showConfetti && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom area */}
      <AnimatePresence>
        {feedback ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`p-6 pt-7 pb-10 z-20 rounded-t-3xl border-t backdrop-blur-xl relative ${
              feedback === "correct"
                ? "bg-emerald-950/80 border-emerald-500/25"
                : "bg-red-950/70 border-red-500/20"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-bold text-xl flex items-center gap-2 ${
                feedback === "correct" ? "text-emerald-300" : "text-red-300"
              }`}>
                {feedback === "correct" ? (
                  <>
                    <motion.div
                      initial={{ rotate: -15, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Sparkles size={24} className="text-emerald-400 fill-emerald-400" />
                    </motion.div>
                    정답이에요!
                  </>
                ) : (
                  <>
                    <X size={24} className="text-red-400 stroke-[3]" />
                    아쉬워요
                  </>
                )}
              </h3>
              {feedback === "correct" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring" }}
                  className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/35 px-3 py-1.5 rounded-full"
                >
                  <Award size={15} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 font-bold text-[13px]">+20 XP</span>
                </motion.div>
              )}
            </div>

            {feedback === "wrong" && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-white/45 font-bold text-[13px]">정답:</span>
                <span className="text-white/85 font-medium text-[14px]">{quiz.options[quiz.correctIndex]}</span>
              </div>
            )}

            <p className="text-white/65 text-[14px] leading-relaxed mb-7 font-medium">{quiz.explanation}</p>

            <PrimaryButton
              variant={feedback === "correct" ? "emerald" : "ghost"}
              onClick={handleNext}
              className="text-[16px] tracking-wide"
            >
              {isLast ? "결과 보기" : "다음"}
            </PrimaryButton>
          </motion.div>
        ) : (
          <motion.div
            className="px-6 pb-10 z-20 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <PrimaryButton disabled={selectedOption === null} onClick={handleCheck}>
              확인하기
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
