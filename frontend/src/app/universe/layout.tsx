import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 우주",
  description: "나만의 독서 우주에서 책을 탐색하고 레슨을 이어가세요.",
  robots: { index: false, follow: false },
};

export default function UniverseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
