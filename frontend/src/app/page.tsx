"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, Check, ChevronLeft, ChevronUp, Flame, Lightbulb, RotateCcw, Smartphone, Sparkles } from "lucide-react";
import { useIsMobile } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/store";
import { DEMO_BOOKS, DEMO_LESSONS, type DemoBook } from "@/lib/demo-data";
import { BETA_BOOK_IDS, BOOK_COVER_MAP } from "@/lib/curations";
import { ConceptDialogue } from "@/components/concept-dialogue";
import { QuizView } from "@/components/quiz-view";

const serif = "font-[var(--font-serif)]";
const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════
   Cosmii hero animation
   ═══════════════════════════════════════════════════════════════════ */

function CosmiiSprite({ mobile }: { mobile: boolean }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-full blur-[60px]"
        style={{ background: "radial-gradient(circle, rgba(110,220,180,0.18) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={mobile
          ? "relative w-[100px] h-[100px]"
          : "relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px]"
        }
        style={{ WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 75%)", maskImage: "radial-gradient(circle, black 50%, transparent 75%)" }}
        animate={{
          y: [0, -14, 0],
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
    </div>
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
    const starCount = lite ? 50 : 140;
    const linkDist = lite ? 100 : 130;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; baseOpacity: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < starCount; i++) {
      const o = Math.random() * 0.4 + 0.1;
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.3 + 0.3, speed: Math.random() * 0.12 + 0.02, opacity: o, baseOpacity: o });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.12 * Math.min(stars[i].opacity, stars[j].opacity);
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(180,200,240,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
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
      <div className="flex flex-col items-center gap-0.5 pb-4">
        <ChevronUp size={14} className="text-white/20" />
        <span className="text-white/15 text-[10px] tracking-[0.2em] uppercase">{t("landing.mockTap")}</span>
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

function StreakMockup() {
  const t = useT();
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const todayIdx = 4;
  const streakDays = 5;

  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2rem] border border-white/[0.08] bg-[#060612] overflow-hidden shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-[18px] font-bold" style={{ fontFamily: "'EB Garamond', Georgia, serif", letterSpacing: 0.4 }}>Cosmii</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-white/30" />
            <span className="text-white/60 text-[13px]" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>5</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={14} className="text-white/30" />
            <span className="text-white/60 text-[13px]" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>420</span>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-white/[0.06]" />

      {/* Reading progress card */}
      <div className="px-5 pt-5 pb-4">
        <button className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3.5 text-left">
          <div className="w-[48px] h-[68px] rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0">
            <img src="/covers/s_atomic.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold mb-1">{t("landing.mockRecent")}</p>
            <p className={`${serif} text-white/90 text-[15px] font-bold truncate`}>{t("landing.mockStreakBook")}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-white/25 rounded-full" style={{ width: "43%" }} />
              </div>
              <span className="text-white/25 text-[10px] flex-shrink-0">43%</span>
            </div>
          </div>
        </button>
      </div>

      {/* Week streak card */}
      <div className="px-5 pb-4">
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={15} className="text-white/55 fill-white/55" />
            <span className={`${serif} text-white/70 text-[13px] font-semibold`}>{t("landing.mockStreakWeek")}</span>
          </div>
          <div className="flex justify-between">
            {days.map((day, i) => {
              const isActive = i <= todayIdx && i > todayIdx - streakDays;
              const isToday = i === todayIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isToday ? "bg-white/[0.15] border-white/30" : isActive ? "bg-white/[0.08] border-white/[0.15]" : "bg-white/[0.03] border-white/[0.07]"
                  }`}>
                    {isActive || isToday
                      ? <Flame size={15} className={isToday ? "text-white/80 fill-white/80" : "text-white/45 fill-white/45"} />
                      : <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                    }
                  </div>
                  <span className={`${serif} text-[11px] font-semibold ${isToday ? "text-white/70" : "text-white/35"}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 pb-5 flex gap-3">
        <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col items-center gap-1">
          <Sparkles size={16} className="text-white/55 fill-white/55" />
          <span className="text-white/25 text-[10px]">총 XP</span>
          <span className={`${serif} text-white/70 text-[16px] font-bold`}>420</span>
        </div>
        <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col items-center gap-1">
          <Flame size={16} className="text-white/55 fill-white/55" />
          <span className="text-white/25 text-[10px]">스트릭</span>
          <span className={`${serif} text-white/70 text-[16px] font-bold`}>5일</span>
        </div>
      </div>
    </div>
  );
}

function NotesMockup() {
  const t = useT();
  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[2rem] border border-white/[0.08] bg-[#060612] overflow-hidden shadow-2xl shadow-black/40 relative">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <ChevronLeft size={20} className="text-white/40" />
        <div>
          <h2 className={`${serif} text-white/80 font-semibold text-[16px]`}>{t("landing.mockNotesTitle")}</h2>
          <span className="text-white/30 text-[11px]">{t("landing.mockNotesBook")}</span>
        </div>
      </div>
      <div className="w-full h-px bg-white/[0.06]" />

      {/* Keywords */}
      <div className="px-5 pt-5 pb-3">
        <span className="text-white/40 text-[11px] uppercase tracking-[0.14em] font-bold">{t("landing.mockNotesKeywords")}</span>
        <div className="flex flex-wrap gap-2 mt-3">
          {(["landing.mockKeyword1", "landing.mockKeyword2", "landing.mockKeyword3", "landing.mockKeyword4"] as const).map((key) => (
            <span key={key} className="bg-white/[0.06] border border-white/[0.10] text-white/60 text-[12px] font-medium px-3 py-1 rounded-full">
              {t(key)}
            </span>
          ))}
        </div>
      </div>

      {/* Spark insights */}
      <div className="px-5 pt-3 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={13} className="text-white/30" />
          <span className="text-white/40 text-[11px] uppercase tracking-[0.14em] font-bold">{t("landing.mockNotesSparks")}</span>
        </div>
        <div className="space-y-3">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
            <p className="text-white/30 text-[10px] font-semibold mb-1">{t("landing.mockSparkLesson1")}</p>
            <p className="text-white/70 text-[13px] leading-[1.6] font-medium">{t("landing.mockSparkText1")}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
            <p className="text-white/30 text-[10px] font-semibold mb-1">{t("landing.mockSparkLesson2")}</p>
            <p className="text-white/70 text-[13px] leading-[1.6] font-medium">{t("landing.mockSparkText2")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Book Marquee
   ═══════════════════════════════════════════════════════════════════ */

function BookMarqueeRow({ books, direction, speed }: {
  books: string[];
  direction: "right" | "left";
  speed: number;
}) {
  const doubled = [...books, ...books];
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="flex-shrink-0 w-[110px] h-[150px] sm:w-[120px] sm:h-[164px] rounded-lg overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${BOOK_COVER_MAP[id]})` }}
          />
        ))}
      </div>
    </div>
  );
}

function usePreloadCovers(ids: string[]) {
  const [result, setResult] = useState<{ ready: boolean; rows: string[][] }>({ ready: false, rows: [[], [], []] });

  useEffect(() => {
    const entries = ids.map((id) => ({ id, url: BOOK_COVER_MAP[id] })).filter((e) => e.url);
    if (entries.length === 0) { setResult({ ready: true, rows: [[], [], []] }); return; }

    let done = 0;
    const valid: string[] = [];

    const finish = () => {
      const rows: string[][] = [[], [], []];
      valid.forEach((id, i) => rows[i % 3].push(id));
      setResult({ ready: true, rows });
    };

    entries.forEach(({ id, url }) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.naturalWidth > 10 && img.naturalHeight > 10) valid.push(id);
        if (++done >= entries.length) finish();
      };
      img.onerror = () => { if (++done >= entries.length) finish(); };
      img.src = url;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}

function BookMarquee() {
  const t = useT();
  const { ready, rows } = usePreloadCovers(BETA_BOOK_IDS as unknown as string[]);

  return (
    <section className="relative z-10 py-20 sm:py-28 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease }}
        className="text-center mb-12 sm:mb-16 px-6"
      >
        <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-4 leading-[1.2]`}>
          {t("landing.bookShowcaseTitle")}
        </h2>
        <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed">
          {t("landing.bookShowcaseDesc")}
        </p>
      </motion.div>

      <div
        className="space-y-3 transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {rows[0].length > 0 && <BookMarqueeRow books={rows[0]} direction="right" speed={45} />}
        {rows[1].length > 0 && <BookMarqueeRow books={rows[1]} direction="left" speed={50} />}
        {rows[2].length > 0 && <BookMarqueeRow books={rows[2]} direction="right" speed={42} />}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 1, ease } }),
};

const MOCKUPS = [LessonMockup, QuizMockup, StreakMockup] as const;

/* ═══════════════════════════════════════════════════════════════════
   Landing page
   ═══════════════════════════════════════════════════════════════════ */

type DemoPhase = "pick" | "lesson" | "quiz" | "done";

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
  const isKo = language === "ko";

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("pick");
  const [demoBook, setDemoBook] = useState<DemoBook | null>(null);
  const [demoScore, setDemoScore] = useState(0);

  const openDemo = useCallback(() => {
    setDemoOpen(true);
    setDemoPhase("pick");
    setDemoBook(null);
    setDemoScore(0);
  }, []);

  const closeDemo = useCallback(() => {
    setDemoOpen(false);
  }, []);

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
    <>
      {/* Nav — outside transform container so fixed positioning works correctly */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={leaving ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", background: "#060612" }}
      >
        <nav className="mx-auto flex items-center justify-between px-4 sm:px-12 py-3 sm:py-4">
          <Link href="/" className="group flex items-center gap-2.5 flex-shrink-0">
            <span className={`${serif} font-brand text-[20px] sm:text-[22px] font-bold tracking-tight text-white/70 group-hover:text-white/90 transition-colors duration-500`}>
              Cosmii
            </span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => navigateTo("/login")}
              className="text-[13px] sm:text-[14px] tracking-wide text-white/50 hover:text-white/80 transition-colors duration-500 whitespace-nowrap"
            >
              {t("landing.signIn")}
            </button>
            <button
              onClick={openDemo}
              className="text-[13px] sm:text-[14px] tracking-wide text-white/70 hover:text-white/95 px-4 sm:px-5 py-2 rounded-full border border-white/[0.12] hover:border-white/[0.25] bg-white/[0.05] hover:bg-white/[0.08] transition-all duration-500 whitespace-nowrap"
            >
              {t("landing.getStarted")}
            </button>
          </div>
        </nav>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </motion.div>

      <motion.div
        className="min-h-screen bg-[#060612] text-white selection:bg-white/10 break-keep"
        animate={leaving ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
      >
      <StarField lite />

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

        <div className="relative flex flex-col items-start gap-6 max-w-6xl mx-auto">
          <motion.div
            custom={0.2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex-shrink-0 relative"
          >
            {!mobile && <div className="absolute inset-0 scale-150 rounded-full bg-emerald-400/[0.04] blur-[80px] pointer-events-none" />}
            <CosmiiSprite mobile={mobile} />
          </motion.div>

          <div className="flex-1 flex flex-col items-start text-left">
            <motion.h1 custom={0.35} variants={fadeUp} initial="hidden" animate="visible" className="max-w-2xl mb-6">
              <span className={`${serif} text-[28px] sm:text-[44px] md:text-[52px] font-normal leading-[1.2] tracking-tight text-white whitespace-pre-line`}>
                {t("landing.heroTitle")}
              </span>
            </motion.h1>
            <motion.p custom={0.5} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[15px] sm:text-[17px] leading-[1.8] text-white/35 max-w-[480px] mb-10">
              {t("landing.heroSub")}
            </motion.p>
            <motion.div custom={0.65} variants={fadeUp} initial="hidden" animate="visible">
              <button
                onClick={openDemo}
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02]">
                {t("landing.cta")}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
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

      {/* Emotional Hook + Pillars */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-6 leading-[1.3] whitespace-pre-line`}>
            {t("landing.hookTitle")}
          </h2>
          <p className="text-[15px] text-white/35 max-w-lg mx-auto leading-[1.9]">
            {t("landing.hookSub")}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.bigKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="text-center py-6 sm:py-8 sm:border-r sm:last:border-r-0 border-white/[0.04]"
            >
              <p className={`${serif} text-[17px] sm:text-[18px] font-semibold text-white/80 mb-2.5 leading-snug`}>{t(p.bigKey)}</p>
              <p className="text-[13px] text-white/30 leading-relaxed max-w-[240px] mx-auto">{t(p.subKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Demo Books */}
      <section className="relative z-10 py-20 sm:py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className={`${serif} text-[28px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-4 leading-[1.2] whitespace-pre-line`}>
            {t("landing.featuredTitle")}
          </h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed whitespace-pre-line">
            {t("landing.featuredDesc")}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {DEMO_BOOKS.map((book, i) => {
            const coverSrc = book.coverUrl || `/covers/${book.id}.jpg`;
            const tagKey = book.id === "s_atomic" ? "landing.featuredTagAtomic" as const
              : book.id === "s_money_psych" ? "landing.featuredTagMoney" as const
              : "landing.featuredTagSapiens" as const;
            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-full max-w-[200px] aspect-[3/4.3] rounded-xl overflow-hidden mb-5 shadow-lg"
                  style={{ boxShadow: `0 8px 32px ${book.color}25, 0 2px 8px rgba(0,0,0,0.4)` }}
                >
                  <img src={coverSrc} alt={isKo ? book.title : book.titleEn} className="w-full h-full object-cover" />
                </div>
                <h3 className={`${serif} text-[18px] font-semibold text-white/90 mb-1.5`}>
                  {isKo ? book.title : book.titleEn}
                </h3>
                <p className="text-[13px] text-white/35 mb-5 leading-snug max-w-[220px]">
                  {t(tagKey)}
                </p>
                <button
                  onClick={() => {
                    setDemoOpen(true);
                    setDemoBook(book);
                    setDemoPhase("lesson");
                    setDemoScore(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] text-[13px] text-white/60 hover:text-white/90 hover:bg-white/[0.08] hover:border-white/[0.20] transition-all duration-300"
                >
                  {t("landing.featuredCta")}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

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

      {/* Book Marquee */}
      <BookMarquee />

      {/* How it works */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 py-20 sm:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className={`${serif} text-[26px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-5 leading-[1.3] whitespace-pre-line`}>{t("landing.howTitle")}</h2>
          <p className="text-[14px] text-white/30 max-w-md mx-auto leading-[1.8] whitespace-pre-line">{t("landing.howSub")}</p>
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

      {/* Guarantee / Reassurance */}
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
          <p className="text-[15px] text-white/35 leading-[1.9] max-w-sm mx-auto mb-10">
            {t("landing.guaranteeSub")}
          </p>
          <button
            onClick={openDemo}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/[0.12] bg-white/[0.05] text-white/70 text-[13px] font-medium transition-all duration-300 hover:bg-white/[0.10] hover:text-white/95 hover:border-white/[0.25]">
            {t("landing.guaranteeCta")}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        </motion.div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 py-24 sm:py-32 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-5 whitespace-pre-line`}>{t("landing.closingTitle")}</h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed mb-10">{t("landing.closingSub")}</p>
          <button
            onClick={openDemo}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]">
            {t("landing.cta")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
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

      {/* ═══ Demo Overlay ═══ */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="fixed inset-0 z-[100] bg-[#060612]"
          >
            {demoPhase === "pick" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center px-5 sm:px-8 py-16 overflow-y-auto"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease }}
                  className="text-center mb-10 sm:mb-14"
                >
                  <h1 className={`${serif} text-[26px] sm:text-[36px] font-normal tracking-tight text-white/90 mb-3`}>
                    {t("demo.pickTitle")}
                  </h1>
                  <p className="text-[14px] sm:text-[15px] text-white/30">{t("demo.pickSub")}</p>
                </motion.div>

                <div className="w-full max-w-[720px] grid grid-cols-3 gap-3 sm:gap-5">
                  {DEMO_BOOKS.map((book, i) => {
                    const coverSrc = book.coverUrl || `/covers/${book.id}.jpg`;
                    return (
                      <motion.button
                        key={book.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease }}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setDemoBook(book);
                          setDemoPhase("lesson");
                        }}
                        className="group flex flex-col items-center text-center relative"
                      >
                        {/* Cover */}
                        <div
                          className="relative w-full aspect-[3/4.3] rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 shadow-lg"
                          style={{ boxShadow: `0 8px 32px ${book.color}25, 0 2px 8px rgba(0,0,0,0.4)` }}
                        >
                          <img
                            src={coverSrc}
                            alt={isKo ? book.title : book.titleEn}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          {/* Gradient fallback always behind */}
                          <div
                            className="absolute inset-0 -z-10"
                            style={{
                              background: `linear-gradient(160deg, ${book.color}90 0%, ${book.color}30 50%, #0a0a1a 100%)`,
                            }}
                          />
                          {/* Bottom gradient for readability */}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                          {/* Hover glow */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at 50% 80%, ${book.color}20, transparent 70%)`,
                            }}
                          />
                        </div>

                        {/* Text */}
                        <h3 className={`${serif} text-[13px] sm:text-[16px] font-semibold text-white/90 leading-tight mb-0.5 sm:mb-1`}>
                          {isKo ? book.title : book.titleEn}
                        </h3>
                        <p className="text-[10px] sm:text-[12px] text-white/35 mb-1 sm:mb-1.5 leading-snug">
                          {isKo ? book.author : book.authorEn}
                        </p>
                        <p className="text-[10px] sm:text-[12px] text-white/20 leading-snug hidden sm:block">
                          {isKo ? book.tagline : book.taglineEn}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={closeDemo}
                  className="mt-8 sm:mt-10 flex items-center gap-1.5 text-[13px] text-white/25 hover:text-white/50 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  뒤로
                </motion.button>
              </motion.div>
            )}

            {demoPhase === "lesson" && demoBook && DEMO_LESSONS[demoBook.id] && (
              <div className="h-full">
                <ConceptDialogue
                  bookId={demoBook.id}
                  bookTitle={isKo ? demoBook.title : demoBook.titleEn}
                  chapter={isKo ? DEMO_LESSONS[demoBook.id].chapter : DEMO_LESSONS[demoBook.id].chapterEn}
                  lessonTitle={isKo ? DEMO_LESSONS[demoBook.id].title : DEMO_LESSONS[demoBook.id].titleEn}
                  currentLesson={1}
                  totalLessons={1}
                  progressPercent={0}
                  dialogue={isKo ? DEMO_LESSONS[demoBook.id].dialogue : DEMO_LESSONS[demoBook.id].dialogueEn}
                  spark=""
                  isFirstInChapter
                  onBack={() => setDemoPhase("pick")}
                  onComplete={() => setDemoPhase("quiz")}
                />
              </div>
            )}

            {demoPhase === "quiz" && demoBook && DEMO_LESSONS[demoBook.id] && (
              <div className="h-full">
                <QuizView
                  quizzes={isKo ? DEMO_LESSONS[demoBook.id].quizzes : DEMO_LESSONS[demoBook.id].quizzesEn}
                  progressPercent={100}
                  onBack={() => setDemoPhase("pick")}
                  onComplete={(score) => {
                    setDemoScore(score);
                    setDemoPhase("done");
                  }}
                />
              </div>
            )}

            {demoPhase === "done" && demoBook && (() => {
              const lesson = DEMO_LESSONS[demoBook.id];
              const doneCover = demoBook.coverUrl || `/covers/${demoBook.id}.jpg`;
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full relative flex flex-col items-center justify-center px-6 overflow-hidden"
                >
                  {/* Blurred cover background */}
                  <div className="absolute inset-0 -z-10">
                    <img src={doneCover} alt="" className="absolute inset-0 w-full h-full object-cover blur-[60px] scale-125 opacity-20" />
                    <div className="absolute inset-0 bg-[#060612]/80" />
                  </div>

                  <div className="text-center max-w-[380px] w-full">
                    {/* Mini cover + title */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.6, ease }}
                      className="flex flex-col items-center mb-6"
                    >
                      <div
                        className="w-[72px] h-[100px] rounded-lg overflow-hidden mb-4 shadow-lg"
                        style={{ boxShadow: `0 4px 24px ${demoBook.color}30` }}
                      >
                        <img src={doneCover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <h1 className={`${serif} text-[26px] sm:text-[34px] font-normal tracking-tight text-white/90 mb-2 leading-[1.3] whitespace-pre-line`}>
                        {t("demo.completeTitle")}
                      </h1>
                    </motion.div>

                    {/* cliffhanger */}
                    {lesson && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.6, ease }}
                        className="mb-10 px-2"
                      >
                        <p className="text-[11px] text-white/20 uppercase tracking-[0.15em] mb-3">
                          {t("demo.nextLabel")} — {isKo ? lesson.nextTitle : lesson.nextTitleEn}
                        </p>
                        <p className={`${serif} text-[15px] text-white/40 leading-[1.8] italic`}>
                          {isKo ? lesson.cliffhanger : lesson.cliffhangerEn}
                        </p>
                      </motion.div>
                    )}

                    {/* primary CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.5, ease }}
                      className="mb-6"
                    >
                      <button
                        onClick={() => {
                          localStorage.setItem("cosmii-demo-book", demoBook.id);
                          localStorage.setItem("cosmii-demo-score", String(demoScore));
                          navigateTo("/login");
                        }}
                        className="group w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#060612] text-[14px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02]"
                      >
                        {t("demo.signupCta")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </button>
                    </motion.div>

                    {/* app download */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.85, duration: 0.5 }}
                      className="flex flex-col items-center gap-3 text-[12px]"
                    >
                      <a
                        href="https://apps.apple.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/45 transition-colors"
                      >
                        <Smartphone size={13} />
                        <span>{t("demo.appTitle")} — {t("demo.appDesc")}</span>
                      </a>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
