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
    <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-around h-[72px] bg-[#060612] border-t border-white/[0.06]">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", damping: 28, stiffness: 520 }}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center justify-center w-16 h-16"
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
  );
}
