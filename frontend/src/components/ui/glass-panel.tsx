"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  disabled = false,
  onClick,
  variant = "indigo",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "indigo" | "emerald" | "ghost";
}) {
  const base = "w-full min-h-[52px] rounded-2xl font-semibold transition-all select-none";
  const variants = {
    indigo: disabled
      ? "bg-white/10 text-white/30 cursor-not-allowed"
      : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]",
    emerald: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    ghost: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(base, variants[variant], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
