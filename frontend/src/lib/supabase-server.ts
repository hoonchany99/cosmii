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
};
