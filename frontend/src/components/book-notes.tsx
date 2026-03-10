"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Lightbulb,
  Hash,
  BookMarked,
  Filter,
} from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";

const serif = "font-[var(--font-serif)]";

interface NoteItem {
  lessonTitle: string;
  chapter: string;
  spark: string;
  highlights: string[];
}

interface BookNotesProps {
  bookTitle: string;
  notes: NoteItem[];
  onBack: () => void;
}

export function BookNotes({ bookTitle, notes, onBack }: BookNotesProps) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const chapters = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => { if (n.chapter) set.add(n.chapter); });
    return Array.from(set);
  }, [notes]);

  const allKeywords = useMemo(() => {
    const map = new Map<string, { keyword: string; count: number; chapters: Set<string> }>();
    notes.forEach((n) => {
      n.highlights.forEach((h) => {
        const key = h.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { keyword: h, count: 0, chapters: new Set() });
        }
        const entry = map.get(key)!;
        entry.count++;
        if (n.chapter) entry.chapters.add(n.chapter);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [notes]);

  const filtered = selectedChapter
    ? notes.filter((n) => n.chapter === selectedChapter)
    : notes;

  const filteredKeywords = selectedChapter
    ? allKeywords.filter((k) => k.chapters.has(selectedChapter))
    : allKeywords;

  const isEmpty = notes.length === 0;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="amber" />

      {/* Header */}
      <div className="absolute top-14 w-full px-5 flex items-center z-20">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <div className="ml-2">
          <h2 className={`${serif} text-white/80 font-bold text-[18px] tracking-wide`}>
            학습 노트
          </h2>
          <p className="text-white/30 text-[11px]">{bookTitle}</p>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto pt-28 pb-20 px-5 z-10">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 mt-20"
          >
            <BookMarked size={40} className="text-white/10" />
            <p className="text-white/30 text-[14px] text-center font-medium">
              아직 학습 노트가 없어요<br />
              탐험을 완료하면 핵심 내용이 여기에 모여요!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Chapter filter */}
            {chapters.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-5"
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Filter size={13} className="text-white/30" />
                  <span className="text-white/30 text-[11px] uppercase tracking-[0.12em] font-bold">챕터</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedChapter(null)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all select-none ${
                      !selectedChapter
                        ? "bg-amber-500/15 border-amber-400/35 text-amber-300"
                        : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    전체
                  </motion.button>
                  {chapters.map((ch) => (
                    <motion.button
                      key={ch}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedChapter(ch)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all select-none truncate max-w-[140px] ${
                        selectedChapter === ch
                          ? "bg-amber-500/15 border-amber-400/35 text-amber-300"
                          : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]"
                      }`}
                    >
                      {ch}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Keywords cloud */}
            {filteredKeywords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-4 mb-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Hash size={14} className="text-indigo-400" />
                  <span className="text-white/50 text-[12px] uppercase tracking-[0.12em] font-bold">핵심 키워드</span>
                  <span className="text-white/20 text-[11px] ml-auto">{filteredKeywords.length}개</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredKeywords.map((kw) => (
                    <span
                      key={kw.keyword}
                      className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[12px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {kw.keyword}
                      {kw.count > 1 && (
                        <span className="text-indigo-400/50 text-[10px]">×{kw.count}</span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Spark notes */}
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-white/50 text-[12px] uppercase tracking-[0.12em] font-bold">탐험별 핵심 정리</span>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-3">
                {filtered.map((note, i) => (
                  <motion.div
                    key={`${note.chapter}-${note.lessonTitle}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.15 + i * 0.03, duration: 0.35 }}
                    className="bg-white/[0.05] border border-white/[0.10] backdrop-blur-xl rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {note.chapter && (
                        <span className="text-indigo-400/50 text-[10px] font-bold uppercase tracking-wider">
                          {note.chapter}
                        </span>
                      )}
                      <span className="text-white/20 text-[10px]">·</span>
                      <span className="text-white/50 text-[12px] font-semibold truncate">
                        {note.lessonTitle}
                      </span>
                    </div>

                    <p className="text-white/75 text-[14px] leading-[1.7] font-medium">
                      {note.spark}
                    </p>

                    {note.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
                        {note.highlights.map((h, hi) => (
                          <span
                            key={hi}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
