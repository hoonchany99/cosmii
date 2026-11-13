import { NextRequest } from "next/server";
import { quizResponse } from "@/lib/quiz-page";

export async function GET(req: NextRequest) {
  return quizResponse(req.nextUrl.origin, null);
}
