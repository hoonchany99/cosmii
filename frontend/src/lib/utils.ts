import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

const FILLER_RE =
  /^(?:the\s+)?(?:passage|text|section|chapter|book|author|document|article)\s+(?:discusses?|describes?|explains?|mentions?|presents?|introduces?|covers?|is about|states?|focuses on|notes?|outlines?|details?)\s+/i;
const IS_A_RE =
  /\s+is\s+(?:an?\s+)?(?:concept|term|topic|idea|principle|method|process|procedure|strategy|technique|framework|type|author|person|character|entity|practice|approach|pattern|tool|component)(?:\s+(?:mentioned|discussed|described|defined|introduced|presented|explained|referred to|outlined|covered|used))?(?:\s+(?:in|within|throughout|across)\s+.*)?\s*\.?\s*$/i;
const TRAILING_RE =
  /\s*(?:,?\s*(?:in|within|from|throughout|across)\s+(?:the\s+)?(?:passage|text|section|chapter|book|document|article|context))\.?\s*$/i;
const VERB_RE =
  /\s+(?:is|are|was|were|involves?|discusses?|describes?|explains?|governs?|manages?|handles?|provides?|requires?|enables?|allows?|ensures?|supports?|contains?|includes?|covers?|shrinks?|tracks?|uses?|defines?|follows?|refers?|begins?|starts?|operates?|evaluates?|performs?|generally|typically|often|usually|can|should|must|may|will|would)\b/i;
const ARTICLE_RE = /^(?:the|a|an|this|these|those|every|each|for)\s+/i;
const MAX_LEN = 35;

export function shortenLabel(raw: string): string {
  if (!raw) return "";
  let t = raw.trim().replace(/\.$/, "");
  t = t.replace(FILLER_RE, "");
  t = t.replace(IS_A_RE, "");
  t = t.replace(TRAILING_RE, "");
  t = t.trim().replace(/\.$/, "");
  t = t.replace(ARTICLE_RE, "");
  if (t) t = t[0].toUpperCase() + t.slice(1);
  if (t.length <= MAX_LEN) return t;
  const vm = VERB_RE.exec(t);
  if (vm && vm.index > 3) {
    const subj = t.slice(0, vm.index).trim().replace(/,$/, "");
    if (subj.length <= MAX_LEN && subj.length >= 3) return subj;
  }
  const words = t.split(/\s+/).slice(0, 5);
  let out = words.join(" ");
  if (out.length > MAX_LEN) out = words.slice(0, -1).join(" ");
  if (out.length > MAX_LEN) out = out.slice(0, MAX_LEN - 1) + "…";
  return out;
}
