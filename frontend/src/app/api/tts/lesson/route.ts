import { createHash } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { directLesson, MODEL, spoken, squash, voiceLesson, type Part } from "@/lib/lesson-voice";

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
  const { data: row } = await sb.from("lessons").select("content_json").eq("id", lessonId).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const content = (typeof row.content_json === "string" ? JSON.parse(row.content_json) : row.content_json) ?? {};
  const parts: Part[] = ((content.dialogue_ko ?? content.dialogue ?? []) as unknown[]).filter(
    (p): p is Part => !!p && typeof p === "object" && typeof (p as { text?: unknown }).text === "string",
  );
  const lessonText = squash(parts.map((p) => p.text).join("\n"));
  if (!lines.every((l) => lessonText.includes(squash(l)))) {
    return NextResponse.json({ error: "Not in lesson" }, { status: 403 });
  }

  const say = lines.map(spoken);
  const key = createHash("sha256").update(`${voiceId}:${MODEL}:${DIRECTION}:${lessonId}:${JSON.stringify(say)}`).digest("hex").slice(0, 32);
  const dir = `${voiceId}/lessons/${key}`;
  const storage = sb.storage.from(BUCKET);

  // Read through the storage API, not the public CDN, so a lesson just voiced
  // is seen at once.
  const manifest = await storage.download(`${dir}/manifest.json`);
  if (manifest.data) {
    const saved = JSON.parse(await manifest.data.text()) as { urls?: string[] };
    if (saved.urls?.length === lines.length) return NextResponse.json({ urls: saved.urls });
  }

  const pending = await storage.download(`${dir}/pending.json`);
  if (pending.data) {
    const { since } = JSON.parse(await pending.data.text()) as { since?: number };
    if (since && Date.now() - since < PENDING_MS) return NextResponse.json({ status: "voicing" }, { status: 202 });
  }
  await storage.upload(`${dir}/pending.json`, JSON.stringify({ since: Date.now() }), {
    contentType: "application/json",
    upsert: true,
  });

  after(async () => {
    try {
      const owner = (l: string) => parts.find((p) => squash(p.text).includes(squash(l)));
      const directed = await directLesson(say, lines.map(owner));
      const audio = await voiceLesson(directed);
      const urls: string[] = [];
      for (let i = 0; i < audio.length; i++) {
        const path = `${dir}/${String(i).padStart(3, "0")}.mp3`;
        const { error } = await storage.upload(path, audio[i], { contentType: "audio/mpeg", cacheControl: "31536000", upsert: true });
        if (error) throw new Error(`upload ${error.message}`);
        urls.push(storage.getPublicUrl(path).data.publicUrl);
      }
      const { error } = await storage.upload(`${dir}/manifest.json`, JSON.stringify({ urls, directed }), {
        contentType: "application/json",
        upsert: true,
      });
      if (error) throw new Error(`manifest ${error.message}`);
    } catch (e) {
      console.error("tts lesson:", e instanceof Error ? e.message : e);
    } finally {
      await storage.remove([`${dir}/pending.json`]);
    }
  });
  return NextResponse.json({ status: "voicing" }, { status: 202 });
}
