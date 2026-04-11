"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PRESET_AVATARS, ACCESSORIES } from "@/lib/store";

type BlinkPhase = "open" | "half_close" | "closed" | "half_open";

interface CosmiiAvatarProps {
  size: number;
  avatarId: string | null;
  accessoryId?: string | null;
  blink?: boolean;
  animated?: boolean;
}

export function CosmiiAvatar({ size, avatarId, accessoryId, blink = false, animated = false }: CosmiiAvatarProps) {
  const avatar = PRESET_AVATARS.find((a) => a.id === avatarId);
  const accessory = accessoryId ? ACCESSORIES.find((a) => a.id === accessoryId) : null;
  const [blinkPhase, setBlinkPhase] = useState<BlinkPhase>("open");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!blink) return;

    const scheduleNextBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      timerRef.current = setTimeout(() => {
        setBlinkPhase("half_close");
        setTimeout(() => setBlinkPhase("closed"), 60);
        setTimeout(() => setBlinkPhase("half_open"), 150);
        setTimeout(() => {
          setBlinkPhase("open");
          scheduleNextBlink();
        }, 220);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [blink]);

  const showMask = blink && blinkPhase !== "open";
  const blinkOverlaySrc =
    blinkPhase === "half_close" || blinkPhase === "half_open"
      ? "/avatars/blink/blink_half_blink_overlay.png"
      : blinkPhase === "closed"
        ? "/avatars/blink/blink_closed_eyes_overlay.png"
        : null;

  const wrapper = (
    <div style={{ width: size, height: size, position: "relative" }}>
      {avatar ? (
        <Image
          src={avatar.src}
          alt={avatar.label}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <div
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "rgba(255,255,255,0.1)" }}
        />
      )}

      {showMask && avatar && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            backgroundColor: avatar.color,
            WebkitMaskImage: "url(/avatars/blink/blink_eye_erase_mask.png)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/avatars/blink/blink_eye_erase_mask.png)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      )}

      {blinkOverlaySrc && (
        <Image
          src={blinkOverlaySrc}
          alt=""
          width={size}
          height={size}
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      )}

      {accessory && (
        <Image
          src={accessory.src}
          alt={accessory.name}
          width={size}
          height={size}
          className="absolute left-0 w-full h-full object-contain pointer-events-none"
          style={{ top: accessory.offsetY * (size / 160) }}
          draggable={false}
        />
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        animate={{ y: [0, -4, 4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        {wrapper}
      </motion.div>
    );
  }

  return wrapper;
}
