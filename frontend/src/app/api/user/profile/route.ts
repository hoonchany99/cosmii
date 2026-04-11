import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, getAuthUserId } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getServiceClient();
  const { data } = await sb
    .from("user_stats")
    .select("nickname, preset_avatar, accessory, spent_xp, unlocked_items")
    .eq("user_id", userId)
    .single();

  return NextResponse.json({
    nickname: data?.nickname ?? null,
    preset_avatar: data?.preset_avatar ?? null,
    accessory: data?.accessory ?? null,
    spent_xp: data?.spent_xp ?? 0,
    unlocked_items: data?.unlocked_items ?? [],
  });
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.nickname === "string" && body.nickname.trim().length > 0) {
    update.nickname = body.nickname.trim();
  }
  if (typeof body.preset_avatar === "string") {
    update.preset_avatar = body.preset_avatar;
  }
  if (body.accessory !== undefined) {
    update.accessory = body.accessory === null ? null : String(body.accessory);
  }
  if (typeof body.spent_xp === "number") {
    update.spent_xp = body.spent_xp;
  }
  if (Array.isArray(body.unlocked_items)) {
    update.unlocked_items = body.unlocked_items;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const sb = getServiceClient();

  if (update.nickname) {
    const { data: existing } = await sb
      .from("user_stats")
      .select("user_id")
      .eq("nickname", update.nickname)
      .neq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Nickname taken" }, { status: 409 });
    }
  }

  await sb.from("user_stats").upsert(
    { user_id: userId, ...update },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ ok: true, ...update });
}
