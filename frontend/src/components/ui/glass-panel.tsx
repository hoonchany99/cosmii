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
    <div className={cn("bg-white/[0.02] border border-white/[0.06] rounded-2xl", className)}>
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
  const base = "w-full min-h-[52px] rounded-full font-semibold transition-all select-none";
  const variants = {
    indigo: disabled
      ? "bg-white/[0.06] text-white/25 cursor-not-allowed"
      : "bg-white text-[#060612] hover:bg-white/90",
    emerald: disabled
      ? "bg-white/[0.06] text-white/25 cursor-not-allowed"
      : "bg-white text-[#060612] hover:bg-white/90",
    ghost: "bg-white/[0.05] hover:bg-white/[0.10] text-white/70 border border-white/[0.12]",
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(base, variants[variant], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
