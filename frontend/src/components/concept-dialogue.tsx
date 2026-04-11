"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronUp } from "lucide-react";
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

interface DialoguePart {
  speaker: string;
  text: string;
  highlight?: string | null;
}

interface ConceptDialogueProps {
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  chapter?: string;
  lessonTitle: string;
  currentLesson: number;
  totalLessons: number;
  progressPercent: number;
  dialogue: DialoguePart[];
  spark: string;
  isFirstInChapter?: boolean;
  onBack: () => void;
  onComplete: () => void;
}

function parseChapterNumber(chapter: string | undefined): string {
  if (!chapter) return "";
  const m = chapter.match(/(?:Ch\.?\s*|(\d+)장\s*)(\d+)?/i);
  if (m) return m[2] || m[1] || "";
  return "";
}

export function ConceptDialogue({
  bookId,
  bookTitle,
  bookAuthor,
  chapter,
  lessonTitle,
  currentLesson,
  totalLessons,
  progressPercent,
  dialogue,
  spark,
  isFirstInChapter,
  onBack,
  onComplete,
}: ConceptDialogueProps) {
  const t = useT();
  const [showChapterIntro, setShowChapterIntro] = useState(!!isFirstInChapter);

  useEffect(() => {
    if (showChapterIntro) {
      const timer = setTimeout(() => setShowChapterIntro(false), 2600);
      return () => clearTimeout(timer);
    }
  }, [showChapterIntro]);

  const splitDialogue = useMemo(() => {
    const result: DialoguePart[] = [];
    for (const part of dialogue) {
      const placeholder: string[] = [];
      const protected_ = part.text.replace(/[「'"\u201C\u300A](?:[^」'\u201D\u300B"]*)[」'\u201D\u300B"]/g, (m) => {
        placeholder.push(m);
        return `\x00${placeholder.length - 1}\x00`;
      });

      const raw = protected_.split(/(?<=[.!?~…])\s*/).filter(Boolean);
      const sentences = raw.map(s =>
        s.replace(/\x00(\d+)\x00/g, (_, idx) => placeholder[Number(idx)])
      );

      let buf = "";
      for (const s of sentences) {
        const next = buf ? buf + " " + s : s;
        if (buf && next.length > 100) {
          result.push({ ...part, text: buf });
          buf = s;
        } else {
          buf = next;
        }
      }
      if (buf) result.push({ ...part, text: buf });
    }
    return result;
  }, [dialogue]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isLast = currentIndex >= splitDialogue.length - 1;

  const dialogueScrollRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndexRef = useRef(0);

  const dialoguePct = useMemo(
    () => Math.round(((currentIndex + 1) / Math.max(splitDialogue.length, 1)) * 100),
    [currentIndex, splitDialogue.length],
  );

  const scrollToCenter = useCallback((index: number) => {
    setTimeout(() => {
      bubbleRefs.current[index]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    setFocusedIndex(currentIndex);
    scrollToCenter(currentIndex);
  }, [currentIndex, scrollToCenter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      bubbleRefs.current[0]?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = dialogueScrollRef.current;
    if (!container) return;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        let closest = currentIndexRef.current;
        let minDist = Infinity;
        const limit = currentIndexRef.current;
        for (let i = 0; i <= limit; i++) {
          const el = bubbleRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const dist = Math.abs(r.top + r.height / 2 - centerY);
          if (dist < minDist) { minDist = dist; closest = i; }
        }
        setFocusedIndex(closest);
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => { container.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  const handleTap = useCallback(() => {
    if (showChapterIntro) return;
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast, onComplete, showChapterIntro]);

  const renderText = (text: string, highlight?: string | null) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && <span className="text-white/95 font-bold">{highlight}</span>}
      </span>
    ));
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden text-white bg-[#060612]"
      onClick={handleTap}
      style={{ cursor: "pointer" }}
    >
      {/* Chapter intro overlay */}
      <AnimatePresence>
        {showChapterIntro && chapter && (
          <motion.div
            key="chapter-intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "#060612" }}
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 0.4, letterSpacing: "0.3em" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-white text-[12px] font-bold uppercase tracking-[0.3em]"
            >
              Chapter
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
              className={`${serif} text-white text-[72px] font-bold leading-none mt-1`}
            >
              {parseChapterNumber(chapter) || ""}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.35, y: 0 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
              className={`${serif} text-white/40 text-[17px] font-medium tracking-wider mt-3`}
            >
              {chapter}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header + Progress line */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-[rgba(6,6,18,0.6)]">
        <div className="pt-safe pb-3 px-5 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            aria-label="Back"
            className="text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/40 text-[12px] font-medium max-w-[220px] text-center truncate">
              {[chapter, bookTitle].filter(Boolean).join(" · ") || `${t("dialogue.explore")} ${currentLesson}/${totalLessons}`}
            </span>
            <h2 className={`${serif} text-white/80 font-semibold text-[16px] tracking-wide max-w-[200px] text-center truncate`}>{lessonTitle}</h2>
          </div>
          <div className="w-10" />
        </div>
        <div className="w-full h-[1px] bg-white/[0.06]">
          <motion.div
            className="h-full bg-white/40"
            initial={false}
            animate={{ width: `${dialoguePct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Centered dialogue area */}
      <div
        ref={dialogueScrollRef}
        className="absolute inset-0 z-10 overflow-y-auto"
        style={{
          paddingTop: "124px",
          paddingBottom: "160px",
          scrollSnapType: "y proximity",
          scrollPaddingTop: "124px",
          scrollPaddingBottom: "160px",
        }}
      >
        <div
          className="flex flex-col gap-4 px-5"
          style={{ paddingTop: "40vh", paddingBottom: "40vh" }}
        >
          {splitDialogue.slice(0, currentIndex + 1).map((part, i) => {
            const dist = Math.abs(i - focusedIndex);
            const bubbleOpacity = Math.max(0.12, 1 - dist * 0.3);
            const bgAlpha = dist === 0 ? 0.12 : Math.max(0.04, 0.08 - dist * 0.02);
            const borderAlpha = dist === 0 ? 0.18 : Math.max(0.04, 0.10 - dist * 0.03);

            return (
              <motion.div
                key={i}
                ref={(el) => { bubbleRefs.current[i] = el; }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: bubbleOpacity, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ scrollSnapAlign: "center" }}
                className={dist > 0 ? "cursor-pointer" : ""}
                onClick={dist > 0 ? (e) => {
                  e.stopPropagation();
                  bubbleRefs.current[i]?.scrollIntoView({ block: "center", behavior: "smooth" });
                } : undefined}
              >
                <motion.div
                  className="w-fit max-w-full rounded-2xl px-5 py-4"
                  animate={{
                    backgroundColor: `rgba(255,255,255,${bgAlpha})`,
                    borderColor: `rgba(255,255,255,${borderAlpha})`,
                    boxShadow: dist === 0 ? "0 8px 32px rgba(0,0,0,0.25)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ border: "1px solid transparent" }}
                >
                  <p className="text-[15px] leading-[1.7] font-medium text-left text-white/90">
                    {renderText(part.text, part.highlight)}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tap indicator */}
      <div
        className="absolute left-0 right-0 flex flex-col items-center gap-1 pointer-events-none"
        style={{ bottom: "60px", zIndex: 15 }}
      >
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1"
        >
          <ChevronUp size={16} className="text-white/25" />
          <span className="text-white/20 text-[11px] tracking-[0.2em] uppercase">
            {isLast ? t("dialogue.tapFinish") : t("dialogue.tapContinue")}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
