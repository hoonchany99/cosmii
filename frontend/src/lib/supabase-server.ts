import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any, any, any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServiceClient(): SupabaseClient<any, any, any> {
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );
  return _client;
}

export function getUserId(): string {
  return "demo-user";
}

export function pick(
  content: Record<string, unknown>,
  field: string,
  lang: string,
): unknown {
  return (
    content[`${field}_${lang}`] ??
    content[`${field}_ko`] ??
    content[field] ??
    ""
  );
}

export const BOOK_I18N: Record<string, Record<string, string>> = {
  bc977bab: {
    title_ko: "데미안",
    title_en: "Demian",
    author_ko: "헤르만 헤세",
    author_en: "Hermann Hesse",
  },
  "45b77580": {
    title_ko: "사피엔스",
    title_en: "Sapiens",
    author_ko: "유발 하라리",
    author_en: "Yuval Noah Harari",
  },
  e40c0e43: {
    title_ko: "신곡",
    title_en: "Divine Comedy",
    author_ko: "단테 알리기에리",
    author_en: "Dante Alighieri",
  },
  afd7a4b0: {
    title_ko: "코스모스",
    title_en: "Cosmos",
    author_ko: "칼 세이건",
    author_en: "Carl Sagan",
  },
  "2021cd07": {
    title_ko: "햄릿",
    title_en: "Hamlet",
    author_ko: "윌리엄 셰익스피어",
    author_en: "William Shakespeare",
  },
};
