import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Cosmii 이용약관 — 무료 이용과 Premium 구독, 별빛, AI 대화에 관한 약속.",
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
