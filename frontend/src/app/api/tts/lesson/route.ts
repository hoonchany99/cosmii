import { createHash } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { isSubscriber, lessonOpenBeforeSubscribing, readerId } from "@/lib/reader-access";
import { directLesson, MODEL, spoken, squash, TAGGED_MODEL, taggedLine, voiceLesson, type Part } from "@/lib/lesson-voice";
import { reusePlan, runs, worthReusing, type Latest } from "@/lib/voice-reuse";

// 듣기 mode, a lesson at a time. The app sends the lesson's speech bubbles as
// it shows them; every one is checked against the lesson, so this can only
// read the library aloud. The first time, the whole lesson is voiced in one
// take (see lib/lesson-voice), which takes a minute or more: the request
// answers 202 at once and the voicing carries on after the response, and the
// app asks again until the manifest is there. The bubbles are kept in the
// public `lesson-audio` bucket, so every later listen is plain files.
export const maxDuration = 300;

const BUCKET = "lesson-audio";
// Bump to re-voice every lesson after changing how lessons are directed.
const DIRECTION = "L1";
const MAX_LINES = 120;
const MAX_TOTAL = 8000;
// A lesson being voiced is marked, so a second request doesn't voice it twice.
const PENDING_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!process.env.ELEVENLABS_API_KEY || !voiceId) {
    return NextResponse.json({ error: "Voice is not set up" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { lessonId?: unknown; lines?: unknown } | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const lines = Array.isArray(body?.lines) ? body.lines.filter((l): l is string => typeof l === "string" && !!l.trim()) : [];
  if (!lessonId || !lines.length || lines.length > MAX_LINES || lines.join("").length > MAX_TOTAL) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const sb = getServiceClient();
  const { data: row } = await sb.from("lessons").select("content_json, book_id, order_index").eq("id", lessonId).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Voicing a book ahead of time (scripts/warm-voice.mjs) asks for lessons that
  // no reader has opened yet, so it cannot be a subscriber and is let through on
  // the server's own secret instead - the same one the ads sweep uses, which
  // lives only in the server's environment. Nothing it produces differs: same
  // voice, same model, same direction, same cache key. Only the moment it is
  // made, which is the whole point of warming. Every other check below still
  // applies, including the one that refuses lines which are not in the lesson.
  const warming =
    !!process.env.CRON_SECRET &&
    req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  // Before subscribing, only the first book's first chapters are voiced.
  const subscriber = warming ? true : await isSubscriber(readerId(req));
  if (subscriber === false && !(await lessonOpenBeforeSubscribing(row.book_id ?? null, row.order_index ?? null))) {
    return NextResponse.json({ error: "subscribe" }, { status: 402 });
  }
  const content = (typeof row.content_json === "string" ? JSON.parse(row.content_json) : row.content_json) ?? {};
  const parts: Part[] = ((content.dialogue_ko ?? content.dialogue ?? []) as unknown[]).filter(
    (p): p is Part => !!p && typeof p === "object" && typeof (p as { text?: unknown }).text === "string",
  );
  const lessonText = squash(parts.map((p) => p.text).join("\n"));
  if (!lines.every((l) => lessonText.includes(squash(l)))) {
    return NextResponse.json({ error: "Not in lesson" }, { status: 403 });
  }

  const say = lines.map(spoken);
  // A rewritten lesson brings a tag for every sentence; then it is voiced with
  // v4 as written and nothing else directs it. Any card without fitting tags
  // sends the whole lesson down the old v3 way, so one lesson is one voice.
  const owner = (l: string) => parts.find((p) => squash(p.text) === squash(l)) ?? parts.find((p) => squash(p.text).includes(squash(l)));
  const tagged = lines.map((l) => taggedLine(l, owner(l)));
  const ownTags = tagged.every((t): t is string => t !== null);
  const model = ownTags ? TAGGED_MODEL : MODEL;
  const keyText = ownTags ? tagged : say;
  const key = createHash("sha256").update(`${voiceId}:${model}:${DIRECTION}:${lessonId}:${JSON.stringify(keyText)}`).digest("hex").slice(0, 32);
  const dir = `${voiceId}/lessons/${key}`;
  const storage = sb.storage.from(BUCKET);

  // Read through the storage API, not the public CDN, so a lesson just voiced
  // is seen at once.
  // The lesson's last voicing, by lesson id, so a later edit can keep the
  // lines that did not change (lib/voice-reuse).
  const latestPath = `${voiceId}/lesson-latest/${lessonId}.json`;
  const readLatest = async (): Promise<Latest | null> => {
    const got = await storage.download(latestPath);
    if (!got.data) return null;
    try { return JSON.parse(await got.data.text()) as Latest; } catch { return null; }
  };
  const writeLatest = (urls: string[], directed: string[]) =>
    storage.upload(latestPath, JSON.stringify({ key, model, direction: DIRECTION, lines: keyText, directed, urls } satisfies Latest), {
      contentType: "application/json",
      upsert: true,
    });

  const manifest = await storage.download(`${dir}/manifest.json`);
  if (manifest.data) {
    const saved = JSON.parse(await manifest.data.text()) as { urls?: string[]; directed?: string[] };
    if (saved.urls?.length === lines.length) {
      // A lesson voiced before this existed gets its record on its next listen.
      // (Older manifests have no direction saved; kept lines only carry it along, so the words stand in.)
      if ((await readLatest())?.key !== key) await writeLatest(saved.urls, saved.directed?.length === lines.length ? saved.directed : keyText);
      return NextResponse.json({ urls: saved.urls });
    }
  }

  const pending = await storage.download(`${dir}/pending.json`);
  if (pending.data) {
    const { since } = JSON.parse(await pending.data.text()) as { since?: number };
    if (since && Date.now() - since < PENDING_MS) return NextResponse.json({ status: "voicing" }, { status: 202 });
  }
  // What went wrong last time, if anything, rides along with the new attempt.
  const failed = await storage.download(`${dir}/failed.json`);
  const lastError = failed.data ? ((JSON.parse(await failed.data.text()) as { error?: string }).error ?? null) : null;
  await storage.upload(`${dir}/pending.json`, JSON.stringify({ since: Date.now() }), {
    contentType: "application/json",
    upsert: true,
  });

  after(async () => {
    try {
      const latest = await readLatest();
      const plan = latest ? reusePlan(latest.lines, keyText) : keyText.map(() => null);
      const reuse = worthReusing(latest, model, DIRECTION, plan);
      // Lines kept from the last voicing keep its direction too, so they and
      // their files stay exactly as heard; v3 direction is asked for the whole
      // lesson, so a new line is directed with its neighbours in view.
      let directed: string[];
      if (ownTags) directed = tagged as string[];
      else {
        const fresh = await directLesson(say, lines.map(owner));
        directed = reuse ? fresh.map((d, i) => (plan[i] !== null ? latest!.directed[plan[i]!] : d)) : fresh;
      }
      const urls: string[] = new Array(lines.length);
      const save = async (i: number, mp3: Buffer) => {
        const path = `${dir}/${String(i).padStart(3, "0")}.mp3`;
        const { error } = await storage.upload(path, mp3, { contentType: "audio/mpeg", cacheControl: "31536000", upsert: true });
        if (error) throw new Error(`upload ${error.message}`);
        urls[i] = storage.getPublicUrl(path).data.publicUrl;
      };
      if (reuse) {
        plan.forEach((p, i) => { if (p !== null) urls[i] = latest!.urls[p]; });
        for (const [a, b] of runs(plan)) {
          const audio = await voiceLesson(directed.slice(a, b), model);
          for (let i = a; i < b; i++) await save(i, audio[i - a]);
        }
        console.log(`tts lesson ${lessonId}: kept ${plan.filter((p) => p !== null).length}/${lines.length} lines, voiced ${runs(plan).length} run(s)`);
      } else {
        const audio = await voiceLesson(directed, model);
        for (let i = 0; i < audio.length; i++) await save(i, audio[i]);
      }
      const { error } = await storage.upload(`${dir}/manifest.json`, JSON.stringify({ urls, directed }), {
        contentType: "application/json",
        upsert: true,
      });
      if (error) throw new Error(`manifest ${error.message}`);
      await writeLatest(urls, directed);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("tts lesson:", message);
      await storage.upload(`${dir}/failed.json`, JSON.stringify({ error: message, at: Date.now() }), {
        contentType: "application/json",
        upsert: true,
      });
    } finally {
      await storage.remove([`${dir}/pending.json`]);
    }
  });
  return NextResponse.json({ status: "voicing", lastError }, { status: 202 });
}
