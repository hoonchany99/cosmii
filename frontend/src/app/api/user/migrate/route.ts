import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

const DEMO_USER = "demo-user";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getServiceClient();

  const { data: existingStats } = await sb
    .from("user_stats")
    .select("user_id")
    .eq("user_id", userId)
    .limit(1);

  if (existingStats && existingStats.length > 0) {
    return NextResponse.json({ status: "ok", migrated: false, reason: "already_has_data" });
  }

  const { data: demoStats } = await sb
    .from("user_stats")
    .select("*")
    .eq("user_id", DEMO_USER);

  if (!demoStats || demoStats.length === 0) {
    return NextResponse.json({ status: "ok", migrated: false, reason: "no_demo_data" });
  }

  await sb
    .from("user_progress")
    .update({ user_id: userId })
    .eq("user_id", DEMO_USER);

  await sb
    .from("user_stats")
    .update({ user_id: userId })
    .eq("user_id", DEMO_USER);

  return NextResponse.json({ status: "ok", migrated: true });
}
