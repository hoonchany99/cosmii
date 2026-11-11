"use client";

// Tells /api/e that this page was opened, and that its App Store link was
// tapped (src/lib/web-events.ts). Runs only in a browser that runs scripts,
// so the link-preview fetchers of messaging apps, which read the HTML for the
// card and nothing else, are not counted as people.
//
// The view id is made here, lives in this module while the page is open, and
// is not stored anywhere: no cookie, no localStorage.
import { useEffect } from "react";
import type { WebEvent, WebPage } from "@/lib/web-events";

let current: { page: WebPage; view_id: string; book_id?: string } | null = null;

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

/** Send one event for the page that is open. Never throws, never waits. */
export function trackWeb(event: WebEvent) {
  if (!current) return;
  try {
    const body = JSON.stringify({ event, ...current });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/e", blob)) {
      void fetch("/api/e", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {}
}

export function TrackView({ page, bookId }: { page: WebPage; bookId?: string }) {
  useEffect(() => {
    current = { page, view_id: newId(), ...(bookId ? { book_id: bookId } : {}) };
    trackWeb(page === "book" ? "web_book_page_viewed" : "web_invite_page_viewed");
    // The App Store link is the page's own <a>; one listener here sees a tap
    // on it without the link becoming a client component.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (a?.href.startsWith("https://apps.apple.com/")) trackWeb("web_store_clicked");
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      current = null;
    };
  }, [page, bookId]);
  return null;
}
