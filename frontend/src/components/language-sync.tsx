"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store";

export function LanguageSync() {
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language === "ko" ? "ko" : "en";
    document.documentElement.dataset.lang = language === "ko" ? "ko" : "en";
  }, [language]);

  return null;
}
