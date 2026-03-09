"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, Network, MessageCircle, Search } from "lucide-react";
import { UniverseCanvas } from "@/components/universe-canvas";
import { useIsMobile } from "@/lib/utils";
import type { BookInfo, GraphNode, GraphEdge, GraphData } from "@/lib/types";

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
   Demo mock data — Pride & Prejudice knowledge graph
   ═══════════════════════════════════════════════════════════════════ */

const DEMO_BOOKS: BookInfo[] = [
  { book_id: "pride", title: "Pride & Prejudice", author: "Jane Austen", total_chunks: 120, domain: "Literature", ingested_at: "2024-01-15" },
  { book_id: "1984", title: "1984", author: "George Orwell", total_chunks: 95, domain: "Literature", ingested_at: "2024-01-16" },
  { book_id: "sapiens", title: "Sapiens", author: "Yuval Noah Harari", total_chunks: 150, domain: "History", ingested_at: "2024-01-17" },
  { book_id: "dune", title: "Dune", author: "Frank Herbert", total_chunks: 130, domain: "Literature", ingested_at: "2024-01-18" },
];

/* label:type — Person 0-24, Concept 25-54, Event 55-79, Place 80-94, Strategy 95-99 */
const PP: string[] = [
  "Elizabeth Bennet:Person","Mr. Darcy:Person","Jane Bennet:Person","Mr. Bingley:Person",
  "Lydia Bennet:Person","Mr. Wickham:Person","Mrs. Bennet:Person","Mr. Bennet:Person",
  "Lady Catherine:Person","Charlotte Lucas:Person","Mr. Collins:Person","Georgiana Darcy:Person",
  "Caroline Bingley:Person","Mary Bennet:Person","Kitty Bennet:Person","Mrs. Gardiner:Person",
  "Mr. Gardiner:Person","Col. Fitzwilliam:Person","Sir William Lucas:Person","Mrs. Reynolds:Person",
  "Mrs. Hurst:Person","Mr. Hurst:Person","Mrs. Phillips:Person","Mrs. Long:Person","Mr. Denny:Person",
  "Pride:Concept","Prejudice:Concept","Social Class:Concept","Marriage:Concept",
  "First Impressions:Concept","Reputation:Concept","Propriety:Concept","Entailment:Concept",
  "Courtship:Concept","Virtue:Concept","Vanity:Concept","Wit:Concept",
  "Self-awareness:Concept","Growth:Concept","Morality:Concept","Honor:Concept",
  "Wealth:Concept","Status:Concept","Love:Concept","Independence:Concept",
  "Intelligence:Concept","Family Duty:Concept","Judgement:Concept","Decorum:Concept",
  "Affection:Concept","Resilience:Concept","Discernment:Concept","Hypocrisy:Concept",
  "Benevolence:Concept","Stubbornness:Concept",
  "Meryton Assembly:Event","Netherfield Ball:Event","Hunsford Proposal:Event",
  "Pemberley Visit:Event","Lydia's Elopement:Event","Second Proposal:Event",
  "Collins's Proposal:Event","Jane's Illness:Event","Darcy's Letter:Event",
  "Lady Catherine's Visit:Event","Wickham's Departure:Event","Bingley's Return:Event",
  "Elizabeth's Rejection:Event","Rosings Dinner:Event","Brighton Trip:Event",
  "Wedding:Event","Charlotte's Marriage:Event","Darcy's First Slight:Event",
  "Elizabeth at Rosings:Event","Gardiner's Invitation:Event","Discovering Pemberley:Event",
  "Mr. Collins's Arrival:Event","Militia in Meryton:Event","Wickham & Georgiana:Event",
  "Fitzwilliam's Revelation:Event",
  "Longbourn:Place","Netherfield Park:Place","Pemberley:Place","Rosings Park:Place",
  "Meryton:Place","London:Place","Brighton:Place","Hunsford:Place",
  "Derbyshire:Place","Gracechurch Street:Place","Lucas Lodge:Place",
  "Lambton:Place","Hertfordshire:Place","Kent:Place","Bath:Place",
  "Social Climbing:Strategy","Marriage of Convenience:Strategy","Deception:Strategy",
  "Self-improvement:Strategy","Class Resistance:Strategy",
];

const PP_EDGES: [number, number][] = [
  [0,1],[0,2],[0,4],[0,6],[0,7],[0,9],[0,17],[1,3],[1,5],[1,8],[1,11],[1,17],
  [2,3],[2,6],[3,12],[4,5],[4,6],[4,14],[5,11],[5,24],[6,7],[6,22],[8,10],[9,10],[10,6],
  [12,20],[13,7],[14,4],[15,16],
  [0,26],[0,36],[0,44],[0,45],[1,25],[1,27],[1,41],[1,42],[2,43],[2,49],[3,43],[3,49],
  [4,35],[4,54],[5,52],[5,30],[6,28],[6,41],[6,46],[7,36],[7,45],[8,31],[8,42],
  [9,29],[9,47],[10,52],[10,31],
  [0,55],[0,56],[0,57],[0,58],[0,60],[0,63],[0,67],[0,73],[0,79],
  [1,55],[1,56],[1,57],[1,58],[1,60],[1,63],[1,72],
  [2,55],[2,56],[2,62],[3,55],[3,56],[3,66],[4,59],[4,69],
  [5,55],[5,65],[5,78],[9,61],[10,61],[10,76],
  [55,84],[56,81],[57,82],[58,82],[59,86],[60,82],[61,80],
  [62,81],[63,83],[64,80],[66,81],[68,80],[69,86],[70,80],
  [25,26],[25,27],[26,29],[28,33],[30,31],[37,38],[41,42],[43,44],[47,48],
  [25,42],[26,37],[28,43],[33,34],[38,39],[40,41],[46,51],[49,50],[53,54],
  [95,6],[95,10],[96,9],[96,28],[97,5],[98,0],[98,1],[99,0],
];

function buildDemoGraph(maxNodes?: number): GraphData {
  const src = maxNodes ? PP.slice(0, maxNodes) : PP;
  const nodes: GraphNode[] = src.map((raw, i) => {
    const c = raw.lastIndexOf(":");
    return { id: `e${i}`, label: raw.slice(0, c), node_type: raw.slice(c + 1), book_ids: ["pride"] };
  });
  const edges: GraphEdge[] = PP_EDGES
    .filter(([a, b]) => a < nodes.length && b < nodes.length)
    .map(([a, b], i) => ({ source: `e${a}`, target: `e${b}`, relation: "relates_to", chunk_ids: [`c${i}`] }));
  return { nodes, edges };
}

const DEMO_GRAPH = buildDemoGraph();
const DEMO_GRAPH_LITE = buildDemoGraph(50);

/* ═══════════════════════════════════════════════════════════════════
   Interactive 3D demo (same canvas as the real app)
   ═══════════════════════════════════════════════════════════════════ */

const DEMO_QUESTION = "What's the relationship between Elizabeth and Darcy?";
const DEMO_ANSWER =
  "Elizabeth and Darcy's relationship is the central arc — a journey from mutual misunderstanding to genuine love. Elizabeth's initial prejudice, formed at the Meryton Assembly, mirrors Darcy's pride in his social standing. The turning point comes with Darcy's Letter after the Hunsford Proposal, forcing both toward self-awareness and growth.";

function DemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [canvasMounted, setCanvasMounted] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setCanvasMounted(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const [sectionProgress, setSectionProgress] = useState(0);
  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const rafRef = useRef<number>(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    targetProgress.current = v;
  });

  useEffect(() => {
    const tick = () => {
      const diff = targetProgress.current - smoothProgress.current;
      if (Math.abs(diff) > 0.00005) {
        smoothProgress.current += diff * 0.12;
        setSectionProgress(smoothProgress.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const [isLg, setIsLg] = useState(true);
  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const ANIMATION_RANGE = 0.58;
  const ASK_START = 0.64;
  const ASK_END = 0.88;
  const MOBILE_ASK_START = 0.74;

  const demoProgress = Math.min(1, sectionProgress / ANIMATION_RANGE);
  const effectiveAskStart = isLg ? ASK_START : MOBILE_ASK_START;
  const askProgress = Math.max(0, Math.min(1, (sectionProgress - effectiveAskStart) / (ASK_END - effectiveAskStart)));
  const panelOpacity = sectionProgress < 0.03 ? sectionProgress / 0.03 : 1;

  const FIRST_COPY_DELAY = 0.1;
  const FIRST_COPY_FADE_RANGE = 0.08;
  const firstStageEnterProgress =
    demoProgress < 0.16
      ? Math.max(0, Math.min(1, (demoProgress - FIRST_COPY_DELAY) / FIRST_COPY_FADE_RANGE))
      : 1;

  const FOCUS_ZOOM_END = 0.4;
  const ZOOM_COPY_END = 0.60;
  const GRAPH_COMPLETE = isLg ? 0.9 : 0.98;

  const isAskStage = askProgress > 0;

  const stageCopy =
    isAskStage
      ? { key: "silent", title: "", desc: "" }
      : demoProgress < FOCUS_ZOOM_END
        ? {
            key: "books",
            title: "Here are your books.",
            desc: "Each star is one of your books. Let's open your memory universe together.",
          }
        : demoProgress < ZOOM_COPY_END
          ? {
              key: "zoom",
              title: "Ready to dive into this one?",
              desc: "We're zooming into Pride & Prejudice to open its memory space.",
            }
          : demoProgress < GRAPH_COMPLETE
            ? { key: "silent", title: "", desc: "" }
            : {
                key: "graph",
                title: "See how everything connects?",
                desc: "People, concepts, and events appear as nodes, linked by relationships.",
              };

  const isBooksStage = stageCopy.key === "books";

  const shiftProgress = Math.min(1, askProgress / 0.35);
  const canvasShiftX = isLg ? shiftProgress * -18 : 0;
  const canvasDim = isLg ? 1 : 1 - shiftProgress * 0.55;
  const maskBlend = Math.min(1, shiftProgress);
  const currentMask = maskBlend > 0.01
    ? `radial-gradient(ellipse ${62 + 28 * maskBlend}% ${58 + 32 * maskBlend}% at ${50 - (isLg ? 10 : 0) * maskBlend}% 50%, black ${42 + 18 * maskBlend}%, rgba(0,0,0,0.92) ${58 + 22 * maskBlend}%, transparent 100%)`
    : "radial-gradient(ellipse 62% 58% at 50% 50%, black 42%, rgba(0,0,0,0.92) 58%, transparent 100%)";

  const uiProgress = Math.max(0, Math.min(1, (askProgress - 0.35) / 0.65));

  const typingProgress = Math.min(1, uiProgress / 0.45);
  const charCount = Math.floor(typingProgress * DEMO_QUESTION.length);
  const typedText = DEMO_QUESTION.slice(0, charCount);
  const showCursor = typingProgress < 1;

  const thinkingProgress = Math.max(0, Math.min(1, (uiProgress - 0.48) / 0.12));
  const answerProgress = Math.max(0, Math.min(1, (uiProgress - 0.62) / 0.3));
  const answerCharCount = Math.floor(answerProgress * DEMO_ANSWER.length);
  const answerText = DEMO_ANSWER.slice(0, answerCharCount);

  const ctaProgress = Math.max(0, Math.min(1, (uiProgress - 0.92) / 0.08));

  return (
    <section ref={sectionRef} className="relative z-10 h-[1300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <motion.div
          style={{
            opacity: panelOpacity * canvasDim,
            WebkitMaskImage: currentMask,
            maskImage: currentMask,
            transform: `translateX(${canvasShiftX}vw) translateY(4vh)`,
          }}
          className="relative h-[86vh] w-screen pointer-events-none"
        >
          <div className="absolute inset-[-12%] pointer-events-none" style={{ touchAction: "auto" }}>
            {canvasMounted && (
              <UniverseCanvas
                books={DEMO_BOOKS}
                graphData={isLg ? DEMO_GRAPH : DEMO_GRAPH_LITE}
                selectedBookId={null}
                onSelectBook={() => {}}
                demoProgress={demoProgress}
                demoFocusBookId="pride"
                lite={!isLg}
              />
            )}
          </div>
        </motion.div>

        {/* Stage copy text */}
        <div className="absolute left-1/2 top-[16vh] lg:top-[10vh] -translate-x-1/2 w-[min(94vw,58rem)] text-center pointer-events-none px-3">
          <motion.div
            style={{
              opacity: isBooksStage ? firstStageEnterProgress : 1,
              y: isBooksStage ? (1 - firstStageEnterProgress) * 12 : 0,
            }}
          >
            <AnimatePresence mode="wait">
              {stageCopy.key !== "silent" && (
                <motion.div
                  key={stageCopy.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] as const }}
                >
                  <p className="text-[22px] sm:text-[28px] md:text-[32px] text-white/95 tracking-wide leading-[1.15] [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
                    {stageCopy.title}
                  </p>
                  <p className="mt-3 text-[15px] sm:text-[17px] md:text-[18px] text-white/75 max-w-[820px] mx-auto leading-relaxed [text-shadow:0_3px_16px_rgba(0,0,0,0.5)]">
                    {stageCopy.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Ask stage — search UI panel */}
        {uiProgress > 0 && (
          <div
            className="absolute top-[50%] pointer-events-none px-6 w-full max-w-[520px] left-1/2 lg:left-auto lg:right-[14vw] lg:w-[38vw] lg:px-0"
            style={{
              opacity: Math.min(1, uiProgress * 4),
              transform: `translate(${isLg ? "0" : "-50%"}, calc(-50% + ${(1 - Math.min(1, uiProgress * 4)) * 16}px))`,
            }}
          >
            <motion.p
              initial={false}
              className="text-[22px] sm:text-[28px] md:text-[32px] text-white/95 tracking-wide mb-8 [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]"
              style={{ opacity: Math.min(1, uiProgress * 5) }}
            >
              Now, ask your book.
            </motion.p>

            {/* Mock search input */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-3.5 flex items-center gap-3">
              <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[14px] text-white/80">
                  {typedText}
                </span>
                {showCursor && (
                  <span className="inline-block w-[2px] h-[16px] bg-white/60 ml-[1px] align-middle animate-pulse" />
                )}
                {charCount === 0 && (
                  <span className="text-[14px] text-white/20">Ask anything about this book…</span>
                )}
              </div>
            </div>

            {/* Thinking indicator */}
            {thinkingProgress > 0 && answerProgress === 0 && (
              <div
                className="mt-4 flex items-center gap-2 px-4"
                style={{ opacity: thinkingProgress }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400/60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-white/30">Thinking…</span>
              </div>
            )}

            {/* Mock answer */}
            {answerProgress > 0 && (
              <div
                className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-lg px-4 py-3.5"
                style={{ opacity: Math.min(1, answerProgress * 3) }}
              >
                <p className="text-[13px] text-white/65 leading-[1.75]">
                  {answerText}
                  {answerProgress < 1 && (
                    <span className="inline-block w-[2px] h-[14px] bg-indigo-400/50 ml-[1px] align-middle animate-pulse" />
                  )}
                </p>
              </div>
            )}

            {/* CTA button */}
            {ctaProgress > 0 && (
              <div
                className="mt-8 pointer-events-auto"
                style={{ opacity: ctaProgress, transform: `translateY(${(1 - ctaProgress) * 12}px)` }}
              >
                <Link
                  href="/universe"
                  className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Try with your own book
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 1, ease: [0.22, 1, 0.36, 1] as const } }),
};
const serif = "font-[var(--font-serif)]";

const features = [
  { icon: Brain, label: "Deep Memory", desc: "Episodic & semantic memory that captures theses, worldviews, and narrative arcs — not just text chunks." },
  { icon: Network, label: "Knowledge Graph", desc: "Automatically maps people, concepts, and events into an explorable 3D constellation of knowledge." },
  { icon: MessageCircle, label: "Deep Conversation", desc: "Five-stage reasoning — recall, verify, resolve, reason, update — like talking to someone who genuinely read it." },
];
const steps = [
  { num: "01", text: "Upload a PDF, EPUB, or text file" },
  { num: "02", text: "Cosmii reads, extracts, and builds memory" },
  { num: "03", text: "Explore the knowledge universe in 3D" },
  { num: "04", text: "Ask anything — with full context and nuance" },
];

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
   Landing page
   ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.08], [1, 0.97]);
  const [leaving, setLeaving] = useState(false);
  const mobile = useIsMobile();

  const navigateTo = useCallback((path: string) => {
    setLeaving(true);
    setTimeout(() => router.push(path), 600);
  }, [router]);

  return (
    <motion.div
      className="min-h-screen bg-[#060612] text-white overflow-x-clip selection:bg-white/10"
      animate={leaving ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto flex items-center justify-between px-8 sm:px-12 py-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className={`${serif} text-[22px] font-bold tracking-tight text-white/70 group-hover:text-white/90 transition-colors duration-500`}>
              Cosmii
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo("/login")}
              className="text-[14px] tracking-wide text-white/50 hover:text-white/80 transition-colors duration-500"
            >
              Sign in
            </button>
            <button
              onClick={() => navigateTo("/login")}
              className="text-[14px] tracking-wide text-white/70 hover:text-white/95 px-5 py-2 rounded-full border border-white/[0.12] hover:border-white/[0.25] bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-sm transition-all duration-500"
            >
              Get started
            </button>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </motion.nav>

      {/* Hero */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex items-center justify-center h-[92vh] px-6 sm:px-12 pb-16 sm:pb-0">
        {!mobile && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
          </div>
        )}

        <div className="relative flex flex-col lg:flex-row items-center gap-3 lg:gap-16 max-w-6xl mx-auto">
          {/* Badge — tablet only (hidden on mobile & desktop) */}
          <motion.div custom={0.2} variants={fadeUp} initial="hidden" animate="visible"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] lg:hidden">
            <span className="text-[12px] text-white/35">AI Reading Companion</span>
          </motion.div>

          {/* Cosmii GIF — mobile: below badge / desktop: right */}
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

          {/* Text column */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div custom={0.2} variants={fadeUp} initial="hidden" animate="visible"
              className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] mb-8">
              <span className="text-[12px] text-white/35">AI Reading Companion</span>
            </motion.div>
            <motion.h1 custom={0.35} variants={fadeUp} initial="hidden" animate="visible" className="max-w-2xl mb-6">
              <span className={`${serif} text-[40px] sm:text-[56px] md:text-[68px] font-normal leading-[1.1] tracking-tight text-white`}>
                Your books, understood<br /><span className="text-white/35">not just indexed</span>
              </span>
            </motion.h1>
            <motion.p custom={0.5} variants={fadeUp} initial="hidden" animate="visible"
              className="text-[15px] sm:text-[17px] leading-[1.8] text-white/35 max-w-[480px] mb-10">
              Cosmii reads entire books, builds episodic &amp; semantic memory, maps knowledge graphs, and converses with genuine comprehension.
            </motion.p>
            <motion.div custom={0.65} variants={fadeUp} initial="hidden" animate="visible">
              <Link href="/universe"
                className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02]">
                Upload your first book
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] tracking-[0.15em] uppercase text-white/50">Scroll</span>
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

      {/* Interactive 3D demo — same canvas as the real app */}
      <DemoSection />

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-4`}>Memory that understands context</h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed">Beyond keyword matching. Cosmii builds structured memory from every book you upload.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500">
              <f.icon className="w-5 h-5 text-white/25 mb-4" />
              <h3 className="text-[14px] font-medium text-white/75 mb-2">{f.label}</h3>
              <p className="text-[13px] text-white/30 leading-[1.7]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 sm:px-12 py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="text-center mb-16">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-4`}>How it works</h2>
        </motion.div>
        <div className="space-y-0">
          {steps.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-center gap-6 py-5 border-b border-white/[0.04] last:border-0">
              <span className="text-[12px] font-mono text-white/15 w-6 flex-shrink-0">{s.num}</span>
              <p className="text-[15px] text-white/50">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 py-32 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
          <h2 className={`${serif} text-3xl sm:text-4xl font-normal tracking-tight text-white/90 mb-5`}>Start building your book memory</h2>
          <p className="text-[15px] text-white/30 max-w-md mx-auto leading-relaxed mb-10">Upload a book. Cosmii will read it, remember it, and talk about it with you.</p>
          <Link href="/universe"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98]">
            Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-20 pb-12 px-8 sm:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-14" />
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
          <div>
            <span className={`${serif} text-[18px] font-bold tracking-tight text-white/70`}>Cosmii</span>
            <p className="text-[12px] text-white/25 mt-3 leading-relaxed">AI that reads books<br />and remembers them.</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">Pages</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/universe" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Universe</Link>
              <Link href="/login" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Sign in</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">Social</p>
            <div className="flex flex-col gap-2.5">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">X</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">GitHub</a>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/30 mb-4">Terms</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Privacy Policy</Link>
              <Link href="/terms" className="text-[13px] text-white/40 hover:text-white/70 transition-colors duration-300">Terms of Use</Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
