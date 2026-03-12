"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Globe,
  Check,
  Bell,
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
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "ko", label: "한국어", native: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", native: "English", flag: "🇺🇸" },
];

const DAILY_GOALS: { value: DailyGoal; labelKey: string; descKey: string; emoji: string }[] = [
  { value: 1, labelKey: "goal.light", descKey: "goal.lightDesc", emoji: "🌱" },
  { value: 2, labelKey: "goal.steady", descKey: "goal.steadyDesc", emoji: "⭐" },
  { value: 3, labelKey: "goal.hard", descKey: "goal.hardDesc", emoji: "🔥" },
  { value: 5, labelKey: "goal.immerse", descKey: "goal.immerseDesc", emoji: "🚀" },
];

const DIFFICULTIES: { value: Difficulty; labelKey: string; descKey: string; color: string }[] = [
  { value: "easy", labelKey: "diff.easy", descKey: "diff.easyDesc", color: "text-emerald-400" },
  { value: "normal", labelKey: "diff.normal", descKey: "diff.normalDesc", color: "text-indigo-400" },
  { value: "hard", labelKey: "diff.hard", descKey: "diff.hardDesc", color: "text-amber-400" },
];

const REMINDER_HOURS = [7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 21, 22];

function SettingRow({
  icon,
  label,
  value,
  onClick,
  delay,
  destructive,
  comingSoon,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  delay: number;
  destructive?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={comingSoon ? undefined : { scale: 0.95 }}
      onClick={comingSoon ? undefined : onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl border transition-colors select-none ${
        comingSoon
          ? "bg-white/[0.01] border-white/[0.04] cursor-default"
          : destructive
            ? "bg-red-500/[0.04] border-red-500/[0.10] hover:bg-red-500/[0.08] active:bg-red-500/[0.12]"
            : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] active:bg-white/[0.08]"
      }`}
      style={comingSoon ? { opacity: 0.4 } : undefined}
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
      {comingSoon && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/30 bg-white/[0.06] px-2.5 py-1 rounded-full mr-1">
          Soon
        </span>
      )}
      {!comingSoon && value && (
        <span className="text-white/35 text-[13px] font-medium mr-1">{value}</span>
      )}
      {!destructive && !comingSoon && <ChevronRight size={16} className="text-white/20" />}
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
  comingSoon,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  enabled: boolean;
  onToggle: () => void;
  delay: number;
  comingSoon?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl border ${
        comingSoon
          ? "bg-white/[0.01] border-white/[0.04]"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}
      style={comingSoon ? { opacity: 0.4 } : undefined}
    >
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white/80 text-[15px] font-medium block">{label}</span>
        {sublabel && !comingSoon && <span className="text-white/30 text-[12px]">{sublabel}</span>}
      </div>
      {comingSoon ? (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/30 bg-white/[0.06] px-2.5 py-1 rounded-full flex-shrink-0">
          Soon
        </span>
      ) : (
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
      )}
    </motion.div>
  );
}

function SectionLabel({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="text-white/30 text-[12px] uppercase tracking-[0.15em] font-bold px-1 mb-2.5 block"
    >
      {text}
    </motion.span>
  );
}

type SheetType = "language" | "dailyGoal" | "difficulty" | "reminderTime" | "resetConfirm" | null;

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
  onResetProgress: () => Promise<void>;
}

export function SettingsView({ onBack, onLogout, onResetProgress }: SettingsViewProps) {
  const settings = useSettingsStore();
  const t = useT();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  const currentLang = LANGUAGES.find((l) => l.code === settings.language) ?? LANGUAGES[0];
  const formatHour = (h: number) => {
    const period = h < 12 ? t("time.am") : t("time.pm");
    const suffix = t("time.hourSuffix");
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return suffix ? `${period} ${displayH}${suffix}` : `${displayH} ${period}`;
  };

  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <CosmicBg accent="indigo" />

      {/* Header */}
      <div className="absolute top-0 w-full pt-safe pb-3 px-5 flex items-center z-30 bg-[rgba(5,5,16,0.4)] backdrop-blur-xl border-b border-white/[0.04]">
        <motion.button
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          onClick={onBack}
          aria-label="Back"
          className="text-white/60 hover:text-white transition-colors p-3 -ml-3 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.10]"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h2 className={`${serif} text-white/80 font-bold text-[18px] tracking-wide ml-1`}>
          {t("settings.title")}
        </h2>
      </div>

      <div className="absolute inset-0 overflow-y-auto pb-20 z-10">
        <div className="w-full h-[180px]" />

        <div className="px-5 -mt-4">

        {/* ─── 학습 설정 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.studySettings")} delay={0.05} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Globe size={17} className="text-indigo-400" />}
              label={t("settings.studyLanguage")}
              value={`${currentLang.flag} ${currentLang.native}`}
              onClick={() => setActiveSheet("language")}
              delay={0.08}
            />
            <SettingRow
              icon={<Target size={17} className="text-emerald-400" />}
              label={t("settings.dailyGoal")}
              value={t(DAILY_GOALS.find((g) => g.value === settings.dailyGoal)?.labelKey as any) ?? ""}
              onClick={() => setActiveSheet("dailyGoal")}
              delay={0.11}
            />
            <SettingRow
              icon={<Gauge size={17} className="text-amber-400" />}
              label={t("settings.difficulty")}
              delay={0.14}
              comingSoon
            />
          </div>
        </div>

        {/* ─── 알림 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.notifications")} delay={0.17} />
          <div className="flex flex-col gap-2">
            <ToggleRow
              icon={<Bell size={17} className="text-amber-400" />}
              label={t("settings.studyReminder")}
              enabled={false}
              onToggle={() => {}}
              delay={0.19}
              comingSoon
            />
          </div>
        </div>

        {/* ─── 일반 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.general")} delay={0.22} />
          <div className="flex flex-col gap-2">
            <ToggleRow
              icon={<Volume2 size={17} className="text-emerald-400" />}
              label={t("settings.soundEffects")}
              enabled={false}
              onToggle={() => {}}
              delay={0.24}
              comingSoon
            />
          </div>
        </div>

        {/* ─── 지원 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.support")} delay={0.28} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<MessageCircle size={17} className="text-teal-400" />}
              label={t("settings.feedback")}
              delay={0.3}
              comingSoon
            />
            <SettingRow
              icon={<FileText size={17} className="text-white/40" />}
              label={t("settings.terms")}
              delay={0.32}
              comingSoon
            />
            <SettingRow
              icon={<Shield size={17} className="text-white/40" />}
              label={t("settings.privacy")}
              delay={0.34}
              comingSoon
            />
          </div>
        </div>

        {/* ─── 계정 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.account")} delay={0.36} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Trash2 size={17} className="text-red-400/70" />}
              label={t("settings.resetProgress")}
              delay={0.38}
              destructive
              onClick={() => setActiveSheet("resetConfirm")}
            />
            <SettingRow
              icon={<LogOut size={17} className="text-red-400/70" />}
              label={t("settings.logout")}
              delay={0.4}
              destructive
              onClick={onLogout}
            />
          </div>
        </div>

        {/* ─── 정보 ─── */}
        <div className="mb-4">
          <SectionLabel text={t("settings.info")} delay={0.42} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Info size={17} className="text-white/40" />}
              label={t("settings.appVersion")}
              value="1.0.0"
              delay={0.44}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center text-white/15 text-[12px] mt-8 mb-4 font-medium"
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
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>{t("settings.langPickerTitle")}</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">{t("settings.langPickerDesc")}</p>
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
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>{t("settings.goalPickerTitle")}</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">{t("settings.goalPickerDesc")}</p>
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
                          <span className={`text-[15px] font-bold ${selected ? "text-white" : "text-white/70"}`}>{t(goal.labelKey as any)}</span>
                          <span className="text-white/35 text-[12px]">{t(goal.descKey as any)}</span>
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
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>{t("settings.diffPickerTitle")}</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">{t("settings.diffPickerDesc")}</p>
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
                            <span className={`text-[15px] font-bold ${selected ? diff.color : "text-white/70"}`}>{t(diff.labelKey as any)}</span>
                            <span className="text-white/30 text-[12px] block mt-0.5">{t(diff.descKey as any)}</span>
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
                    <h3 className={`${serif} text-white/90 font-bold text-[18px]`}>{t("settings.reminderPickerTitle")}</h3>
                    <p className="text-white/35 text-[13px] mt-0.5">{t("settings.reminderPickerDesc")}</p>
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
                  <div className="px-6 pt-7 pb-safe-lg">
                  <h3 className={`${serif} text-white/90 font-bold text-[18px] mb-2`}>{t("settings.resetConfirmTitle")}</h3>
                  <p className="text-white/40 text-[14px] leading-relaxed mb-7">
                    {t("settings.resetConfirmDesc")}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        await onResetProgress();
                        setActiveSheet(null);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[15px] active:bg-red-500/30 transition-colors select-none"
                    >
                      {t("settings.resetBtn")}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSheet(null)}
                      className="w-full py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 font-bold text-[15px] active:bg-white/[0.10] transition-colors select-none"
                    >
                      {t("settings.cancelBtn")}
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
