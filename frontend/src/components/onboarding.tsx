"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Pencil } from "lucide-react";
import { useAppStore, useSettingsStore, generateCosmiiName, type DailyGoal } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase";

const serif = "font-[family-name:var(--font-serif)]";
const ease = [0.22, 1, 0.36, 1] as const;

const DAILY_GOALS: { value: DailyGoal; minutes: number; labelKey: string; descKey: string }[] = [
  { value: 1, minutes: 3, labelKey: "goal.light", descKey: "goal.lightDesc" },
  { value: 2, minutes: 6, labelKey: "goal.steady", descKey: "goal.steadyDesc" },
  { value: 3, minutes: 10, labelKey: "goal.hard", descKey: "goal.hardDesc" },
  { value: 5, minutes: 15, labelKey: "goal.immerse", descKey: "goal.immerseDesc" },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal>(2);
  const [exiting, setExiting] = useState(false);
  const setName = useAppStore((s) => s.setName);
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);
  const language = useSettingsStore((s) => s.language);
  const t = useT();

  const [nickname, setNickname] = useState("");
  const [googleName, setGoogleName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const fullName = user?.user_metadata?.full_name as string | undefined;
        if (fullName) {
          setGoogleName(fullName);
          setNickname(fullName);
        } else {
          setNickname(generateCosmiiName(language));
        }
      } catch {
        setNickname(generateCosmiiName(language));
      } finally {
        setLoadingName(false);
      }
    })();
  }, [language]);

  const saveNickname = useCallback(async (name: string) => {
    setName(name);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: name }),
      });
    } catch {}
  }, [setName]);

  const handleFinish = useCallback(() => {
    setDailyGoal(selectedGoal);
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem("cosmii-onboarded", "1");
      onComplete();
    }, 800);
  }, [selectedGoal, setDailyGoal, onComplete]);

  const handleNext = useCallback(() => {
    if (step === 0) {
      setStep(1);
      setTimeout(() => inputRef.current?.focus(), 400);
    } else if (step === 1) {
      const trimmed = nickname.trim();
      if (!trimmed) return;
      saveNickname(trimmed);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  }, [step, nickname, saveNickname]);

  const handleSkip = useCallback(() => {
    if (nickname.trim()) saveNickname(nickname.trim());
    handleFinish();
  }, [nickname, saveNickname, handleFinish]);

  const randomize = useCallback(() => {
    setNickname(generateCosmiiName(language));
  }, [language]);

  return (
    <motion.div
      className="w-full h-full relative overflow-hidden text-white bg-[#050510]"
      animate={exiting ? { opacity: 0, scale: 1.08, filter: "blur(6px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 1 + (i % 2),
              height: 1 + (i % 2),
              left: `${(i * 23 + 7) % 100}%`,
              top: `${(i * 17 + 11) % 100}%`,
              opacity: 0.08 + (i % 5) * 0.04,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-8 pt-4">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/[0.08]">
              <motion.div
                className="h-full bg-white/40 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease, delay: i <= step ? i * 0.1 : 0 }}
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
          onClick={handleSkip}
          className="absolute top-3 right-5 z-30 text-white/20 text-[13px] font-medium hover:text-white/40 transition-colors px-3 py-3"
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
            transition={{ duration: 0.6, ease }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center text-center">
              {/* Cosmii character */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease }}
                className="relative mb-8"
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-[50px]"
                  style={{ background: "radial-gradient(circle, rgba(110,220,180,0.15) 0%, transparent 70%)" }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-[110px] h-[110px]"
                  style={{ WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 75%)", maskImage: "radial-gradient(circle, black 50%, transparent 75%)" }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 3, 0, -3, 0],
                  }}
                  transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <img
                    src="/avatars/cosmii/mint.png"
                    alt="Cosmii"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`${serif} text-[28px] font-bold tracking-tight text-white/90`}
              >
                {t("onboarding.welcome")}
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
                className="mt-14 flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/[0.12] text-white/70 text-[15px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors select-none"
              >
                {t("onboarding.nextBtn")}
                <ChevronRight size={16} className="text-white/40" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center text-center w-full max-w-[320px]">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`${serif} text-[24px] font-bold tracking-tight text-white/90 mb-2`}
              >
                {t("onboarding.nameTitle")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white/30 text-[13px] mb-8"
              >
                {t("onboarding.nameSub")}
              </motion.p>

              {!loadingName && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="relative w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={24}
                      onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                      className="w-full text-center text-[18px] font-medium bg-white/[0.04] border border-white/[0.10] rounded-2xl px-5 py-4 text-white/90 placeholder:text-white/20 outline-none focus:border-white/[0.25] transition-colors duration-300"
                      placeholder={t("onboarding.namePlaceholder")}
                    />
                    <Pencil className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15 pointer-events-none" />
                  </div>

                  {googleName && nickname !== googleName && (
                    <button
                      onClick={() => setNickname(googleName)}
                      className="text-[12px] text-white/25 hover:text-white/50 transition-colors"
                    >
                      {t("onboarding.useGoogleName", { name: googleName })}
                    </button>
                  )}

                  <button
                    onClick={randomize}
                    className="text-[12px] text-white/25 hover:text-white/50 transition-colors"
                  >
                    {t("onboarding.randomName")}
                  </button>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!nickname.trim()}
                className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/[0.12] text-white/70 text-[15px] font-semibold hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors select-none disabled:opacity-30 disabled:pointer-events-none"
              >
                {t("onboarding.nextBtn")}
                <ChevronRight size={16} className="text-white/40" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Daily Goal ── */}
        {step === 2 && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease }}
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
                      <div className={`flex-shrink-0 w-[52px] text-center ${active ? "text-white/90" : "text-white/40"}`}>
                        <span className={`${serif} text-[22px] font-bold`}>{g.minutes}</span>
                        <span className="text-[11px] ml-0.5">{language === "ko" ? "분" : "min"}</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-[15px] font-semibold ${active ? "text-white/90" : "text-white/55"}`}>
                          {t(g.labelKey as any)}
                        </p>
                        <p className={`text-[12px] mt-0.5 ${active ? "text-white/35" : "text-white/18"}`}>
                          {t(g.descKey as any)}
                        </p>
                      </div>
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

        {/* ── Step 3: Ready ── */}
        {step === 3 && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
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
                {nickname.trim()
                  ? t("onboarding.readyName", { name: nickname.trim() })
                  : t("onboarding.readyDefault")}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="text-white/25 text-[13px] mt-3 max-w-[240px] text-center"
              >
                {t("onboarding.freeBookHint")}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, ease }}
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
