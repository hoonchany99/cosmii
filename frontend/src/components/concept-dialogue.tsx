"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronUp, Send, X } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useIsMobile } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  onAskQuestion: () => void;
}

function HighlightPill({ keyword }: { keyword: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
      {keyword}
    </span>
  );
}

function splitIntoBubbles(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
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
  onAskQuestion,
}: ConceptDialogueProps) {
  const mobile = useIsMobile();
  const t = useT();
  const language = useSettingsStore((s) => s.language);
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
  const isLast = currentIndex >= splitDialogue.length - 1;
  const current = splitDialogue[currentIndex];

  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [sheetMessages, setSheetMessages] = useState<{ role: "user" | "cosmii"; bubbles: string[] }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [visibleBubbleIdx, setVisibleBubbleIdx] = useState(0);
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const answerBottomRef = useRef<HTMLDivElement>(null);
  const dialogueScrollRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const [kbHeight, setKbHeight] = useState(0);

  const dialoguePct = useMemo(
    () => Math.round(((currentIndex + 1) / Math.max(splitDialogue.length, 1)) * 100),
    [currentIndex, splitDialogue.length],
  );

  const totalBubbles = useMemo(
    () => sheetMessages.reduce((sum, m) => sum + m.bubbles.length, 0),
    [sheetMessages],
  );

  useEffect(() => {
    if (questionOpen) {
      setTimeout(() => answerBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 350);
    }
  }, [questionOpen]);

  useEffect(() => {
    answerBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleBubbleIdx, sheetMessages]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      if (dialogueScrollRef.current) {
        dialogueScrollRef.current.scrollTo({
          top: dialogueScrollRef.current.scrollHeight,
          behavior,
        });
      }
    }, 80);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentIndex, scrollToBottom]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbHeight(kb);
      if (kb > 0) scrollToBottom();
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [scrollToBottom]);

  useEffect(() => {
    if (totalBubbles > 0 && visibleBubbleIdx < totalBubbles) {
      const timer = setTimeout(() => setVisibleBubbleIdx((p) => p + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalBubbles, visibleBubbleIdx]);

  const handleTap = useCallback(() => {
    if (questionOpen || showChapterIntro) return;
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast, onComplete, questionOpen, showChapterIntro]);

  const askQuestion = useCallback(async (question: string) => {
    setSheetMessages((prev) => [...prev, { role: "user", bubbles: [question] }]);
    setVisibleBubbleIdx((prev) => prev + 1);
    setIsAnswering(true);

    chatHistoryRef.current.push({ role: "user", content: question });

    try {
      const lessonContext = dialogue
        .slice(0, currentIndex + 1)
        .map((d) => d.text)
        .join(" ")
        .slice(0, 500);

      const res = await fetch(`${API}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          book_id: bookId,
          lesson_context: lessonContext,
          history: chatHistoryRef.current.slice(-6),
          language,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) fullAnswer += data.token;
            } catch {}
          }
        }
      }

      if (fullAnswer) {
        chatHistoryRef.current.push({ role: "assistant", content: fullAnswer });
        const bubbles = splitIntoBubbles(fullAnswer);
        setSheetMessages((prev) => [...prev, { role: "cosmii", bubbles: bubbles.length > 0 ? bubbles : [fullAnswer] }]);
      }
    } catch {
      setSheetMessages((prev) => [...prev, { role: "cosmii", bubbles: [t("dialogue.errorAnswer")] }]);
    } finally {
      setIsAnswering(false);
    }
  }, [bookId, dialogue, currentIndex]);

  const handleAskInline = useCallback(async () => {
    const q = questionInput.trim();
    if (!q || isAnswering) return;

    setQuestionInput("");
    setQuestionOpen(true);

    await askQuestion(q);
  }, [questionInput, isAnswering, askQuestion]);

  const handleSheetAsk = useCallback(async () => {
    const q = sheetInput.trim();
    if (!q || isAnswering) return;

    setSheetInput("");
    await askQuestion(q);
  }, [sheetInput, isAnswering, askQuestion]);

  const handleCloseAnswer = useCallback(() => {
    setQuestionOpen(false);
  }, []);


  const renderText = (text: string, highlight?: string | null) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && <span className="text-indigo-300 font-bold">{highlight}</span>}
      </span>
    ));
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden text-white"
      onClick={!questionOpen ? handleTap : undefined}
      style={{ cursor: questionOpen ? "default" : "pointer" }}
    >
      <CosmicBg accent="indigo" />

      {/* Chapter intro overlay */}
      <AnimatePresence>
        {showChapterIntro && chapter && (
          <motion.div
            key="chapter-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 0.35, letterSpacing: "0.3em" }}
              exit={{ opacity: 0, letterSpacing: "0.5em" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-white text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              Chapter
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
              className={`${serif} text-white text-[72px] font-bold leading-none mt-1`}
            >
              {parseChapterNumber(chapter) || ""}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.3, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
              className={`${serif} text-white/40 text-[16px] font-medium tracking-wider mt-3`}
            >
              {chapter}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-14 pb-3 px-5 flex items-center justify-between bg-[rgba(5,5,16,0.4)] backdrop-blur-xl border-b border-white/[0.04]">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/40 text-[11px] font-medium max-w-[220px] text-center truncate">
            {[chapter, bookTitle].filter(Boolean).join(" · ") || `${t("dialogue.explore")} ${currentLesson}/${totalLessons}`}
          </span>
          <h2 className={`${serif} text-white/80 font-semibold text-[15px] tracking-wide max-w-[200px] text-center truncate`}>{lessonTitle}</h2>
        </div>
        <div className="w-8" />
      </div>

      {/* Progress bar */}
      <div className="absolute top-[108px] w-[calc(100%-40px)] left-5 h-[3px] bg-white/[0.08] rounded-full overflow-hidden z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
          initial={false}
          animate={{ width: `${dialoguePct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Chat-style dialogue area */}
      <div
        ref={dialogueScrollRef}
        className="absolute inset-0 z-10 overflow-y-auto"
        style={{ paddingTop: "120px", paddingBottom: `${160 + kbHeight}px` }}
      >
        <div className="flex flex-col gap-4 px-5" style={{ minHeight: "100%" }}>
          <div className="flex-1 shrink-0" />
          {splitDialogue.slice(0, currentIndex + 1).map((part, i) => {
            const isCurrent = i === currentIndex;
            return (
              <motion.div
                key={i}
                ref={isCurrent ? lastMsgRef : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: isCurrent ? 1 : 0.3 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                    style={{ opacity: isCurrent ? 1 : 0, visibility: isCurrent ? "visible" : "hidden" }}
                  >
                    <img
                      src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"}
                      alt=""
                      className="w-20 h-20 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                      draggable={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="rounded-2xl rounded-tl-md px-5 py-4"
                      style={{
                        backgroundColor: isCurrent ? "rgba(255,255,255,0.05)" : "transparent",
                        border: `1px solid ${isCurrent ? "rgba(255,255,255,0.10)" : "transparent"}`,
                        boxShadow: isCurrent ? "0 8px 32px rgba(0,0,0,0.25)" : "none",
                      }}
                    >
                      <p
                        className="text-[15px] leading-[1.7] font-medium text-left"
                        style={{ color: isCurrent ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.45)" }}
                      >
                        {renderText(part.text, part.highlight)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Tap indicator */}
          {!questionOpen && (
            <motion.div
              className="flex flex-col items-center mt-4 gap-1"
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronUp size={18} className="text-white/30" />
              </motion.div>
              <span className="text-white/25 text-[11px] tracking-[0.2em] uppercase">
                {isLast ? t("dialogue.tapFinish") : t("dialogue.tapContinue")}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom question input bar */}
      <div
        className="absolute left-0 right-0 z-30 px-5 pb-8 transition-[bottom] duration-200"
        style={{ bottom: kbHeight }}
      >
        <div
          className="relative w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskInline()}
            onPointerDown={(e) => {
              if (sheetMessages.length > 0) {
                e.preventDefault();
                setQuestionOpen(true);
                setTimeout(() => sheetInputRef.current?.focus(), 400);
              }
            }}
            placeholder={t("dialogue.askPlaceholder")}
            className="w-full h-12 bg-white/[0.07] border border-white/[0.15] rounded-full pl-5 pr-12 text-white text-[14px] placeholder-white/25 backdrop-blur-xl outline-none focus:border-indigo-400/50 focus:bg-white/[0.10] transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onClick={handleAskInline}
            disabled={!questionInput.trim() || isAnswering}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-500/25 hover:bg-indigo-500/45 rounded-full flex items-center justify-center transition-colors disabled:opacity-25 active:bg-indigo-500/60"
          >
            <Send size={16} className="text-indigo-300 ml-0.5" />
          </motion.button>
        </div>
      </div>

      {/* Answer bottom sheet overlay */}
      <AnimatePresence>
        {questionOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-35"
              onClick={!isAnswering ? handleCloseAnswer : undefined}
              style={{ zIndex: 35 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-[#0a0a1a]/95 border-t border-white/[0.10] backdrop-blur-2xl rounded-t-3xl overflow-hidden flex flex-col"
              style={{ zIndex: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 flex items-center justify-center">
                    <img src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"} alt="" className="w-11 h-11 object-contain drop-shadow-[0_0_6px_rgba(139,92,246,0.3)]" draggable={false} />
                  </div>
                  <span className="text-white/80 text-[17px] font-bold">Cosmii</span>
                </div>
                {!isAnswering && (
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    onClick={handleCloseAnswer}
                    className="text-white/40 hover:text-white/80 p-2 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.10] transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {(() => {
                  let globalIdx = 0;
                  return sheetMessages.map((msg, mi) =>
                    msg.bubbles.map((bubble, bi) => {
                      const idx = globalIdx++;
                      const show = idx < visibleBubbleIdx;
                      if (!show) return null;
                      const isUser = msg.role === "user";
                      return (
                        <motion.div
                          key={`${mi}-${bi}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className={isUser
                            ? "self-end bg-indigo-500/25 border border-indigo-400/25 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]"
                            : "bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3 max-w-[90%]"
                          }
                        >
                          <p className={`text-[14px] leading-[1.7] font-medium ${isUser ? "text-white/90" : "text-white/85"}`}>{bubble}</p>
                        </motion.div>
                      );
                    })
                  );
                })()}

                {isAnswering && (
                  <div className="flex gap-1.5 py-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-indigo-400/60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}

                {!isAnswering && visibleBubbleIdx < totalBubbles && (
                  <div className="flex gap-1.5 py-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/20"
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                )}

                <div ref={answerBottomRef} />
              </div>

              {/* Bottom: input + back to lesson */}
              <div className="px-5 pb-8 pt-3 border-t border-white/[0.06] flex flex-col gap-3">
                <div className="relative w-full">
                  <input
                    ref={sheetInputRef}
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSheetAsk()}
                    placeholder={t("dialogue.sheetPlaceholder")}
                    disabled={isAnswering}
                    className="w-full h-11 bg-white/[0.07] border border-white/[0.12] rounded-full pl-5 pr-11 text-white text-[14px] placeholder-white/25 backdrop-blur-xl outline-none focus:border-indigo-400/50 focus:bg-white/[0.10] transition-all disabled:opacity-40"
                  />
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    onClick={handleSheetAsk}
                    disabled={!sheetInput.trim() || isAnswering}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500/25 hover:bg-indigo-500/45 rounded-full flex items-center justify-center transition-colors disabled:opacity-25 active:bg-indigo-500/60"
                  >
                    <Send size={15} className="text-indigo-300 ml-0.5" />
                  </motion.button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  onClick={handleCloseAnswer}
                  disabled={isAnswering}
                  className="text-white/35 hover:text-white/60 text-[13px] font-semibold mx-auto transition-colors disabled:opacity-30 active:text-white/90"
                >
                  {t("dialogue.backToExplore")}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
