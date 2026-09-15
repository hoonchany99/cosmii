import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServiceClient } from "@/lib/supabase-server";

// Cosmii's voice for the lesson reader's 듣기 mode. The app sends one line as
// it shows on screen plus the lesson it came from; the line is checked against
// that lesson's text, so this can only ever read the library aloud. Each line
// is spoken once by ElevenLabs and kept in the public `lesson-audio` bucket,
// keyed by voice, model and text, so every later listen is a plain file.
// Nothing is made ahead: a line is kept only once someone has listened to it.
// 64 kbps is plenty for one speaking voice and keeps the whole library under
// the free storage tier.
//
// Lines are performed, not just read: before a line is voiced the first time,
// a small model reads it in its place in the lesson and adds eleven_v3 audio
// tags ([curious], [softly], ...) and pauses. The words themselves never
// change; if the directed line doesn't match the lesson word for word, the
// plain line is voiced instead.
export const maxDuration = 60;

const BUCKET = "lesson-audio";
const MODEL = "eleven_v3";
// Bump to re-voice every line after changing how lines are directed.
const DIRECTION = "d2";
const MAX_CHARS = 400;

type Part = { text: string; kind?: string; highlight?: string | null };

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

// The words alone: tags, punctuation and spacing removed. A moved comma or
// question mark is harmless; a changed word is not.
const words = (s: string) => s.replace(/\[[^\]]*\]/g, "").replace(/[^가-힣A-Za-z0-9]/g, "");

const DIRECTOR = `You direct a Korean audiobook narrator. The narrator is Cosmii, a being who has heard every story since the universe began, telling a classic to a friend in casual Korean (반말).

You get one line of a lesson and the lines around it. Return the same line with ElevenLabs v3 audio tags and pauses added, nothing else.

Rules:
- Never add, remove, reorder or change a single Korean word or punctuation mark that is already there. You may only insert: English audio tags in square brackets, "…" for a held pause, and "," for a short beat.
- 1 to 3 tags per line, placed right before the words they colour. Short tags: [curious], [playfully], [amused], [warmly], [gently], [softly], [slowly], [wistful], [sighs], [chuckles], [whispers], [excited], [serious], [brightly], [thoughtful]. For a character speaking, a tag like [like a small child, earnest] or [gruff old man].
- By line role:
  - hook: draw the listener in, a little hushed or intrigued.
  - guess: ask like you really want them to think; a playful question at the end.
  - reveal: a small pause before the answer word, then a pleased or amused tone.
  - quote (the book's own words, shown in 「」): softer and slower, with weight.
  - character speech (shown in '…'): voice that character.
  - aside / feel: warm and personal, as if leaning in.
  - beat / line: natural storytelling; mark scene changes with a brighter or quieter turn.
  - close: gentle and open, leaving the question with the listener.
- If a highlight word is given, put a short "…" pause just before it.
- Keep it natural. Not every sentence needs a tag.`;

async function direct(line: string, shown: string, part: Part | undefined, around: Part[]): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return line;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const context = around.map((p) => `(${p.kind ?? "line"}) ${p.text}`).join("\n");
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: DIRECTOR },
        {
          role: "user",
          content: `Lesson lines around it:\n${context}\n\nLine role: ${part?.kind ?? "line"}${part?.highlight ? `\nHighlight: ${part.highlight}` : ""}\nAs shown to the reader: ${shown}\n\nLine to direct (return only this, with tags):\n${line}`,
        },
      ],
    });
    const out = (completion.choices[0]?.message?.content ?? "")
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/[「」『』《》]/g, "");
    const tagsOk = (out.match(/\[[^\]]*\]/g) ?? []).every((t) => /^\[[A-Za-z ,'-]{2,48}\]$/.test(t));
    if (out && tagsOk && words(out) === words(line)) {
      console.log("tts: performed", out);
      return out;
    }
    console.warn("tts: direction changed the words, voicing plain:", out);
  } catch (e) {
    console.warn("tts: direction failed", e instanceof Error ? e.message : e);
  }
  return line;
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
  const parts: Part[] = ((content.dialogue_ko ?? content.dialogue ?? []) as unknown[])
    .filter((p): p is Part => !!p && typeof p === "object" && typeof (p as { text?: unknown }).text === "string");
  const lessonText = squash(parts.map((p) => p.text).join("\n"));
  if (!lessonText.includes(squash(text))) return NextResponse.json({ error: "Not in lesson" }, { status: 403 });

  const say = spoken(text);
  const hash = createHash("sha256").update(`${voiceId}:${MODEL}:${DIRECTION}:${say}`).digest("hex").slice(0, 32);
  const path = `${voiceId}/${hash}.mp3`;
  const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const cached = await fetch(url, { method: "HEAD", cache: "no-store" }).catch(() => null);
  if (cached?.ok) return NextResponse.json({ url });

  // The app shows long lines in pieces; direct the piece within its whole line.
  const at = parts.findIndex((p) => squash(p.text).includes(squash(text)));
  const around = at >= 0 ? parts.slice(Math.max(0, at - 2), at + 2) : [];
  const performed = await direct(say, text, parts[at], around);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: performed,
      model_id: MODEL,
      // v3 takes 0 (creative), 0.5 (natural) or 1 (robust).
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
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
