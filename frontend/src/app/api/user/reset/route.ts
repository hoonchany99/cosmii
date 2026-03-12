import { NextResponse } from "next/server";
import { getServiceClient, getUserId } from "@/lib/supabase-server";

export async function DELETE() {
  const userId = getUserId();
  const sb = getServiceClient();

  await sb.from("user_progress").delete().eq("user_id", userId);
  await sb.from("user_stats").delete().eq("user_id", userId);

  return NextResponse.json({ status: "ok", message: "Progress reset" });
}
