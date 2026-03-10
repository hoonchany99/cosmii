"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Lock, RotateCcw, ChevronLeft, Star, Circle, BookMarked } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";

const serif = "font-[var(--font-serif)]";

interface LessonNode {
  id: string;
  title: string;
  chapter?: string;
  orderIndex: number;
  completed: boolean;
  isCurrent: boolean;
  reviewNeeded: boolean;
  locked: boolean;
}

interface LessonConstellationProps {
  bookTitle: string;
  bookAuthor?: string;
  completedCount: number;
  totalCount: number;
  lessons: LessonNode[];
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
  onOpenNotes?: () => void;
}


function ChapterDivider({ chapter }: { chapter: string }) {
  return (
    <div className="flex items-center gap-3 w-[260px] my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
      <span className={`${serif} text-indigo-300/60 text-[11px] tracking-wider uppercase whitespace-nowrap`}>{chapter}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  );
}

export function LessonConstellation({
  bookTitle,
  bookAuthor,
  completedCount,
  totalCount,
  lessons,
  onBack,
  onSelectLesson,
  onOpenNotes,
}: LessonConstellationProps) {
  const points = useMemo(() => {
    return lessons.map((_, i) => {
      const x = Math.sin(i * 0.8) * 55;
      const y = i * 95;
      return { x, y };
    });
  }, [lessons.length]);

  const chapters = useMemo(() => {
    const map = new Map<number, string>();
    let lastCh = "";
    lessons.forEach((l, i) => {
      if (l.chapter && l.chapter !== lastCh) {
        map.set(i, l.chapter);
        lastCh = l.chapter;
      }
    });
    return map;
  }, [lessons]);

  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="indigo" />

      <div className="absolute top-14 w-full px-6 flex items-center justify-between z-20">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="flex flex-col items-center gap-1">
          <h2 className={`${serif} text-white/90 font-bold text-[18px] tracking-wide`}>{bookTitle}</h2>
          {bookAuthor && <p className="text-white/35 text-[11px] -mt-0.5">{bookAuthor}</p>}
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-white/40 text-[11px] font-medium">{completedCount}/{totalCount}</span>
          </div>
        </div>
        {onOpenNotes ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onClick={onOpenNotes}
            className="text-white/50 hover:text-white/80 p-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10] transition-colors"
          >
            <BookMarked size={19} />
          </motion.button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div
        className="absolute inset-0 overflow-y-auto pb-40 flex flex-col items-center z-10"
        style={{ paddingTop: "140px" }}
      >
        <div className="flex flex-col items-center gap-[55px]">
          {lessons.map((lesson, i) => {
            const offsetX = points[i]?.x ?? 0;
            const chapterLabel = chapters.get(i);

            return (
              <motion.div
                key={lesson.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center gap-3"
                style={{ marginLeft: `${offsetX}px` }}
              >
                {chapterLabel && <ChapterDivider chapter={chapterLabel} />}

                {lesson.isCurrent ? (
                  <>
                    <div className="absolute -inset-3 bg-amber-500/20 rounded-full animate-pulse blur-xl" />
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-[3px] border-amber-300/70 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.45)] z-10 relative select-none"
                    >
                      <Star size={26} className="text-white fill-white drop-shadow-md" />
                    </motion.button>
                    <span className="text-amber-200/70 text-[11px] font-medium max-w-[180px] text-center leading-snug line-clamp-2">
                      {lesson.title}
                    </span>
                  </>
                ) : lesson.completed && !lesson.reviewNeeded ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-12 h-12 rounded-full bg-emerald-500/15 border-2 border-emerald-400/50 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.2)] hover:bg-emerald-500/25 transition-colors select-none"
                    >
                      <Check size={20} className="text-emerald-400" strokeWidth={3} />
                    </motion.button>
                    <span className="text-emerald-300/40 text-[11px] font-medium max-w-[180px] text-center leading-snug line-clamp-2">
                      {lesson.title}
                    </span>
                  </>
                ) : lesson.reviewNeeded ? (
                  <>
                    <div className="absolute -inset-2 rounded-full border border-violet-400/30 border-dashed animate-[spin_8s_linear_infinite]" />
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-12 h-12 rounded-full bg-violet-500/12 border-2 border-violet-400/40 flex items-center justify-center hover:bg-violet-500/20 transition-colors select-none"
                    >
                      <RotateCcw size={16} className="text-violet-400" />
                    </motion.button>
                  </>
                ) : lesson.locked ? (
                  <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                    <Lock size={13} className="text-white/15" />
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    onClick={() => onSelectLesson(lesson.id)}
                    className="w-11 h-11 rounded-full bg-white/[0.04] border-2 border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/[0.08] transition-all select-none"
                  >
                    <Circle size={14} className="text-white/25" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
