import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getServiceClient();

  await sb.from("user_progress").delete().eq("user_id", userId);
  await sb.from("user_stats").delete().eq("user_id", userId);

  return NextResponse.json({ status: "ok", message: "Progress reset" });
}
