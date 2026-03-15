"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useAppStore, useSettingsStore, type DailyGoal } from "@/lib/store";
import { useT } from "@/lib/i18n";
import dynamic from "next/dynamic";

const ImageConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.ImageConstellation),
  { ssr: false },
);

const serif = "font-[var(--font-serif)]";

const DAILY_GOALS: { value: DailyGoal; labelKey: string; descKey: string; minutes: string }[] = [
  { value: 1, labelKey: "goal.light", descKey: "goal.lightDesc", minutes: "~5min" },
  { value: 2, labelKey: "goal.steady", descKey: "goal.steadyDesc", minutes: "~10min" },
  { value: 3, labelKey: "goal.hard", descKey: "goal.hardDesc", minutes: "~15min" },
  { value: 5, labelKey: "goal.immerse", descKey: "goal.immerseDesc", minutes: "~25min" },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal>(2);
  const [exiting, setExiting] = useState(false);
  const profile = useAppStore((s) => s.profile);
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);
  const t = useT();

  const totalSteps = 3;

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }, [step]);

  const handleFinish = useCallback(() => {
    setDailyGoal(selectedGoal);
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem("cosmii-onboarded", "1");
      onComplete();
    }, 800);
  }, [selectedGoal, setDailyGoal, onComplete]);

  const firstName = profile.name?.split(" ")[0] ?? null;

  return (
    <motion.div
      className="w-full h-full relative overflow-hidden text-white"
      animate={exiting ? { opacity: 0, scale: 1.08, filter: "blur(6px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Constellation background - always present, fades in */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <ImageConstellation
          imageSrc="/cosmii-constellation.png"
          color="#6BC5A0"
          animate={false}
          dim
          dimOpacity={step === 0 ? 0.15 : step === 2 ? 0.25 : 0.1}
          dimZoom={10}
        />
      </motion.div>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[120px]" />
      </div>

      {/* Progress bar */}
      <div className="absolute pt-safe top-0 left-0 right-0 z-30 px-8 mt-3">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/[0.08]">
              <motion.div
                className="h-full bg-white/40 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i <= step ? i * 0.1 : 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Skip */}
      {step < totalSteps - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={handleFinish}
          className="absolute top-safe mt-6 right-5 z-30 text-white/20 text-[13px] font-medium hover:text-white/40 transition-colors px-3 py-3"
        >
          {t("onboarding.skip")}
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${serif} text-[28px] font-bold tracking-tight text-white/90`}
              >
                {firstName ? (t("onboarding.welcomeName") as string).replace("{name}", firstName) : t("onboarding.welcome")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7 }}
                className="text-white/40 text-[16px] leading-relaxed mt-3 max-w-[260px]"
              >
                {t("onboarding.intro")}
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-16 flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/[0.12] text-white/70 text-[15px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors select-none"
              >
                {t("onboarding.nextBtn")}
                <ChevronRight size={16} className="text-white/40" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Daily Goal ── */}
        {step === 1 && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center text-center w-full max-w-[340px]">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`${serif} text-[24px] font-bold tracking-tight text-white/90 mb-2`}
              >
                {t("onboarding.goalTitle")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white/30 text-[13px] mb-8"
              >
                {t("onboarding.goalSub")}
              </motion.p>

              <div className="flex flex-col gap-2.5 w-full">
                {DAILY_GOALS.map((g, i) => {
                  const active = selectedGoal === g.value;
                  return (
                    <motion.button
                      key={g.value}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedGoal(g.value)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all select-none ${
                        active
                          ? "bg-white/[0.06] border-white/[0.18]"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-left flex-1">
                        <p className={`text-[15px] font-semibold ${active ? "text-white/90" : "text-white/55"}`}>
                          {t(g.labelKey as any)}
                        </p>
                        <p className={`text-[13px] mt-0.5 ${active ? "text-white/40" : "text-white/20"}`}>
                          {t(g.descKey as any)}
                        </p>
                      </div>
                      <span className={`text-[12px] font-medium ${active ? "text-white/40" : "text-white/15"}`}>
                        {g.minutes}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        active ? "border-white/50 bg-white/80" : "border-white/12"
                      }`}>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="w-2 h-2 rounded-full bg-[#060612]"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/[0.12] text-white/70 text-[15px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors select-none"
              >
                {t("onboarding.goalDone")}
                <ChevronRight size={16} className="text-white/40" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Ready ── */}
        {step === 2 && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className={`${serif} text-[28px] font-bold tracking-tight text-white/90 mb-3`}
              >
                {t("onboarding.readyTitle")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-white/40 text-[16px] leading-relaxed max-w-[260px]"
              >
                {firstName
                  ? (t("onboarding.readyName") as string).replace("{name}", firstName)
                  : t("onboarding.readyDefault")}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="mt-14 px-10 py-4 rounded-full bg-white/90 text-[#060612] text-[16px] font-bold hover:bg-white/80 active:bg-white/70 transition-colors select-none"
              >
                {t("onboarding.startExplore")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
