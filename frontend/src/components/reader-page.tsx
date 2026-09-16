// The pages the app sends a reader to: support, terms, privacy. They are read
// on a phone, right after leaving the app, so they wear the app's ground, its
// text face (IBM Plex Sans KR) and its wordmark (EB Garamond) — and nothing
// else. The app itself has no cards and no chrome; neither do these.
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const h2 = "text-[15px] font-semibold text-white/92 mb-4";
export const strong = "text-white/80 font-semibold";
export const link =
  "text-white/64 underline underline-offset-4 decoration-white/25 hover:text-white/92 hover:decoration-white/50 transition-colors duration-200";

const NAV = [
  { href: "/support", label: "고객 지원" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export function ReaderPage({
  title,
  note,
  current,
  children,
}: {
  title: string;
  note?: string;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060612] text-white font-[family-name:var(--font-app)]">
      <div className="mx-auto max-w-[42rem] px-6 sm:px-10 pt-16 pb-24">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Image src="/cosmii-mark.png" alt="" width={28} height={28} priority className="h-7 w-7" />
          <span className="font-[family-name:var(--font-serif)] text-[22px] font-bold text-white/92 group-hover:text-white transition-colors duration-200">
            Cosmii
          </span>
        </Link>

        <h1 className="mt-12 text-[30px] sm:text-[34px] font-semibold tracking-tight text-white leading-tight break-keep">
          {title}
        </h1>
        {note ? <p className="mt-3 text-[15px] leading-[1.7] text-white/64 break-keep">{note}</p> : null}

        <div className="mt-12 h-px bg-white/10" />

        <div className="mt-12 space-y-12 text-[15px] leading-[1.8] text-white/64 break-keep">{children}</div>

        <div className="mt-20 h-px bg-white/10" />
        <nav className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          {NAV.filter((n) => n.href !== current).map((n) => (
            <Link key={n.href} href={n.href} className={link}>
              {n.label}
            </Link>
          ))}
          <span className="ml-auto text-white/25 font-[family-name:var(--font-serif)] font-bold">Cosmii</span>
        </nav>
      </div>
    </div>
  );
}
