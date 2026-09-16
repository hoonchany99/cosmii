import OpenAI from "openai";
import { encodeMp3, type Alignment } from "@/lib/voice-trim";

// A whole lesson read in one take. Voicing each speech bubble on its own gave
// every bubble a slightly different voice (v3 performs anew each time and
// knows nothing of the line before). Here the lesson is directed as a whole,
// voiced in as few takes as the model allows, and cut back into the app's
// bubbles with ElevenLabs' character timings.

export type Part = { text: string; kind?: string; highlight?: string | null };

export const RATE = 24000;
export const MODEL = "eleven_v3";
// v3 clips the last word of a take unless something follows it; a held pause
// does, and the cut after the last line takes it back out.
const HOLD = " [pause] … …";
// Characters per take, tags included, kept well inside the model's limit.
const TAKE_CHARS = 1800;

const WINDOW_MS = 20;
const SILENT_DB = -50;

export const squash = (s: string) => s.replace(/\s+/g, "");

// What the reader sees is set with 「」 for the book's words and '…' for a
// character speaking; the voice needs neither mark.
export function spoken(text: string) {
  return text
    .replace(/[「」『』《》]/g, "")
    .replace(/(^|[\s(])'([^']+)'/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

const spokenChar = /[가-힣A-Za-z0-9]/;
// The words alone: tags, punctuation and spacing removed.
const words = (s: string) => s.replace(/\[[^\]]*\]/g, "").replace(/[^가-힣A-Za-z0-9]/g, "");
const letterCount = (s: string) => [...s.replace(/\[[^\]]*\]/g, "")].filter((c) => spokenChar.test(c)).length;

const DIRECTOR = `You direct a Korean audiobook narrator. The narrator is Cosmii, a being who has heard every story since the universe began, telling a classic to a friend in casual Korean (반말). The whole lesson is read in one take by one voice, so keep that voice steady from line to line: colour the delivery, don't change who is speaking.

You get the lesson's lines in order, each with its role. Return JSON {"lines": [...]} with exactly the same number of lines, each the same line with ElevenLabs v3 audio tags and pauses added.

Rules:
- Never add, remove, reorder or change a single Korean word or punctuation mark. You may only insert: English audio tags in square brackets, "…" for a held pause, and "," for a short beat.
- 0 to 2 tags per line, right before the words they colour. Use gentle delivery tags: [curious], [playfully], [amused], [warmly], [gently], [softly], [slowly], [wistful], [sighs], [chuckles], [thoughtful], [serious]. For a character's words, a light touch like [softly, like the boy] rather than a different voice.
- By role:
  - hook: draw the listener in, a little hushed or intrigued.
  - guess: ask like you really want them to think.
  - reveal: a short "…" before the answer word, then pleased or amused.
  - quote (the book's own words): softer and slower, with weight.
  - aside / feel: warm and personal.
  - beat / line: natural storytelling.
  - close: gentle and open.
- If a line has a highlight word, put a short "…" just before it.
- Many lines need no tag at all.`;

export async function directLesson(lines: string[], parts: (Part | undefined)[]): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) return lines;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const listing = lines
      .map((l, i) => `${i + 1}. (${parts[i]?.kind ?? "line"}${parts[i]?.highlight ? `, highlight: ${parts[i]?.highlight}` : ""}) ${l}`)
      .join("\n");
    const completion = await openai.chat.completions.create({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DIRECTOR },
        { role: "user", content: `Lines:\n${listing}` },
      ],
    });
    const out = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as { lines?: unknown };
    const directed = Array.isArray(out.lines) ? out.lines : [];
    return lines.map((line, i) => {
      const d = typeof directed[i] === "string" ? (directed[i] as string).replace(/[「」『』《》]/g, "").replace(/^\d+\.\s*(\([^)]*\)\s*)?/, "").trim() : "";
      const tagsOk = (d.match(/\[[^\]]*\]/g) ?? []).every((t) => /^\[[A-Za-z ,'-]{2,48}\]$/.test(t));
      return d && tagsOk && words(d) === words(line) ? d : line;
    });
  } catch (e) {
    console.warn("tts: lesson direction failed", e instanceof Error ? e.message : e);
    return lines;
  }
}

type Take = { pcm: Int16Array; alignment: Alignment | null };

async function voiceTake(text: string): Promise<Take> {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const voiceId = process.env.ELEVENLABS_VOICE_ID!;
  const speak = () =>
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=pcm_${RATE}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text + HOLD,
        model_id: MODEL,
        // v3 takes 0 (creative), 0.5 (natural) or 1 (robust).
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
  let res = await speak();
  // The plan allows only a few voices at once.
  for (let attempt = 0; res.status === 429 && attempt < 4; attempt++) {
    await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    res = await speak();
  }
  if (!res.ok) throw new Error(`elevenlabs ${res.status} ${(await res.text().catch(() => "")).slice(0, 160)}`);
  const body = (await res.json()) as { audio_base64?: string; alignment?: Alignment | null };
  if (!body.audio_base64) throw new Error("elevenlabs returned no audio");
  const raw = Buffer.from(body.audio_base64, "base64");
  const bytes = new Uint8Array(raw.byteLength & ~1);
  bytes.set(raw.subarray(0, bytes.byteLength));
  return { pcm: new Int16Array(bytes.buffer), alignment: body.alignment ?? null };
}

// Start and end time of every line, from the timing of their letters.
function lineTimes(alignment: Alignment, lines: string[]): { start: number; end: number }[] | null {
  const counts = lines.map(letterCount);
  const chars = alignment.characters ?? [];
  const starts = alignment.character_start_times_seconds ?? [];
  const ends = alignment.character_end_times_seconds ?? [];
  const out: { start: number; end: number }[] = [];
  let line = 0;
  let seen = 0;
  let inTag = false;
  for (let i = 0; i < chars.length && line < lines.length; i++) {
    const c = chars[i];
    if (c === "[") inTag = true;
    else if (c === "]") inTag = false;
    else if (!inTag && spokenChar.test(c)) {
      if (seen === 0) out[line] = { start: starts[i], end: ends[i] };
      seen++;
      out[line].end = ends[i];
      if (seen === counts[line]) {
        line++;
        seen = 0;
        while (line < lines.length && counts[line] === 0) {
          out[line] = { start: out[line - 1].end, end: out[line - 1].end };
          line++;
        }
      }
    }
  }
  return line === lines.length ? out : null;
}

function loudAt(pcm: Int16Array, w: number, win: number) {
  let sum = 0;
  for (let j = w * win; j < (w + 1) * win && j < pcm.length; j++) sum += pcm[j] * pcm[j];
  return 20 * Math.log10(Math.sqrt(sum / win) / 32768 + 1e-9) > SILENT_DB;
}

// Where the voice really stops after `seconds` (a letter's timing can come a
// little early): the first 160 ms of silence, never past `limit`.
function settleAfter(pcm: Int16Array, seconds: number, limit: number): number {
  const win = Math.round((RATE * WINDOW_MS) / 1000);
  const from = Math.floor((seconds * RATE) / win);
  const last = Math.min(Math.floor(pcm.length / win), Math.floor((limit * RATE) / win));
  for (let w = from, quiet = 0; w < last; w++) {
    quiet = loudAt(pcm, w, win) ? 0 : quiet + 1;
    if (quiet >= 8) return ((w - 7) * win) / RATE;
  }
  return limit;
}

function clip(pcm: Int16Array, from: number, to: number): Int16Array {
  const out = pcm.slice(Math.max(0, Math.round(from * RATE)), Math.min(pcm.length, Math.round(to * RATE)));
  const fadeIn = Math.min(out.length, Math.round(RATE * 0.02));
  for (let i = 0; i < fadeIn; i++) out[i] = Math.round(out[i] * (i / fadeIn));
  const fadeOut = Math.min(out.length, Math.round(RATE * 0.06));
  for (let i = 0; i < fadeOut; i++) out[out.length - fadeOut + i] = Math.round(out[out.length - fadeOut + i] * (1 - i / fadeOut));
  return out;
}

// Every stretch of silence in a take, as [from, to] in seconds.
function silences(pcm: Int16Array): [number, number][] {
  const win = Math.round((RATE * WINDOW_MS) / 1000);
  const runs: [number, number][] = [];
  let from: number | null = null;
  for (let w = 0, n = Math.floor(pcm.length / win); w < n; w++) {
    if (loudAt(pcm, w, win)) {
      if (from !== null && (w - from) * WINDOW_MS >= 100) runs.push([(from * win) / RATE, (w * win) / RATE]);
      from = null;
    } else if (from === null) {
      from = w;
    }
  }
  if (from !== null) runs.push([(from * win) / RATE, pcm.length / RATE]);
  return runs;
}

// Cuts one take into its lines. The character timings say roughly where a line
// ends, but they can drift (a number read as words, a tag), and a cut inside a
// word sends the rest of it to the next bubble. So each cut is moved onto the
// real silence nearest that point; only when there is none does the timing
// itself decide.
function cutTake(take: Take, lines: string[]): Buffer[] {
  const times = take.alignment ? lineTimes(take.alignment, lines) : null;
  if (!times) throw new Error("no timing for the take");
  const total = take.pcm.length / RATE;
  const quiet = silences(take.pcm);

  // Where one line hands over to the next: the gap of silence between them.
  const breaks: { end: number; start: number }[] = [];
  for (let i = 0; i + 1 < lines.length; i++) {
    const after = times[i].end;
    const before = times[i + 1].start;
    const middle = (after + before) / 2;
    let best: [number, number] | null = null;
    let bestScore = Infinity;
    for (const [from, to] of quiet) {
      if (to < after - 1.5 || from > before + 1.5) continue;
      const centre = (Math.max(from, after - 1.5) + Math.min(to, before + 1.5)) / 2;
      const score = Math.abs(centre - middle) - Math.min(to - from, 1) * 0.5;
      if (score < bestScore) {
        bestScore = score;
        best = [from, to];
      }
    }
    if (best) {
      breaks.push({ end: Math.min(best[1], best[0] + 0.35), start: Math.max(best[0], best[1] - 0.12) });
    } else {
      const stop = settleAfter(take.pcm, after, Math.max(after, before - 0.12));
      breaks.push({ end: Math.min(stop + 0.3, before), start: Math.max(after, before - 0.12) });
    }
  }

  return lines.map((_, i) => {
    const from = i === 0 ? 0 : breaks[i - 1].start;
    const to =
      i + 1 < lines.length
        ? breaks[i].end
        : Math.min(total, settleAfter(take.pcm, times[i].end, Math.min(total, times[i].end + 1)) + 0.3);
    return encodeMp3(clip(take.pcm, from, Math.max(to, from + 0.2)), RATE);
  });
}

// The lesson's lines, voiced: one mp3 per line, in order.
export async function voiceLesson(directed: string[]): Promise<Buffer[]> {
  const takes: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const line of directed) {
    if (current.length && size + line.length > TAKE_CHARS) {
      takes.push(current);
      current = [];
      size = 0;
    }
    current.push(line);
    size += line.length + 2;
  }
  if (current.length) takes.push(current);

  const out: Buffer[] = [];
  for (const lines of takes) {
    // Lines of a take are read as paragraphs, so each gets its own breath.
    const take = await voiceTake(lines.join("\n\n"));
    out.push(...cutTake(take, lines));
  }
  return out;
}
