import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getUserId } from "@/lib/supabase-server";

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

function calcLevel(xp: number): number {
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp < XP_THRESHOLDS[i]) return i;
  }
  return XP_THRESHOLDS.length;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const body = await req.json();
  const { score, correct_answers } = body;
  const userId = getUserId();
  const sb = getServiceClient();

  const baseXp = 50;
  const quizXp = (correct_answers ?? 0) * 20;
  const xpEarned = baseXp + quizXp;

  await sb.from("user_progress").upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed: true,
    score,
    completed_at: new Date().toISOString(),
  });

  const { data: statsRows } = await sb
    .from("user_stats")
    .select("*")
    .eq("user_id", userId);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newXp: number;
  let newStreak: number;
  let newLevel: number;
  let levelUp: boolean;

  if (statsRows && statsRows.length > 0) {
    const cur = statsRows[0];
    newXp = cur.xp + xpEarned;
    const last = cur.last_study_date;
    if (last === yesterday) newStreak = cur.streak_days + 1;
    else if (last === today) newStreak = cur.streak_days;
    else newStreak = 1;

    newLevel = calcLevel(newXp);
    levelUp = newLevel > (cur.level ?? 1);

    await sb
      .from("user_stats")
      .update({ xp: newXp, streak_days: newStreak, last_study_date: today, level: newLevel })
      .eq("user_id", userId);
  } else {
    newXp = xpEarned;
    newStreak = 1;
    newLevel = calcLevel(newXp);
    levelUp = newLevel > 1;

    await sb.from("user_stats").insert({
      user_id: userId,
      xp: newXp,
      streak_days: 1,
      last_study_date: today,
      level: newLevel,
    });
  }

  return NextResponse.json({
    xp_earned: xpEarned,
    streak_days: newStreak,
    level: newLevel,
    level_up: levelUp,
  });
}
