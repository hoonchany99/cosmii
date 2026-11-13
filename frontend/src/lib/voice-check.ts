// Checking a voiced take against its script, by what a listener would hear
// (대표 TG 1123·1126·1130). A take is read in one go and cut into bubbles by
// ElevenLabs' letter timings; when the voice stumbles and reads a sentence
// again, those timings slide and a bubble gets the next one's first sentence
// (이방인 1장, 2026-11-13). A transcription of the take gives where each line
// really starts, and shows a stumbled run so it can be taken out.
//
// Pure functions only; the transcription call is in lesson-voice.ts.

export type Word = { text: string; start: number; end: number };

/** Letters a listener hears: Hangul and Latin letters only, no spaces or marks. */
export function letters(s: string): string {
  return s.replace(/\[[^\]]*\]/g, "").replace(/[^\p{Script=Hangul}A-Za-z]/gu, "");
}

const HEAD = 5;

/**
 * Where each line starts in the take, from the transcription: the first place,
 * after the previous line's start, where the line's opening letters are heard.
 * A line whose opening isn't found (a number read as words, a misheard word)
 * gets null, and the letter timing decides for it.
 */
export function lineStarts(words: Word[], lines: string[]): (number | null)[] {
  const heard = words.map((w) => letters(w.text));
  const out: (number | null)[] = [];
  let from = 0;
  for (let i = 0; i < lines.length; i++) {
    const head = letters(lines[i]).slice(0, HEAD);
    if (i === 0) { out.push(words[0]?.start ?? null); continue; }
    if (head.length < 2) { out.push(null); continue; }
    let found: number | null = null;
    for (let k = from; k < heard.length; k++) {
      let run = "";
      for (let m = k; m < heard.length && run.length < head.length; m++) run += heard[m];
      if (run.startsWith(head)) { found = k; break; }
    }
    if (found === null) { out.push(null); continue; }
    out.push(words[found].start);
    from = found + 1;
  }
  return out;
}

/**
 * Stretches where the voice started a sentence, broke off and read it again:
 * the same three words heard twice within a dozen words, when the script says
 * them once. The first, broken reading is what to take out ([from, to) seconds).
 */
export function stumbles(words: Word[], script: string): [number, number][] {
  const heard = words.map((w) => letters(w.text));
  const wanted = letters(script);
  const out: [number, number][] = [];
  for (let i = 0; i + 2 < heard.length; i++) {
    const tri = heard[i] + heard[i + 1] + heard[i + 2];
    if (tri.length < 4) continue;
    for (let j = i + 3; j < Math.min(heard.length - 2, i + 14); j++) {
      if (heard[j] + heard[j + 1] + heard[j + 2] !== tri) continue;
      const spanHeard = heard.slice(i, j).join("");
      // Said twice in the script too (a refrain): leave it.
      if (count(wanted, tri) >= 2 || count(wanted, spanHeard + tri) >= 1) break;
      out.push([words[i].start, words[j].start]);
      i = j - 1;
      break;
    }
  }
  return out;
}

function count(hay: string, needle: string): number {
  if (!needle) return 0;
  let n = 0;
  for (let at = hay.indexOf(needle); at !== -1; at = hay.indexOf(needle, at + 1)) n++;
  return n;
}

/** How much of the script was heard, 0..1, by shared letter pairs (numbers read as words lower it a little). */
export function heardShare(words: Word[], script: string): number {
  const a = pairs(letters(script));
  const b = pairs(words.map((w) => letters(w.text)).join(""));
  if (!a.size) return 1;
  let hit = 0;
  for (const [p, n] of a) hit += Math.min(n, b.get(p) ?? 0);
  let total = 0;
  for (const n of a.values()) total += n;
  return hit / total;
}

function pairs(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i + 1 < s.length; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) ?? 0) + 1);
  return m;
}
