"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Download, Flame, Star, Search, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAppStore, useSettingsStore } from "@/lib/store";
import { BETA_CURATION_SECTIONS, BETA_RECOMMENDED_IDS, BOOK_TAGLINES } from "@/lib/curations";

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

interface ActiveSession {
  book: Book;
  completedLessons: number;
  totalLessons: number;
}

interface HomeViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  activeSession?: ActiveSession | null;
  readingBooks?: ReadingBook[];
  onContinueLearning?: () => void;
  freeBookId?: string | null;
}

function BookCover({ book, size = "md" }: { book: Book; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-[90px] h-[126px]" : size === "md" ? "w-[100px] h-[145px]" : "w-[80px] h-[116px]";
  const coverSrc = book.cover_url || `/covers/${book.id}.jpg`;

  return (
    <div className={`${dims} rounded-xl flex-shrink-0 relative overflow-hidden`} style={{ background: `linear-gradient(135deg, ${book.color}40, ${book.color}15)` }}>
      <img
        src={coverSrc}
        alt={book.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

export function HomeView({ books, onSelectBook, activeSession, readingBooks = [], onContinueLearning, freeBookId }: HomeViewProps) {
  const t = useT();
  const isKo = useSettingsStore((s) => s.language) === "ko";
  const stats = useAppStore((s) => s.stats);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const bookMap = useMemo(() => {
    const m = new Map<string, Book>();
    books.forEach((b) => m.set(b.id, b));
    return m;
  }, [books]);

  const recommendedBooks = useMemo(
    () => BETA_RECOMMENDED_IDS.map((id) => bookMap.get(id)).filter(Boolean) as Book[],
    [bookMap],
  );

  const curationSections = useMemo(
    () => BETA_CURATION_SECTIONS.slice(0, 12).map((s) => ({
      ...s,
      books: s.bookIds.map((id) => bookMap.get(id)).filter(Boolean) as Book[],
    })).filter((s) => s.books.length > 0),
    [bookMap],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }, [searchQuery, books]);

  const openSearch = useCallback(() => {
    setSearchVisible(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchVisible(false);
    setSearchQuery("");
  }, []);

  const xpDisplay = stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}K` : `${stats.xp}`;

  return (
    <div className="h-full overflow-y-auto pb-[90px] relative">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 h-14 bg-[rgba(6,6,18,0.85)] border-b border-white/[0.04] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-[20px] font-bold" style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: 0.4 }}>Cosmii</span>
          <span className="px-2 py-0.5 rounded-md bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.3)] text-[rgba(165,180,252,0.9)] text-[11px] font-semibold tracking-wide">Beta</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-white/30" />
            <span className="text-white/60 text-[13px] tabular-nums" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{stats.streakDays}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="text-white/30" />
            <span className="text-white/60 text-[13px] tabular-nums" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{xpDisplay}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={openSearch}
            className="p-1.5 rounded-lg"
          >
            <Search size={18} className="text-white/45" />
          </motion.button>
        </div>
      </div>

      <div className="pt-6">
        {/* Hero CTA — most recent reading book */}
        <div className="px-5">
          {(() => {
            const heroBook = activeSession && activeSession.completedLessons > 0
              ? { book: activeSession.book, pct: activeSession.totalLessons > 0 ? Math.round((activeSession.completedLessons / activeSession.totalLessons) * 100) : 0, canContinue: true }
              : readingBooks.length > 0
                ? {
                    book: readingBooks[0],
                    pct: readingBooks[0].totalLessons > 0 ? Math.round((readingBooks[0].completedLessons / readingBooks[0].totalLessons) * 100) : 0,
                    canContinue: readingBooks[0].id === freeBookId,
                  }
                : null;

            if (heroBook) {
              return (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => heroBook.canContinue && onContinueLearning ? onContinueLearning() : onSelectBook(heroBook.book)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 mb-8 text-left active:bg-white/[0.06] transition-colors"
                >
                  <BookCover book={heroBook.book} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold mb-1.5">
                      {t("home.readingNow")}
                    </p>
                    <p className={`${serif} text-white/90 text-[16px] font-bold truncate`}>
                      {heroBook.book.title}
                    </p>
                    <p className="text-white/30 text-[12px] mt-0.5 truncate">{heroBook.book.author}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-[#a78bfa]"
                          initial={{ width: 0 }}
                          animate={{ width: `${heroBook.pct}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[11px] text-white/30 tabular-nums">{heroBook.pct}%</span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-[#060612]">
                      <Play size={12} className="fill-[#060612]" />
                      <span className="text-[12px] font-semibold">{t("home.keepReading")}</span>
                    </div>
                  </div>
                </motion.button>
              );
            }

            if (!freeBookId && readingBooks.length === 0) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center mb-8"
                >
                  <p className={`${serif} text-white/80 text-[18px] font-bold mb-2`}>{t("home.startFirst")}</p>
                  <p className="text-white/30 text-[13px] mb-5">{t("home.startFirstSub")}</p>
                  <div className="flex justify-center gap-3">
                    {recommendedBooks.slice(0, 3).map((book) => (
                      <motion.button key={book.id} whileTap={{ scale: 0.95 }} onClick={() => onSelectBook(book)}>
                        <BookCover book={book} size="sm" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              );
            }

            return null;
          })()}
        </div>

        {/* Recommended */}
        {recommendedBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] font-semibold mb-3 px-5">
              {isKo ? "추천" : "Recommended"}
            </p>
            <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
              {recommendedBooks.map((book) => {
                const tagline = BOOK_TAGLINES[book.id];
                return (
                  <motion.button
                    key={book.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectBook(book)}
                    className="flex-shrink-0 w-[100px] text-left"
                  >
                    <BookCover book={book} size="md" />
                    <p className={`${serif} text-white/70 text-[12px] mt-2 truncate font-medium`}>{book.title}</p>
                    {tagline && (
                      <p className="text-white/25 text-[10px] mt-0.5 line-clamp-2 leading-snug">
                        {isKo ? tagline.ko : tagline.en}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Curation Sections */}
        {curationSections.map((section, sIdx) => (
          <div key={section.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + sIdx * 0.05, duration: 0.5 }}
              className="mb-8"
            >
              <div className="px-5 mb-3">
                <p className={`${serif} text-white/70 text-[15px] font-bold`}>
                  {isKo ? section.title : section.titleEn}
                </p>
                <p className="text-white/25 text-[12px] mt-0.5">
                  {isKo ? section.subtitle : section.subtitleEn}
                </p>
              </div>
              <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
                {section.books.map((book) => {
                  const tagline = BOOK_TAGLINES[book.id];
                  return (
                    <motion.button
                      key={book.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelectBook(book)}
                      className="flex-shrink-0 w-[110px] text-left"
                    >
                      <div
                        className="w-[110px] h-[160px] rounded-xl relative overflow-hidden flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${book.color}40, ${book.color}15)` }}
                      >
                        <img
                          src={book.cover_url || `/covers/${book.id}.jpg`}
                          alt={book.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <p className={`${serif} text-white/60 text-[12px] mt-2 truncate font-medium`}>{book.title}</p>
                      {tagline && (
                        <p className="text-white/20 text-[10px] mt-0.5 line-clamp-2 leading-snug">
                          {isKo ? tagline.ko : tagline.en}
                        </p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ))}

        {/* App Download CTA */}
        <div className="px-5 pb-6">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/35 text-[13px] font-medium hover:bg-white/[0.04] hover:text-white/50 transition-all"
          >
            <Download size={14} />
            {t("home.moreInAppSub")}
          </a>
        </div>
      </div>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-[#060612] flex flex-col"
          >
            {/* Search Header */}
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.04] flex-shrink-0">
              <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-white/[0.06] rounded-xl px-3.5 h-10">
                <Search size={16} className="text-white/30 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isKo ? "책, 작가 검색..." : "Search books, authors..."}
                  className={`${serif} flex-1 bg-transparent text-white/90 text-[15px] outline-none placeholder:text-white/25`}
                />
                {searchQuery.length > 0 && (
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setSearchQuery("")}>
                    <X size={16} className="text-white/35" />
                  </motion.button>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={closeSearch}
                className="flex-shrink-0 pl-1 pr-1"
              >
                <span className={`${serif} text-white/50 text-[14px] font-semibold`}>
                  {isKo ? "취소" : "Cancel"}
                </span>
              </motion.button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-[100px]">
              {searchQuery.trim().length === 0 ? (
                <div>
                  <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] font-semibold mb-3">
                    {isKo ? "추천" : "Recommended"}
                  </p>
                  <div className="flex flex-col gap-3">
                    {recommendedBooks.map((book) => {
                      const tagline = BOOK_TAGLINES[book.id];
                      return (
                        <motion.button
                          key={book.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { onSelectBook(book); closeSearch(); }}
                          className="flex items-center gap-3 text-left p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06] transition-colors"
                        >
                          <BookCover book={book} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`${serif} text-white/80 text-[15px] font-bold truncate`}>{book.title}</p>
                            <p className="text-white/35 text-[12px] mt-0.5">{book.author}</p>
                            {tagline && (
                              <p className="text-white/20 text-[11px] mt-1 line-clamp-1">
                                {isKo ? tagline.ko : tagline.en}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <p className="text-[11px] text-white/25 uppercase tracking-[0.12em] font-semibold mb-3">
                    {isKo ? `${searchResults.length}개 결과` : `${searchResults.length} results`}
                  </p>
                  <div className="flex flex-col gap-3">
                    {searchResults.map((book) => {
                      const tagline = BOOK_TAGLINES[book.id];
                      return (
                        <motion.button
                          key={book.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { onSelectBook(book); closeSearch(); }}
                          className="flex items-center gap-3 text-left p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] active:bg-white/[0.06] transition-colors"
                        >
                          <BookCover book={book} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className={`${serif} text-white/80 text-[15px] font-bold truncate`}>{book.title}</p>
                            <p className="text-white/35 text-[12px] mt-0.5">{book.author}</p>
                            {tagline && (
                              <p className="text-white/20 text-[11px] mt-1 line-clamp-1">
                                {isKo ? tagline.ko : tagline.en}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center pt-20 text-center">
                  <Search size={32} className="text-white/10 mb-3" />
                  <p className={`${serif} text-white/30 text-[15px]`}>
                    {isKo ? "검색 결과가 없어요" : "No results found"}
                  </p>
                  <p className="text-white/15 text-[13px] mt-1">
                    {isKo ? "다른 키워드로 검색해보세요" : "Try a different keyword"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
