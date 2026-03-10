"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase";
import { HudOverlay } from "@/components/hud-overlay";
import { HomeView } from "@/components/home-view";
import { LessonConstellation } from "@/components/lesson-constellation";
import { ConceptDialogue } from "@/components/concept-dialogue";
import { QuizView } from "@/components/quiz-view";
import { FreeQuestion } from "@/components/free-question";
import { SessionComplete } from "@/components/session-complete";
import { ProfileView } from "@/components/profile-view";
import { SettingsView } from "@/components/settings-view";
import { BookDetail } from "@/components/book-detail";
import { BookNotes } from "@/components/book-notes";
import { WarpOverlay } from "@/components/warp-overlay";
import { Onboarding } from "@/components/onboarding";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url: string | null;
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

type View = "home" | "bookDetail" | "constellation" | "dialogue" | "quiz" | "chat" | "complete" | "profile" | "settings" | "notes";

export default function UniversePage() {
  const [view, setView] = useState<View>("home");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDetail | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [quizResults, setQuizResults] = useState({ score: 0, total: 0, correct: 0 });
  const [completeData, setCompleteData] = useState({ xpEarned: 0, streakDays: 0, levelUp: false });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("cosmii-onboarded");
  });

  const [warpActive, setWarpActive] = useState(false);
  const pendingViewRef = useRef<View | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const { stats, setStats, setProfile } = useAppStore();

  useEffect(() => {
    fetch(`${API}/api/books`)
      .then((r) => r.json())
      .then((data) => setBooks(data))
      .catch(() => {});

    fetch(`${API}/api/user/stats`)
      .then((r) => r.json())
      .then((data) =>
        setStats({
          xp: data.xp ?? 0,
          streakDays: data.streak_days ?? 0,
          lastStudyDate: data.last_study_date ?? null,
          level: data.level ?? 1,
        })
      )
      .catch(() => {});

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
  }, [setStats, setProfile]);

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
      const res = await fetch(`${API}/api/books/${book.id}/lessons`);
      const data = await res.json();
      setLessons(data);
    } catch {
      setLessons([]);
    }
    setView("bookDetail");
  }, []);

  const handleStartLearning = useCallback(() => {
    warpTo("constellation");
  }, [warpTo]);

  const handleSelectLesson = useCallback(async (lessonId: string) => {
    try {
      const res = await fetch(`${API}/api/lessons/${lessonId}`);
      const data: LessonDetail = await res.json();
      const idx = lessons.findIndex((l) => l.lesson.id === lessonId);
      setCurrentLesson(data);
      setCurrentLessonIndex(idx >= 0 ? idx : 0);
      setView("dialogue");
    } catch (e) {
      console.error("Failed to load lesson:", e);
    }
  }, [lessons]);

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
        } catch {
          setCompleteData({ xpEarned: 50, streakDays: stats.streakDays, levelUp: false });
        }
      } else if (allWrong) {
        setCompleteData({ xpEarned: 0, streakDays: stats.streakDays, levelUp: false });
      }
      setView("complete");
    },
    [currentLesson, stats, setStats],
  );

  const handleNextLesson = useCallback(() => {
    const nextIdx = currentLessonIndex + 1;
    if (nextIdx < lessons.length) {
      handleSelectLesson(lessons[nextIdx].lesson.id);
    } else {
      setView("constellation");
    }
  }, [currentLessonIndex, lessons, handleSelectLesson]);

  const handleRetryLesson = useCallback(() => {
    if (currentLesson) {
      setView("dialogue");
    }
  }, [currentLesson]);

  const handleGoToList = useCallback(async () => {
    if (selectedBook) {
      try {
        const r = await fetch(`${API}/api/books/${selectedBook.id}/lessons`);
        const data = await r.json();
        setLessons(data);
      } catch { /* ignore */ }
    }
    setView("constellation");
  }, [selectedBook]);

  const handleGoHome = useCallback(async () => {
    if (selectedBook) {
      try {
        const r = await fetch(`${API}/api/books/${selectedBook.id}/lessons`);
        const data = await r.json();
        setLessons(data);
      } catch { /* ignore */ }
    }
    warpTo("home");
  }, [warpTo, selectedBook]);

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
      const ch = l.lesson.chapter || "기타";
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
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  const slideRight = {
    initial: { opacity: 0, x: 40, filter: "blur(4px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -30, filter: "blur(4px)" },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  };

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
          <motion.div key="constellation" {...fadeScale} className="absolute inset-0">
            <LessonConstellation
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
                  locked: i > firstIncomplete + 1 && !l.completed,
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
              bookAuthor={selectedBook?.author ?? ""}
              lessonTitle={currentLesson.lesson.title}
              currentLesson={currentLessonIndex + 1}
              totalLessons={lessons.length}
              progressPercent={progressPercent}
              dialogue={currentLesson.lesson.dialogue}
              spark={currentLesson.lesson.spark}
              onBack={() => setView("constellation")}
              onComplete={handleDialogueComplete}
              onAskQuestion={() => setView("chat")}
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

        {view === "chat" && selectedBook && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <FreeQuestion
              bookId={selectedBook.id}
              lessonContext={currentLesson?.lesson.dialogue.map((d) => d.text).join(" ").slice(0, 500)}
              onBack={() => setView(currentLesson ? "dialogue" : "constellation")}
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
            <SettingsView onBack={() => setView("profile")} />
          </motion.div>
        )}

        {view === "notes" && selectedBook && (
          <motion.div key="notes" {...slideRight} className="absolute inset-0">
            <BookNotes
              bookTitle={selectedBook.title}
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
