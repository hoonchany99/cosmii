"use client";

import { useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, MessageCircle, Trophy, ChevronRight, Rocket } from "lucide-react";
import { CosmicBg } from "@/components/cosmic-bg";
import { useAppStore, useSettingsStore, type DailyGoal } from "@/lib/store";
import { useIsMobile } from "@/lib/utils";
import dynamic from "next/dynamic";

const CosmiiConstellation = dynamic(
  () => import("@/components/cosmii-constellation").then((m) => m.CosmiiConstellation),
  { ssr: false },
);

const serif = "font-[var(--font-serif)]";

const DAILY_GOALS: { value: DailyGoal; label: string; desc: string; minutes: string; icon: typeof Sparkles }[] = [
  { value: 1, label: "가볍게", desc: "하루 1탐험", minutes: "~5분", icon: Sparkles },
  { value: 2, label: "꾸준히", desc: "하루 2탐험", minutes: "~10분", icon: Sparkles },
  { value: 3, label: "열심히", desc: "하루 3탐험", minutes: "~15분", icon: Sparkles },
  { value: 5, label: "몰입!", desc: "하루 5탐험", minutes: "~25분", icon: Sparkles },
];

const HOW_STEPS = [
  { icon: BookOpen, label: "책 업로드", desc: "PDF, EPUB 파일을 올려주세요", color: "text-indigo-400", bg: "bg-indigo-500/15" },
  { icon: MessageCircle, label: "대화 학습", desc: "Cosmii와 대화하며 배워요", color: "text-teal-400", bg: "bg-teal-500/15" },
  { icon: Sparkles, label: "퀴즈 풀기", desc: "배운 내용을 확인해요", color: "text-amber-400", bg: "bg-amber-500/15" },
  { icon: Trophy, label: "마스터!", desc: "XP를 모으고 레벨업!", color: "text-emerald-400", bg: "bg-emerald-500/15" },
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
  const mobile = useIsMobile();

  const totalSteps = 5;

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  }, [step]);

  const handleFinish = useCallback(() => {
    setDailyGoal(selectedGoal);
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem("cosmii-onboarded", "1");
      onComplete();
    }, 700);
  }, [selectedGoal, setDailyGoal, onComplete]);

  const firstName = profile.name?.split(" ")[0] ?? null;

  const slideVariants = {
    enter: { opacity: 0, x: 60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -60 },
  };

  return (
    <motion.div
      className="w-full h-full relative overflow-hidden text-white"
      animate={exiting ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <CosmicBg accent="indigo" />

      {/* Progress dots */}
      <div className="absolute top-14 left-0 right-0 z-30 flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="h-[3px] rounded-full"
            animate={{
              width: i === step ? 24 : 8,
              backgroundColor: i <= step ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.12)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        ))}
      </div>

      {/* Skip button */}
      {step < totalSteps - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleFinish}
          className="absolute top-12 right-5 z-30 text-white/25 text-[13px] font-medium hover:text-white/50 transition-colors px-3 py-2"
        >
          건너뛰기
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            {/* Constellation background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <Suspense fallback={null}>
                <CosmiiConstellation animate={false} />
              </Suspense>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                className="relative mb-6"
              >
                <div className="absolute -inset-6 bg-teal-400/[0.08] rounded-full blur-3xl" />
                <motion.img
                  src={mobile ? "/cosmii/giggling-mobile.webp" : "/cosmii/giggling-desktop.webp"}
                  alt="Cosmii"
                  className="w-[120px] h-auto relative z-10 drop-shadow-[0_0_30px_rgba(45,212,191,0.25)]"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  draggable={false}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={`${serif} text-[32px] font-bold tracking-tight mb-3`}
              >
                {firstName ? (
                  <>반가워, <span className="text-teal-300">{firstName}</span>!</>
                ) : (
                  "반가워!"
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="text-white/45 text-[15px] leading-relaxed max-w-[280px]"
              >
                나는 <span className="text-white/70 font-semibold">Cosmii</span>, 너의 독서 탐험 친구야
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-10 flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl text-white/80 text-[15px] font-semibold hover:bg-white/[0.12] active:bg-white/[0.16] transition-colors select-none"
              >
                시작하기
                <ChevronRight size={16} className="text-white/50" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 1: What is Cosmii */}
        {step === 1 && (
          <motion.div
            key="what"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="relative z-10 flex flex-col items-center text-center max-w-[320px]">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="relative mb-8"
              >
                <div className="absolute -inset-4 bg-indigo-400/[0.06] rounded-full blur-2xl" />
                <motion.img
                  src={mobile ? "/cosmii/talking-mobile.webp" : "/cosmii/talking-desktop.webp"}
                  alt="Cosmii talking"
                  className="w-[100px] h-auto relative z-10 drop-shadow-[0_0_24px_rgba(99,102,241,0.2)]"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  draggable={false}
                />
              </motion.div>

              {/* Chat bubbles */}
              <div className="flex flex-col gap-2.5 w-full">
                {[
                  { text: "책을 읽는 건 좋은데, 금방 잊어버리지 않아?", delay: 0.3 },
                  { text: "내가 책 내용을 재밌는 대화로 알려줄게!", delay: 0.6 },
                  { text: "퀴즈도 풀면서 확실히 기억하자!", delay: 0.9 },
                ].map((bubble, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: bubble.delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white/[0.06] border border-white/[0.10] backdrop-blur-xl rounded-2xl rounded-bl-md px-4 py-3 text-left"
                  >
                    <p className="text-white/65 text-[14px] leading-relaxed">{bubble.text}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl text-white/80 text-[15px] font-semibold hover:bg-white/[0.12] active:bg-white/[0.16] transition-colors select-none"
              >
                오 재밌겠다!
                <ChevronRight size={16} className="text-white/50" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: How it works */}
        {step === 2 && (
          <motion.div
            key="how"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="relative z-10 flex flex-col items-center text-center max-w-[340px]">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`${serif} text-[24px] font-bold tracking-tight mb-2`}
              >
                이렇게 학습해요
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white/35 text-[13px] mb-8"
              >
                4단계로 책을 완전히 내 것으로
              </motion.p>

              <div className="flex flex-col gap-3 w-full">
                {HOW_STEPS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3.5"
                  >
                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                      <s.icon size={20} className={s.color} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-white/80 text-[14px] font-semibold">{s.label}</p>
                      <p className="text-white/35 text-[12px] mt-0.5">{s.desc}</p>
                    </div>
                    <span className="text-white/15 text-[11px] font-bold flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl text-white/80 text-[15px] font-semibold hover:bg-white/[0.12] active:bg-white/[0.16] transition-colors select-none"
              >
                다음
                <ChevronRight size={16} className="text-white/50" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Daily goal */}
        {step === 3 && (
          <motion.div
            key="goal"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="relative z-10 flex flex-col items-center text-center max-w-[340px]">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`${serif} text-[24px] font-bold tracking-tight mb-2`}
              >
                하루 학습 목표는?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white/35 text-[13px] mb-8"
              >
                언제든 설정에서 바꿀 수 있어요
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
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all select-none ${
                        active
                          ? "bg-indigo-500/15 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active ? "bg-indigo-500/20" : "bg-white/[0.06]"
                      }`}>
                        <Sparkles size={18} className={active ? "text-indigo-400" : "text-white/30"} />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-[15px] font-semibold ${active ? "text-white/90" : "text-white/60"}`}>{g.label}</p>
                        <p className={`text-[12px] mt-0.5 ${active ? "text-white/40" : "text-white/25"}`}>{g.desc}</p>
                      </div>
                      <span className={`text-[12px] font-medium ${active ? "text-indigo-300/60" : "text-white/20"}`}>
                        {g.minutes}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        active ? "border-indigo-400 bg-indigo-500" : "border-white/15"
                      }`}>
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="w-2 h-2 rounded-full bg-white"
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
                className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-white/90 text-[15px] font-semibold hover:bg-indigo-500/30 active:bg-indigo-500/40 transition-colors select-none"
              >
                목표 설정 완료!
                <ChevronRight size={16} className="text-white/60" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Ready! */}
        {step === 4 && (
          <motion.div
            key="ready"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 18 }}
                className="relative mb-6"
              >
                <div className="absolute -inset-8 bg-teal-400/[0.10] rounded-full blur-3xl" />
                <motion.img
                  src={mobile ? "/cosmii/dancing-mobile.webp" : "/cosmii/dancing-desktop.webp"}
                  alt="Cosmii dancing"
                  className="w-[140px] h-auto relative z-10 drop-shadow-[0_0_30px_rgba(45,212,191,0.3)]"
                  draggable={false}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className={`${serif} text-[36px] font-bold tracking-tight mb-3`}
              >
                준비 완료!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-white/40 text-[15px] leading-relaxed max-w-[260px] mb-10"
              >
                {firstName ? `${firstName}, ` : ""}이제 우주를 탐험할 시간이야!
              </motion.p>

              {/* Floating particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-teal-400/40"
                  initial={{
                    x: (Math.random() - 0.5) * 100,
                    y: 60,
                    opacity: 0,
                  }}
                  animate={{
                    y: -200 - Math.random() * 200,
                    x: (Math.random() - 0.5) * 300,
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 1.5,
                    delay: 0.3 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeOut",
                  }}
                />
              ))}

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFinish}
                className="flex items-center gap-2.5 px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[16px] font-bold shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] active:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-shadow select-none"
              >
                <Rocket size={18} />
                탐험 시작!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
