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
  accessory: string | null;
}

export interface Accessory {
  id: string;
  name: string;
  nameEn: string;
  src: string;
  category: "head" | "face";
  price: number;
  offsetY: number;
}

export const ACCESSORIES: Accessory[] = [
  { id: "halo", name: "헤일로", nameEn: "Halo", src: "/accessories/halo.png", category: "head", price: 150, offsetY: -8 },
  { id: "bow", name: "리본", nameEn: "Bow", src: "/accessories/bow.png", category: "head", price: 250, offsetY: -8 },
  { id: "beanie", name: "비니", nameEn: "Beanie", src: "/accessories/beanie.png", category: "head", price: 400, offsetY: -10 },
  { id: "crown", name: "왕관", nameEn: "Crown", src: "/accessories/crown.png", category: "head", price: 600, offsetY: -12 },
  { id: "hat", name: "모자", nameEn: "Hat", src: "/accessories/hat.png", category: "head", price: 600, offsetY: -10 },
  { id: "party_hat", name: "파티 햇", nameEn: "Party Hat", src: "/accessories/party_hat.png", category: "head", price: 800, offsetY: -12 },
  { id: "headphones", name: "헤드폰", nameEn: "Headphones", src: "/accessories/headphones.png", category: "head", price: 1200, offsetY: -4 },
  { id: "sunglasses", name: "선글라스", nameEn: "Sunglasses", src: "/accessories/sunglasses.png", category: "face", price: 2000, offsetY: 4 },
];

const COSMII_NAMES = {
  ko: {
    adj: [
      "졸린", "호기심많은", "몽상하는", "배고픈", "용감한",
      "수줍은", "반짝이는", "떠다니는", "길잃은", "꿈꾸는",
      "느긋한", "엉뚱한", "설레는", "조용한", "심심한",
      "겁많은", "방황하는", "신비로운", "무모한", "따뜻한",
      "잠못드는", "서툰", "순수한", "까칠한", "배부른",
    ],
    noun: [
      "우주비행사", "별똥별", "책벌레", "독서가", "혜성",
      "성운", "우주먼지", "별지기", "행성", "소행성",
      "은하수여행자", "달팽이", "올빼미", "고양이", "해파리",
      "수달", "북극곰", "여우", "펭귄", "우주고래",
      "토끼", "다람쥐", "반딧불이", "인공위성", "망원경",
    ],
  },
  en: {
    adj: [
      "Sleepy", "Curious", "Dreamy", "Hungry", "Brave",
      "Shy", "Sparkly", "Drifting", "Lost", "Wandering",
      "Lazy", "Quirky", "Restless", "Quiet", "Bored",
      "Timid", "Mystic", "Reckless", "Cozy", "Fuzzy",
      "Nocturnal", "Clumsy", "Gentle", "Grumpy", "Fluffy",
    ],
    noun: [
      "Astronaut", "Stargazer", "Bookworm", "Explorer", "Comet",
      "Nebula", "Stardust", "Moonkeeper", "Planet", "Asteroid",
      "Voyager", "Snail", "Owl", "Cat", "Jellyfish",
      "Otter", "Polar Bear", "Fox", "Penguin", "Space Whale",
      "Rabbit", "Squirrel", "Firefly", "Satellite", "Telescope",
    ],
  },
};

export function generateCosmiiName(lang: "ko" | "en" = "ko"): string {
  const { adj, noun } = COSMII_NAMES[lang];
  const a = adj[Math.floor(Math.random() * adj.length)];
  const n = noun[Math.floor(Math.random() * noun.length)];
  const tag = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${a} ${n} #${tag}`;
}

export const PRESET_AVATARS = [
  { id: "pink", src: "/avatars/cosmii/pink.png", label: "Pink", color: "#F4B0C8", price: 0 },
  { id: "mint", src: "/avatars/cosmii/mint.png", label: "Mint", color: "#A2E4C4", price: 0 },
  { id: "lavender", src: "/avatars/cosmii/lavender.png", label: "Lavender", color: "#C4B0E8", price: 0 },
  { id: "peach", src: "/avatars/cosmii/peach.png", label: "Peach", color: "#F5CDA8", price: 80 },
  { id: "coral", src: "/avatars/cosmii/coral.png", label: "Coral", color: "#F098A0", price: 80 },
  { id: "yellow", src: "/avatars/cosmii/yellow.png", label: "Yellow", color: "#F5E8A0", price: 120 },
  { id: "blue", src: "/avatars/cosmii/blue.png", label: "Blue", color: "#8EB4F0", price: 120 },
  { id: "skyblue", src: "/avatars/cosmii/skyblue.png", label: "Sky Blue", color: "#A0D0E8", price: 150 },
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
  setAccessory: (accessoryId: string | null) => void;
  setName: (name: string) => void;

  // Stats
  stats: UserStats;
  setStats: (stats: UserStats) => void;

  // Current book
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;

  // Free book (web: one book free)
  freeBookId: string | null;
  setFreeBookId: (id: string) => void;
  clearFreeBookId: () => void;

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

  // Shop
  spentXP: number;
  unlockedItems: string[];
  setSpentXP: (v: number) => void;
  setUnlockedItems: (items: string[]) => void;
  purchaseItem: (itemId: string, cost: number) => boolean;

  // View state
  view: "universe" | "constellation" | "lesson" | "quiz" | "chat" | "complete";
  setView: (view: AppState["view"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),

  profile: { name: loadSetting<string | null>("profileName", null), email: null, avatarUrl: null, presetAvatar: loadSetting<string | null>("presetAvatar", "pink"), accessory: loadSetting<string | null>("accessory", null) },
  setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
  setPresetAvatar: (avatarId) => {
    saveSetting("presetAvatar", avatarId);
    set((state) => ({ profile: { ...state.profile, presetAvatar: avatarId } }));
  },
  setAccessory: (accessoryId) => {
    saveSetting("accessory", accessoryId);
    set((state) => ({ profile: { ...state.profile, accessory: accessoryId } }));
  },
  setName: (name) => {
    saveSetting("profileName", name);
    set((state) => ({ profile: { ...state.profile, name } }));
  },

  stats: { xp: 0, streakDays: 0, lastStudyDate: null, level: 1 },
  setStats: (stats) => set({ stats }),

  selectedBookId: null,
  setSelectedBookId: (id) => set({ selectedBookId: id }),

  freeBookId: loadSetting<string | null>("freeBookId", null),
  setFreeBookId: (id) => { saveSetting("freeBookId", id); set({ freeBookId: id }); },
  clearFreeBookId: () => { saveSetting("freeBookId", null); set({ freeBookId: null }); },

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

  spentXP: loadSetting<number>("spentXP", 0),
  unlockedItems: loadSetting<string[]>("unlockedItems", []),
  setSpentXP: (v) => { saveSetting("spentXP", v); set({ spentXP: v }); },
  setUnlockedItems: (items) => { saveSetting("unlockedItems", items); set({ unlockedItems: items }); },
  purchaseItem: (itemId, cost) => {
    const state = useAppStore.getState();
    const available = Math.max(0, state.stats.xp - state.spentXP);
    if (available < cost) return false;
    if (state.unlockedItems.includes(itemId)) return false;
    const newSpent = state.spentXP + cost;
    const newItems = [...state.unlockedItems, itemId];
    saveSetting("spentXP", newSpent);
    saveSetting("unlockedItems", newItems);
    set({ spentXP: newSpent, unlockedItems: newItems });
    fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spent_xp: newSpent, unlocked_items: newItems }),
    }).catch(() => {});
    return true;
  },

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
