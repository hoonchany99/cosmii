import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

// The 24-hour promise, kept for the installs nobody comes back for.
//
// A token is deleted as soon as Apple answers, and the app's own next launch
// deletes an expired one. But a reader who never opens the app again would
// leave their token sitting here, so this runs on a schedule (vercel.json) and
// clears every token past its day. It keeps the campaign numbers, which say
// nothing about anyone.
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // Vercel signs its own cron calls; nothing else may sweep.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "no" }, { status: 401 });
  }
  const db = getServiceClient();
  const { data, error } = await db
    .from("ad_attribution")
    .update({ token: null })
    .lt("token_expires_at", new Date().toISOString())
    .not("token", "is", null)
    .select("install_id");
  if (error) return NextResponse.json({ error: "sweep failed" }, { status: 500 });
  return NextResponse.json({ cleared: data?.length ?? 0 });
}
