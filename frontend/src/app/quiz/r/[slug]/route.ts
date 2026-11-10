import { NextRequest, NextResponse } from "next/server";
import { QUIZ_RESULTS, quizResponse } from "@/lib/quiz-page";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(QUIZ_RESULTS, slug)) return NextResponse.redirect(new URL("/quiz", req.url), 307);
  return quizResponse(req.nextUrl.origin, slug);
}
