#!/usr/bin/env node
// Re-voices a lesson (or a whole book) after the voicing itself changes: how
// lines are cut, how loud a take is read, how it is directed. Only what is
// named here is remade, so a fix costs the credits of one lesson instead of
// the library.
//
//   node scripts/revoice.mjs <lessonId | bookId> [...]
//
// Reads .env.local for Supabase (service key) and takes the voice from
// ELEVENLABS_VOICE_ID or --voice. The lesson's kept audio is deleted, then the
// app's own endpoint is asked for it again, which voices it afresh.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const voiceArg = process.argv.slice(2).find((a) => a.startsWith("--voice="));
const VOICE = voiceArg ? voiceArg.slice(8) : process.env.ELEVENLABS_VOICE_ID;
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://cosmii.vercel.app";
const BUCKET = "lesson-audio";
const MODEL = "eleven_v3";
const DIRECTION = "L1"; // keep in step with src/app/api/tts/lesson/route.ts
if (!VOICE) throw new Error("no voice: pass --voice=<id> or set ELEVENLABS_VOICE_ID");
if (!args.length) throw new Error("name a lesson id or a book id");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// The app's own splitting (src/components/concept-dialogue.tsx) and the
// route's `spoken`, so the key matches the one the app will ask for.
function split(dialogue) {
  const out = [];
  for (const part of dialogue) {
    const text = typeof part?.text === "string" ? part.text : "";
    if (!text.trim()) continue;
    const held = [];
    const masked = text.replace(/[「'"“《](?:[^」'”》"]*)[」'”》"]/g, (m) => {
      held.push(m);
      return `\x00${held.length - 1}\x00`;
    });
    const sentences = masked
      .split(/(?<=[.!?~…])\s*/)
      .filter(Boolean)
      .map((s) => s.replace(/\x00(\d+)\x00/g, (_, i) => held[Number(i)]));
    let buf = "";
    for (const s of sentences) {
      const next = buf ? `${buf} ${s}` : s;
      if (buf && next.length > 100) {
        out.push(buf);
        buf = s;
      } else {
        buf = next;
      }
    }
    if (buf) out.push(buf);
  }
  return out;
}

const spoken = (t) =>
  t.replace(/[「」『』《》]/g, "").replace(/(^|[\s(])'([^']+)'/g, "$1$2").replace(/\s+/g, " ").trim();

async function lessonsOf(id) {
  const one = await sb.from("lessons").select("id, order_index, content_json").eq("id", id);
  if (one.data?.length) return one.data;
  const book = await sb.from("lessons").select("id, order_index, content_json").eq("book_id", id).order("order_index");
  return book.data ?? [];
}

async function revoice(lesson) {
  const content = typeof lesson.content_json === "string" ? JSON.parse(lesson.content_json) : lesson.content_json ?? {};
  const lines = split(content.dialogue_ko ?? content.dialogue ?? []);
  if (!lines.length) return { id: lesson.id, skipped: "no lines" };
  const key = createHash("sha256")
    .update(`${VOICE}:${MODEL}:${DIRECTION}:${lesson.id}:${JSON.stringify(lines.map(spoken))}`)
    .digest("hex")
    .slice(0, 32);
  const dir = `${VOICE}/lessons/${key}`;
  const { data: kept } = await sb.storage.from(BUCKET).list(dir);
  if (kept?.length) {
    await sb.storage.from(BUCKET).remove(kept.map((f) => `${dir}/${f.name}`));
  }
  const started = Date.now();
  for (;;) {
    const res = await fetch(`${API}/api/tts/lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, lines }),
    });
    if (res.status === 200) return { id: lesson.id, seconds: Math.round((Date.now() - started) / 1000) };
    if (res.status !== 202) return { id: lesson.id, failed: `${res.status} ${(await res.text()).slice(0, 120)}` };
    if (Date.now() - started > 300_000) return { id: lesson.id, failed: "took too long" };
    await new Promise((r) => setTimeout(r, 4000));
  }
}

const queue = [];
for (const id of args) queue.push(...(await lessonsOf(id)));
console.log(`re-voicing ${queue.length} lesson(s)`);
let next = 0;
await Promise.all(
  [0, 1].map(async () => {
    while (next < queue.length) {
      const lesson = queue[next++];
      const out = await revoice(lesson);
      console.log(new Date().toISOString(), lesson.order_index ?? "", JSON.stringify(out));
    }
  }),
);
console.log("done");
