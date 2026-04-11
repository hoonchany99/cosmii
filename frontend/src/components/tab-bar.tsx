"use client";

import { motion } from "framer-motion";
import { Sparkles, Globe2, User } from "lucide-react";

type TabId = "home" | "universe" | "profile";

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; icon: typeof Sparkles }[] = [
  { id: "home", icon: Sparkles },
  { id: "universe", icon: Globe2 },
  { id: "profile", icon: User },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:w-[430px]">
      <div
        className="pointer-events-auto mx-4 mb-3 flex items-center justify-around rounded-2xl bg-[#12122a] border border-white/[0.10] py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        style={{ marginBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", damping: 28, stiffness: 520 }}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center justify-center w-14 h-12"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.5}
                className={`transition-colors duration-200 ${active ? "text-[#a78bfa]" : "text-white/35"}`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
