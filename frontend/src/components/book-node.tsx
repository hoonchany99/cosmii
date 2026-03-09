"use client";

import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { UPLOAD_STAGE_LABELS } from "@/lib/types";
import type { UploadProgress } from "@/lib/types";

interface BookNodeProps {
  label: string;
  color: string;
  isUploading: boolean;
  progress: UploadProgress | null;
  isSelected: boolean;
  onClick: () => void;
}

export function BookNode({
  label,
  color,
  isUploading,
  progress,
  isSelected,
  onClick,
}: BookNodeProps) {
  const stageLabel = progress?.stage
    ? UPLOAD_STAGE_LABELS[progress.stage] ?? progress.stage
    : "";
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <motion.button
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full transition-shadow"
        style={{
          width: 48,
          height: 48,
          background: isUploading ? `${color}33` : `${color}22`,
          border: `2px solid ${isSelected ? color : "transparent"}`,
          boxShadow: isSelected ? `0 0 20px ${color}40` : "none",
        }}
        animate={isUploading ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={
          isUploading
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin" style={{ color }} />
        ) : (
          <FileText className="w-5 h-5" style={{ color }} />
        )}
      </motion.div>

      <span
        className="text-xs font-medium max-w-[80px] truncate text-center leading-tight"
        style={{ color: isSelected ? color : undefined }}
      >
        {label}
      </span>

      {isUploading && progress && (
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{stageLabel}</span>
        </div>
      )}
    </motion.button>
  );
}
