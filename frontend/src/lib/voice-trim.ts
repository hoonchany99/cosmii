import { Mp3Encoder } from "@breezystack/lamejs";

// eleven_v3 tends to stop voicing before a line is quite over, clipping its
// last word. The route asks for a held pause after every line so the words
// finish; this then takes that pause back down to a short breath, so lines
// still follow one another closely.

const WINDOW_MS = 20;
const SILENT_DB = -50;
const KEEP_AFTER_MS = 300;

export function trimTrailingSilence(pcm: Int16Array, rate: number): Int16Array {
  const win = Math.round((rate * WINDOW_MS) / 1000);
  let end = Math.floor(pcm.length / win);
  while (end > 0) {
    let sum = 0;
    for (let j = (end - 1) * win; j < end * win; j++) sum += pcm[j] * pcm[j];
    const db = 20 * Math.log10(Math.sqrt(sum / win) / 32768 + 1e-9);
    if (db > SILENT_DB) break;
    end--;
  }
  if (end === 0) return pcm;
  const cut = Math.min(pcm.length, end * win + Math.round((rate * KEEP_AFTER_MS) / 1000));
  return pcm.subarray(0, cut);
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
