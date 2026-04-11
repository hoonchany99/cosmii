"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Pencil } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAppStore, useSettingsStore, generateCosmiiName } from "@/lib/store";
import { createClient } from "@/lib/supabase";

const serif = "font-[var(--font-serif)]";
const ease = [0.22, 1, 0.36, 1] as const;
const PHASES = ["welcome", "name", "goal", "ready"] as const;
type Phase = (typeof PHASES)[number];

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.08 + 0.01, opacity: Math.random() * 0.3 + 0.05 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,240,${s.opacity})`; ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height + 5) { s.y = -5; s.x = Math.random() * canvas.width; }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
}

function CosmiiFloat() {
  return (
    <motion.div
      className="relative w-[120px] h-[120px]"
      animate={{ y: [0, -10, 0], rotate: [0, 3, 0, -3, 0] }}
      transition={{ y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
    >
      <motion.div
        className="absolute inset-0 rounded-full blur-[40px]"
        style={{ background: "radial-gradient(circle, rgba(110,220,180,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <img src="/avatars/cosmii/mint.png" alt="Cosmii" className="w-full h-full object-contain relative z-10" style={{ WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 75%)", maskImage: "radial-gradient(circle, black 50%, transparent 75%)" }} draggable={false} />
    </motion.div>
  );
}

const GOAL_OPTIONS = [1, 2, 3, 5] as const;

export default function OnboardingPage() {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const setName = useAppStore((s) => s.setName);
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);

  const [phase, setPhase] = useState<Phase>("welcome");
  const [selectedGoal, setSelectedGoal] = useState(dailyGoal);
  const [exiting, setExiting] = useState(false);

  const [nickname, setNickname] = useState("");
  const [googleName, setGoogleName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const goNext = useCallback(() => {
    if (phase === "welcome") {
      setPhase("name");
      setTimeout(() => inputRef.current?.focus(), 400);
    } else if (phase === "name") {
      const trimmed = nickname.trim();
      if (!trimmed) return;
      saveNickname(trimmed);
      setPhase("goal");
    } else if (phase === "goal") {
      setDailyGoal(selectedGoal);
      setPhase("ready");
    } else {
      localStorage.setItem("cosmii-onboarded", "1");
      setExiting(true);
      setTimeout(() => { window.location.href = "/universe"; }, 800);
    }
  }, [phase, nickname, selectedGoal, setDailyGoal, saveNickname]);

  const skip = useCallback(() => {
    if (nickname.trim()) saveNickname(nickname.trim());
    localStorage.setItem("cosmii-onboarded", "1");
    setExiting(true);
    setTimeout(() => { window.location.href = "/universe"; }, 800);
  }, [nickname, saveNickname]);

  const randomize = useCallback(() => {
    setNickname(generateCosmiiName(language));
  }, [language]);

  const phaseIdx = PHASES.indexOf(phase);

  return (
    <motion.div
      className="min-h-screen bg-[#060612] text-white flex flex-col items-center justify-center overflow-hidden relative"
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <StarField />

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {PHASES.map((p, i) => (
          <motion.div
            key={p}
            className="rounded-full"
            animate={{
              width: p === phase ? 24 : 6,
              height: 6,
              backgroundColor: p === phase ? "rgba(255,255,255,0.5)" : (phaseIdx > i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"),
            }}
            transition={{ duration: 0.4, ease }}
          />
        ))}
      </div>

      {/* Skip */}
      {phase !== "ready" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={skip}
          className="fixed top-8 right-6 z-20 text-[12px] text-white/20 hover:text-white/50 transition-colors duration-300"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {t("onboarding.skip")}
        </motion.button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md w-full">
        <AnimatePresence mode="wait">
          {phase === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col items-center"
            >
              <div className="mb-8">
                <CosmiiFloat />
              </div>
              <h1 className={`${serif} text-[28px] sm:text-[34px] text-white/90 tracking-tight mb-3`}>
                {t("onboarding.welcome")}
              </h1>
              <p className={`${serif} text-[16px] text-white/40 leading-relaxed`}>
                {t("onboarding.intro")}
              </p>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col items-center w-full"
            >
              <h2 className={`${serif} text-[24px] sm:text-[28px] text-white/90 tracking-tight mb-2`}>
                {t("onboarding.nameTitle")}
              </h2>
              <p className="text-[14px] text-white/30 mb-8">
                {t("onboarding.nameSub")}
              </p>

              {!loadingName && (
                <div className="w-full max-w-[300px] flex flex-col items-center gap-4">
                  <div className="relative w-full">
                    <input
                      ref={inputRef}
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={24}
                      onKeyDown={(e) => { if (e.key === "Enter") goNext(); }}
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
                </div>
              )}
            </motion.div>
          )}

          {phase === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col items-center w-full"
            >
              <h2 className={`${serif} text-[24px] sm:text-[28px] text-white/90 tracking-tight mb-2`}>
                {t("onboarding.goalTitle")}
              </h2>
              <p className="text-[14px] text-white/30 mb-10">
                {t("onboarding.goalSub")}
              </p>
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                {GOAL_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGoal(g)}
                    className={`w-full py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-300 border ${
                      selectedGoal === g
                        ? "bg-white/[0.10] border-white/[0.20] text-white/80"
                        : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    {t("onboarding.goalN", { n: String(g) })}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="text-[48px] mb-6"
              >
                ✦
              </motion.div>
              <h2 className={`${serif} text-[24px] sm:text-[28px] text-white/90 tracking-tight mb-3`}>
                {t("onboarding.readyTitle")}
              </h2>
              <p className={`${serif} text-[16px] text-white/40 leading-relaxed mb-2`}>
                {nickname.trim() ? t("onboarding.readyName", { name: nickname.trim() }) : t("onboarding.readyDefault")}
              </p>
              <p className="text-[13px] text-white/25">
                {t("onboarding.freeBookHint")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <motion.button
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={goNext}
          disabled={phase === "name" && !nickname.trim()}
          className="mt-12 group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#060612] text-[14px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none"
        >
          {phase === "welcome" ? t("onboarding.nextBtn") : phase === "name" ? t("onboarding.nextBtn") : phase === "goal" ? t("onboarding.goalDone") : t("onboarding.startExplore")}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
        </motion.button>
      </div>
    </motion.div>
  );
}
