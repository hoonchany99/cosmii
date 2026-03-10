"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronUp, Send, X } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useIsMobile } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store";

const serif = "font-[var(--font-serif)]";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DialoguePart {
  speaker: string;
  text: string;
  highlight?: string | null;
}

interface ConceptDialogueProps {
  bookId: string;
  bookAuthor?: string;
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

export function ConceptDialogue({
  bookId,
  bookAuthor,
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
  const mobile = useIsMobile();
  const language = useSettingsStore((s) => s.language);
  const isLast = currentIndex >= dialogue.length - 1;
  const current = dialogue[currentIndex];

  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [sheetMessages, setSheetMessages] = useState<{ role: "user" | "cosmii"; bubbles: string[] }[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [visibleBubbleIdx, setVisibleBubbleIdx] = useState(0);
  const chatHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const answerBottomRef = useRef<HTMLDivElement>(null);

  const dialoguePct = useMemo(
    () => Math.round(((currentIndex + 1) / Math.max(dialogue.length, 1)) * 100),
    [currentIndex, dialogue.length],
  );

  const totalBubbles = useMemo(
    () => sheetMessages.reduce((sum, m) => sum + m.bubbles.length, 0),
    [sheetMessages],
  );

  useEffect(() => {
    answerBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleBubbleIdx, sheetMessages]);

  useEffect(() => {
    if (totalBubbles > 0 && visibleBubbleIdx < totalBubbles) {
      const timer = setTimeout(() => setVisibleBubbleIdx((p) => p + 1), 350);
      return () => clearTimeout(timer);
    }
  }, [totalBubbles, visibleBubbleIdx]);

  const handleTap = useCallback(() => {
    if (questionOpen) return;
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLast, onComplete, questionOpen]);

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
      setSheetMessages((prev) => [...prev, { role: "cosmii", bubbles: ["미안, 답변을 가져오는 데 실패했어"] }]);
    } finally {
      setIsAnswering(false);
    }
  }, [bookId, dialogue, currentIndex]);

  const handleAskInline = useCallback(async () => {
    const q = questionInput.trim();
    if (!q || isAnswering) return;

    setQuestionInput("");
    setSheetMessages([]);
    setVisibleBubbleIdx(0);
    chatHistoryRef.current = [];
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
    setAnswerBubbles([]);
    setVisibleBubbleCount(0);
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

      {/* Header */}
      <div className="absolute top-14 w-full px-5 flex items-center justify-between z-20">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-white/40 text-[11px] font-medium">
            탐험 {currentLesson}/{totalLessons}{bookAuthor ? ` · ${bookAuthor}` : ""}
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
      <div className="absolute inset-0 flex flex-col justify-end z-10 px-5 pb-44 pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-3 w-full"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
              <img src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"} alt="" className="w-7 h-7 object-contain" draggable={false} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl rounded-tl-md px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                <p className="text-white/90 text-[16px] leading-[1.7] font-medium text-left">
                  {current ? renderText(current.text, current.highlight) : spark}
                </p>
                {current?.highlight && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <HighlightPill keyword={current.highlight} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tap indicator */}
        {!questionOpen && (
          <motion.div
            className="flex flex-col items-center mt-6 gap-1"
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
              {isLast ? "tap to finish" : "tap to continue"}
            </span>
          </motion.div>
        )}
      </div>

      {/* Bottom question input bar */}
      <div className="absolute bottom-0 w-full z-30 px-5 pb-8">
        <div
          className="relative w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskInline()}
            onFocus={() => { /* keep keyboard visible */ }}
            placeholder="궁금한 거 있으면 물어봐!"
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
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"} alt="" className="w-5 h-5 object-contain" draggable={false} />
                  </div>
                  <span className="text-white/70 text-[14px] font-semibold">Cosmii</span>
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
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSheetAsk()}
                    placeholder="더 궁금한 거 있어?"
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
                  탐험으로 돌아가기
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
