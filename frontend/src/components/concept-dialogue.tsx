"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

interface DialoguePart {
  speaker: string;
  text: string;
  highlight?: string | null;
}

interface ConceptDialogueProps {
  lessonTitle: string;
  currentLesson: number;
  totalLessons: number;
  progressPercent: number;
  dialogue: DialoguePart[];
  spark: string;
  onBack: () => void;
  onComplete: () => void;
  onAskQuestion: () => void;
}

export function ConceptDialogue({
  lessonTitle,
  currentLesson,
  totalLessons,
  progressPercent,
  dialogue,
  spark,
  onBack,
  onComplete,
  onAskQuestion,
}: ConceptDialogueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex >= dialogue.length - 1;
  const current = dialogue[currentIndex];

  const handleTap = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [isLast, onComplete]);

  const renderText = (text: string, highlight?: string | null) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span className="text-indigo-400 font-bold">{highlight}</span>
        )}
      </span>
    ));
  };

  return (
    <div
      className="w-full h-full bg-[#050510] relative overflow-hidden text-white cursor-pointer"
      onClick={handleTap}
    >
      {/* Header */}
      <div className="absolute top-12 w-full px-6 flex items-center justify-between z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-white/80 font-semibold text-lg">레슨 {currentLesson}/{totalLessons}</h2>
        <button
          onClick={(e) => { e.stopPropagation(); onAskQuestion(); }}
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-24 w-[calc(100%-48px)] left-6 h-1.5 bg-white/10 rounded-full overflow-hidden z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 pt-12">
        {/* Cosmii mascot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <img
            src="/cosmii/talking.webp"
            alt="Cosmii"
            className="w-[100px] h-auto drop-shadow-[0_0_30px_rgba(45,212,191,0.3)]"
            draggable={false}
          />
        </motion.div>

        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassPanel className="p-6 w-full text-center relative shadow-2xl max-w-[340px]">
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white/10" />
              <p className="text-white/90 text-lg leading-relaxed font-medium">
                {current ? renderText(current.text, current.highlight) : spark}
              </p>
            </GlassPanel>
          </motion.div>
        </AnimatePresence>

        {/* Tap indicator */}
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-white/30 text-sm tracking-widest uppercase"
        >
          {isLast ? "tap to continue" : "tap to continue"}
        </motion.p>

        {/* Dialogue progress dots */}
        <div className="flex gap-1.5 mt-4">
          {dialogue.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i <= currentIndex ? "bg-indigo-400" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
