"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  BookOpen,
  Play,
  Clock,
  Layers,
  Lock,
  Download,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { PrimaryButton } from "@/components/ui/glass-panel";
import { getBookConstellation } from "@/lib/book-constellations";
import dynamic from "next/dynamic";
import { useT } from "@/lib/i18n";

const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);

const API = "";
const serif = "font-[var(--font-serif)]";

interface ChapterSummary {
  chapter: string;
  lessonCount: number;
  completedCount: number;
}

interface BookDetailProps {
  book: { id: string; title: string; author: string; color: string; cover_url?: string | null };
  chapters: ChapterSummary[];
  completedLessons: number;
  totalLessons: number;
  locked?: boolean;
  showConfirm?: boolean;
  onBack: () => void;
  onStartLearning: () => void;
  onConfirmFreeBook?: () => void;
  onCancelConfirm?: () => void;
}

export function BookDetail({
  book,
  chapters,
  completedLessons,
  totalLessons,
  locked = false,
  showConfirm = false,
  onBack,
  onStartLearning,
  onConfirmFreeBook,
  onCancelConfirm,
}: BookDetailProps) {
  const t = useT();
  const pct = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const isStarted = completedLessons > 0;
  const estimatedMinutes = (totalLessons - completedLessons) * 3;
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const localCover = `/covers/${book.id}.jpg`;
  const coverSrc = book.cover_url
    ? book.cover_url.startsWith("http")
      ? book.cover_url
      : book.cover_url.startsWith("/covers/")
        ? book.cover_url
        : `${API}${book.cover_url}`
    : localCover;
  const showCover = !!coverSrc && !imgError;

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <ImageConstellation imageSrc={getBookConstellation(book.id).image} color={book.color} animate={false} dim dimOpacity={0.25} />
      </div>

      {/* Header */}
      <div className="absolute pt-safe top-0 w-full px-5 flex items-center z-20">
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onBack}
          aria-label="Back"
          className="text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
      </div>

      <div className="absolute inset-0 overflow-y-auto pt-24 pb-36 px-6 z-10">
        {/* Book Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 mb-8"
        >
          {/* Book cover */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl blur-[40px] scale-150 opacity-10"
              style={{ background: "white" }}
            />
            {showCover ? (
              <div className="relative w-32 h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt={book.title}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div
                className="relative w-28 h-40 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                }}
              >
                <BookOpen size={36} className="text-white/60" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h1 className={`${serif} text-[26px] font-bold text-white tracking-tight leading-tight`}>
              {book.title}
            </h1>
            <p className="text-white/40 text-[14px] mt-1.5">{book.author}</p>
          </div>

          {/* Progress ring */}
          {totalLessons > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4"
            >
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                  <circle
                    cx="28" cy="28" r="24"
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"
                  />
                  <motion.circle
                    cx="28" cy="28" r="24"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - pct / 100) }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center ${serif} text-[14px] font-bold text-white/80`}>
                  {pct}%
                </span>
              </div>
              <div>
                <p className="text-white/70 text-[15px] font-semibold">
                  {t("bookDetail.sessionsComplete", { done: completedLessons, total: totalLessons })}
                </p>
                {estimatedMinutes > 0 && (
                  <p className="text-white/30 text-[13px] flex items-center gap-1 mt-0.5">
                    <Clock size={12} />
                    {t("bookDetail.estMinutes", { min: estimatedMinutes })}
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="w-32 h-4 rounded-lg bg-white/[0.04] animate-pulse" />
                <div className="w-20 h-3 rounded-lg bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Chapter List */}
        {chapters.length === 0 && totalLessons === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded bg-white/[0.04] animate-pulse" />
              <div className="w-16 h-3 rounded-lg bg-white/[0.04] animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-4 flex items-center gap-3.5">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-28 h-4 rounded-lg bg-white/[0.04] animate-pulse" />
                    <div className="w-16 h-3 rounded-lg bg-white/[0.04] animate-pulse" />
                  </div>
                  <div className="w-11 h-1.5 rounded-full bg-white/[0.04] animate-pulse flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
        {chapters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-white/40" />
              <span className="text-white/50 text-[13px] uppercase tracking-[0.12em] font-bold">
                {t("bookDetail.chapters")}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {chapters.map((ch, i) => {
                const chPct = ch.lessonCount > 0 ? Math.round((ch.completedCount / ch.lessonCount) * 100) : 0;
                const done = chPct >= 100;
                return (
                  <motion.div
                    key={ch.chapter}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.35 }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-[15px] font-semibold block truncate ${done ? "text-white/50" : "text-white/75"}`}>
                        {ch.chapter}
                      </span>
                      <span className="text-white/30 text-[13px]">
                        {t("bookDetail.chapterSessions", { done: ch.completedCount, total: ch.lessonCount })}
                      </span>
                    </div>
                    <div className="w-11 h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex-shrink-0">
                      <motion.div
                        className={`h-full rounded-full ${done ? "bg-white/40" : "bg-white/50"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${chPct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#060612] via-[#060612]/90 to-transparent pt-12 pb-safe-lg px-6 z-20">
        {locked ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-white/30">
              <Lock size={14} />
              <span className="text-[14px] font-medium">{t("bookDetail.lockedTitle")}</span>
            </div>
            <p className="text-white/20 text-[13px] text-center mb-2">{t("bookDetail.lockedSub")}</p>
            <a
              href="#app-download"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.08] border border-white/[0.10] text-white/60 text-[15px] font-semibold hover:bg-white/[0.12] active:bg-white/[0.16] transition-colors"
            >
              <Download size={16} />
              {t("bookDetail.downloadApp")}
            </a>
          </div>
        ) : (
          <PrimaryButton onClick={onStartLearning} className="py-4 text-[16px] flex items-center justify-center gap-2">
            <Play size={18} className="fill-white" />
            {isStarted ? t("bookDetail.continue") : t("bookDetail.startLearning")}
          </PrimaryButton>
        )}
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[320px] bg-[#12121e] border border-white/[0.08] rounded-3xl p-6 flex flex-col items-center"
            >
              <h3 className={`${serif} text-[20px] font-bold text-white/90 text-center`}>
                {t("bookDetail.confirmTitle")}
              </h3>
              <p className="text-white/35 text-[14px] text-center mt-3 leading-relaxed whitespace-pre-line">
                {t("bookDetail.confirmSub")}
              </p>
              <div className="flex flex-col gap-2.5 w-full mt-6">
                <PrimaryButton
                  onClick={onConfirmFreeBook}
                  className="py-3.5 text-[15px]"
                >
                  {t("bookDetail.confirmBtn")}
                </PrimaryButton>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancelConfirm}
                  className="text-white/30 hover:text-white/50 font-medium py-3 transition-colors text-[14px]"
                >
                  {t("bookDetail.confirmBack")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
