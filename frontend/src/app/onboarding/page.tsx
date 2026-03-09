"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Network, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

const serif = "font-[var(--font-serif)]";

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; baseOp: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 120; i++) {
      const op = Math.random() * 0.4 + 0.05;
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.12 + 0.01, opacity: op, baseOp: op });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,240,${s.opacity})`; ctx.fill();
        s.y += s.speed; s.opacity += (Math.random() - 0.5) * 0.008;
        s.opacity = Math.max(0.03, Math.min(0.5, s.opacity));
        if (s.y > canvas.height + 5) { s.y = -5; s.x = Math.random() * canvas.width; }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
}

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Cosmii",
    desc: "Your personal book universe awaits.\nEverything you read, remembered and connected.",
    visual: "logo",
  },
  {
    icon: BookOpen,
    title: "Upload any book",
    desc: "PDF, EPUB, or plain text.\nCosmii reads every page and builds deep memory.",
    visual: "upload",
  },
  {
    icon: Network,
    title: "See knowledge unfold",
    desc: "People, concepts, and events become an explorable\n3D constellation — your book's universe.",
    visual: "graph",
  },
  {
    icon: MessageCircle,
    title: "Ask with understanding",
    desc: "Five-stage reasoning with full context.\nLike talking to someone who genuinely read it.",
    visual: "chat",
  },
];

function StepVisual({ visual, step }: { visual: string; step: number }) {
  if (visual === "logo") {
    return (
      <motion.div
        key="logo"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-center"
      >
        <div className="relative">
          <img
            src="/cosmii-logo.png"
            alt=""
            className="w-24 h-auto drop-shadow-[0_0_40px_rgba(110,200,170,0.2)]"
          />
          {/* Orbital rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-white/[0.04]"
              style={{
                width: `${160 + i * 60}px`,
                height: `${160 + i * 60}px`,
                left: `50%`,
                top: `50%`,
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              }}
              animate={{ rotate: [i * 30, i * 30 + 360] }}
              transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
            />
          ))}
          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
              style={{
                left: `50%`,
                top: `50%`,
              }}
              animate={{
                x: [
                  Math.cos((i * Math.PI) / 2) * (80 + i * 15),
                  Math.cos((i * Math.PI) / 2 + Math.PI * 2) * (80 + i * 15),
                ],
                y: [
                  Math.sin((i * Math.PI) / 2) * (80 + i * 15),
                  Math.sin((i * Math.PI) / 2 + Math.PI * 2) * (80 + i * 15),
                ],
              }}
              transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const icons = [
    { icon: "📄", x: -40, y: -20, delay: 0 },
    { icon: "📚", x: 30, y: -35, delay: 0.15 },
    { icon: "✨", x: 0, y: 30, delay: 0.3 },
  ];

  if (visual === "upload") {
    return (
      <motion.div
        key="upload"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center"
      >
        <div className="relative w-48 h-48">
          {/* Glowing center */}
          <motion.div
            className="absolute inset-0 m-auto w-20 h-20 rounded-2xl border border-white/[0.1] bg-white/[0.03] backdrop-blur flex items-center justify-center"
            animate={{ boxShadow: ["0 0 30px rgba(99,102,241,0.05)", "0 0 50px rgba(99,102,241,0.12)", "0 0 30px rgba(99,102,241,0.05)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BookOpen className="w-8 h-8 text-white/30" />
          </motion.div>
          {icons.map((item, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 text-2xl"
              initial={{ opacity: 0, x: item.x * 2, y: item.y * 2, scale: 0 }}
              animate={{ opacity: 0.6, x: item.x, y: item.y, scale: 1 }}
              transition={{ duration: 0.8, delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (visual === "graph") {
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      x: Math.cos((i / 8) * Math.PI * 2) * 70,
      y: Math.sin((i / 8) * Math.PI * 2) * 70,
    }));
    return (
      <motion.div
        key="graph"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center"
      >
        <svg width="200" height="200" viewBox="-100 -100 200 200">
          {/* Edges */}
          {nodes.map((n, i) =>
            nodes.slice(i + 1).map((m, j) => {
              if (Math.random() > 0.4) return null;
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={n.x} y1={n.y} x2={m.x} y2={m.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={0.8}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.08 }}
                />
              );
            }),
          )}
          {/* Nodes */}
          {nodes.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.x} cy={n.y} r={4}
              fill={i < 3 ? "rgba(129,140,248,0.5)" : i < 5 ? "rgba(167,139,250,0.4)" : "rgba(248,113,113,0.35)"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          {/* Center glow */}
          <motion.circle
            cx={0} cy={0} r={6}
            fill="rgba(255,255,255,0.15)"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </svg>
      </motion.div>
    );
  }

  // chat visual
  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-3 w-[240px]"
    >
      {/* User message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="self-end rounded-2xl rounded-br-sm bg-white/[0.06] border border-white/[0.08] px-4 py-2.5"
      >
        <p className="text-[12px] text-white/50">What drives Darcy&apos;s change?</p>
      </motion.div>
      {/* Cosmii response */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="self-start rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 flex gap-2.5"
      >
        <img src="/cosmii-logo.png" alt="" className="w-4 h-4 mt-0.5 opacity-40 flex-shrink-0" />
        <p className="text-[12px] text-white/40 leading-[1.7]">
          Elizabeth&apos;s rejection forces him to confront his pride…
        </p>
      </motion.div>
      {/* Thinking dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="self-start flex items-center gap-1 px-4"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-indigo-400/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      setExiting(true);
      setTimeout(() => {
        window.location.href = "/universe";
      }, 1200);
      return;
    }
    setStep((s) => s + 1);
  }, [isLast]);

  const currentStep = STEPS[step];

  return (
    <motion.div
      className="min-h-screen bg-[#060612] text-white flex flex-col items-center justify-center overflow-hidden"
      animate={exiting ? { scale: 1.05, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <StarField />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[160px]"
          animate={{
            backgroundColor: [
              "rgba(79,70,229,0.05)",
              "rgba(139,92,246,0.06)",
              "rgba(99,102,241,0.05)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === step ? 24 : 6,
              height: 6,
              backgroundColor: i === step ? "rgba(255,255,255,0.5)" : i < step ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      {/* Skip */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            setExiting(true);
            setTimeout(() => { window.location.href = "/universe"; }, 1200);
          }}
          className="fixed top-8 right-8 z-20 text-[12px] text-white/20 hover:text-white/50 transition-colors duration-300"
        >
          Skip
        </motion.button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Visual */}
        <div className="h-[200px] flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            <StepVisual key={step} visual={currentStep.visual} step={step} />
          </AnimatePresence>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <currentStep.icon className="w-4 h-4 text-white/25" />
              <span className="text-[11px] text-white/25 tracking-wide uppercase">{`Step ${step + 1} of ${STEPS.length}`}</span>
            </div>
            <h2 className={`${serif} text-[28px] sm:text-[34px] text-white/90 tracking-tight mb-4`}>
              {currentStep.title}
            </h2>
            <p className="text-[15px] text-white/35 leading-[1.8] whitespace-pre-line">
              {currentStep.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={handleNext}
          className="mt-12 group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#060612] text-[13px] font-medium transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLast ? "Enter your universe" : "Continue"}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
        </motion.button>
      </div>
    </motion.div>
  );
}
