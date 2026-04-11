"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, useSettingsStore, generateCosmiiName } from "@/lib/store";
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
import { LibraryView } from "@/components/library-view";
import { WarpOverlay } from "@/components/warp-overlay";
import { GoalToast, LevelUpToast, AppDownloadToast } from "@/components/goal-toast";
import { TabBar } from "@/components/tab-bar";
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

interface ReadingBook {
  id: string;
  title: string;
  author: string;
  color: string;
  cover_url?: string | null;
  completedLessons: number;
  totalLessons: number;
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

type View = "home" | "universe" | "constellation" | "dialogue" | "quiz" | "complete" | "profile" | "settings" | "notes";

export default function UniversePage() {
  const [view, setView] = useState<View>("home");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDetail | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [quizResults, setQuizResults] = useState({ score: 0, total: 0, correct: 0 });
  const [completeData, setCompleteData] = useState({ xpEarned: 0, streakDays: 0, levelUp: false });

  const [readingBooks, setReadingBooks] = useState<ReadingBook[]>([]);

  const [showBookDetail, setShowBookDetail] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [detailLessons, setDetailLessons] = useState<LessonListItem[]>([]);

  const [statsLoaded, setStatsLoaded] = useState(false);

  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const [warpActive, setWarpActive] = useState(false);
  const pendingViewRef = useRef<View | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const { stats, setStats, setProfile, setPresetAvatar, setAccessory, setName, setSpentXP, setUnlockedItems, incrementTodayCompleted, todayCompleted, freeBookId, setFreeBookId, clearFreeBookId } = useAppStore();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const [showGoalToast, setShowGoalToast] = useState(false);
  const [showLevelUpToast, setShowLevelUpToast] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);
  const [showFreeBookConfirm, setShowFreeBookConfirm] = useState(false);
  const [showAppToast, setShowAppToast] = useState(false);
  const completedCountRef = useRef(0);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => { document.body.classList.remove("no-scroll"); };
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    const updated = books.find((b) => b.id === selectedBook.id);
    if (updated && updated.title !== selectedBook.title) {
      setSelectedBook(updated);
    }
  }, [books, selectedBook]);

  useEffect(() => {
    if (view === "constellation" && selectedBook) {
      fetch(`${API}/api/books/${selectedBook.id}/lessons?language=${language}`)
        .then((r) => r.json())
        .then((data) => setLessons(data))
        .catch(() => {});
    }
  }, [view, selectedBook, language]);

  useEffect(() => {
    fetch(`${API}/api/books?language=${language}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBooks(data);
      })
      .catch(() => {});

    const migratedKey = "cosmii-migrated";
    const needsMigration = typeof window !== "undefined" && !localStorage.getItem(migratedKey);

    const AVATAR_IDS = ["pink", "mint", "peach", "coral", "yellow", "blue", "skyblue", "lavender"];

    const loadStats = () =>
      fetch(`${API}/api/user/stats`)
        .then((r) => r.json())
        .then(async (data) => {
          if (data.error) return;
          setStats({
            xp: data.xp ?? 0,
            streakDays: data.streak_days ?? 0,
            lastStudyDate: data.last_study_date ?? null,
            level: data.level ?? 1,
          });

          let nickname = data.nickname as string | null;
          let presetAvatar = data.preset_avatar as string | null;
          const accessory = data.accessory as string | null;
          const needsInit = !nickname || !presetAvatar;

          if (!nickname) {
            nickname = generateCosmiiName(language);
          }
          if (!presetAvatar) {
            presetAvatar = AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)];
          }

          if (needsInit) {
            try {
              await fetch(`${API}/api/user/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, preset_avatar: presetAvatar }),
              });
            } catch {}
          }

          setName(nickname);
          setPresetAvatar(presetAvatar);
          setAccessory(accessory);

          if (typeof data.spent_xp === "number") setSpentXP(data.spent_xp);
          if (Array.isArray(data.unlocked_items)) setUnlockedItems(data.unlocked_items);

          if ((data.xp ?? 0) === 0 && !localStorage.getItem("cosmii-onboarded")) {
            window.location.href = "/onboarding";
            return;
          }
          setStatsLoaded(true);
        })
        .catch(() => { setStatsLoaded(true); });

    if (needsMigration) {
      fetch(`${API}/api/user/migrate`, { method: "POST" })
        .then((r) => r.json())
        .then(() => {
          localStorage.setItem(migratedKey, "1");
          loadStats();
        })
        .catch(() => loadStats());
    } else {
      loadStats();
    }

    fetch(`${API}/api/user/reading?language=${language}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setReadingBooks(data); })
      .catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setProfile({ email: data.user.email ?? null });
      }
    });
  }, [setStats, setProfile, setName, setPresetAvatar, setAccessory, setSpentXP, setUnlockedItems, language]);

  const demoBookHandled = useRef(false);
  useEffect(() => {
    if (demoBookHandled.current || books.length === 0) return;
    const demoBookId = localStorage.getItem("cosmii-demo-book");
    if (!demoBookId) return;
    demoBookHandled.current = true;
    const book = books.find((b) => b.id === demoBookId);
    if (!book) return;
    setSelectedBook(book);
    if (!freeBookId) setFreeBookId(book.id);
    fetch(`${API}/api/books/${book.id}/lessons?language=${language}`)
      .then((r) => r.json())
      .then(async (data: LessonListItem[]) => {
        const demoScore = localStorage.getItem("cosmii-demo-score");
        const firstLesson = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (demoScore && firstLesson && !firstLesson.completed) {
          try {
            const score = parseInt(demoScore, 10) || 100;
            const correct = Math.round((score / 100) * 2);
            await fetch(`${API}/api/lessons/${firstLesson.lesson.id}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ score, total_questions: 2, correct_answers: correct }),
            });
            firstLesson.completed = true;
            firstLesson.score = score;
          } catch {}
        }
        localStorage.removeItem("cosmii-demo-book");
        localStorage.removeItem("cosmii-demo-score");
        setLessons(data);
        setView("constellation");
      })
      .catch(() => {});
  }, [books, freeBookId, setFreeBookId, language]);

  // freeBookId가 있으면 홈 화면에서도 해당 책과 레슨 데이터 자동 로드
  const freeBookLoaded = useRef(false);
  useEffect(() => {
    if (freeBookLoaded.current || books.length === 0 || !freeBookId) return;
    if (selectedBook) return; // 이미 선택된 책이 있으면 스킵
    const book = books.find((b) => b.id === freeBookId);
    if (!book) return;
    freeBookLoaded.current = true;
    setSelectedBook(book);
    fetch(`${API}/api/books/${book.id}/lessons?language=${language}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLessons(data); })
      .catch(() => {});
  }, [books, freeBookId, selectedBook, language]);

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

  const handleSelectBook = useCallback((book: Book) => {
    setDetailBook(book);
    setDetailLessons([]);
    setShowBookDetail(true);
    fetch(`${API}/api/books/${book.id}/lessons?language=${language}`)
      .then((r) => r.json())
      .then((data) => setDetailLessons(data))
      .catch(() => setDetailLessons([]));
  }, [language]);

  const applyDetailToMain = useCallback(() => {
    if (!detailBook) return;
    const isSameBook = selectedBook?.id === detailBook.id;
    setSelectedBook(detailBook);
    if (!isSameBook || detailLessons.length > 0) {
      setLessons(detailLessons);
    }
  }, [detailBook, detailLessons, selectedBook]);

  const handleStartLearning = useCallback(() => {
    if (!freeBookId) {
      setShowFreeBookConfirm(true);
      return;
    }
    applyDetailToMain();
    setShowBookDetail(false);
    warpTo("constellation");
  }, [warpTo, freeBookId, applyDetailToMain]);

  const handleConfirmFreeBook = useCallback(() => {
    if (detailBook) {
      setFreeBookId(detailBook.id);
      applyDetailToMain();
      setShowFreeBookConfirm(false);
      setShowBookDetail(false);
      warpTo("constellation");
    }
  }, [detailBook, setFreeBookId, warpTo, applyDetailToMain]);

  const handleCancelConfirm = useCallback(() => {
    setShowFreeBookConfirm(false);
  }, []);

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

          setLessons((prev) =>
            prev.map((l) =>
              l.lesson.id === currentLesson.lesson.id
                ? { ...l, completed: true, score }
                : l,
            ),
          );

          if (data.level_up) {
            setLevelUpLevel(data.level ?? stats.level + 1);
            setTimeout(() => setShowLevelUpToast(true), 800);
          }

          incrementTodayCompleted();
          const newCount = todayCompleted + 1;
          if (newCount === dailyGoal) {
            setTimeout(() => setShowGoalToast(true), data.level_up ? 4800 : 1200);
          }

          completedCountRef.current += 1;
          if (completedCountRef.current % 2 === 0) {
            const delay = data.level_up ? 6000 : newCount === dailyGoal ? 5500 : 2000;
            setTimeout(() => setShowAppToast(true), delay);
          }

          fetch(`${API}/api/user/reading?language=${language}`)
            .then((r) => r.json())
            .then((rd) => { if (Array.isArray(rd)) setReadingBooks(rd); })
            .catch(() => {});
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

  const handleNextLesson = useCallback(async () => {
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

  const handleGoToList = useCallback(() => {
    setView("constellation");
  }, []);

  const handleGoHome = useCallback(() => {
    warpTo("home");
  }, [warpTo]);

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

  const detailChapterSummaries = useMemo(() => {
    const map = new Map<string, { chapter: string; lessonCount: number; completedCount: number }>();
    detailLessons.forEach((l) => {
      const ch = l.lesson.chapter || t("universe.other");
      if (!map.has(ch)) map.set(ch, { chapter: ch, lessonCount: 0, completedCount: 0 });
      const entry = map.get(ch)!;
      entry.lessonCount++;
      if (l.completed) entry.completedCount++;
    });
    return Array.from(map.values());
  }, [detailLessons]);

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
      <div className="h-screen w-screen overflow-hidden bg-[#020208] relative md:flex md:items-center md:justify-center">
        <div className="phone-frame relative w-full h-full md:w-[430px] md:h-[90vh] md:max-h-[932px] md:rounded-[2.5rem] overflow-hidden bg-[#060612]" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#020208] relative md:flex md:items-center md:justify-center">
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full bg-[#a78bfa]/[0.04] blur-[120px]" />
      </div>
      <div className="phone-frame relative w-full h-full md:w-[430px] md:h-[90vh] md:max-h-[932px] md:rounded-[2.5rem] md:border md:border-white/[0.06] md:shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_80px_rgba(167,139,250,0.06)] overflow-hidden bg-[#050510]">
      <WarpOverlay
        active={warpActive}
        onMidpoint={handleWarpMidpoint}
        onComplete={handleWarpComplete}
      />
      <LevelUpToast show={showLevelUpToast} newLevel={levelUpLevel} onDone={() => setShowLevelUpToast(false)} />
      <GoalToast show={showGoalToast} goal={dailyGoal} onDone={() => setShowGoalToast(false)} />
      <AppDownloadToast show={showAppToast} onDone={() => setShowAppToast(false)} />

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div key="home" {...fadeScale} className="absolute inset-0">
            <HomeView
              books={books}
              onSelectBook={handleSelectBook}
              freeBookId={freeBookId}
              readingBooks={readingBooks}
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

        {view === "universe" && (
          <motion.div key="universe" {...fadeScale} className="absolute inset-0">
            <LibraryView
              books={books}
              freeBookId={freeBookId}
              readingBooks={readingBooks}
              activeSession={
                selectedBook && lessons.length > 0
                  ? {
                      book: selectedBook,
                      completedLessons: lessons.filter((l) => l.completed).length,
                      totalLessons: lessons.length,
                    }
                  : null
              }
              onSelectBook={handleSelectBook}
              onContinueLearning={handleContinueLearning}
            />
          </motion.div>
        )}


        {view === "constellation" && selectedBook && (
          <motion.div key="constellation" {...fadeScale} className="absolute inset-0 z-10">
            <LessonConstellation
              bookId={selectedBook.id}
              bookTitle={selectedBook.title}
              bookAuthor={selectedBook.author}
              bookColor={selectedBook.color}
              bookCoverUrl={selectedBook.cover_url}
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
              isLastLesson={currentLessonIndex + 1 >= lessons.length && lessons.every((l) => l.completed || l.lesson.id === currentLesson?.lesson.id)}
              completedLessons={lessons.filter((l) => l.completed).length}
              totalLessons={lessons.length}
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
              readingBooks={readingBooks}
              onOpenSettings={() => setView("settings")}
              isTab
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
                clearFreeBookId();
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

      {(view === "home" || view === "universe" || view === "profile") && (
        <TabBar
          activeTab={view as "home" | "universe" | "profile"}
          onTabChange={(tab) => setView(tab)}
        />
      )}

      {/* Book Detail Bottom Sheet */}
      <AnimatePresence>
        {showBookDetail && detailBook && (
          <>
            <motion.div
              key="detail-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-40 bg-black/50"
              onClick={() => { setShowFreeBookConfirm(false); setShowBookDetail(false); }}
            />
            <motion.div
              key="detail-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{ height: "92%" }}
            >
              <BookDetail
                book={detailBook}
                chapters={detailChapterSummaries}
                completedLessons={detailLessons.filter((l) => l.completed).length}
                totalLessons={detailLessons.length}
                locked={freeBookId !== null && freeBookId !== detailBook.id}
                showConfirm={showFreeBookConfirm}
                onBack={() => { setShowFreeBookConfirm(false); setShowBookDetail(false); }}
                onStartLearning={handleStartLearning}
                onConfirmFreeBook={handleConfirmFreeBook}
                onCancelConfirm={handleCancelConfirm}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
