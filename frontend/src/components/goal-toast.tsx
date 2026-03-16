"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp } from "lucide-react";
import { useT } from "@/lib/i18n";

const serif = "font-[var(--font-serif)]";

function useAutoToast(show: boolean, onDone: () => void, duration = 3000) {
  const [visible, setVisible] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDoneRef.current(), 400);
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration]);
  return visible;
}

function ToastShell({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed top-safe left-0 right-0 z-[100] flex justify-center px-5 pt-4 pointer-events-none"
        >
          <div className="bg-[#0e0e1c]/90 backdrop-blur-xl border border-white/[0.12] rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl shadow-black/40 pointer-events-auto">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface GoalToastProps {
  show: boolean;
  goal: number;
  onDone: () => void;
}

export function GoalToast({ show, goal, onDone }: GoalToastProps) {
  const t = useT();
  const visible = useAutoToast(show, onDone);

  return (
    <ToastShell visible={visible}>
      <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
        <Sparkles size={17} className="text-white/70" />
      </div>
      <div>
        <p className={`${serif} text-white/90 text-[15px] font-bold`}>
          {t("toast.dailyGoalReached")}
        </p>
        <p className="text-white/45 text-[12px] mt-0.5">
          {(t("toast.dailyGoalSub") as string).replace("{goal}", String(goal))}
        </p>
      </div>
    </ToastShell>
  );
}

interface LevelUpToastProps {
  show: boolean;
  newLevel: number;
  onDone: () => void;
}

export function LevelUpToast({ show, newLevel, onDone }: LevelUpToastProps) {
  const t = useT();
  const visible = useAutoToast(show, onDone, 3500);

  return (
    <ToastShell visible={visible}>
      <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
        <ArrowUp size={17} className="text-white/70" />
      </div>
      <div>
        <p className={`${serif} text-white/90 text-[15px] font-bold`}>
          {t("toast.levelUp")}
        </p>
        <p className="text-white/45 text-[12px] mt-0.5">
          {(t("toast.levelUpSub") as string).replace("{level}", String(newLevel))}
        </p>
      </div>
    </ToastShell>
  );
}
