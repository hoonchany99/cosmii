"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, Check, ChevronLeft, ChevronRight, ChevronUp, Flame, Send, Sparkles, Star } from "lucide-react";
import { useIsMobile } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/store";
import dynamic from "next/dynamic";

const UniverseMockupScene = dynamic(
  () => import("@/components/universe-mockup-scene").then((m) => m.UniverseMockupScene),
  { ssr: false },
);

const serif = "font-[var(--font-serif)]";
const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════
   Cosmii hero animation
   ═══════════════════════════════════════════════════════════════════ */

function CosmiiSprite({ mobile }: { mobile: boolean }) {
  return (
    <motion.img
      src={mobile ? "/cosmii/standing-mobile.webp" : "/cosmii/standing-desktop.webp"}
      alt="Cosmii"
      className={mobile
        ? "relative w-[140px] h-auto drop-shadow-[0_0_24px_rgba(110,200,170,0.12)]"
        : "relative w-[200px] lg:w-[320px] h-auto drop-shadow-[0_0_40px_rgba(110,200,170,0.15)]"
      }
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      draggable={false}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Star background
   ═══════════════════════════════════════════════════════════════════ */

function StarField({ lite = false }: { lite?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const count = lite ? 40 : 120;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < count; i++) {
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.15 + 0.02, opacity: Math.random() * 0.4 + 0.1 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,240,${s.opacity})`; ctx.fill();
        s.y += s.speed; s.opacity += (Math.random() - 0.5) * 0.008;
        s.opacity = Math.max(0.05, Math.min(0.5, s.opacity));
        if (s.y > canvas.height + 5) { s.y = -5; s.x = Math.random() * canvas.width; }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [lite]);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
}

/* ═══════════════════════════════════════════════════════════════════
   Feature showcase mockups — faithful to actual app UI
   ═══════════════════════════════════════════════════════════════════ */

function LessonMockup() {
  const t = useT();
  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2rem] border border-white/[0.08] bg-[#060612] overflow-hidden shadow-2xl shadow-black/40 relative">
      {/* Header */}
      <div className="bg-[rgba(6,6,18,0.6)]">
        <div className="px-4 pt-4 pb-2.5 flex items-center justify-between">
          <ChevronLeft size={20} className="text-white/40" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/35 text-[10px] font-medium">{t("landing.mockLessonHeader")}</span>
            <h2 className={`${serif} text-white/80 font-semibold text-[14px] tracking-wide`}>{t("landing.mockLessonTitle")}</h2>
          </div>
          <div className="w-5" />
        </div>
        <div className="w-full h-px bg-white/[0.06]">
          <div className="h-full w-[60%] bg-white/40" />
        </div>
      </div>

      {/* Dialogue bubbles with focus/dim */}
      <div className="px-4 py-6 flex flex-col gap-3.5">
        {/* Dim bubble */}
        <div className="opacity-25">
          <div className="w-fit max-w-full rounded-2xl px-4 py-3 bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[13px] leading-[1.7] font-medium text-white/90">
              {t("landing.mockBubble1")}
            </p>
          </div>
        </div>

        {/* Focused bubble — glow */}
        <div>
          <div className="w-fit max-w-full rounded-2xl px-4 py-3 bg-white/[0.10] border border-white/[0.18] shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <p className="text-[13px] leading-[1.7] font-medium text-white/90">
              {t("landing.mockBubble2")}
            </p>
          </div>
        </div>

        {/* Next dim bubble */}
        <div className="opacity-15">
          <div className="w-fit max-w-full rounded-2xl px-4 py-3 bg-white/[0.04] border border-white/[0.04]">
            <p className="text-[13px] leading-[1.7] font-medium text-white/90">
              {t("landing.mockBubble3")}
            </p>
          </div>
        </div>
      </div>

      {/* Tap indicator */}
      <div className="flex flex-col items-center gap-0.5 pb-2">
        <ChevronUp size={14} className="text-white/20" />
        <span className="text-white/15 text-[10px] tracking-[0.2em] uppercase">{t("landing.mockTap")}</span>
      </div>

      {/* Bottom input bar */}
      <div className="px-3 pb-4">
        <div className="w-full h-10 bg-white/[0.04] border border-white/[0.10] rounded-full flex items-center px-4">
          <span className="text-[12px] text-white/20 flex-1">{t("landing.mockAsk")}</span>
          <Send size={13} className="text-white/20" />
        </div>
      </div>
    </div>
  );
}

function QuizMockup() {
  const t = useT();
  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2rem] border border-white/[0.08] bg-[#060612] overflow-hidden shadow-2xl shadow-black/40 relative">
      {/* Header */}
      <div>
        <div className="px-4 pt-4 pb-2.5 flex items-center">
          <ChevronLeft size={20} className="text-white/40" />
          <span className="text-white/40 text-[12px] font-semibold ml-auto">1/3</span>
        </div>
        <div className="w-full h-px bg-white/[0.06]">
          <div className="h-full w-[33%] bg-white/40" />
        </div>
      </div>

      {/* Question */}
      <div className="px-5 pt-7 pb-4">
        <h2 className={`${serif} text-white/95 font-bold text-[19px] leading-snug`}>
          {t("landing.mockQuizQ")}
        </h2>
      </div>

      {/* Options */}
      <div className="px-4 flex flex-col gap-2.5">
        {/* Dimmed option */}
        <div className="min-h-[50px] rounded-2xl flex items-center px-3.5 gap-3 bg-white/[0.02] border border-white/[0.05] opacity-35">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border bg-white/[0.04] text-white/20 border-white/[0.08] flex-shrink-0">A</span>
          <span className="font-medium text-[13px] text-white/80">{t("landing.mockQuizA")}</span>
        </div>
        {/* Correct option — emerald */}
        <div className="min-h-[50px] rounded-2xl flex items-center px-3.5 gap-3 bg-emerald-500/10 border-2 border-emerald-500/50">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border bg-emerald-500 text-white border-emerald-400 flex-shrink-0">
            <Check size={13} strokeWidth={3} />
          </span>
          <span className="font-medium text-[13px] text-emerald-200">{t("landing.mockQuizB")}</span>
        </div>
        {/* Dimmed option */}
        <div className="min-h-[50px] rounded-2xl flex items-center px-3.5 gap-3 bg-white/[0.02] border border-white/[0.05] opacity-35">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border bg-white/[0.04] text-white/20 border-white/[0.08] flex-shrink-0">C</span>
          <span className="font-medium text-[13px] text-white/80">{t("landing.mockQuizC")}</span>
        </div>
      </div>

      {/* Feedback panel — slide up from bottom */}
      <div className="mt-4 p-5 pt-6 rounded-t-3xl border-t border-emerald-500/20">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-[17px] flex items-center gap-2 text-emerald-300">
            <Sparkles size={20} className="text-emerald-400 fill-emerald-400" />
            {t("landing.mockCorrect")}
          </h3>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.12] px-2.5 py-1 rounded-full">
            <Award size={13} className="text-white/50" />
            <span className="text-white/60 font-bold text-[11px]">+20 XP</span>
          </div>
        </div>
        <p className="text-white/55 text-[12px] leading-relaxed font-medium">
          {t("landing.mockQuizExplain")}
        </p>
        <div className="mt-5 w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-white/90 font-bold text-[14px]">{t("landing.mockNext")}</span>
        </div>
      </div>
    </div>
  );
}

function UniverseMockup() {
  const t = useT();
  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2rem] border border-white/[0.08] bg-[#060612] overflow-hidden shadow-2xl shadow-black/40 relative">
      {/* 3D Canvas — actual BookStar + StarField */}
      <div className="absolute inset-0 z-0">
        <UniverseMockupScene />
      </div>

      {/* Top: Date + Greeting */}
      <div className="relative z-10 px-6 pt-8">
        <p className="text-white/25 text-[10px] font-semibold tracking-[0.15em] uppercase">
          {t("landing.mockDate")}
        </p>
        <h1 className={`${serif} text-white/90 text-[24px] font-bold mt-1.5 leading-tight`}>
          {t("landing.mockGreeting")}
        </h1>
        <p className="text-white/40 text-[12px] mt-0.5 font-medium">
          {t("landing.mockGreetSub")}
        </p>
      </div>

      {/* Spacer for 3D stars area */}
      <div className="relative h-[320px]" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ height: "40%", background: "linear-gradient(to top, rgba(6,6,18,0.9) 0%, transparent 100%)" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 1, ease } }),
};

const MOCKUPS = [LessonMockup, QuizMockup, UniverseMockup] as const;

/* ═══════════════════════════════════════════════════════════════════
   Landing page
   ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.97]);
  const [leaving, setLeaving] = useState(false);
  const mobile = useIsMobile();
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const navigateTo = useCallback((path: string) => {
    setLeaving(true);
    setTimeout(() => router.push(path), 600);
  }, [router]);

  const showcases = [
    { titleKey: "landing.showcase1Title" as const, descKey: "landing.showcase1Desc" as const, Mockup: MOCKUPS[0] },
    { titleKey: "landing.showcase2Title" as const, descKey: "landing.showcase2Desc" as const, Mockup: MOCKUPS[1] },
    { titleKey: "landing.showcase3Title" as const, descKey: "landing.showcase3Desc" as const, Mockup: MOCKUPS[2] },
  ];

  const steps = [
    { num: "01", key: "landing.step1" as const },
    { num: "02", key: "landing.step2" as const },
    { num: "03", key: "landing.step3" as const },
    { num: "04", key: "landing.step4" as const },
  ];

  const pillars = [
    { bigKey: "landing.pillar1Big" as const, subKey: "landing.pillar1Sub" as const },
    { bigKey: "landing.pillar2Big" as const, subKey: "landing.pillar2Sub" as const },
    { bigKey: "landing.pillar3Big" as const, subKey: "landing.pillar3Sub" as const },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[#060612] text-white overflow-x-clip selection:bg-white/10"
      animate={leaving ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease }}
    >
      <StarField lite={mobile} />
      {!mobile && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-30%] left-[20%] w-[800px] h-[800px] rounded-full bg-indigo-900/[0.07] blur-[150px]" />
          <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] rounded-full bg-violet-900/[0.05] blur-[120px]" />
        </div>
      )}

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease }}
        className="fixed top-0 left-0 right-0 z-50 bg-[rgba(6,6,18,0.6)] backdrop-blur-md"
      >
        <div className="mx-auto flex items-center justify-between px-8 sm:px-12 py-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className={`${serif} font-brand text-[22px] font-bold tracking-tight text-white/70 group-hover:text-white/90 transition-colors duration-500`}>
              Cosmii
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo("/login")}
              className="text-[14px] tracking-wide text-white/50 hover:text-white/80 transition-colors duration-500"
            >
              {t("landing.signIn")}
            </button>
            <button
              onClick={() => navigateTo("/login")}
              className="text-[14px] tracking-wide text-white/70 hover:text-white/95 px-5 py-2 rounded-full border border-white/[0.12] hover:border-white/[0.25] bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm transition-all duration-500"
            >
              {t("landing.getStarted")}
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </motion.nav>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex items-center justify-center h-[92vh] px-6 sm:px-12 pb-16 sm:pb-0"
      >
        {!mobile && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
          </div>
        )}

        <div className="relative flex flex-col lg:flex-row items-center gap-3 lg:gap-16 max-w-6xl mx-auto">
          <motion.div custom={0.2} variants={fadeUp} initial="hidden" animate="visible"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] lg:hidden">
            <span className="text-[12px] text-white/35">{t("landing.badge")}</span>
          </motion.div>

          <motion.div
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex-shrink-0 relative order-none lg:order-last"
          >
            {!mobile && <div className="absolute inset-0 scale-150 rounded-full bg-emerald-400/[0.04] blur-[80px] pointer-events-none" />}
            <CosmiiSprite mobile={mobile} />
          </motion.div>

          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div custom={0.2} variants={fadeUp} initial="hidden" animate="visible"
              className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] mb-8">
              <span className="text-[12px] text-white/35">{t("landing.badge")}</span>
            </motion.div>
            <motion.h1 custom={0.35} variants={fadeUp} initial="hidden" animate="visible" className="max-w-2xl mb-6">
              <span className={`${serif} text-[40px] sm:text-[56px] md:text-[68px] font-normal leading-[1.1] tracking-tight text-white whitespace-pre-line`}>
                {t("landing.heroTitle")}
              </span>
            </motion.h1>
            <motion.p custom={0.5} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[15px] sm:text-[17px] leading-[1.8] text-white/35 max-w-[520px] mb-10">
              {t("landing.heroSub")}
            </motion.p>
            <motion.div custom={0.65} variants={fadeUp} initial="hidden" animate="visible">
              <Link href="/login"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02]">
                {t("landing.cta")}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] tracking-[0.15em] uppercase text-white/50">{t("landing.scroll")}</span>
          <motion.div
            className="w-[20px] h-[30px] rounded-full border border-white/30 flex items-start justify-center pt-1.5"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="w-[3px] h-[6px] rounded-full bg-white/60"
              animate={{ y: [0, 8], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Feature Showcase */}
      {showcases.map((s, i) => {
        const reversed = i % 2 === 1;
        const MockupComponent = s.Mockup;
        return (
          <section key={s.titleKey} className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-20 sm:py-28">
            <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease }}
                className="flex-1 max-w-md"
              >
                <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-5 leading-[1.2] whitespace-pre-line`}>
                  {t(s.titleKey)}
                </h2>
                <p className="text-[15px] text-white/35 leading-[1.8]">{t(s.descKey)}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.15, ease }}
                className="flex-1 flex justify-center w-full"
              >
                <MockupComponent />
              </motion.div>
            </div>
          </section>
        );
      })}

      {/* Emotional hook — replaces redundant Features Grid */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-4 leading-[1.2] whitespace-pre-line`}>
            {t("landing.hookTitle")}
          </h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed">
            {t("landing.hookSub")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-px sm:gap-0">
          {pillars.map((p, i) => (
            <motion.div
              key={p.bigKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="text-center py-6 sm:py-8 sm:border-r sm:last:border-r-0 border-white/[0.04]"
            >
              <p className={`${serif} text-[28px] sm:text-[32px] font-normal text-white/80 mb-2`}>{t(p.bigKey)}</p>
              <p className="text-[13px] text-white/30">{t(p.subKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 py-20 sm:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-4`}>{t("landing.howTitle")}</h2>
        </motion.div>
        <div className="space-y-0">
          {steps.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-center gap-6 py-5 border-b border-white/[0.04] last:border-0">
              <span className="text-[12px] font-mono text-white/15 w-6 flex-shrink-0">{s.num}</span>
              <p className="text-[15px] text-white/50">{t(s.key)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guarantee — emotional */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="max-w-lg mx-auto text-center"
        >
          <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-5 leading-[1.2] whitespace-pre-line`}>
            {t("landing.guaranteeTitle")}
          </h2>
          <p className={`${serif} italic text-[15px] sm:text-[16px] text-white/35 leading-[1.9] max-w-sm mx-auto`}>
            {t("landing.guaranteeSub")}
          </p>
        </motion.div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-5`}>{t("landing.closingTitle")}</h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed mb-10">{t("landing.closingSub")}</p>
          <Link href="/login"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]">
            {t("landing.cta")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-20 pb-12 px-8 sm:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-14" />
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          <div>
            <span className={`${serif} font-brand text-[18px] font-bold tracking-tight text-white/70`}>Cosmii</span>
            <p className="text-[12px] text-white/25 mt-3 leading-relaxed whitespace-pre-line">{t("landing.footerTagline")}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">{t("landing.footerPages")}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/universe" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">{t("landing.footerUniverse")}</Link>
              <Link href="/login" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">{t("landing.footerSignIn")}</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">{t("landing.footerSocial")}</p>
            <div className="flex flex-col gap-2.5">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">X</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">GitHub</a>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">{t("landing.footerTerms")}</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">{t("landing.footerPrivacy")}</Link>
              <Link href="/terms" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">{t("landing.footerTos")}</Link>
              <button
                onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
                className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300 text-left"
              >
                {language === "ko" ? "English" : "한국어"}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
