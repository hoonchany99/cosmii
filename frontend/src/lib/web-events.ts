// What the web reports about a shared link being opened, and nothing more
// (마케팅 대표 2619·2621). The app counts a share (book_shared,
// invite_link_shared in cosmii-app src/lib/share-book.ts, invite-share.ts);
// these are the other end of it: did the person who got the link open it,
// and did they go on to the App Store.
//
// - Only these events and these properties get through (readEvent below).
//   An invitation code is never sent, only that the page had one.
// - No cookie, no localStorage, no id that outlives the page: `view_id` is
//   made when the page loads and is gone when it closes, so a page view and a
//   tap on it can be put together and nothing else can.
// - Mixpanel is asked not to read the IP address (ip=0 on the server), so
//   there is no location either. The page sends to /api/e, which sends on.
// Pure: imported by the client (track-view.tsx), the route and the tests.

export const WEB_EVENTS = [
  "web_book_page_viewed",
  "web_invite_page_viewed",
  "web_store_clicked",
  "web_invite_code_copied",
] as const;
export type WebEvent = (typeof WEB_EVENTS)[number];

export type WebPage = "book" | "invite";

/** Where the page was opened, read from the user agent: which app's browser, not who. */
export type OpenedIn = "kakaotalk" | "instagram" | "facebook" | "threads" | "line" | "naver" | "browser";

export type WebEventBody = {
  event: WebEvent;
  page: WebPage;
  view_id: string;
  book_id?: string;
};

const BOOK_ID = /^[A-Za-z0-9_-]{1,64}$/;
const VIEW_ID = /^[A-Za-z0-9-]{8,64}$/;

/** The body the page sent, or null if it is anything but one of ours. */
export function readEvent(raw: unknown): WebEventBody | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.event !== "string" || !(WEB_EVENTS as readonly string[]).includes(r.event)) return null;
  if (r.page !== "book" && r.page !== "invite") return null;
  if (typeof r.view_id !== "string" || !VIEW_ID.test(r.view_id)) return null;
  const out: WebEventBody = { event: r.event as WebEvent, page: r.page, view_id: r.view_id };
  if (r.book_id !== undefined) {
    if (r.page !== "book" || typeof r.book_id !== "string" || !BOOK_ID.test(r.book_id)) return null;
    out.book_id = r.book_id;
  }
  if (out.event === "web_book_page_viewed" && (out.page !== "book" || !out.book_id)) return null;
  if ((out.event === "web_invite_page_viewed" || out.event === "web_invite_code_copied") && out.page !== "invite") return null;
  return out;
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|kakaotalk-scrap|embedly|whatsapp|telegram|discord|skype|curl|wget|python|headless/i;

/** Link-preview fetchers and scripts are not people opening a link. */
export function isBot(ua: string): boolean {
  return ua === "" || BOT.test(ua);
}

export function openedIn(ua: string): OpenedIn {
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Barcelona|Threads/i.test(ua)) return "threads";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/\bLine\//i.test(ua)) return "line";
  if (/NAVER\(inapp/i.test(ua)) return "naver";
  return "browser";
}

/** One event as Mixpanel's /track takes it. */
export function toMixpanel(body: WebEventBody, ua: string, token: string, now: number) {
  return {
    event: body.event,
    properties: {
      token,
      time: now,
      distinct_id: `web-${body.view_id}`,
      platform: "web",
      mp_lib: "cosmii-web",
      page: body.page,
      view_id: body.view_id,
      ...(body.book_id ? { book_id: body.book_id } : {}),
      ...(body.page === "invite" ? { has_code: true } : {}),
      opened_in: openedIn(ua),
    },
  };
}
