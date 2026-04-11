import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getServiceClient();

  await sb.from("user_progress").delete().eq("user_id", userId);
  await sb.from("user_stats").upsert(
    {
      user_id: userId,
      xp: 0,
      streak_days: 0,
      last_study_date: null,
      level: 1,
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ status: "ok", message: "Progress reset" });
}
