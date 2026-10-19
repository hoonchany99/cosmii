// The name Cosmii is always set in the wordmark face, wherever it appears in
// a sentence - the same rule the app keeps (see its editorial/withCosmii).
// Wrapping each one by hand means the next sentence someone writes forgets,
// so the swap is done by the text itself.
import type { ReactNode } from "react";

const SERIF = "font-[family-name:var(--font-serif)] font-bold";

/** A sentence with every "Cosmii" in it set in the wordmark face. */
export function withCosmii(text: string): ReactNode {
  const parts = text.split("Cosmii");
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<span key={i} className={SERIF}>Cosmii</span>, part],
  );
}

/**
 * A night sky, drawn with gradients rather than loaded as a picture. The
 * positions come from the seed, so the same seed is always the same sky and
 * no file has to be shipped for it.
 */
export function starfield(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  const next = () => {
    h = (h * 1103515245 + 12345) % 2147483648;
    return h / 2147483648;
  };
  const stars: string[] = [];
  for (let i = 0; i < 90; i++) {
    const x = (next() * 100).toFixed(2);
    const y = (next() * 100).toFixed(2);
    const r = (next() * 1.2 + 0.5).toFixed(2);
    const a = (next() * 0.5 + 0.18).toFixed(2);
    stars.push(`radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(255,255,255,${a}) 50%, transparent 51%)`);
  }
  stars.push("radial-gradient(900px 520px at 18% 12%, rgba(90,80,170,0.16), transparent 70%)");
  stars.push("radial-gradient(760px 480px at 86% 88%, rgba(60,110,140,0.13), transparent 70%)");
  return stars.join(", ");
}
