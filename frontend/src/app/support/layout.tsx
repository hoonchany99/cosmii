import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "고객 지원",
  description: "Cosmii 사용 중 막히는 것, 구독과 환불, 계정 삭제, 의견 보내기.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
