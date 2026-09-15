import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Cosmii 개인정보처리방침 — 어떤 정보를 왜 받고 어떻게 지우는지.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
