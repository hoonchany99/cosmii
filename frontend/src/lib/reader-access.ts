// Who is asking, as far as what they may use: a subscriber (Cosmii Premium,
// its free trial included) or a reader who hasn't subscribed yet.
//
// The app sends its RevenueCat app user id in `X-Cosmii-Reader`. Whether that
// id has the "premium" entitlement is asked of RevenueCat's REST API with the
// secret key (REVENUECAT_SECRET_KEY, server only), and remembered for a few
// minutes. Without the key nothing is enforced here (every reader passes) so
// a missing setting never locks paying readers out; the app keeps its own
// limits either way.
//
// Before subscribing: a few questions to Cosmii a day. The voice is no longer
// one of the things held back - every chapter is read aloud for everyone. The
// numbers are the same ones the app reads, from app_config "access", so the
// two can be changed together without shipping either.
import { createHash } from "node:crypto";
import { type NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

const ENTITLEMENT = "premium";
const CACHE_MS = 5 * 60 * 1000;
const DEFAULTS = {
  freeChapters: 3,
  preTrialChats: 5,
  /** Questions to Cosmii in one day, before subscribing. */
  dailyFreeChats: 3,
  /**
   * Whether every chapter is read aloud for everyone. False puts the voice
   * back behind a subscription, as it was, without shipping anything.
   */
  voiceForEveryone: true,
};
/** The first week's books: the only ones a reader can open before subscribing. */
export const FIRST_WEEK_BOOKS = ["bc977bab", "cl_odyssey", "c_animal_farm"];
/** A quiet ceiling on a subscriber's questions a day, against abuse only. */
export const SUBSCRIBER_DAILY_CHATS = 200;

const cache = new Map<string, { premium: boolean; at: number }>();

/** The reader's RevenueCat id, or a stand-in from the address for an app that doesn't send one. */
export function readerId(req: NextRequest): string {
  const id = req.headers.get("x-cosmii-reader")?.trim();
  if (id && id.length <= 200) return id;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `ip:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
}

/** true / false from RevenueCat; null when it can't be asked (no key, no answer). */
export async function isSubscriber(appUserId: string): Promise<boolean | null> {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key || appUserId.startsWith("ip:")) return key ? false : null;
  const hit = cache.get(appUserId);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.premium;
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> };
    };
    const ent = body.subscriber?.entitlements?.[ENTITLEMENT];
    const premium = !!ent && (!ent.expires_date || new Date(ent.expires_date).getTime() > Date.now());
    cache.set(appUserId, { premium, at: Date.now() });
    return premium;
  } catch {
    return null;
  }
}

export async function accessConfig(): Promise<typeof DEFAULTS> {
  try {
    const { data } = await getServiceClient().from("app_config").select("value").eq("key", "access").maybeSingle();
    const v = (data?.value ?? {}) as Record<string, unknown>;
    const n = (x: unknown, d: number) => (typeof x === "number" && x >= 0 ? Math.floor(x) : d);
    const b = (x: unknown, d: boolean) => (typeof x === "boolean" ? x : d);
    return {
      freeChapters: n(v.free_chapters, DEFAULTS.freeChapters),
      preTrialChats: n(v.pre_trial_chats, DEFAULTS.preTrialChats),
      dailyFreeChats: n(v.daily_free_chats, DEFAULTS.dailyFreeChats),
      voiceForEveryone: b(v.voice_for_everyone, DEFAULTS.voiceForEveryone),
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * The day a reader is standing in, which is Seoul's: Cosmii is sold in Korea
 * only, and the app counts the day on the reader's own clock. Counting UTC
 * here would turn the day over at nine in the morning for them, and the app
 * and the server would disagree about it for nine hours every day.
 */
function seoulDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

/**
 * Counts one question and says whether it may be asked. Both a subscriber and
 * a reader without one are counted by the day now - the difference is the
 * number, three against a ceiling that exists only against abuse.
 * When the count can't be kept (table missing), the question passes.
 *
 * `pre_trial_chats`, which counted a reader's questions for all time, is left
 * alone: an older app still in someone's hands reads nothing from it, and it
 * is the record of what was asked before the day's allowance existed.
 */
export async function takeChat(appUserId: string, subscriber: boolean): Promise<boolean> {
  const sb = getServiceClient();
  try {
    const { dailyFreeChats } = await accessConfig();
    const limit = subscriber ? SUBSCRIBER_DAILY_CHATS : dailyFreeChats;
    const day = seoulDay();
    const { data, error } = await sb
      .from("chat_daily")
      .select("count")
      .eq("app_user_id", appUserId)
      .eq("day", day)
      .maybeSingle();
    if (error) return true;
    const count = (data?.count as number | undefined) ?? 0;
    if (count >= limit) return false;
    await sb.from("chat_daily").upsert({ app_user_id: appUserId, day, count: count + 1 }, { onConflict: "app_user_id,day" });
    return true;
  } catch {
    return true;
  }
}

/**
 * Whether a reader who hasn't subscribed may hear this lesson. Every chapter
 * of every book, unless `voice_for_everyone` is turned off in app_config, in
 * which case it is the first book's first chapters as it used to be.
 */
export async function lessonOpenBeforeSubscribing(bookId: string | null, orderIndex: number | null): Promise<boolean> {
  const { freeChapters, voiceForEveryone } = await accessConfig();
  if (voiceForEveryone) return true;
  if (!bookId || orderIndex == null || !FIRST_WEEK_BOOKS.includes(bookId)) return false;
  return orderIndex < freeChapters;
}
