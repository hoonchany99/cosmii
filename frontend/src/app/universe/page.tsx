"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, useSettingsStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import { HudOverlay } from "@/components/hud-overlay";
import { HomeView } from "@/components/home-view";
import { LessonConstellation } from "@/components/lesson-constellation";
import { ConceptDialogue } from "@/components/concept-dialogue";
import { QuizView } from "@/components/quiz-view";
import { SessionComplete } from "@/components/session-complete";
import { ProfileView } from "@/components/profile-view";
import { SettingsView } from "@/components/settings-view";
import { BookDetail } from "@/components/book-detail";
import { BookNotes } from "@/components/book-notes";
import { WarpOverlay } from "@/components/warp-overlay";
import { GoalToast } from "@/components/goal-toast";
import { Onboarding } from "@/components/onboarding";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CosmiiConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.CosmiiConstellation),
  { ssr: false },
);
const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);

import { getBookConstellation } from "@/lib/book-constellations";

const API = "";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
}

interface LessonListItem {
  lesson: {
    id: string;
    title: string;
    order_index: number;
    chapter: string;
    spark: string;
  };
  completed: boolean;
  score: number | null;
  review_needed: boolean;
}

interface LessonDetail {
  lesson: {
    id: string;
    book_id: string;
    order_index: number;
    title: string;
    chapter: string;
    chapter_title: string;
    part: number;
    total_parts: number;
    dialogue: { speaker: string; text: string; highlight?: string | null }[];
    spark: string;
    cliffhanger: string;
  };
  quizzes: {
    id: string;
    lesson_id: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }[];
}

type View = "home" | "bookDetail" | "constellation" | "dialogue" | "quiz" | "complete" | "profile" | "settings" | "notes";

export default function UniversePage() {
  const [view, setView] = useState<View>("home");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDetail | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [quizResults, setQuizResults] = useState({ score: 0, total: 0, correct: 0 });
  const [completeData, setCompleteData] = useState({ xpEarned: 0, streakDays: 0, levelUp: false });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const [warpActive, setWarpActive] = useState(false);
  const pendingViewRef = useRef<View | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const { stats, setStats, setProfile, incrementTodayCompleted, todayCompleted } = useAppStore();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const [showGoalToast, setShowGoalToast] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => { document.body.classList.remove("no-scroll"); };
  }, []);

  useEffect(() => {
    fetch(`${API}/api/books?language=${language}`)
      .then((r) => r.json())
      .then((data) => setBooks(data))
      .catch(() => {});

    fetch(`${API}/api/user/stats`)
      .then((r) => r.json())
      .then((data) => {
        setStats({
          xp: data.xp ?? 0,
          streakDays: data.streak_days ?? 0,
          lastStudyDate: data.last_study_date ?? null,
          level: data.level ?? 1,
        });
        if ((data.xp ?? 0) === 0) {
          setShowOnboarding(true);
        }
        setStatsLoaded(true);
      })
      .catch(() => { setStatsLoaded(true); });

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setProfile({
          name: meta?.full_name ?? meta?.name ?? null,
          email: data.user.email ?? null,
          avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
        });
      }
    });
  }, [setStats, setProfile, language]);

  const warpTo = useCallback((targetView: View, beforeSwitch?: () => void) => {
    pendingViewRef.current = targetView;
    pendingActionRef.current = beforeSwitch ?? null;
    setWarpActive(true);
  }, []);

  const handleWarpMidpoint = useCallback(() => {
    pendingActionRef.current?.();
    if (pendingViewRef.current) {
      setView(pendingViewRef.current);
    }
  }, []);

  const handleWarpComplete = useCallback(() => {
    setWarpActive(false);
    pendingViewRef.current = null;
    pendingActionRef.current = null;
  }, []);

  const handleSelectBook = useCallback(async (book: Book) => {
    setSelectedBook(book);
    try {
      const res = await fetch(`${API}/api/books/${book.id}/lessons?language=${language}`);
      const data = await res.json();
      setLessons(data);
    } catch {
      setLessons([]);
    }
    setView("bookDetail");
  }, [language]);

  const handleStartLearning = useCallback(() => {
    warpTo("constellation");
  }, [warpTo]);

  const handleSelectLesson = useCallback(async (lessonId: string) => {
    try {
      const res = await fetch(`${API}/api/lessons/${lessonId}?language=${language}`);
      const data: LessonDetail = await res.json();
      const idx = lessons.findIndex((l) => l.lesson.id === lessonId);
      setCurrentLesson(data);
      setCurrentLessonIndex(idx >= 0 ? idx : 0);
      setView("dialogue");
    } catch (e) {
      console.error("Failed to load lesson:", e);
    }
  }, [lessons, language]);

  const handleDialogueComplete = useCallback(() => {
    if (currentLesson && currentLesson.quizzes.length > 0) {
      setView("quiz");
    } else {
      handleQuizComplete(100, 0, 0);
    }
  }, [currentLesson]);

  const handleQuizComplete = useCallback(
    async (score: number, total: number, correct: number) => {
      setQuizResults({ score, total, correct });

      const allWrong = total > 0 && correct === 0;

      if (currentLesson && !allWrong) {
        try {
          const res = await fetch(`${API}/api/lessons/${currentLesson.lesson.id}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score, total_questions: total, correct_answers: correct }),
          });
          const data = await res.json();
          setCompleteData({
            xpEarned: data.xp_earned ?? 0,
            streakDays: data.streak_days ?? 0,
            levelUp: data.level_up ?? false,
          });
          setStats({
            ...stats,
            xp: stats.xp + (data.xp_earned ?? 0),
            streakDays: data.streak_days ?? stats.streakDays,
            level: data.level ?? stats.level,
          });

          incrementTodayCompleted();
          const newCount = todayCompleted + 1;
          if (newCount === dailyGoal) {
            setTimeout(() => setShowGoalToast(true), 1200);
          }
        } catch {
          setCompleteData({ xpEarned: 50, streakDays: stats.streakDays, levelUp: false });
        }
      } else if (allWrong) {
        setCompleteData({ xpEarned: 0, streakDays: stats.streakDays, levelUp: false });
      }
      setView("complete");
    },
    [currentLesson, stats, setStats, incrementTodayCompleted, todayCompleted, dailyGoal],
  );

  const refreshLessons = useCallback(async () => {
    if (!selectedBook) return;
    try {
      const r = await fetch(`${API}/api/books/${selectedBook.id}/lessons?language=${language}`);
      const data = await r.json();
      setLessons(data);
    } catch { /* ignore */ }
  }, [selectedBook, language]);

  const handleNextLesson = useCallback(async () => {
    const nextIdx = currentLessonIndex + 1;
    if (nextIdx < lessons.length) {
      handleSelectLesson(lessons[nextIdx].lesson.id);
    } else {
      await refreshLessons();
      setView("constellation");
    }
  }, [currentLessonIndex, lessons, handleSelectLesson, refreshLessons]);

  const handleRetryLesson = useCallback(() => {
    if (currentLesson) {
      setView("dialogue");
    }
  }, [currentLesson]);

  const handleGoToList = useCallback(async () => {
    await refreshLessons();
    setView("constellation");
  }, [refreshLessons]);

  const handleGoHome = useCallback(async () => {
    await refreshLessons();
    warpTo("home");
  }, [warpTo, refreshLessons]);

  const handleBackToHome = useCallback(() => {
    warpTo("home");
  }, [warpTo]);

  const handleContinueLearning = useCallback(() => {
    if (selectedBook && lessons.length > 0) {
      warpTo("constellation");
    }
  }, [selectedBook, lessons, warpTo]);

  const progressPercent = currentLesson
    ? ((currentLessonIndex + 1) / Math.max(lessons.length, 1)) * 100
    : 0;

  const chapterSummaries = useMemo(() => {
    const map = new Map<string, { chapter: string; lessonCount: number; completedCount: number }>();
    lessons.forEach((l) => {
      const ch = l.lesson.chapter || t("universe.other");
      if (!map.has(ch)) map.set(ch, { chapter: ch, lessonCount: 0, completedCount: 0 });
      const entry = map.get(ch)!;
      entry.lessonCount++;
      if (l.completed) entry.completedCount++;
    });
    return Array.from(map.values());
  }, [lessons]);

  const fadeScale = {
    initial: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  };

  const slideRight = {
    initial: { opacity: 0, x: 40, filter: "blur(4px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -30, filter: "blur(4px)" },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  };

  if (!statsLoaded) {
    return (
      <div className="h-screen w-screen bg-[#050510] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Suspense fallback={null}>
            <CosmiiConstellation animate={false} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#050510] relative">
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050510] relative">
      <WarpOverlay
        active={warpActive}
        onMidpoint={handleWarpMidpoint}
        onComplete={handleWarpComplete}
      />
      <GoalToast show={showGoalToast} goal={dailyGoal} onDone={() => setShowGoalToast(false)} />

      {(view === "constellation" || view === "dialogue" || view === "quiz") && selectedBook && (
        <div className="absolute inset-0 z-0">
          <ImageConstellation
              imageSrc={getBookConstellation(selectedBook.id).image}
              color={selectedBook.color}
              animate={false}
              dim
              dimOpacity={view === "quiz" ? 0.25 : 0.35}
            />
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div key="home" {...fadeScale} className="absolute inset-0">
            <HudOverlay onOpenProfile={() => setView("profile")} />
            <HomeView
              books={books}
              onSelectBook={handleSelectBook}
              activeSession={
                selectedBook && lessons.length > 0
                  ? {
                      book: selectedBook,
                      completedLessons: lessons.filter((l) => l.completed).length,
                      totalLessons: lessons.length,
                    }
                  : null
              }
              onContinueLearning={handleContinueLearning}
            />
          </motion.div>
        )}

        {view === "bookDetail" && selectedBook && (
          <motion.div key="bookDetail" {...slideRight} className="absolute inset-0">
            <BookDetail
              book={selectedBook}
              chapters={chapterSummaries}
              completedLessons={lessons.filter((l) => l.completed).length}
              totalLessons={lessons.length}
              onBack={() => setView("home")}
              onStartLearning={handleStartLearning}
            />
          </motion.div>
        )}

        {view === "constellation" && selectedBook && (
          <motion.div key="constellation" {...fadeScale} className="absolute inset-0 z-10">
            <LessonConstellation
              bookId={selectedBook.id}
              bookTitle={selectedBook.title}
              bookAuthor={selectedBook.author}
              completedCount={lessons.filter((l) => l.completed).length}
              totalCount={lessons.length}
              lessons={lessons.map((l, i) => {
                const firstIncomplete = lessons.findIndex((x) => !x.completed);
                return {
                  id: l.lesson.id,
                  title: l.lesson.title,
                  chapter: l.lesson.chapter,
                  orderIndex: l.lesson.order_index,
                  completed: l.completed,
                  isCurrent: i === firstIncomplete,
                  reviewNeeded: l.review_needed,
                  locked: i > firstIncomplete && !l.completed,
                };
              })}
              onBack={handleBackToHome}
              onSelectLesson={handleSelectLesson}
              onOpenNotes={() => setView("notes")}
            />
          </motion.div>
        )}

        {view === "dialogue" && currentLesson && (
          <motion.div key="dialogue" {...slideRight} className="absolute inset-0">
            <ConceptDialogue
              bookId={selectedBook?.id ?? ""}
              bookTitle={selectedBook?.title ?? ""}
              bookAuthor={selectedBook?.author ?? ""}
              chapter={currentLesson.lesson.chapter}
              lessonTitle={currentLesson.lesson.title}
              currentLesson={currentLessonIndex + 1}
              totalLessons={lessons.length}
              progressPercent={progressPercent}
              dialogue={currentLesson.lesson.dialogue}
              spark={currentLesson.lesson.spark}
              isFirstInChapter={
                currentLessonIndex === 0 ||
                lessons[currentLessonIndex - 1]?.lesson.chapter !== currentLesson.lesson.chapter
              }
              onBack={() => setView("constellation")}
              onComplete={handleDialogueComplete}
            />
          </motion.div>
        )}

        {view === "quiz" && currentLesson && (
          <motion.div key="quiz" {...slideRight} className="absolute inset-0">
            <QuizView
              quizzes={currentLesson.quizzes.map((q) => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctIndex: q.correct_index,
                explanation: q.explanation,
              }))}
              progressPercent={progressPercent}
              onBack={() => setView("dialogue")}
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}

        {view === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="absolute inset-0"
          >
            <SessionComplete
              correctRate={quizResults.total > 0 ? Math.round((quizResults.correct / quizResults.total) * 100) : 100}
              correctCount={quizResults.correct}
              totalQuestions={quizResults.total}
              xpEarned={completeData.xpEarned}
              streakDays={completeData.streakDays}
              levelUp={completeData.levelUp}
              onNextLesson={handleNextLesson}
              onGoHome={handleGoHome}
              onRetry={handleRetryLesson}
              onGoToList={handleGoToList}
            />
          </motion.div>
        )}

        {view === "profile" && (
          <motion.div key="profile" {...slideRight} className="absolute inset-0">
            <ProfileView
              totalBooks={books.length}
              completedLessons={lessons.filter((l) => l.completed).length}
              totalLessons={lessons.length}
              onBack={() => setView("home")}
              onOpenSettings={() => setView("settings")}
            />
          </motion.div>
        )}

        {view === "settings" && (
          <motion.div key="settings" {...slideRight} className="absolute inset-0">
            <SettingsView
              onBack={() => setView("profile")}
              onLogout={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              onResetProgress={async () => {
                await fetch(`${API}/api/user/reset`, { method: "DELETE" });
                setStats({ xp: 0, streakDays: 0, lastStudyDate: null, level: 1 });
                setLessons((prev) =>
                  prev.map((l) => ({ ...l, completed: false, score: null, review_needed: false })),
                );
              }}
            />
          </motion.div>
        )}

        {view === "notes" && selectedBook && (
          <motion.div key="notes" {...slideRight} className="absolute inset-0">
            <BookNotes
              bookId={selectedBook.id}
              bookTitle={selectedBook.title}
              bookColor={selectedBook.color}
              notes={lessons
                .filter((l) => l.completed)
                .map((l) => ({
                  lessonTitle: l.lesson.title,
                  chapter: l.lesson.chapter || "",
                  spark: l.lesson.spark || "",
                  highlights: [],
                }))}
              onBack={() => setView("constellation")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
