// What is said aloud for a lesson card, kept apart from the voicing so it can be
// tested on its own (node --test src/lib/lesson-tags.test.ts).

export type Part = { text: string; kind?: string; highlight?: string | null; voice?: unknown };

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

/**
 * A line's sentences as a listener hears them: split after . ? ! outside 「」
 * and '…', and after a quotation or a spoken line that ends a sentence itself.
 * The same as sentences() in cosmii-app src/lib/lesson-mix.ts, which checks
 * that a script has one cue per sentence; keep the two alike.
 */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let cur = "", inQuote = false, inLine = false;
  const t = text.trim();
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    cur += ch;
    const wasIn = inQuote || inLine;
    if (ch === "「") inQuote = true;
    else if (ch === "」") inQuote = false;
    else if (ch === "'") inLine = !inLine;
    if (wasIn && !inQuote && !inLine && /[.?!]/.test(t[i - 1] ?? "") && (i + 1 >= t.length || /\s/.test(t[i + 1]))) {
      out.push(cur.trim()); cur = ""; continue;
    }
    if (!inQuote && !inLine && /[.?!]/.test(ch)) {
      while (i + 1 < t.length && /[.?!」'"]/.test(t[i + 1])) { i++; cur += t[i]; if (t[i] === "'") inLine = !inLine; }
      if (i + 1 >= t.length || /\s/.test(t[i + 1])) { out.push(cur.trim()); cur = ""; }
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// A card's kind is never said aloud (in October a narrator read "[hook]").
const KIND_TAG = /\[\s*(hook|beat|line|aside|feel|guess|reveal|quote|close|tease|turn|person|map|choice|you)\s*\]/i;
const cueOk = (c: unknown): c is string => typeof c === "string" && /^\[[^\[\]]{1,38}\]$/.test(c.trim()) && !KIND_TAG.test(c);

/**
 * The line as v4 should read it: each sentence after its own tag, or null when
 * the card has no tags of its own or they don't fit its sentences one to one.
 * The app cuts a card longer than 100 letters into bubbles at sentence ends, so
 * a line may be a run of the card's sentences; it takes those sentences' tags.
 */
export function taggedLine(line: string, part: Part | undefined): string | null {
  if (!part || !Array.isArray(part.voice)) return null;
  const said = sentences(part.text);
  const cues = part.voice;
  if (cues.length !== said.length || !cues.every(cueOk)) return null;
  const want = squash(line);
  for (let from = 0; from < said.length; from++) {
    let run = "";
    for (let to = from; to < said.length; to++) {
      run += squash(said[to]);
      if (run === want) return said.slice(from, to + 1).map((x, i) => `${(cues[from + i] as string).trim()} ${spoken(x)}`).join(" ");
      if (!want.startsWith(run)) break;
    }
  }
  return null;
}

/**
 * A tag the same as the one just before it in the same take is dropped: v4 keeps
 * a tag's direction until the next tag, so the repeat only costs letters (대표
 * TG 1093·1095, about 15% of a rewritten card). Each line is voiced on its own,
 * so a line's first tag always stays - without it the take would start undirected.
 */
export function dropRepeatedTags(line: string): string {
  let prev: string | null = null;
  return line
    .replace(/\[([^\[\]]+)\]\s*/g, (m, cue: string) => {
      const c = cue.trim();
      if (c === prev) return "";
      prev = c;
      return m;
    })
    .trim();
}
