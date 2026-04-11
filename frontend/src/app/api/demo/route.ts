import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, BOOK_I18N, pick } from "@/lib/supabase-server";
import { BOOK_TAGLINES } from "@/lib/curations";

const DEMO_BOOK_IDS = ["s_atomic", "s_money_psych", "45b77580"];

export async function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get("language") ?? "ko";
  const sb = getServiceClient();

  const { data: books, error: bErr } = await sb
    .from("books")
    .select("id, title, author, color, cover_url, pages")
    .in("id", DEMO_BOOK_IDS);

  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });
  if (!books?.length) return NextResponse.json([]);

  const { data: allLessons } = await sb
    .from("lessons")
    .select("*")
    .in("book_id", DEMO_BOOK_IDS)
    .order("order_index", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonsByBook = new Map<string, any[]>();
  for (const l of allLessons ?? []) {
    const arr = lessonsByBook.get(l.book_id) ?? [];
    arr.push(l);
    lessonsByBook.set(l.book_id, arr);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = DEMO_BOOK_IDS.map((bookId) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return null;

    const i18n = BOOK_I18N[book.id] ?? {};
    const bookLessons = lessonsByBook.get(bookId) ?? [];
    const firstLesson = bookLessons[0];
    const secondLesson = bookLessons[1];

    let lesson = null;
    if (firstLesson) {
      const content = typeof firstLesson.content_json === "string"
        ? JSON.parse(firstLesson.content_json)
        : (firstLesson.content_json ?? {});

      let dialogue = pick(content, "dialogue", language);
      if (!Array.isArray(dialogue)) dialogue = content.dialogue ?? [];

      const contentQuizzes = pick(content, "quizzes", language);
      let quizzes: unknown[] = [];
      if (Array.isArray(contentQuizzes) && contentQuizzes.length > 0) {
        quizzes = contentQuizzes.map((q: Record<string, unknown>, i: number) => ({
          id: `${firstLesson.id}-q${i}`,
          question: q.question,
          options: q.options ?? [],
          correctIndex: q.correct_index ?? q.correctIndex ?? 0,
          explanation: q.explanation ?? "",
        }));
      }

      let nextTitle = "";
      if (secondLesson) {
        const secondContent = typeof secondLesson.content_json === "string"
          ? JSON.parse(secondLesson.content_json)
          : (secondLesson.content_json ?? {});
        nextTitle = (pick(secondContent, "title", language) as string) || secondLesson.title || "";
      }

      lesson = {
        title: (pick(content, "title", language) as string) || firstLesson.title || "",
        chapter: (pick(content, "chapter", language) as string) || content.chapter || "",
        dialogue,
        quizzes,
        cliffhanger: (pick(content, "cliffhanger", language) as string) || "",
        nextTitle,
        totalLessons: bookLessons.length,
      };
    }

    return {
      id: book.id,
      title: i18n[`title_${language}`] ?? book.title,
      author: i18n[`author_${language}`] ?? book.author,
      color: book.color,
      coverUrl: book.cover_url ?? `/covers/${book.id}.jpg`,
      tagline: BOOK_TAGLINES[book.id]
        ? (language === "ko" ? BOOK_TAGLINES[book.id].ko : BOOK_TAGLINES[book.id].en)
        : "",
      pages: book.pages ?? 0,
      lesson,
    };
  }).filter(Boolean);

  return NextResponse.json(result);
}
