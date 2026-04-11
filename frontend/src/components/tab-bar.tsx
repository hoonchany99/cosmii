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
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-[#060612] border-t border-white/[0.06] md:absolute md:bottom-0 md:left-0 md:right-0 md:w-auto md:rounded-b-[2.5rem]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[56px]">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", damping: 28, stiffness: 520 }}
              onClick={() => onTabChange(tab.id)}
              className="flex items-center justify-center w-16 h-full"
            >
              <Icon
                size={24}
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
