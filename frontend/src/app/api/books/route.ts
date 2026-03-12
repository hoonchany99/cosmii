import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, BOOK_I18N } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get("language") ?? "ko";
  const sb = getServiceClient();

  const { data, error } = await sb
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const books = ((data ?? []) as any[]).map((row) => {
    const i18n = BOOK_I18N[row.id] ?? {};
    return {
      ...row,
      title: i18n[`title_${language}`] ?? row.title,
      author: i18n[`author_${language}`] ?? row.author,
    };
  });

  return NextResponse.json(books);
}
