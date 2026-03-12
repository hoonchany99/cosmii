import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, pick } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const language = req.nextUrl.searchParams.get("language") ?? "ko";
  const sb = getServiceClient();

  const { data: lesson, error } = await sb
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !lesson)
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const content = JSON.parse(lesson.content_json ?? "{}");

  const contentQuizzes = pick(content, "quizzes", language);
  let quizzes: unknown[];

  if (Array.isArray(contentQuizzes) && contentQuizzes.length > 0) {
    quizzes = contentQuizzes.map((q: Record<string, unknown>, i: number) => ({
      id: `${lessonId}-q${i}`,
      lesson_id: lessonId,
      question: q.question,
      options: q.options ?? [],
      correct_index: q.correct_index ?? 0,
      explanation: q.explanation ?? "",
    }));
  } else {
    const { data: dbQuizzes } = await sb
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId);

    quizzes = (dbQuizzes ?? []).map((q) => ({
      id: q.id,
      lesson_id: q.lesson_id,
      question: q.question,
      options:
        typeof q.options_json === "string"
          ? JSON.parse(q.options_json)
          : q.options_json,
      correct_index: q.correct_index,
      explanation: q.explanation ?? "",
    }));
  }

  let dialogue = pick(content, "dialogue", language);
  if (!Array.isArray(dialogue)) dialogue = content.dialogue ?? [];

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      book_id: lesson.book_id,
      order_index: lesson.order_index,
      title: (pick(content, "title", language) as string) || lesson.title || "",
      chapter: (pick(content, "chapter", language) as string) || content.chapter || "",
      chapter_title: pick(content, "chapter_title", language) as string,
      part: content.part ?? 1,
      total_parts: content.total_parts ?? 1,
      dialogue,
      spark: pick(content, "spark", language) as string,
      cliffhanger: pick(content, "cliffhanger", language) as string,
    },
    quizzes,
  });
}
