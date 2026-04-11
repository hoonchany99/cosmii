import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "Cosmii에 로그인하고 읽고 싶었던 책을 이어서 읽어보세요.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
