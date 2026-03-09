"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useChatStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FreeQuestionProps {
  bookId: string;
  lessonContext?: string;
  onBack: () => void;
}

export function FreeQuestion({ bookId, lessonContext, onBack }: FreeQuestionProps) {
  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput("");
    addMessage({ role: "user", content: question });
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          book_id: bookId,
          lesson_context: lessonContext,
          history: messages.slice(-6),
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
    } catch (e) {
      console.error("Chat failed:", e);
      addMessage({ role: "assistant", content: "죄송해요, 답변을 가져오는 데 실패했어요." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#050510] relative overflow-hidden text-white flex flex-col">
      {/* Header */}
      <div className="pt-12 px-6 flex items-center z-20">
        <button onClick={onBack} className="text-white/70 hover:text-white flex items-center gap-2 transition-colors">
          <ChevronLeft size={24} />
          <span className="font-semibold text-lg">돌아가기</span>
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 pt-6 pb-32 px-6 overflow-y-auto z-10 flex flex-col gap-6">
        {/* Lesson context (dimmed) */}
        {lessonContext && (
          <div className="flex gap-3 items-end opacity-40">
            <img src="/cosmii/standing.webp" alt="Cosmii" className="w-10 h-10 rounded-full object-cover" />
            <GlassPanel className="p-4 max-w-[80%] text-sm leading-relaxed rounded-bl-none">
              {lessonContext}
            </GlassPanel>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "gap-3 items-end"}`}>
            {msg.role === "assistant" && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="/cosmii/talking.webp" alt="Cosmii" className="w-10 h-10 rounded-full object-cover" />
              </motion.div>
            )}
            {msg.role === "user" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-500/30 border border-indigo-400/30 text-white p-4 rounded-2xl rounded-br-none max-w-[80%] text-[15px] leading-relaxed backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]"
              >
                {msg.content}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 max-w-[80%]"
              >
                <GlassPanel className="p-4 text-[15px] leading-relaxed rounded-bl-none shadow-lg border-indigo-500/20">
                  {msg.content}
                </GlassPanel>
              </motion.div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-end">
            <img src="/cosmii/standing.webp" alt="Cosmii" className="w-10 h-10 rounded-full object-cover" />
            <GlassPanel className="p-4 rounded-bl-none">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </GlassPanel>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#050510] via-[#050510]/90 to-transparent pt-12 pb-8 px-6 z-20 flex flex-col gap-4">
        <button
          onClick={onBack}
          className="text-white/50 hover:text-white/80 text-sm font-semibold mx-auto transition-colors"
        >
          레슨으로 돌아가기
        </button>

        <div className="relative w-full shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="질문하기..."
            className="w-full h-14 bg-white/10 border border-white/20 rounded-full pl-6 pr-14 text-white placeholder-white/30 backdrop-blur-md outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Send size={18} className="text-indigo-300 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
