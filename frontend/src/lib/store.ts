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

// ── User Profile ──

interface UserProfile {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

// ── App Store ──

interface AppState {
  // User
  userId: string | null;
  setUserId: (id: string | null) => void;

  // Profile
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;

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

  profile: { name: null, email: null, avatarUrl: null },
  setProfile: (p) => set({ profile: p }),

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

// ── Settings Store ──

export type Language = "ko" | "en" | "ja" | "zh";
export type DailyGoal = 1 | 2 | 3 | 5;
export type Difficulty = "easy" | "normal" | "hard";

interface SettingsState {
  language: Language;
  dailyGoal: DailyGoal;
  difficulty: Difficulty;
  notifications: boolean;
  reminderHour: number;
  sound: boolean;

  setLanguage: (lang: Language) => void;
  setDailyGoal: (goal: DailyGoal) => void;
  setDifficulty: (d: Difficulty) => void;
  setNotifications: (v: boolean) => void;
  setReminderHour: (h: number) => void;
  setSound: (v: boolean) => void;
}

function loadSetting<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(`cosmii-${key}`);
  if (v === null) return fallback;
  try { return JSON.parse(v) as T; } catch { return v as unknown as T; }
}

function saveSetting(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(`cosmii-${key}`, JSON.stringify(value));
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: loadSetting<Language>("lang", "ko"),
  dailyGoal: loadSetting<DailyGoal>("dailyGoal", 2),
  difficulty: loadSetting<Difficulty>("difficulty", "normal"),
  notifications: loadSetting<boolean>("notifications", true),
  reminderHour: loadSetting<number>("reminderHour", 20),
  sound: loadSetting<boolean>("sound", true),

  setLanguage: (lang) => { saveSetting("lang", lang); set({ language: lang }); },
  setDailyGoal: (goal) => { saveSetting("dailyGoal", goal); set({ dailyGoal: goal }); },
  setDifficulty: (d) => { saveSetting("difficulty", d); set({ difficulty: d }); },
  setNotifications: (v) => { saveSetting("notifications", v); set({ notifications: v }); },
  setReminderHour: (h) => { saveSetting("reminderHour", h); set({ reminderHour: h }); },
  setSound: (v) => { saveSetting("sound", v); set({ sound: v }); },
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

// ── Legacy compat (used by old book-mind components still in tree) ──

interface LegacyChatState {
  messages: { role: string; content: string }[];
  conversationId: string | null;
}

const _sessions = new Map<string, LegacyChatState>();

function _key(bookIds: string[]): string {
  const sorted = [...bookIds].sort();
  return sorted.length === 1 ? `book::${sorted[0]}` : `books::${sorted.join("+")}`;
}

export function getChatState(bookIds: string[]): LegacyChatState {
  const k = _key(bookIds);
  if (!_sessions.has(k)) _sessions.set(k, { messages: [], conversationId: null });
  return _sessions.get(k)!;
}

export function setChatState(bookIds: string[], state: LegacyChatState): void {
  _sessions.set(_key(bookIds), state);
}
