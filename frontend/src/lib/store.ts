import { create } from "zustand";

// ── User Stats ──

interface UserStats {
  xp: number;
  streakDays: number;
  lastStudyDate: string | null;
  level: number;
}

// ── Lesson Progress ──

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number | null;
  reviewNeeded: boolean;
}

// ── App Store ──

interface AppState {
  // User
  userId: string | null;
  setUserId: (id: string | null) => void;

  // Stats
  stats: UserStats;
  setStats: (stats: UserStats) => void;

  // Current book
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;

  // Lesson progress
  progress: Map<string, LessonProgress>;
  setProgress: (lessonId: string, p: LessonProgress) => void;

  // Current lesson session
  currentLessonId: string | null;
  setCurrentLessonId: (id: string | null) => void;

  // View state
  view: "universe" | "constellation" | "lesson" | "quiz" | "chat" | "complete";
  setView: (view: AppState["view"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  stats: { xp: 0, streakDays: 0, lastStudyDate: null, level: 1 },
  setStats: (stats) => set({ stats }),

  selectedBookId: null,
  setSelectedBookId: (id) => set({ selectedBookId: id }),

  progress: new Map(),
  setProgress: (lessonId, p) =>
    set((state) => {
      const next = new Map(state.progress);
      next.set(lessonId, p);
      return { progress: next };
    }),

  currentLessonId: null,
  setCurrentLessonId: (id) => set({ currentLessonId: id }),

  view: "universe",
  setView: (view) => set({ view }),
}));

// ── Chat Store (for free question mode) ──

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}));
