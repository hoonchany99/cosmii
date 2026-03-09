"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, X, Award } from "lucide-react";
import { PrimaryButton } from "@/components/ui/glass-panel";

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

export function QuizView({ quizzes, progressPercent, onBack, onComplete }: QuizViewProps) {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const quiz = quizzes[currentQuiz];
  const isLast = currentQuiz >= quizzes.length - 1;

  const handleSelect = (idx: number) => {
    if (feedback) return;
    setSelectedOption(idx);
  };

  const handleCheck = useCallback(() => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === quiz.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setXpEarned(prev => prev + 20);
    }
  }, [selectedOption, quiz]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const score = Math.round((correctCount + (feedback === "correct" ? 0 : 0)) / quizzes.length * 100);
      onComplete(score, quizzes.length, correctCount + (feedback === "correct" ? 0 : 0));
    } else {
      setCurrentQuiz(prev => prev + 1);
      setSelectedOption(null);
      setFeedback(null);
    }
  }, [isLast, correctCount, feedback, quizzes.length, onComplete]);

  const optionLabel = (i: number) => String.fromCharCode(65 + i);

  const getOptionStyle = (i: number) => {
    if (!feedback) {
      return i === selectedOption
        ? "bg-indigo-500/15 border-2 border-indigo-400/50"
        : "bg-white/5 border border-white/10 hover:bg-white/10";
    }
    if (i === selectedOption && feedback === "wrong") {
      return "bg-red-500/10 border-2 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
    }
    if (i === quiz.correctIndex) {
      return "bg-emerald-500/10 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
    }
    return "bg-white/5 border border-white/5 opacity-30";
  };

  const progressColor = feedback === "correct" ? "from-emerald-500 to-emerald-400"
    : feedback === "wrong" ? "from-red-500 to-red-400"
    : "from-indigo-500 to-indigo-400";

  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden text-white flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 flex items-center justify-between z-20">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="w-full mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="w-6" />
      </div>

      {/* Question */}
      <div className="flex-1 pt-12 px-6 flex flex-col z-10">
        <h2 className="text-white font-semibold text-2xl leading-snug mb-12">
          {quiz.question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {quiz.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={!!feedback}
              className={`w-full min-h-[56px] rounded-2xl flex items-center px-4 backdrop-blur-md text-left transition-all ${getOptionStyle(i)}`}
            >
              <span className={`w-8 font-bold ${
                feedback && i === quiz.correctIndex ? "text-emerald-400"
                : feedback && i === selectedOption ? "text-red-400"
                : i === selectedOption ? "text-indigo-400"
                : "text-white/40"
              }`}>
                {optionLabel(i)}
              </span>
              <span className={`font-medium flex-1 ${
                feedback && i === quiz.correctIndex ? "text-emerald-200"
                : feedback && i === selectedOption && feedback === "wrong" ? "text-white"
                : "text-white/80"
              }`}>
                {opt}
              </span>
              {feedback && i === selectedOption && feedback === "wrong" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 rounded-full p-1"
                >
                  <X size={16} className="text-white" />
                </motion.div>
              )}
              {feedback && i === quiz.correctIndex && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-500 rounded-full p-1"
                >
                  <Check size={16} className="text-white" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom area */}
      <AnimatePresence>
        {feedback ? (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`p-6 pt-8 pb-10 z-20 rounded-t-3xl border-t ${
              feedback === "correct"
                ? "bg-emerald-950/80 border-emerald-500/30 shadow-[0_-10px_30px_rgba(16,185,129,0.15)]"
                : "bg-red-950/70 border-red-500/20 shadow-[0_-10px_30px_rgba(239,68,68,0.1)]"
            } backdrop-blur-xl`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-bold text-2xl flex items-center gap-2 ${
                feedback === "correct" ? "text-emerald-300" : "text-red-300"
              }`}>
                {feedback === "correct" ? (
                  <><Check size={28} className="text-emerald-400 stroke-[3]" /> 정답이에요!</>
                ) : (
                  <><X size={28} className="text-red-400 stroke-[3]" /> 아쉬워요</>
                )}
              </h3>
              {feedback === "correct" && (
                <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Award size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 font-bold text-sm">+20 XP</span>
                </div>
              )}
            </div>

            {feedback === "wrong" && (
              <div className="mb-2">
                <span className="text-white/50 font-bold mr-2 text-sm">정답:</span>
                <span className="text-white/90 font-medium">{quiz.options[quiz.correctIndex]}</span>
              </div>
            )}

            <p className="text-white/70 text-[15px] leading-relaxed mb-8 font-medium">
              {quiz.explanation}
            </p>

            <PrimaryButton
              variant={feedback === "correct" ? "emerald" : "ghost"}
              onClick={handleNext}
              className="text-lg tracking-wide"
            >
              다음
            </PrimaryButton>
          </motion.div>
        ) : (
          <div className="px-6 pb-12 z-20">
            <PrimaryButton
              disabled={selectedOption === null}
              onClick={handleCheck}
            >
              확인하기
            </PrimaryButton>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
