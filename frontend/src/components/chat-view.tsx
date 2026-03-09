"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { streamChat, type AnswerPartData } from "@/lib/api";
import { getChatState, setChatState } from "@/lib/store";
import { getBookColorById } from "@/lib/colors";
import type {
  BookInfo,
  ChatMessage as ChatMessageType,
  ThinkingProcess,
  Source,
} from "@/lib/types";

interface ChatViewProps {
  bookIds: string[];
  books: BookInfo[];
  initialMessage?: string;
  onBackToBrain: () => void;
}

export function ChatView({
  bookIds,
  books,
  initialMessage,
  onBackToBrain,
}: ChatViewProps) {
  const mobile = useIsMobile();
  const saved = getChatState(bookIds);
  const [messages, setMessages] = useState<ChatMessageType[]>(saved.messages);
  const [conversationId, setConversationId] = useState<string | null>(
    saved.conversationId,
  );
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    setChatState(bookIds, { messages, conversationId });
  }, [messages, conversationId, bookIds]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      let finalThinking: ThinkingProcess | null = null;
      let partIndex = 0;

      try {
        await streamChat(
          content,
          conversationId,
          {
            onThinkingStep: () => {},
            onThinkingDone: (process: ThinkingProcess) => {
              finalThinking = process;
            },
            onAnswerPart: (data: AnswerPartData) => {
              const isCasual = finalThinking?.selected_mode === "casual";
              const isFirst = data.index === 0;
              const msg: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.text,
                thinking: isFirst && !isCasual ? finalThinking || undefined : undefined,
                sources: data.is_last ? (data.sources as Source[]) : undefined,
                timestamp: new Date(),
                isGrouped: !isFirst,
              };
              setMessages((prev) => [...prev, msg]);
              if (data.is_last) {
                setConversationId(data.conversation_id);
              }
              partIndex++;
            },
            onAnswer: (data) => {
              if (partIndex > 0) return;
              const assistantMessage: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.text,
                thinking: finalThinking || undefined,
                sources: data.sources as Source[],
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setConversationId(data.conversation_id);
            },
            onError: (error) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `Error: ${error.message}`,
                  timestamp: new Date(),
                },
              ]);
            },
          },
          bookIds,
        );
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, bookIds],
  );

  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      handleSend(initialMessage);
    }
  }, [initialMessage, handleSend]);

  const referencedBooks = books.filter((b) => bookIds.includes(b.book_id));

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-5 py-3 border-b bg-card/80 backdrop-blur">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onBackToBrain}
        >
          <Brain className="w-4 h-4" />
          Brain
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          {referencedBooks.map((book) => {
            return (
              <Badge
                key={book.book_id}
                variant="secondary"
                className="text-xs flex-shrink-0"
                style={{
                  borderColor: getBookColorById(book.book_id),
                  color: getBookColorById(book.book_id),
                  borderWidth: 1,
                  background: `${getBookColorById(book.book_id)}10`,
                }}
              >
                {book.title}
              </Badge>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 select-none">
              <motion.img
                src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"}
                alt="Cosmii"
                className="h-44 w-auto object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.12)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                draggable={false}
              />
              <motion.p
                className="mt-5 text-lg text-white/60 font-semibold tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Ask anything about this book!
              </motion.p>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage message={msg} />
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="w-16 h-16 ml-1 -mb-1">
                <img
                  src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"}
                  alt="Cosmii"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="rounded-2xl rounded-tl-[4px] bg-white/[0.04] border border-white/[0.08] px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/30"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t bg-card/80 backdrop-blur">
        <div className="max-w-3xl mx-auto w-full px-4 py-3">
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Type a message…"
          />
        </div>
      </div>
    </div>
  );
}
