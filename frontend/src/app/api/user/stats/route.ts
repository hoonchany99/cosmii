import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getServiceClient();

  const { data } = await sb.from("user_stats").select("*").eq("user_id", userId);

  if (data && data.length > 0) {
    const s = data[0];
    return NextResponse.json({
      xp: s.xp,
      streak_days: s.streak_days,
      last_study_date: s.last_study_date,
      level: s.level ?? 1,
    });
  }

  return NextResponse.json({ xp: 0, streak_days: 0, last_study_date: null, level: 1 });
}
