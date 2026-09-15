import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

// Deletes the signed-in account and everything stored for it. The iOS app
// calls this from 설정 > 계정 삭제 with the user's access token as a bearer
// token (App Store Review Guideline 5.1.1(v): deletion must be possible in the
// app, not by email). The token is checked with Supabase, so a caller can only
// ever delete their own account.
const USER_TABLES = ["user_progress", "user_stats"] as const;

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getServiceClient();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = data.user.id;

  for (const table of USER_TABLES) {
    const { error: deleteError } = await sb.from(table).delete().eq("user_id", userId);
    if (deleteError) {
      console.error(`account delete: ${table}`, deleteError.message);
      return NextResponse.json({ error: "Could not delete account data" }, { status: 500 });
    }
  }

  const { error: authError } = await sb.auth.admin.deleteUser(userId);
  if (authError) {
    console.error("account delete: auth user", authError.message);
    return NextResponse.json({ error: "Could not delete account" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
