"use client";

import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown, { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BookOpen, Copy, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ChatMessage as ChatMessageType, Source } from "@/lib/types";

function CodeBlock({ className, children }: { className?: string; children?: ReactNode }) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  if (!match) {
    return <code className="text-[13px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">{children}</code>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-muted/80 rounded-t-lg px-3 py-1.5 border border-b-0 border-border/30">
        <span className="text-[12px] font-mono text-muted-foreground">{match[1]}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneLight}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, padding: "12px 16px", paddingBottom: 20, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border) / 0.3)" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const mdComponents: Components = {
  code({ className, children, ...props }) {
    const isBlock = /language-/.test(className || "");
    if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
    return <code className="text-[13px] bg-muted/60 px-1.5 py-0.5 rounded font-mono" {...props}>{children}</code>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
};

function SourceBadge({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false);
  const label = source.page ? `p.${source.page}` : `[${index + 1}]`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-[13px] font-medium text-white/50 hover:bg-white/[0.08] hover:border-white/[0.20] transition-all duration-200 cursor-pointer"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <BookOpen className="w-2.5 h-2.5" />
          {label}
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-80 p-3.5 text-sm shadow-xl border-border/50"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-2">
          {source.book_title && (
            <p className="font-semibold text-foreground text-sm">{source.book_title}</p>
          )}
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            {source.chapter && <span>{source.chapter}</span>}
            {source.page && <span className="text-primary/70">p.{source.page}</span>}
          </div>
          {source.snippet && (
            <p className="text-[13px] text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-2.5 italic">
              &ldquo;{source.snippet}&rdquo;
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const mobile = useIsMobile();
  const isUser = message.role === "user";
  const isGrouped = message.isGrouped;

  if (isUser) {
    return (
      <div className={`flex justify-end ${isGrouped ? "mt-0.5" : ""}`}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 4 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`relative max-w-[75%] rounded-2xl px-3.5 py-2.5 bg-white/[0.06] border border-white/[0.10] text-white/90 rounded-br-[4px] ${isGrouped ? "rounded-br-2xl" : ""}`}
        >
          {!isGrouped && (
            <svg className="absolute -right-[5px] bottom-0 w-[10px] h-[16px]" viewBox="0 0 10 16" fill="none">
              <path d="M0 16H5C7.76 16 10 13.76 10 11V0C10 5 7 10 0 12V16Z" fill="rgba(255,255,255,0.06)" />
            </svg>
          )}
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${isGrouped ? "mt-0.5" : ""}`}>
      {/* Cosmii character above the bubble */}
      {!isGrouped && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 ml-1 -mb-1"
        >
          <img src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"} alt="Cosmii" className="w-full h-full object-contain" />
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 bg-white/[0.025] border border-white/[0.06] ${!isGrouped ? "rounded-tl-[4px]" : ""}`}
      >
        {/* Tail pointing up-left toward Cosmii */}
        {!isGrouped && (
          <svg className="absolute -top-[5px] left-[10px] w-[12px] h-[7px]" viewBox="0 0 12 7" fill="none">
            <path d="M0 7H12C8.5 7 4 3.5 2 0C2 2.5 1.5 5 0 7Z" fill="rgba(255,255,255,0.025)" />
            <path d="M2 0C2 2.5 1.5 5 0 7" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
          </svg>
        )}

        <div className="text-[14px] leading-relaxed text-white/80 prose prose-sm prose-invert max-w-none
            prose-p:my-1 prose-headings:my-2 prose-headings:font-semibold
            prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
            prose-code:text-[13px] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-white/[0.12] prose-blockquote:text-white/50 prose-blockquote:not-italic
            prose-strong:text-white prose-a:text-white/70 prose-a:underline hover:prose-a:text-white/90">
            <ReactMarkdown components={mdComponents}>{message.content}</ReactMarkdown>
          </div>
      </motion.div>

      {/* Source badges — only show when RAG returned meaningful references */}
      {(() => {
        const meaningful = message.sources?.filter(
          (s) => s.page && s.page !== "0" && s.page.trim() !== "" && s.snippet?.trim(),
        );
        if (!meaningful || meaningful.length === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-1.5 items-center pl-1 mt-1.5"
          >
            <span className="text-[12px] text-white/25 mr-0.5">Sources</span>
            {meaningful.map((source, idx) => (
              <SourceBadge key={idx} source={source} index={idx} />
            ))}
          </motion.div>
        );
      })()}
    </div>
  );
}
