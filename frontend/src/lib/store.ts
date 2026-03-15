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
  presetAvatar: string | null;
}

export const PRESET_AVATARS = [
  { id: "moon", src: "/avatars/moon.svg", label: "Moon" },
  { id: "cat", src: "/avatars/cat.svg", label: "Cat" },
  { id: "feather", src: "/avatars/feather.svg", label: "Feather" },
  { id: "flower", src: "/avatars/flower.svg", label: "Flower" },
  { id: "mountain", src: "/avatars/mountain.svg", label: "Mountain" },
  { id: "eye", src: "/avatars/eye.svg", label: "Eye" },
  { id: "star", src: "/avatars/star.svg", label: "Star" },
  { id: "whale", src: "/avatars/whale.svg", label: "Whale" },
] as const;

// ── App Store ──

interface AppState {
  // User
  userId: string | null;
  setUserId: (id: string | null) => void;

  // Profile
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  setPresetAvatar: (avatarId: string | null) => void;

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

  // Daily goal tracking
  todayCompleted: number;
  todayDate: string;
  incrementTodayCompleted: () => void;

  // View state
  view: "universe" | "constellation" | "lesson" | "quiz" | "chat" | "complete";
  setView: (view: AppState["view"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  profile: { name: null, email: null, avatarUrl: null, presetAvatar: loadSetting<string | null>("presetAvatar", null) },
  setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
  setPresetAvatar: (avatarId) => {
    saveSetting("presetAvatar", avatarId);
    set((state) => ({ profile: { ...state.profile, presetAvatar: avatarId } }));
  },

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

  todayCompleted: (() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("cosmii-todayCompleted");
    const savedDate = localStorage.getItem("cosmii-todayDate");
    const today = new Date().toISOString().slice(0, 10);
    if (savedDate === today && saved) return parseInt(saved, 10) || 0;
    return 0;
  })(),
  todayDate: (() => {
    if (typeof window === "undefined") return new Date().toISOString().slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  })(),
  incrementTodayCompleted: () =>
    set((state) => {
      const today = new Date().toISOString().slice(0, 10);
      const count = state.todayDate === today ? state.todayCompleted + 1 : 1;
      if (typeof window !== "undefined") {
        localStorage.setItem("cosmii-todayCompleted", String(count));
        localStorage.setItem("cosmii-todayDate", today);
      }
      return { todayCompleted: count, todayDate: today };
    }),

  view: "universe",
  setView: (view) => set({ view }),
}));

// ── Settings Store ──

export type Language = "ko" | "en";
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
  language: (() => {
    if (typeof window === "undefined") return "ko" as Language;
    const saved = localStorage.getItem("cosmii-lang");
    if (saved) try { return JSON.parse(saved) as Language; } catch {}
    const browserLang = navigator.language?.slice(0, 2);
    return (browserLang === "ko" ? "ko" : "en") as Language;
  })(),
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
