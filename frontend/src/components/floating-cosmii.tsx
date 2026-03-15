"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useIsMobile } from "@/lib/utils";
import { useT } from "@/lib/i18n";

type CosmiiGifState = "standing" | "talking" | "giggling" | "dancing";

const COSMII_MAP: Record<CosmiiGifState, { desktop: string; mobile: string }> = {
  standing: { desktop: "/cosmii/standing-desktop.webp", mobile: "/cosmii/standing-mobile.webp" },
  talking:  { desktop: "/cosmii/talking-desktop.webp",  mobile: "/cosmii/talking-mobile.webp" },
  giggling: { desktop: "/cosmii/giggling-desktop.webp", mobile: "/cosmii/giggling-mobile.webp" },
  dancing:  { desktop: "/cosmii/dancing-desktop.webp",  mobile: "/cosmii/dancing-mobile.webp" },
};

const IDLE_QUOTES = [
  "This book was fun!",
  "What should I read?",
  "The universe is vast...",
  "One page at a time!",
  "Knowledge becomes stars!",
  "Click me!",
  "Reading is the best~",
  "I'll remember for you!",
  "A new world opens!",
  "We meet again!",
  "The answer is in the book",
  "Thoughts sparkling!",
  "What are you curious about?",
  "Let's explore together!",
  "One star, one book",
  "Hmm... interesting?",
  "Wait, did you know?",
  "Space traveling~",
  "Bookworm mode ON!",
  "Hehe... this is fun!",
  "Boop!",
];

const AUTO_TALK_MIN = 15_000;
const AUTO_TALK_MAX = 25_000;

const THINKING_MUMBLES_COUNT = 12;

const SPARKLE_CONFIGS = [
  { x: -10, y: -15, delay: 0, size: 6 },
  { x: 20, y: -25, delay: 0.4, size: 4 },
  { x: 35, y: -5, delay: 0.8, size: 5 },
  { x: -15, y: 10, delay: 1.2, size: 4 },
  { x: 30, y: 15, delay: 0.2, size: 3 },
  { x: 5, y: -30, delay: 0.6, size: 5 },
  { x: -20, y: -5, delay: 1.0, size: 4 },
];

interface BubbleInfo {
  current: number;
  total: number;
}

interface FloatingCosmii3DProps {
  triggerDance?: boolean;
  chatMode?: boolean;
  chatResponse?: string | null;
  chatLoading?: boolean;
  welcomeText?: string;
  bubbleInfo?: BubbleInfo | null;
  onBubbleNext?: () => void;
  onSettings?: () => void;
  onAbout?: () => void;
  onDemo?: () => void;
  hidden?: boolean;
}

export function FloatingCosmii3D({
  triggerDance,
  chatMode = false,
  chatResponse = null,
  chatLoading = false,
  welcomeText = "Ask anything about this book!",
  bubbleInfo = null,
  onBubbleNext,
  onSettings,
  onAbout,
  onDemo,
  hidden = false,
}: FloatingCosmii3DProps) {
  const mobile = useIsMobile();
  const t = useT();
  const thinkingMumbles = Array.from({ length: THINKING_MUMBLES_COUNT }, (_, i) => t(`thinking.${i}` as any));
  const [gifState, setGifState] = useState<CosmiiGifState>("standing");
  const [quote, setQuote] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const currentGif = useRef<CosmiiGifState>("standing");
  const currentQuote = useRef<string | null>(null);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [thinkingText, setThinkingText] = useState("");
  const mumbleIdx = useRef(0);
  const charIdx = useRef(0);

  useEffect(() => {
    if (!chatMode || !chatLoading) {
      setThinkingText("");
      mumbleIdx.current = Math.floor(Math.random() * thinkingMumbles.length);
      charIdx.current = 0;
      return;
    }

    const target = thinkingMumbles[mumbleIdx.current % thinkingMumbles.length];

    const typeInterval = setInterval(() => {
      charIdx.current++;
      if (charIdx.current <= target.length) {
        setThinkingText(target.slice(0, charIdx.current));
      } else if (charIdx.current > target.length + 12) {
        mumbleIdx.current = (mumbleIdx.current + 1 + Math.floor(Math.random() * (thinkingMumbles.length - 1))) % thinkingMumbles.length;
        charIdx.current = 0;
        setThinkingText("");
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, [chatMode, chatLoading, thinkingText === ""]);

  currentGif.current = gifState;
  currentQuote.current = quote;

  useEffect(() => {
    if (chatMode) setShowMenu(false);
  }, [chatMode]);

  const handleCosmiiClick = useCallback(() => {
    if (chatMode) return;
    setShowMenu((prev) => !prev);
    if (currentQuote.current) {
      setQuote(null);
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    }
  }, [chatMode]);

  const handleSettingsClick = useCallback(() => {
    setShowMenu(false);
    onSettings?.();
  }, [onSettings]);

  const handleAboutClick = useCallback(() => {
    setShowMenu(false);
    onAbout?.();
  }, [onAbout]);

  const handleDemoClick = useCallback(() => {
    setShowMenu(false);
    onDemo?.();
  }, [onDemo]);

  useEffect(() => {
    if (triggerDance && currentGif.current !== "dancing") {
      setGifState("dancing");
      const t = setTimeout(() => setGifState("standing"), 3000);
      return () => clearTimeout(t);
    }
  }, [triggerDance]);

  const showQuote = useCallback((q: string, duration = 3000) => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    setQuote(q);
    quoteTimer.current = setTimeout(() => {
      setQuote(null);
      quoteTimer.current = null;
    }, duration);
  }, []);

  const triggerTalk = useCallback(() => {
    if (currentGif.current !== "standing" || currentQuote.current !== null)
      return;
    const q = IDLE_QUOTES[Math.floor(Math.random() * IDLE_QUOTES.length)];
    showQuote(q);
    setGifState("talking");
    setTimeout(() => {
      setGifState("giggling");
      setTimeout(() => setGifState("standing"), 1500);
    }, 3000);
  }, [showQuote]);

  useEffect(() => {
    if (chatMode) return;
    const schedule = () =>
        AUTO_TALK_MIN + Math.random() * (AUTO_TALK_MAX - AUTO_TALK_MIN);
    const id = setInterval(() => {
      if (
        currentGif.current === "standing" &&
        currentQuote.current === null
      ) {
        triggerTalk();
      }
    }, schedule());
    return () => clearInterval(id);
  }, [triggerTalk, chatMode]);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      if (bobRef.current) {
        const y = Math.sin(t * 0.8) * 6;
        const rot = Math.sin(t * 0.5) * 3;
        bobRef.current.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (chatMode && chatResponse && bubbleRef.current) {
      bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight;
    }
  }, [chatMode, chatResponse]);

  const pick = (state: CosmiiGifState) =>
    mobile ? COSMII_MAP[state].mobile : COSMII_MAP[state].desktop;

  const hasMore = bubbleInfo != null && bubbleInfo.current < bubbleInfo.total - 1;

  const chatSrc = chatLoading
    ? pick("standing")
    : chatResponse
      ? pick("talking")
      : pick("standing");

  const idleGifSrc = pick(gifState);
  const cosmiiSize = mobile ? 90 : 130;
  const chatCosmiiSize = mobile ? 100 : 140;

  if (hidden) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: mobile ? 12 : 40,
        ...(mobile ? { top: 70 } : { bottom: 90 }),
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      {/* Chat speech bubble */}
      <AnimatePresence mode="wait">
        {chatMode && (
          <motion.div
            key="chat-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
              position: "absolute",
              top: 0,
              left: chatCosmiiSize + 8,
              maxWidth: mobile ? "calc(100vw - " + (chatCosmiiSize + 8 + 24) + "px)" : 420,
              pointerEvents: "auto",
            }}
          >
            <div
              className="w-fit rounded-2xl bg-white/[0.03] border border-white/[0.06] shadow-2xl shadow-black/40"
              style={{ position: "relative" }}
            >

              <AnimatePresence mode="wait">
                {chatLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-4 whitespace-nowrap"
                  >
                    <div className="min-h-[24px] flex items-center">
                      <span className="text-[14px] text-white/70 font-medium">
                        {thinkingText}
                      </span>
                      <motion.span
                        className="inline-block w-[2px] h-[16px] bg-white/30 ml-0.5"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                ) : chatResponse ? (
                  <motion.div
                    key={`response-${bubbleInfo?.current ?? 0}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={hasMore ? "cursor-pointer select-none" : ""}
                    onClick={hasMore ? onBubbleNext : undefined}
                    style={{ minWidth: 0 }}
                  >
                    <div
                      ref={bubbleRef}
                      className="px-5 py-4 overflow-y-auto text-[14px] leading-relaxed text-white/85 prose prose-sm prose-invert max-w-none
                        prose-p:my-1.5 prose-headings:my-2 prose-headings:font-semibold
                        prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                        prose-code:text-[13px] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-blockquote:border-white/[0.10] prose-blockquote:text-white/50
                        prose-strong:text-white prose-a:text-white/70"
                      style={{ maxHeight: mobile ? "40vh" : 320 }}
                    >
                      <ReactMarkdown>{chatResponse}</ReactMarkdown>
                    </div>
                    {bubbleInfo && (
                      <div className="px-5 pb-3 pt-1 flex items-center justify-between">
                        <span className="text-[12px] text-white/30 font-mono">
                          {bubbleInfo.current + 1} / {bubbleInfo.total}
                        </span>
                        {hasMore && (
                          <motion.span
                            className="text-[12px] text-white/40 flex items-center gap-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            tap to continue
                            <motion.span
                              animate={{ y: [0, 2, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ▼
                            </motion.span>
                          </motion.span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-4 text-[15px] text-white/70 font-semibold"
                  >
                    {welcomeText}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle speech bubble (not chatMode) */}
      {!chatMode && quote && !showMenu && (
            <div
              style={{
                position: "absolute",
            ...(mobile
              ? { top: cosmiiSize / 2 - 12, left: cosmiiSize + 8, transform: "none" }
              : { bottom: cosmiiSize + 8, left: "50%", transform: "translateX(-50%)" }),
                whiteSpace: "nowrap",
                padding: "4px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontSize: 12,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {quote}
            </div>
          )}

      {/* Menu popup */}
      <AnimatePresence>
        {!chatMode && showMenu && (
          <motion.div
            key="cosmii-menu"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "absolute",
              bottom: cosmiiSize + 10,
              left: mobile ? 0 : "50%",
              transform: mobile ? "none" : "translateX(-50%)",
            }}
          >
            <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-2xl shadow-black/40 min-w-[120px]">
              <button
                onClick={handleSettingsClick}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer min-h-[40px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>
              <button
                onClick={handleAboutClick}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer min-h-[40px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                About
              </button>
              <button
                onClick={handleDemoClick}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer min-h-[40px]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cosmii character */}
      <div
        ref={bobRef}
        onClick={handleCosmiiClick}
        style={{
          position: "relative",
          width: chatMode ? chatCosmiiSize : cosmiiSize,
          height: chatMode ? chatCosmiiSize : cosmiiSize,
          userSelect: "none",
          cursor: chatMode ? "default" : "pointer",
          willChange: "transform",
          transition: "width 0.3s, height 0.3s",
        }}
      >
        {/* Sparkle particles when thinking */}
        <AnimatePresence>
          {chatMode && chatLoading && SPARKLE_CONFIGS.map((sp, i) => (
            <motion.span
              key={`sparkle-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [sp.x * 0.5, sp.x, sp.x * 1.3],
                y: [sp.y * 0.5, sp.y, sp.y * 1.3],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: sp.delay,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: sp.size,
                height: sp.size,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)",
                boxShadow: "none",
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>

        {chatMode ? (
          <img
            key={chatSrc}
            src={chatSrc}
            alt="Cosmii"
            width={chatCosmiiSize}
            height={chatCosmiiSize}
            draggable={false}
            style={{
              objectFit: "contain",
              transition: "filter 0.5s ease",
            }}
          />
        ) : (
          <img
            key={idleGifSrc}
            src={idleGifSrc}
            alt="Cosmii"
            width={cosmiiSize}
            height={cosmiiSize}
            draggable={false}
            style={{
              objectFit: "contain",
            }}
          />
        )}
      </div>
        </div>
  );
}
