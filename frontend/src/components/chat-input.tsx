"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && input.trim().length > 0;

  return (
    <motion.div
      className={`relative flex items-end gap-2.5 rounded-2xl transition-all duration-300 px-4 py-2.5 ${
        focused
          ? "bg-white/[0.06] ring-1 ring-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.08)]"
          : "bg-white/[0.03]"
      }`}
      animate={{ scale: focused ? 1.005 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <input
        ref={textareaRef as unknown as React.RefObject<HTMLInputElement>}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler<HTMLInputElement>}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? "Type a message…"}
        className="flex-1 h-8 bg-transparent border-0 outline-none text-[14px] text-white/85 placeholder:text-white/45"
        disabled={disabled}
      />
      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        animate={{
          scale: canSend ? 1 : 0.85,
          opacity: canSend ? 1 : 0.3,
        }}
        whileHover={canSend ? { scale: 1.08 } : {}}
        whileTap={canSend ? { scale: 0.92 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200 ${
          canSend
            ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25"
            : "bg-white/10 text-white/30"
        }`}
      >
        {disabled ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5" />
        )}
      </motion.button>
    </motion.div>
  );
}
