// The web's copies of the app's editorial pieces (cosmii-app
// src/components/ui/editorial.tsx), set from the Cosmii design system's
// tokens (globals.css @theme). No surfaces: everything stands on the night
// ground, grouped by hairlines; the one button is an outline.
import Link from "next/link";
import type { ReactNode } from "react";

export const APP_STORE_URL = "https://apps.apple.com/kr/app/cosmii/id6812843004";

/** The page's head: the wordmark on the left, whatever the page wants on the right. */
export function Masthead({ right }: { right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between pt-8 pb-3">
      <Link href="/" className="type-wordmark text-ink-70 transition-colors duration-200 hover:text-ink">
        Cosmii
      </Link>
      {right}
    </header>
  );
}

/** The design system's Label: a section's head, at reading size. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`type-label text-ink-70 break-keep ${className}`}>{children}</p>;
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-hairline ${className}`} />;
}

/** The secondary action: meta size, text-70, underlined. */
export const textLink =
  "text-ink-70 underline underline-offset-4 decoration-white/30 transition-colors duration-200 hover:text-ink hover:decoration-white/50";

/**
 * The OutlineButton: a 1px outline, white label, 52px tall, as wide as its
 * column but never wider than one target (360px).
 */
export function OutlineLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`type-button flex h-[52px] w-full max-w-action items-center justify-center gap-2 rounded-ds border border-outline px-6 text-white transition-[background-color,transform] duration-150 hover:bg-pressed active:scale-[0.99] ${className}`}
    >
      {children}
    </a>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="20" viewBox="0 0 17 21" aria-hidden="true" fill="currentColor">
      <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.5 4.8 1.8 5.8.9 7.4-1 10.7.4 15.6 2.2 18.2c.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.8-1.1-2.8-4.5zM11.5 3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

export function AppStoreLink({ href = APP_STORE_URL, className = "" }: { href?: string; className?: string }) {
  return (
    <OutlineLink href={href} className={className}>
      <AppleGlyph />
      App Store에서 받기
    </OutlineLink>
  );
}

const NAV = [
  { href: "/support", label: "고객 지원" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

/** The foot every page shares: the other pages, then the maker. */
export function Footer({ current }: { current?: string }) {
  return (
    <footer className="border-t border-hairline py-8">
      <nav className="type-caption flex flex-wrap items-center gap-x-4 gap-y-2">
        {NAV.filter((n) => n.href !== current).map((n) => (
          <Link key={n.href} href={n.href} className={textLink}>
            {n.label}
          </Link>
        ))}
        <span className="ml-auto font-wordmark font-bold text-ink-faint">© 2026 Utopify</span>
      </nav>
    </footer>
  );
}
