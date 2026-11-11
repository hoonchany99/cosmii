// Where the book and invitation pages send what happened on them
// (src/lib/web-events.ts says what that is). Sent on to Mixpanel, the
// app's own project, with the IP address left out (ip=0).
//
// Without MIXPANEL_TOKEN (a server-only variable, set in Vercel) nothing is
// sent and the page is still told it went fine: a missing token must never
// show to a reader. Anything that is not one of our events is dropped the same
// way, quietly.
import { NextResponse } from "next/server";
import { isBot, readEvent, toMixpanel } from "@/lib/web-events";

const MIXPANEL = "https://api.mixpanel.com/track?ip=0&strict=1";
const MAX_BODY = 2048;

export async function POST(req: Request) {
  const done = new NextResponse(null, { status: 204 });
  const token = process.env.MIXPANEL_TOKEN;
  if (!token) return done;
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return done;
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return done;
    raw = JSON.parse(text);
  } catch {
    return done;
  }
  const body = readEvent(raw);
  if (!body) return done;
  try {
    await fetch(MIXPANEL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify([toMixpanel(body, ua, token, Math.floor(Date.now() / 1000))]),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // A lost count is not worth a reader's wait.
  }
  return done;
}
