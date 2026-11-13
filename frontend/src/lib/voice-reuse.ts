// Re-voicing only what changed (대표 TG 1167·7557, 2026-11-13). A lesson's
// voice is stored under a key made from all of its text, so changing one card
// used to make the whole lesson again (about 2,000 credits). The last voicing
// of each lesson is now remembered by lesson id; when the text changes, the
// lines that read exactly as before keep their files and only the rest are
// voiced. Pure functions only; the storage side is in api/tts/lesson.

/** What a lesson's last voicing left behind, kept at lesson-latest/<id>.json. */
export type Latest = { key: string; model: string; direction: string; lines: string[]; directed: string[]; urls: string[] };

/**
 * For each new line, the index of the same line in the last voicing, or null
 * if it has to be voiced. Lines are matched in order, so a card that moved is
 * voiced again rather than reused out of place.
 */
export function reusePlan(before: string[], after: string[]): (number | null)[] {
  const out: (number | null)[] = [];
  let from = 0;
  for (const line of after) {
    let hit = -1;
    for (let j = from; j < before.length; j++) if (before[j] === line) { hit = j; break; }
    if (hit === -1) out.push(null);
    else { out.push(hit); from = hit + 1; }
  }
  return out;
}

/** Runs of consecutive lines to voice, as [start, end) index pairs. */
export function runs(plan: (number | null)[]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < plan.length; i++) {
    if (plan[i] !== null) continue;
    const start = i;
    while (i + 1 < plan.length && plan[i + 1] === null) i++;
    out.push([start, i + 1]);
  }
  return out;
}

/**
 * Whether reusing is worth it: same voice settings, and at least half the
 * lines kept. Past that, one fresh take reads more evenly than a patchwork.
 */
export function worthReusing(latest: Latest | null, model: string, direction: string, plan: (number | null)[]): boolean {
  if (!latest || latest.model !== model || latest.direction !== direction) return false;
  if (latest.urls.length !== latest.lines.length) return false;
  const kept = plan.filter((p) => p !== null).length;
  return kept > 0 && kept * 2 >= plan.length;
}
