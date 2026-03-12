import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getUserId, pick } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await params;
  const language = req.nextUrl.searchParams.get("language") ?? "ko";
  const userId = getUserId();
  const sb = getServiceClient();

  const [lessonsRes, progressRes] = await Promise.all([
    sb.from("lessons").select("*").eq("book_id", bookId).order("order_index"),
    sb.from("user_progress").select("*").eq("user_id", userId),
  ]);

  if (lessonsRes.error)
    return NextResponse.json({ error: lessonsRes.error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const progressMap = new Map<string, any>();
  for (const p of (progressRes.data ?? []) as any[]) {
    progressMap.set(p.lesson_id, p);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (lessonsRes.data ?? []).map((lesson: any) => {
    const content = JSON.parse(lesson.content_json ?? "{}");
    const p = progressMap.get(lesson.id);

    return {
      lesson: {
        id: lesson.id,
        book_id: lesson.book_id,
        order_index: lesson.order_index,
        title: (pick(content, "title", language) as string) || lesson.title || "",
        chapter: (pick(content, "chapter", language) as string) || content.chapter || "",
        chapter_title: pick(content, "chapter_title", language) as string,
        spark: pick(content, "spark", language) as string,
      },
      completed: p?.completed ?? false,
      score: p?.score ?? null,
      review_needed: p?.review_needed ?? false,
    };
  });

  return NextResponse.json(result);
}
