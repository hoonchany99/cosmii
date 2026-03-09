"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Lock, RotateCcw, ChevronLeft, Star } from "lucide-react";

interface LessonNode {
  id: string;
  title: string;
  orderIndex: number;
  completed: boolean;
  isCurrent: boolean;
  reviewNeeded: boolean;
  locked: boolean;
}

interface LessonConstellationProps {
  bookTitle: string;
  completedCount: number;
  totalCount: number;
  lessons: LessonNode[];
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonConstellation({
  bookTitle,
  completedCount,
  totalCount,
  lessons,
  onBack,
  onSelectLesson,
}: LessonConstellationProps) {
  const pathD = useMemo(() => {
    if (lessons.length < 2) return "";
    const points = lessons.map((_, i) => {
      const x = 187.5 + Math.sin(i * 0.8) * 60;
      const y = 150 + i * 90;
      return { x, y };
    });
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2 + (Math.sin(i) * 40);
      d += ` Q ${cx} ${(prev.y + curr.y) / 2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [lessons]);

  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden text-white">
      {/* Header */}
      <div className="absolute top-12 w-full px-6 flex items-center justify-between z-20 backdrop-blur-sm pb-4">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-white font-semibold text-lg">{bookTitle}</h2>
          <span className="text-white/50 text-xs">{completedCount}/{totalCount} 완료</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Path lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        <path d={pathD} stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
      </svg>

      {/* Lesson nodes */}
      <div
        className="absolute inset-0 pt-24 overflow-y-auto pb-32 flex flex-col items-center z-10"
        style={{ paddingTop: "150px" }}
      >
        <div className="flex flex-col items-center gap-[50px]">
          {lessons.map((lesson, i) => {
            const offsetX = Math.sin(i * 0.8) * 60;

            if (lesson.locked) {
              return (
                <div key={lesson.id} className="relative" style={{ marginLeft: `${offsetX}px` }}>
                  <div className="w-12 h-12 rounded-full bg-white/5 border-2 border-white/[0.15] flex items-center justify-center">
                    <Lock size={16} className="text-white/30" />
                  </div>
                </div>
              );
            }

            if (lesson.isCurrent) {
              return (
                <div key={lesson.id} className="relative" style={{ marginLeft: `${offsetX}px` }}>
                  <div className="absolute -inset-1 bg-amber-500/30 rounded-full animate-pulse blur-md" />
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    className="w-16 h-16 rounded-full bg-amber-500 border-2 border-amber-300 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] z-10 relative"
                  >
                    <Star size={24} className="text-white fill-white" />
                  </button>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+16px)] whitespace-nowrap bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-white font-semibold text-sm">{lesson.title}</span>
                    <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-0 h-0 border-r-[6px] border-r-white/20 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent" />
                  </div>
                </div>
              );
            }

            if (lesson.reviewNeeded) {
              return (
                <div key={lesson.id} className="relative" style={{ marginLeft: `${offsetX}px` }}>
                  <div className="absolute -inset-2 rounded-full border-2 border-indigo-500/50 border-dashed animate-[spin_8s_linear_infinite]" />
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <RotateCcw size={16} className="text-emerald-400" />
                  </button>
                </div>
              );
            }

            return (
              <div key={lesson.id} className="relative" style={{ marginLeft: `${offsetX}px` }}>
                <button
                  onClick={() => onSelectLesson(lesson.id)}
                  className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Check size={20} className="text-emerald-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
