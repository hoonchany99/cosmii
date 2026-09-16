#!/usr/bin/env node
// Checks a voiced lesson against its text. By default it only weighs each
// bubble's length against what its letters need to say, which catches a badly
// truncated line. With --stt it listens: every bubble is transcribed on this
// Mac (whisper.cpp, free and offline) and compared with the line it should be,
// which also catches a cut that sent the end of one line into the next bubble.
//
//   node scripts/check-voice.mjs <lessonId | bookId> [...] --voice=<id> [--stt]
//   brew install whisper-cpp   (and a model: --model=<path to ggml-*.bin>)
//
// Prints a line per lesson, and names the bubbles worth a second look.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const voiceArg = process.argv.slice(2).find((a) => a.startsWith("--voice="));
const VOICE = voiceArg ? voiceArg.slice(8) : process.env.ELEVENLABS_VOICE_ID;
const BUCKET = "lesson-audio";
const MODEL = "eleven_v3";
const DIRECTION = "L1";
// Cosmii reads about this fast, with a breath at each end of a line.
const MS_PER_LETTER = 150;
const BREATH_MS = 900;
// A bubble is suspect when its audio is this far off what its text needs.
const SHORT = 0.55;
const LONG = 1.9;
// Listening: how much of a line has to be heard in its own bubble, and how
// much of the next line's opening counts as having spilled into it.
const STT = process.argv.includes("--stt");
const MODEL_PATH = (process.argv.find((a) => a.startsWith("--model=")) ?? "").slice(8);
const HEARD_ENOUGH = 0.72;
// A short line is mostly names and endings, where the transcription itself
// slips; only a line that is largely missing counts there.
const SHORT_LINE = 18;
const HEARD_ENOUGH_SHORT = 0.5;
const SPILL = 0.7;
const SPILL_LETTERS = 12;

if (!VOICE) throw new Error("no voice: pass --voice=<id> or set ELEVENLABS_VOICE_ID");
if (!args.length) throw new Error("name a lesson id or a book id");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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
const letters = (t) => (t.match(/[가-힣A-Za-z0-9]/g) ?? []).length;

// An mp3's length from its frame headers, without decoding it. Cosmii's lines
// are 24 kHz, which is MPEG-2, and MPEG-1 and MPEG-2 read their bitrates from
// different tables.
const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], // MPEG-1 layer III
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // MPEG-2 / 2.5 layer III
};
const FREQS = [44100, 48000, 32000];

function mp3Seconds(buf) {
  let i = 0;
  let seconds = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const versionBits = (buf[i + 1] >> 3) & 0x03; // 3 MPEG-1, 2 MPEG-2, 0 MPEG-2.5
    const layerBits = (buf[i + 1] >> 1) & 0x03; // 1 = layer III
    const rateIndex = (buf[i + 2] >> 4) & 0x0f;
    const freqIndex = (buf[i + 2] >> 2) & 0x03;
    if (versionBits === 1 || layerBits !== 1 || rateIndex === 0 || rateIndex === 15 || freqIndex === 3) {
      i++;
      continue;
    }
    const mpeg1 = versionBits === 3;
    const bitrate = BITRATES[mpeg1 ? 1 : 2][rateIndex] * 1000;
    const freq = FREQS[freqIndex] / (mpeg1 ? 1 : versionBits === 2 ? 2 : 4);
    const samples = mpeg1 ? 1152 : 576;
    const pad = (buf[i + 2] >> 1) & 0x01;
    const size = Math.floor((samples / 8) * (bitrate / freq)) + pad;
    if (size < 4) {
      i++;
      continue;
    }
    seconds += samples / freq;
    i += size;
  }
  return seconds;
}

// What a bubble actually says, transcribed on this Mac.
function transcribe(mp3, tmp) {
  const wav = `${tmp}/clip.wav`;
  execFileSync("ffmpeg", ["-v", "quiet", "-y", "-i", mp3, "-ar", "16000", "-ac", "1", wav]);
  const out = execFileSync(
    "whisper-cli",
    ["-m", MODEL_PATH, "-l", "ko", "-nt", "-np", "-f", wav],
    { encoding: "utf8", maxBuffer: 1 << 24 },
  );
  return out.trim();
}

// How much of `want` turns up in `got`, in order: 1 is every letter.
function heard(want, got) {
  if (!want.length) return 1;
  const a = [...want];
  const b = [...got];
  const row = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let prev = 0;
    for (let j = 1; j <= b.length; j++) {
      const here = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(row[j], row[j - 1]);
      prev = here;
    }
  }
  return row[b.length] / a.length;
}

async function lessonsOf(id) {
  const one = await sb.from("lessons").select("id, order_index, title, content_json").eq("id", id);
  if (one.data?.length) return one.data;
  const book = await sb
    .from("lessons")
    .select("id, order_index, title, content_json")
    .eq("book_id", id)
    .order("order_index");
  return book.data ?? [];
}

let suspect = 0;
for (const id of args) {
  for (const lesson of await lessonsOf(id)) {
    const content =
      typeof lesson.content_json === "string" ? JSON.parse(lesson.content_json) : lesson.content_json ?? {};
    const lines = split(content.dialogue_ko ?? content.dialogue ?? []);
    if (!lines.length) continue;
    const key = createHash("sha256")
      .update(`${VOICE}:${MODEL}:${DIRECTION}:${lesson.id}:${JSON.stringify(lines.map(spoken))}`)
      .digest("hex")
      .slice(0, 32);
    const dir = `${VOICE}/lessons/${key}`;
    const manifest = await sb.storage.from(BUCKET).download(`${dir}/manifest.json`);
    if (!manifest.data) {
      console.log(`${lesson.order_index}\t${lesson.title}\tnot voiced yet`);
      continue;
    }
    const bad = [];
    for (let i = 0; i < lines.length; i++) {
      const file = await sb.storage.from(BUCKET).download(`${dir}/${String(i).padStart(3, "0")}.mp3`);
      if (!file.data) {
        bad.push(`${i}: missing`);
        continue;
      }
      const audio = Buffer.from(await file.data.arrayBuffer());
      const seconds = mp3Seconds(audio);
      const expected = (BREATH_MS + letters(lines[i]) * MS_PER_LETTER) / 1000;
      const ratio = seconds / expected;
      if (!STT) {
        if (ratio < SHORT || ratio > LONG) {
          bad.push(`${i}: ${seconds.toFixed(1)}s vs ${expected.toFixed(1)}s (${ratio.toFixed(2)}x) "${lines[i].slice(0, 22)}…"`);
        }
        continue;
      }
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cosmii-voice-"));
      fs.writeFileSync(`${tmp}/clip.mp3`, audio);
      let said = "";
      try {
        said = transcribe(`${tmp}/clip.mp3`, tmp);
      } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
      }
      const plain = (t) => (t.match(/[가-힣A-Za-z0-9]/g) ?? []).join("");
      const mine = plain(lines[i]);
      const heardMine = heard(mine, plain(said));
      const next = i + 1 < lines.length ? plain(lines[i + 1]).slice(0, SPILL_LETTERS) : "";
      const spilled = next ? heard(next, plain(said)) : 0;
      const enough = mine.length < SHORT_LINE ? HEARD_ENOUGH_SHORT : HEARD_ENOUGH;
      if (heardMine < enough) {
        bad.push(`${i}: only ${(heardMine * 100) | 0}% of the line is in its bubble — "${said.slice(0, 40)}…"`);
      } else if (spilled > SPILL) {
        bad.push(`${i}: the next line starts in this bubble — "${said.slice(-40)}"`);
      }
    }
    if (bad.length) suspect++;
    console.log(`${lesson.order_index}\t${lesson.title}\t${bad.length ? `⚠ ${bad.length}/${lines.length}` : `ok (${lines.length})`}`);
    for (const b of bad) console.log(`    ${b}`);
    if (bad.length) console.log(`    → node scripts/revoice.mjs ${lesson.id} --voice=${VOICE}`);
  }
}
console.log(suspect ? `\n${suspect} lesson(s) worth remaking` : "\nnothing to remake");
