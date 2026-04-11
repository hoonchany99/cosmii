import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const body = await req.json();
  const { score, correct_answers } = body;
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getServiceClient();

  const xpEarned = Math.round((score ?? 0) * 0.6 + (correct_answers ?? 0) * 10);

  await sb.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      score,
      review_needed: false,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  const { data: stats } = await sb
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const prevDate = stats?.last_study_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const isConsecutive = prevDate === yesterday || prevDate === today;

  const newXp = (stats?.xp ?? 0) + xpEarned;
  const newStreak =
    prevDate === today
      ? (stats?.streak_days ?? 1)
      : isConsecutive
        ? (stats?.streak_days ?? 0) + 1
        : 1;
  const newLevel = Math.floor(newXp / 200) + 1;
  const prevLevel = stats?.level ?? 1;

  await sb.from("user_stats").upsert(
    {
      user_id: userId,
      xp: newXp,
      streak_days: newStreak,
      last_study_date: today,
      level: newLevel,
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({
    xp_earned: xpEarned,
    streak_days: newStreak,
    level: newLevel,
    level_up: newLevel > prevLevel,
  });
}
