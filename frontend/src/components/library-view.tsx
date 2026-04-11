"use client";

import { motion } from "framer-motion";
import { Globe2, BookOpen, Play, Download } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/store";

const serif = "font-[var(--font-serif)]";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
}

interface ReadingBook {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
  completedLessons: number;
  totalLessons: number;
}

interface LibraryViewProps {
  books: Book[];
  freeBookId: string | null;
  readingBooks?: ReadingBook[];
  activeSession?: {
    book: Book;
    completedLessons: number;
    totalLessons: number;
  } | null;
  onSelectBook: (book: Book) => void;
  onContinueLearning?: () => void;
}

function MiniCover({ book }: { book: Book }) {
  const coverSrc = book.cover_url || `/covers/${book.id}.jpg`;
  return (
    <div
      className="w-[100px] h-[140px] rounded-[14px] flex-shrink-0 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${book.color}40, ${book.color}15)` }}
    >
      <img
        src={coverSrc}
        alt={book.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

export function LibraryView({ books, freeBookId, readingBooks = [], activeSession, onSelectBook, onContinueLearning }: LibraryViewProps) {
  const t = useT();
  const isKo = useSettingsStore((s) => s.language) === "ko";
  const readingBookIds = new Set(readingBooks.map((b) => b.id));
  const otherBooks = books.filter((b) => !readingBookIds.has(b.id));
  const progress = activeSession && activeSession.totalLessons > 0
    ? Math.round((activeSession.completedLessons / activeSession.totalLessons) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto pb-[90px]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-2 px-5 h-14 bg-[rgba(6,6,18,0.85)] border-b border-white/[0.04] backdrop-blur-sm">
        <Globe2 size={18} className="text-[#a78bfa]" />
        <span className={`${serif} text-white/70 text-[18px] font-bold`}>{t("library.title")}</span>
        <span className="px-2 py-0.5 rounded-md bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.3)] text-[rgba(165,180,252,0.9)] text-[11px] font-semibold tracking-wide">Beta</span>
        {readingBooks.length > 0 && (
          <span className="text-white/25 text-[13px] ml-1">· {readingBooks.length}{isKo ? "권" : ""}</span>
        )}
      </div>

      <div className="px-5 pt-6">
        {/* Reading Books */}
        {readingBooks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] font-semibold mb-3">
              {t("library.reading")}
            </p>
            <div className="flex flex-col gap-3">
              {readingBooks.map((rb) => {
                const pct = rb.totalLessons > 0 ? Math.round((rb.completedLessons / rb.totalLessons) * 100) : 0;
                const isFreeBook = rb.id === freeBookId;
                return (
                  <motion.button
                    key={rb.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => isFreeBook && onContinueLearning ? onContinueLearning() : onSelectBook(rb)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex gap-4 text-left active:bg-white/[0.06] transition-colors"
                  >
                    <MiniCover book={rb} />
                    <div className="flex-1 min-w-0 py-1">
                      <p className={`${serif} text-white/90 text-[16px] font-bold truncate`}>{rb.title}</p>
                      <p className="text-white/30 text-[12px] mt-0.5 truncate">{rb.author}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-white/30 tabular-nums">{pct}%</span>
                      </div>
                      {isFreeBook && onContinueLearning && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-[#060612]">
                          <Play size={12} className="fill-[#060612]" />
                          <span className="text-[12px] font-semibold">{t("home.keepReading")}</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center mb-8"
          >
            <Globe2 size={40} className="text-white/10 mb-4" />
            <p className={`${serif} text-white/40 text-[16px] mb-2`}>{t("library.empty")}</p>
            <p className="text-white/20 text-[13px]">{t("library.emptySub")}</p>
          </motion.div>
        )}

        {/* Other books (locked) */}
        {otherBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] font-semibold mb-3">
              {t("home.moreInApp")}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {otherBooks.slice(0, 6).map((book) => (
                <motion.button
                  key={book.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectBook(book)}
                  className="text-left"
                >
                  <div
                    className="w-full aspect-[1/1.45] rounded-[14px] relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${book.color}30, ${book.color}10)` }}
                  >
                    <img
                      src={book.cover_url || `/covers/${book.id}.jpg`}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className={`${serif} text-white/40 text-[11px] mt-1.5 truncate`}>{book.title}</p>
                </motion.button>
              ))}
            </div>

            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/35 text-[13px] font-medium hover:bg-white/[0.04] transition-all mt-4"
            >
              <Download size={14} />
              {t("home.moreInAppSub")}
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
