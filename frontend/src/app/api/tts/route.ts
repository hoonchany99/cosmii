import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

// Cosmii's voice for the lesson reader's 듣기 mode. The app sends one line as
// it shows on screen plus the lesson it came from; the line is checked against
// that lesson's text, so this can only ever read the library aloud. Each line
// is spoken once by ElevenLabs and kept in the public `lesson-audio` bucket,
// keyed by voice, model and text, so every later listen is a plain file.
// Nothing is made ahead: a line is kept only once someone has listened to it.
// 64 kbps is plenty for one speaking voice and keeps the whole library under
// the free storage tier.
const BUCKET = "lesson-audio";
const MODEL = "eleven_multilingual_v2";
const MAX_CHARS = 400;

const squash = (s: string) => s.replace(/\s+/g, "");

// What the reader sees is set with 「」 for the book's words and '…' for a
// character speaking; the voice needs neither mark.
function spoken(text: string) {
  return text
    .replace(/[「」『』《》]/g, "")
    .replace(/(^|[\s(])'([^']+)'/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) return NextResponse.json({ error: "Voice is not set up" }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { lessonId?: unknown; text?: unknown } | null;
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!lessonId || !text || text.length > MAX_CHARS) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const sb = getServiceClient();
  const { data: row } = await sb.from("lessons").select("content_json").eq("id", lessonId).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const content = (typeof row.content_json === "string" ? JSON.parse(row.content_json) : row.content_json) ?? {};
  const dialogue: unknown[] = content.dialogue_ko ?? content.dialogue ?? [];
  const lessonText = squash(
    dialogue.map((p) => (p && typeof p === "object" && typeof (p as { text?: unknown }).text === "string" ? (p as { text: string }).text : "")).join("\n"),
  );
  if (!lessonText.includes(squash(text))) return NextResponse.json({ error: "Not in lesson" }, { status: 403 });

  const say = spoken(text);
  const hash = createHash("sha256").update(`${voiceId}:${MODEL}:${say}`).digest("hex").slice(0, 32);
  const path = `${voiceId}/${hash}.mp3`;
  const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const cached = await fetch(url, { method: "HEAD", cache: "no-store" }).catch(() => null);
  if (cached?.ok) return NextResponse.json({ url });

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: say,
      model_id: MODEL,
      language_code: "ko",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error("tts: elevenlabs", res.status, (await res.text().catch(() => "")).slice(0, 200));
    return NextResponse.json({ error: "Voice failed" }, { status: 502 });
  }
  const audio = Buffer.from(await res.arrayBuffer());

  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, audio, {
    contentType: "audio/mpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (uploadError) {
    console.error("tts: upload", uploadError.message);
    return NextResponse.json({ error: "Could not keep audio" }, { status: 500 });
  }
  return NextResponse.json({ url });
}
