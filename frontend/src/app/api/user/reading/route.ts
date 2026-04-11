import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId, BOOK_I18N } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get("language") ?? "ko";
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getServiceClient();

  const { data: progress } = await sb
    .from("user_progress")
    .select("lesson_id, completed")
    .eq("user_id", userId);

  if (!progress || progress.length === 0) {
    return NextResponse.json([]);
  }

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id),
  );

  if (completedLessonIds.size === 0) {
    return NextResponse.json([]);
  }

  const { data: lessons } = await sb
    .from("lessons")
    .select("id, book_id")
    .order("order_index");

  if (!lessons) return NextResponse.json([]);

  const bookProgress = new Map<string, { completed: number; total: number }>();
  for (const lesson of lessons) {
    const entry = bookProgress.get(lesson.book_id) ?? { completed: 0, total: 0 };
    entry.total++;
    if (completedLessonIds.has(lesson.id)) {
      entry.completed++;
    }
    bookProgress.set(lesson.book_id, entry);
  }

  const readingBookIds = Array.from(bookProgress.entries())
    .filter(([, prog]) => prog.completed > 0)
    .map(([bookId]) => bookId);

  if (readingBookIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: books } = await sb
    .from("books")
    .select("id, title, author, color, cover_url")
    .in("id", readingBookIds);

  if (!books) return NextResponse.json([]);

  const suffix = language === "en" ? "en" : "ko";
  const result = books.map((book) => {
    const prog = bookProgress.get(book.id) ?? { completed: 0, total: 0 };
    const i18n = BOOK_I18N[book.id];
    return {
      id: book.id,
      title: i18n?.[`title_${suffix}`] ?? book.title,
      author: i18n?.[`author_${suffix}`] ?? book.author,
      color: book.color,
      cover_url: book.cover_url,
      completedLessons: prog.completed,
      totalLessons: prog.total,
    };
  });

  return NextResponse.json(result);
}
