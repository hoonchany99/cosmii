"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ChevronLeft, BookMarked } from "lucide-react";

const serif = "font-[family-name:var(--font-serif)]";

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
  bookColor?: string;
  bookCoverUrl?: string | null;
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
  bookColor,
  bookCoverUrl,
  completedCount,
  totalCount,
  lessons,
  onBack,
  onSelectLesson,
  onOpenNotes,
}: LessonConstellationProps) {
  const points = useMemo(() => {
    return lessons.map((_, i) => ({
      x: Math.sin(i * 0.8) * 55,
      y: i * 95,
    }));
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
  const [scrollY, setScrollY] = useState(0);
  const [frameW, setFrameW] = useState(typeof window !== "undefined" ? window.innerWidth : 430);
  const [frameH, setFrameH] = useState(typeof window !== "undefined" ? window.innerHeight : 800);

  const coverSrc = bookCoverUrl || `/covers/${bookId}.jpg`;
  const [coverLoaded, setCoverLoaded] = useState(false);
  const accentColor = bookColor || "#6366f1";

  const heroH = frameH * 0.88;

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollY(scrollRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setFrameW(el.clientWidth);
      setFrameH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollRef.current || lessons.length === 0) return;
    const el = scrollRef.current;

    const currentIdx = lessons.findIndex((l) => l.isCurrent);
    const targetIdx = currentIdx >= 0 ? currentIdx : lessons.length - 1;
    const nodeApproxY = targetIdx * 150;
    const scrollTarget = heroH + nodeApproxY - frameH / 2 + 28;

    const timer = setTimeout(() => {
      el.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
    }, 800);

    return () => clearTimeout(timer);
  }, [lessons.length, heroH, frameH]);

  const blurProgress = Math.min(1, Math.max(0, scrollY) / heroH);
  const headerOpacity = Math.min(1, Math.max(0, (scrollY - heroH * 0.65) / 120));

  const coverW = frameW * 0.48;
  const coverH = coverW * 1.5;

  return (
    <div className="w-full h-full relative overflow-hidden text-white bg-[#060612]">
      {/* Fixed book cover background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {coverLoaded ? (
          <>
            <img
              src={coverSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: 0.75 + blurProgress * 0.25,
                backdropFilter: `blur(${24}px)`,
                WebkitBackdropFilter: `blur(${24}px)`,
              }}
            >
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-[24px] scale-110"
              />
            </div>
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${accentColor}60 0%, #060612 60%, #060612 100%)`,
            }}
          />
        )}
        <div
          className="absolute inset-0 bg-[#060612] transition-opacity duration-200"
          style={{ opacity: 0.55 + blurProgress * 0.25 }}
        />
      </div>

      {/* Hidden img to detect cover load */}
      <img
        src={coverSrc}
        alt=""
        className="hidden"
        onLoad={() => setCoverLoaded(true)}
        onError={() => setCoverLoaded(false)}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-5 pb-2 flex items-center justify-between overflow-hidden"
           style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}>
        {/* Header background fade in */}
        <div
          className="absolute inset-0 overflow-hidden transition-opacity duration-200"
          style={{ opacity: headerOpacity }}
        >
          {coverLoaded ? (
            <>
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-[25px] scale-110"
              />
              <div className="absolute inset-0 bg-[rgba(6,6,18,0.6)]" />
            </>
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: `${accentColor}30` }} />
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onBack}
          aria-label="Back"
          className="relative z-10 text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl"
        >
          <ChevronLeft size={22} />
        </motion.button>

        <div
          className="relative z-10 flex flex-col items-center gap-0.5 flex-1 transition-opacity duration-200"
          style={{ opacity: headerOpacity }}
        >
          <h2 className={`${serif} text-white/90 font-bold text-[20px] tracking-wide truncate max-w-[200px]`}>{bookTitle}</h2>
          {bookAuthor && <p className="text-white/35 text-[13px] -mt-0.5">{bookAuthor}</p>}
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className={`${serif} text-white/40 text-[13px] font-medium`}>{completedCount}/{totalCount}</span>
          </div>
        </div>

        {onOpenNotes ? (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onOpenNotes}
            aria-label="Notes"
            className="relative z-10 text-white/50 hover:text-white/80 p-3 rounded-xl transition-colors"
          >
            <BookMarked size={19} />
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto z-10"
        style={{ paddingBottom: 160 }}
      >
        {/* Hero section */}
        <div
          className="flex flex-col items-center justify-center text-center px-6"
          style={{ height: heroH, paddingTop: "calc(env(safe-area-inset-top, 0px) + 32px)" }}
        >
          {coverLoaded ? (
            <div className="rounded-lg overflow-hidden shadow-2xl" style={{ width: coverW, height: coverH }}>
              <img
                src={coverSrc}
                alt={bookTitle}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="rounded-lg border flex items-center justify-center"
              style={{
                width: coverW,
                height: coverH,
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
              }}
            >
              <span className={`${serif} text-[48px] opacity-60`} style={{ color: accentColor }}>
                {bookTitle.charAt(0)}
              </span>
            </div>
          )}
          <h2 className={`${serif} text-white text-[26px] tracking-wide mt-6 px-4 line-clamp-2`}>{bookTitle}</h2>
          {bookAuthor && <p className={`${serif} text-white/50 text-[15px] mt-1.5`}>{bookAuthor}</p>}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-28 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className={`${serif} text-white/45 text-[13px] tabular-nums`}>{completedCount}/{totalCount}</span>
          </div>
        </div>

        {/* Lesson nodes */}
        <div className="flex flex-col items-center gap-[55px]">
          {lessons.map((lesson, i) => {
            const offsetX = points[i]?.x ?? 0;
            const chapterLabel = chapters.get(i);

            return (
              <motion.div
                key={lesson.id}
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
                      onClick={() => onSelectLesson(lesson.id)}
                      className="relative w-[56px] h-[56px] rounded-full flex items-center justify-center z-10 select-none"
                    >
                      <motion.span
                        className="absolute inset-0 rounded-full bg-white"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.05, 0.18] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <span className="w-12 h-12 rounded-full border-[1.5px] border-white/70 bg-white/[0.08] flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </span>
                    </motion.button>
                    <span className={`${serif} text-white/90 text-[14px] font-semibold max-w-[220px] text-center leading-snug line-clamp-2`}>
                      {lesson.title}
                    </span>
                  </>
                ) : lesson.completed ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-[52px] h-[52px] rounded-full border-2 flex items-center justify-center hover:bg-white/[0.10] transition-colors select-none"
                      style={{ borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                      <Check size={22} className="text-white/60" strokeWidth={3} />
                    </motion.button>
                    <span className={`${serif} text-white/50 text-[13px] font-semibold max-w-[220px] text-center leading-snug line-clamp-2`}>
                      {lesson.title}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.10] flex items-center justify-center">
                      <Lock size={14} className="text-white/20" />
                    </div>
                    <span className={`${serif} text-white/35 text-[12px] max-w-[200px] text-center leading-snug line-clamp-2`}>
                      {lesson.title}
                    </span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="h-40" />
      </div>
    </div>
  );
}
