"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, RotateCcw, ChevronLeft, BookMarked } from "lucide-react";
import { getBookConstellation } from "@/lib/book-constellations";

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
  bookId: string;
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
  const fontSize = chapter.length > 20 ? 11 : chapter.length > 12 ? 12 : 14;
  return (
    <div className="flex items-center gap-3 w-[280px] my-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.20] to-transparent" />
      <span
        className={`${serif} text-white/55 font-semibold tracking-wider uppercase text-center whitespace-nowrap`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {chapter}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.20] to-transparent" />
    </div>
  );
}

export function LessonConstellation({
  bookId,
  bookTitle,
  bookAuthor,
  completedCount,
  totalCount,
  lessons,
  onBack,
  onSelectLesson,
  onOpenNotes,
}: LessonConstellationProps) {
  const bookConst = useMemo(() => getBookConstellation(bookId), [bookId]);
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRef.current || !scrollRef.current) return;
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 500);
    return () => clearTimeout(timer);
  }, [lessons]);

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      {/* background provided by parent */}

      <div className="absolute top-0 left-0 right-0 z-20 pt-safe pb-2 px-5 flex items-center justify-between bg-[rgba(6,6,18,0.75)] border-b border-white/[0.04]">
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onBack}
          aria-label="Back"
          className="text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="flex flex-col items-center gap-0.5">
          <h2 className={`${serif} text-white/90 font-bold text-[20px] tracking-wide`}>{bookTitle}</h2>
          {bookAuthor && <p className="text-white/35 text-[13px] -mt-0.5">{bookAuthor}</p>}
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/50 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-white/40 text-[13px] font-medium">{completedCount}/{totalCount}</span>
          </div>
        </div>
        {onOpenNotes ? (
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={onOpenNotes}
            aria-label="Notes"
            className="text-white/50 hover:text-white/80 p-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10] transition-colors"
          >
            <BookMarked size={19} />
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div
        ref={scrollRef}
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
                ref={lesson.isCurrent ? currentRef : undefined}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.025, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col items-center gap-3"
                style={{ marginLeft: `${offsetX}px` }}
              >
                {chapterLabel && (
                  <div style={{ marginLeft: `${-offsetX}px` }}>
                    <ChapterDivider chapter={chapterLabel} />
                  </div>
                )}

                {lesson.isCurrent ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="relative w-[56px] h-[56px] rounded-full bg-white/[0.08] border-2 border-white/30 flex items-center justify-center z-10 select-none"
                    >
                      <span className="w-[14px] h-[14px] rounded-full bg-white/90" />
                      <motion.span
                        className="absolute inset-0 rounded-full border border-white/10"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.button>
                    <span className={`${serif} text-white/80 text-[14px] font-bold max-w-[220px] text-center leading-snug line-clamp-2`}>
                      {lesson.title}
                    </span>
                  </>
                ) : lesson.completed && !lesson.reviewNeeded ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-13 h-13 rounded-full bg-white/[0.06] border-2 border-white/[0.20] flex items-center justify-center hover:bg-white/[0.10] transition-colors select-none"
                    >
                      <Check size={22} className="text-white/70" strokeWidth={3} />
                    </motion.button>
                    <span className="text-white/50 text-[13px] font-semibold max-w-[220px] text-center leading-snug line-clamp-2">
                      {lesson.title}
                    </span>
                  </>
                ) : lesson.reviewNeeded ? (
                  <>
                    <div className="absolute -inset-2 rounded-full border border-white/[0.10] border-dashed animate-[spin_8s_linear_infinite]" />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-13 h-13 rounded-full bg-white/[0.04] border-2 border-white/[0.15] flex items-center justify-center hover:bg-white/[0.08] transition-colors select-none"
                    >
                      <RotateCcw size={18} className="text-white/40" />
                    </motion.button>
                  </>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center">
                    <Lock size={14} className="text-white/30" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
