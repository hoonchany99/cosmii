"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Globe,
  Check,
  Info,
  ChevronRight,
  Target,
  Trash2,
  LogOut,
  MessageCircle,
  FileText,
  Shield,
} from "lucide-react";
import dynamic from "next/dynamic";

const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);
import {
  useSettingsStore,
  type Language,
  type DailyGoal,
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
          ? "bg-white/[0.03] border-white/[0.06] cursor-default"
          : destructive
            ? "bg-red-500/[0.06] border-red-500/[0.12] hover:bg-red-500/[0.10] active:bg-red-500/[0.14]"
            : "bg-white/[0.05] border-white/[0.10] hover:bg-white/[0.08] active:bg-white/[0.12]"
      }`}
      style={comingSoon ? { opacity: 0.4 } : undefined}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        destructive ? "bg-red-500/10" : "bg-white/[0.08]"
      }`}>
        {icon}
      </div>
      <span className={`text-[15px] font-semibold flex-1 text-left ${
        destructive ? "text-red-400/90" : "text-white/90"
      }`}>
        {label}
      </span>
      {comingSoon && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 bg-white/[0.08] px-2.5 py-1 rounded-full mr-1">
          Soon
        </span>
      )}
      {!comingSoon && value && (
        <span className="text-white/50 text-[13px] font-medium mr-1">{value}</span>
      )}
      {!destructive && !comingSoon && <ChevronRight size={16} className="text-white/35" />}
    </motion.button>
  );
}

function SectionLabel({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="text-white/50 text-[12px] uppercase tracking-[0.15em] font-bold px-1 mb-2.5 block"
    >
      {text}
    </motion.span>
  );
}

type SheetType = "language" | "dailyGoal" | "resetConfirm" | null;

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
  return (
    <div className="w-full h-full relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <ImageConstellation imageSrc="/constellations/settings-gear.svg" color="#6BC5A0" animate={false} dim dimOpacity={0.25} dimZoom={16} spinZ={0.08} starDensity={{ edge: 350, interior: 0 }} />
      </div>

      {/* Header */}
      <div className="absolute top-0 w-full pt-safe pb-3 px-5 flex items-center z-30 bg-[rgba(6,6,18,0.5)] border-b border-white/[0.04]">
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
              icon={<Globe size={17} className="text-white/60" />}
              label={t("settings.studyLanguage")}
              value={`${currentLang.flag} ${currentLang.native}`}
              onClick={() => setActiveSheet("language")}
              delay={0.08}
            />
            <SettingRow
              icon={<Target size={17} className="text-white/60" />}
              label={t("settings.dailyGoal")}
              value={t(DAILY_GOALS.find((g) => g.value === settings.dailyGoal)?.labelKey as any) ?? ""}
              onClick={() => setActiveSheet("dailyGoal")}
              delay={0.11}
            />
          </div>
        </div>

        {/* ─── 지원 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.support")} delay={0.17} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<MessageCircle size={17} className="text-white/60" />}
              label={t("settings.feedback")}
              delay={0.19}
              onClick={() => window.open("https://cosmii.canny.io/", "_blank")}
            />
            <SettingRow
              icon={<FileText size={17} className="text-white/60" />}
              label={t("settings.terms")}
              delay={0.21}
              onClick={() => window.open("/terms", "_blank")}
            />
            <SettingRow
              icon={<Shield size={17} className="text-white/60" />}
              label={t("settings.privacy")}
              delay={0.23}
              onClick={() => window.open("/privacy", "_blank")}
            />
          </div>
        </div>

        {/* ─── 계정 ─── */}
        <div className="mb-6">
          <SectionLabel text={t("settings.account")} delay={0.26} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Trash2 size={17} className="text-red-400/70" />}
              label={t("settings.resetProgress")}
              delay={0.28}
              destructive
              onClick={() => setActiveSheet("resetConfirm")}
            />
            <SettingRow
              icon={<LogOut size={17} className="text-red-400/70" />}
              label={t("settings.logout")}
              delay={0.3}
              destructive
              onClick={onLogout}
            />
          </div>
        </div>

        {/* ─── 정보 ─── */}
        <div className="mb-4">
          <SectionLabel text={t("settings.info")} delay={0.32} />
          <div className="flex flex-col gap-2">
            <SettingRow
              icon={<Info size={17} className="text-white/60" />}
              label={t("settings.appVersion")}
              value="1.0.0"
              delay={0.34}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/15 text-[12px] mt-8 mb-4 font-medium"
        >
          Made with ✦ by <span className="font-brand">Cosmii</span>
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
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a1a]/95 border-t border-white/[0.10] rounded-t-3xl z-40 overflow-hidden"
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
                              ? "bg-white/[0.06] border-white/[0.20]"
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
                              className="w-7 h-7 rounded-full bg-white/50 flex items-center justify-center"
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
                              ? "bg-white/[0.06] border-white/[0.20]"
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
                              className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center mt-0.5"
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
