"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useIsMobile } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FreeQuestionProps {
  bookId: string;
  lessonContext?: string;
  onBack: () => void;
}

function splitIntoBubbles(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function AssistantBubbles({ text }: { text: string }) {
  const bubbles = splitIntoBubbles(text);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    if (visibleCount < bubbles.length) {
      const timer = setTimeout(() => setVisibleCount((p) => p + 1), 350);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, bubbles.length]);

  return (
    <div className="flex flex-col gap-2">
      {bubbles.slice(0, visibleCount).map((bubble, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl rounded-tl-md px-4 py-3 shadow-lg max-w-full"
        >
          <p className="text-white/85 text-[15px] leading-[1.7] font-medium">{bubble}</p>
        </motion.div>
      ))}
      {visibleCount < bubbles.length && (
        <div className="flex gap-1.5 py-1 pl-1">
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
    </div>
  );
}

export function FreeQuestion({ bookId, lessonContext, onBack }: FreeQuestionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const mobile = useIsMobile();
  const language = useSettingsStore((s) => s.language);
  const t = useT();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput("");
    addMessage({ role: "user", content: question });
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          book_id: bookId,
          lesson_context: lessonContext,
          history: messages.slice(-6),
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
        addMessage({ role: "assistant", content: fullAnswer });
      }
    } catch {
      addMessage({ role: "assistant", content: t("dialogue.errorAnswer") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden text-white flex flex-col">
      <CosmicBg accent="indigo" />

      {/* Header */}
      <div className="pt-14 px-5 flex items-center z-20 relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onBack}
          className="text-white/60 hover:text-white flex items-center gap-2 transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
          <span className="font-semibold text-[15px]">{t("freeQ.goBack")}</span>
        </motion.button>
      </div>

      {/* Chat area */}
      <div className="flex-1 pt-4 pb-32 px-5 overflow-y-auto z-10 flex flex-col gap-5 relative">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 mt-16"
          >
            <motion.img
              src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"}
              alt="Cosmii"
              className="w-16 h-16 object-contain"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              draggable={false}
            />
            <p className="text-white/40 text-[14px] font-medium text-center">
              {t("freeQ.emptyHint")}
            </p>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-2.5"}`}>
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"}
                  alt=""
                  className="w-6 h-6 object-contain"
                  draggable={false}
                />
              </div>
            )}

            {msg.role === "user" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-500/25 border border-indigo-400/25 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-[15px] leading-relaxed backdrop-blur-md"
              >
                {msg.content}
              </motion.div>
            ) : (
              <div className="max-w-[85%]">
                <AssistantBubbles text={msg.content} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"}
                alt=""
                className="w-6 h-6 object-contain"
                draggable={false}
              />
            </div>
            <div className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#050510] via-[#050510]/90 to-transparent pt-10 pb-8 px-5 z-20 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          onClick={onBack}
          className="text-white/40 hover:text-white/70 text-[13px] font-semibold mx-auto transition-colors active:text-white/90"
        >
          {t("freeQ.backToExplore")}
        </motion.button>

        <div className="relative w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={t("freeQ.placeholder")}
            className="w-full h-12 bg-white/[0.07] border border-white/[0.15] rounded-full pl-5 pr-12 text-white text-[14px] placeholder-white/25 backdrop-blur-xl outline-none focus:border-indigo-400/50 focus:bg-white/[0.10] transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-500/25 hover:bg-indigo-500/45 rounded-full flex items-center justify-center transition-colors disabled:opacity-25 active:bg-indigo-500/60"
          >
            <Send size={16} className="text-indigo-300 ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
