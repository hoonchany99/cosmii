"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Globe,
  Check,
  Bell,
  Moon,
  Volume2,
  Info,
  ChevronRight,
  Target,
  Clock,
  Gauge,
  Trash2,
  LogOut,
  MessageCircle,
  FileText,
  Shield,
} from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import {
  useSettingsStore,
  type Language,
  type DailyGoal,
  type Difficulty,
} from "@/lib/store";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const GearConstellation = dynamic(
  () => import("@/components/gear-constellation").then((m) => m.GearConstellation),
  { ssr: false },
);

const serif = "font-[var(--font-serif)]";

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "ko", label: "한국어", native: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", native: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", native: "中文", flag: "🇨🇳" },
];

const DAILY_GOALS: { value: DailyGoal; label: string; desc: string; emoji: string }[] = [
  { value: 1, label: "가볍게", desc: "하루 1탐험", emoji: "🌱" },
  { value: 2, label: "꾸준히", desc: "하루 2탐험", emoji: "⭐" },
  { value: 3, label: "열심히", desc: "하루 3탐험", emoji: "🔥" },
  { value: 5, label: "몰입!", desc: "하루 5탐험", emoji: "🚀" },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: "easy", label: "쉬움", desc: "핵심만 간단하게", color: "text-emerald-400" },
  { value: "normal", label: "보통", desc: "적당한 깊이로", color: "text-indigo-400" },
  { value: "hard", label: "심화", desc: "깊이 있는 학습", color: "text-amber-400" },
];

const REMINDER_HOURS = [7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 21, 22];

function SettingRow({
  icon,
  label,
  value,
  onClick,
  delay,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  delay: number;
  destructive?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl border transition-colors select-none ${
        destructive
          ? "bg-red-500/[0.04] border-red-500/[0.10] hover:bg-red-500/[0.08] active:bg-red-500/[0.12]"
          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] active:bg-white/[0.08]"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        destructive ? "bg-red-500/10" : "bg-white/[0.06]"
      }`}>
        {icon}
      </div>
      <span className={`text-[15px] font-medium flex-1 text-left ${
        destructive ? "text-red-400/80" : "text-white/80"
      }`}>
        {label}
      </span>
      {value && (
        <span className="text-white/35 text-[13px] font-medium mr-1">{value}</span>
      )}
      {!destructive && <ChevronRight size={16} className="text-white/20" />}
    </motion.button>
  );
}

function ToggleRow({
  icon,
  label,
  sublabel,
  enabled,
  onToggle,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  enabled: boolean;
  onToggle: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
    >
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white/80 text-[15px] font-medium block">{label}</span>
        {sublabel && <span className="text-white/30 text-[12px]">{sublabel}</span>}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`w-[50px] h-[28px] rounded-full p-[3px] transition-colors flex-shrink-0 ${
          enabled ? "bg-indigo-500" : "bg-white/10"
        }`}
      >
        <motion.div
          className="w-[22px] h-[22px] bg-white rounded-full shadow-md"
          animate={{ x: enabled ? 22 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </motion.div>
  );
}

function SectionLabel({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="text-white/30 text-[11px] uppercase tracking-[0.15em] font-bold px-1 mb-2.5 block"
    >
      {text}
    </motion.span>
  );
}

type SheetType = "language" | "dailyGoal" | "difficulty" | "reminderTime" | "resetConfirm" | null;

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const settings = useSettingsStore();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  const currentLang = LANGUAGES.find((l) => l.code === settings.language) ?? LANGUAGES[0];
  const currentGoal = DAILY_GOALS.find((g) => g.value === settings.dailyGoal) ?? DAILY_GOALS[1];
  const currentDiff = DIFFICULTIES.find((d) => d.value === settings.difficulty) ?? DIFFICULTIES[1];

  const formatHour = (h: number) => {
    if (h === 0) return "오전 12시";
    if (h < 12) return `오전 ${h}시`;
    if (h === 12) return "오후 12시";
    return `오후 ${h - 12}시`;
  };

  const handleReset = () => {
    setActiveSheet(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="indigo" />

      {/* Header */}
      <div className="absolute top-14 w-full px-5 flex items-center z-30">
        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors p-2 -ml-2 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h2 className={`${serif} text-white/80 font-bold text-[18px] tracking-wide ml-2`}>
          설정
        </h2>
      </div>

      <div className="absolute inset-0 overflow-y-auto pb-20 z-10">
        {/* Gear Constellation Hero */}
        <div className="relative w-full h-[180px] overflow-hidden">
          <Suspense fallback={<div className="w-full h-full" />}>
            <div className="absolute inset-0 opacity-30">
              <GearConstellation animate={false} />
            </div>
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]" />
        </div>

        <div className="px-5 -mt-4">

        {/* ─── 학습 설정 ─── */}
        <div className="mb-6">
          <SectionLabel text="학습 설정" delay={0.05} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Globe size={17} className="text-indigo-400" />}
              label="학습 언어"
              value={`${currentLang.flag} ${currentLang.native}`}
              onClick={() => setActiveSheet("language")}
              delay={0.08}
            />
            <SettingRow
              icon={<Target size={17} className="text-emerald-400" />}
              label="하루 학습 목표"
              value={`${currentGoal.emoji} ${currentGoal.label}`}
              onClick={() => setActiveSheet("dailyGoal")}
              delay={0.11}
            />
            <SettingRow
              icon={<Gauge size={17} className="text-amber-400" />}
              label="학습 난이도"
              value={currentDiff.label}
              onClick={() => setActiveSheet("difficulty")}
              delay={0.14}
            />
          </div>
        </div>

        {/* ─── 알림 ─── */}
        <div className="mb-6">
          <SectionLabel text="알림" delay={0.17} />
          <div className="flex flex-col gap-2">
            <ToggleRow
              icon={<Bell size={17} className="text-amber-400" />}
              label="학습 리마인더"
              sublabel={settings.notifications ? `매일 ${formatHour(settings.reminderHour)}에 알림` : undefined}
              enabled={settings.notifications}
              onToggle={() => settings.setNotifications(!settings.notifications)}
              delay={0.19}
            />
            <AnimatePresence>
              {settings.notifications && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <SettingRow
                    icon={<Clock size={17} className="text-orange-400" />}
                    label="리마인더 시간"
                    value={formatHour(settings.reminderHour)}
                    onClick={() => setActiveSheet("reminderTime")}
                    delay={0}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── 일반 ─── */}
        <div className="mb-6">
          <SectionLabel text="일반" delay={0.22} />
          <div className="flex flex-col gap-2">
            <ToggleRow
              icon={<Volume2 size={17} className="text-emerald-400" />}
              label="효과음"
              enabled={settings.sound}
              onToggle={() => settings.setSound(!settings.sound)}
              delay={0.24}
            />
            <ToggleRow
              icon={<Moon size={17} className="text-violet-400" />}
              label="다크 모드"
              sublabel="우주 테마 고정"
              enabled={true}
              onToggle={() => {}}
              delay={0.26}
            />
          </div>
        </div>

        {/* ─── 지원 ─── */}
        <div className="mb-6">
          <SectionLabel text="지원" delay={0.28} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<MessageCircle size={17} className="text-teal-400" />}
              label="의견 보내기"
              delay={0.3}
            />
            <SettingRow
              icon={<FileText size={17} className="text-white/40" />}
              label="이용약관"
              delay={0.32}
            />
            <SettingRow
              icon={<Shield size={17} className="text-white/40" />}
              label="개인정보처리방침"
              delay={0.34}
            />
          </div>
        </div>

        {/* ─── 계정 ─── */}
        <div className="mb-6">
          <SectionLabel text="계정" delay={0.36} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Trash2 size={17} className="text-red-400/70" />}
              label="학습 기록 초기화"
              delay={0.38}
              destructive
              onClick={() => setActiveSheet("resetConfirm")}
            />
            <SettingRow
              icon={<LogOut size={17} className="text-red-400/70" />}
              label="로그아웃"
              delay={0.4}
              destructive
            />
          </div>
        </div>

        {/* ─── 정보 ─── */}
        <div className="mb-4">
          <SectionLabel text="정보" delay={0.42} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Info size={17} className="text-white/40" />}
              label="앱 버전"
              value="1.0.0"
              delay={0.44}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center text-white/15 text-[11px] mt-8 mb-4 font-medium"
        >
          Made with ✦ by Cosmii
        </motion.p>
        </div>
      </div>

      {/* ─── Bottom Sheets ─── */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-30"
              onClick={() => setActiveSheet(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a1a]/95 border-t border-white/[0.10] backdrop-blur-2xl rounded-t-3xl z-40 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Language Picker ── */}
              {activeSheet === "language" && (
                <>
                  <div className="pt-6 pb-3 px-6">
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>학습 언어 선택</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">Cosmii가 이 언어로 설명해줄게!</p>
                  </div>
                  <div className="px-5 pb-10 flex flex-col gap-2">
                    {LANGUAGES.map((lang) => {
                      const selected = lang.code === settings.language;
                      return (
                        <motion.button
                          key={lang.code}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          onClick={() => { settings.setLanguage(lang.code); setActiveSheet(null); }}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all select-none ${
                            selected
                              ? "bg-indigo-500/12 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.12)]"
                              : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] active:bg-white/[0.08]"
                          }`}
                        >
                          <span className="text-[26px]">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <span className={`text-[15px] font-semibold ${selected ? "text-white" : "text-white/75"}`}>{lang.native}</span>
                            {lang.code !== "ko" && <span className="text-white/30 text-[12px] ml-2">{lang.label}</span>}
                          </div>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center"
                            >
                              <Check size={15} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Daily Goal Picker ── */}
              {activeSheet === "dailyGoal" && (
                <>
                  <div className="pt-6 pb-3 px-6">
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>하루 학습 목표</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">매일 얼마나 공부할까?</p>
                  </div>
                  <div className="px-5 pb-10 grid grid-cols-2 gap-2.5">
                    {DAILY_GOALS.map((goal) => {
                      const selected = goal.value === settings.dailyGoal;
                      return (
                        <motion.button
                          key={goal.value}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          onClick={() => { settings.setDailyGoal(goal.value); setActiveSheet(null); }}
                          className={`flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border transition-all select-none ${
                            selected
                              ? "bg-emerald-500/10 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                              : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] active:bg-white/[0.08]"
                          }`}
                        >
                          <span className="text-[28px]">{goal.emoji}</span>
                          <span className={`text-[15px] font-bold ${selected ? "text-white" : "text-white/70"}`}>{goal.label}</span>
                          <span className="text-white/35 text-[12px]">{goal.desc}</span>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5"
                            >
                              <Check size={13} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Difficulty Picker ── */}
              {activeSheet === "difficulty" && (
                <>
                  <div className="pt-6 pb-3 px-6">
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>학습 난이도</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">Cosmii가 얼마나 깊이 설명해줄까?</p>
                  </div>
                  <div className="px-5 pb-10 flex flex-col gap-2.5">
                    {DIFFICULTIES.map((diff) => {
                      const selected = diff.value === settings.difficulty;
                      return (
                        <motion.button
                          key={diff.value}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          onClick={() => { settings.setDifficulty(diff.value); setActiveSheet(null); }}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all select-none ${
                            selected
                              ? "bg-indigo-500/10 border-indigo-400/35 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                              : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] active:bg-white/[0.08]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            selected ? "bg-indigo-500/20" : "bg-white/[0.05]"
                          }`}>
                            <Gauge size={18} className={selected ? "text-indigo-400" : "text-white/30"} />
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-[15px] font-bold ${selected ? diff.color : "text-white/70"}`}>{diff.label}</span>
                            <span className="text-white/30 text-[12px] block mt-0.5">{diff.desc}</span>
                          </div>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center"
                            >
                              <Check size={15} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Reminder Time Picker ── */}
              {activeSheet === "reminderTime" && (
                <>
                  <div className="pt-6 pb-3 px-6">
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>리마인더 시간</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">언제 알려줄까?</p>
                  </div>
                  <div className="px-5 pb-10 grid grid-cols-3 gap-2">
                    {REMINDER_HOURS.map((h) => {
                      const selected = h === settings.reminderHour;
                      return (
                        <motion.button
                          key={h}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          onClick={() => { settings.setReminderHour(h); setActiveSheet(null); }}
                          className={`py-3.5 rounded-xl border text-[14px] font-semibold transition-all select-none ${
                            selected
                              ? "bg-orange-500/15 border-orange-400/40 text-orange-300 shadow-[0_0_16px_rgba(245,158,11,0.15)]"
                              : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06] active:bg-white/[0.08]"
                          }`}
                        >
                          {formatHour(h)}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Reset Confirm ── */}
              {activeSheet === "resetConfirm" && (
                <div className="px-6 pt-7 pb-10">
                  <h3 className={`${serif} text-white/90 font-bold text-[18px] mb-2`}>정말 초기화할까요?</h3>
                  <p className="text-white/40 text-[14px] leading-relaxed mb-7">
                    모든 학습 기록, XP, 레벨, 스트릭이 초기화돼요. 이 작업은 되돌릴 수 없어요.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="w-full py-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[15px] active:bg-red-500/30 transition-colors select-none"
                    >
                      초기화하기
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSheet(null)}
                      className="w-full py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-bold text-[15px] active:bg-white/[0.10] transition-colors select-none"
                    >
                      취소
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
