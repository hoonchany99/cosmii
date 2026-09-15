import { Mp3Encoder } from "@breezystack/lamejs";

// eleven_v3 tends to stop voicing before a line is quite over, clipping its
// last word. The route asks for a held pause after every line so the words
// finish, then cuts the audio a breath after the line's last letter (from
// ElevenLabs' character timings), which also drops the stray syllables v3
// sometimes makes in that pause. Without timings, the pause is trimmed by
// level instead.

const WINDOW_MS = 20;
const SILENT_DB = -50;
const KEEP_AFTER_MS = 300;
const STRAY_MAX_MS = 800;
const STRAY_GAP_MS = 400;

export function trimTrailingSilence(pcm: Int16Array, rate: number): Int16Array {
  const win = Math.round((rate * WINDOW_MS) / 1000);
  const count = Math.floor(pcm.length / win);
  const loud = (w: number) => {
    let sum = 0;
    for (let j = w * win; j < (w + 1) * win; j++) sum += pcm[j] * pcm[j];
    return 20 * Math.log10(Math.sqrt(sum / win) / 32768 + 1e-9) > SILENT_DB;
  };
  let end = count;

  // A stray sound running into the very end, after a clear gap.
  if (end > 0 && loud(end - 1)) {
    let start = end - 1;
    while (start > 0 && loud(start - 1)) start--;
    let gapStart = start;
    while (gapStart > 0 && !loud(gapStart - 1)) gapStart--;
    const strayMs = (end - start) * WINDOW_MS;
    const gapMs = (start - gapStart) * WINDOW_MS;
    if (gapStart > 0 && strayMs <= STRAY_MAX_MS && gapMs >= STRAY_GAP_MS) end = start;
  }

  while (end > 0 && !loud(end - 1)) end--;
  if (end === 0) return pcm;
  const cut = Math.min(pcm.length, end * win + Math.round((rate * KEEP_AFTER_MS) / 1000));
  return pcm.subarray(0, cut);
}

export type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

const spokenChar = /[가-힣A-Za-z0-9]/;

// When the last letter of the line itself ends, in seconds. Audio tags in
// [brackets] are skipped on both sides; anything after the line's letters
// (the held pause) doesn't count.
export function speechEnd(alignment: Alignment, line: string): number | null {
  const letters = [...line.replace(/\[[^\]]*\]/g, "")].filter((c) => spokenChar.test(c)).length;
  if (!letters) return null;
  const chars = alignment.characters ?? [];
  const ends = alignment.character_end_times_seconds ?? [];
  let seen = 0;
  let inTag = false;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === "[") inTag = true;
    else if (c === "]") inTag = false;
    else if (!inTag && spokenChar.test(c) && ++seen === letters) {
      return typeof ends[i] === "number" ? ends[i] : null;
    }
  }
  return null;
}

// The line up to where its voice actually stops: the timing of the last letter
// can come a little early, so the cut waits for the first real silence after
// it (never more than a second), keeps a breath, and fades so it doesn't click.
const SETTLE_MS = 160;
const LOOK_AHEAD_MS = 1000;

export function cutAt(pcm: Int16Array, rate: number, seconds: number): Int16Array {
  const win = Math.round((rate * WINDOW_MS) / 1000);
  const loud = (w: number) => {
    let sum = 0;
    for (let j = w * win; j < (w + 1) * win && j < pcm.length; j++) sum += pcm[j] * pcm[j];
    return 20 * Math.log10(Math.sqrt(sum / win) / 32768 + 1e-9) > SILENT_DB;
  };
  const from = Math.floor((seconds * rate) / win);
  const last = Math.min(Math.floor(pcm.length / win), from + LOOK_AHEAD_MS / WINDOW_MS);
  const settle = SETTLE_MS / WINDOW_MS;
  let stop = last;
  for (let w = from, quiet = 0; w < last; w++) {
    quiet = loud(w) ? 0 : quiet + 1;
    if (quiet >= settle) {
      stop = w - settle + 1;
      break;
    }
  }
  const cut = Math.min(pcm.length, stop * win + Math.round((rate * KEEP_AFTER_MS) / 1000));
  const out = pcm.slice(0, cut);
  const fade = Math.min(out.length, Math.round(rate * 0.06));
  for (let i = 0; i < fade; i++) out[out.length - fade + i] = Math.round(out[out.length - fade + i] * (1 - i / fade));
  return out;
}

export function encodeMp3(pcm: Int16Array, rate: number, kbps = 64): Buffer {
  const encoder = new Mp3Encoder(1, rate, kbps);
  const chunks: Uint8Array[] = [];
  const block = 1152 * 20;
  for (let i = 0; i < pcm.length; i += block) {
    const out = encoder.encodeBuffer(pcm.subarray(i, i + block));
    if (out.length) chunks.push(new Uint8Array(out));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(new Uint8Array(tail));
  return Buffer.concat(chunks);
}
