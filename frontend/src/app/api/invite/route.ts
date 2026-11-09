import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { makeCode } from "@/lib/invite-rules";
import { caller, inviteConfig } from "@/lib/invite-server";

// The signed-in reader's invitation: their code (made on first ask), how many
// friends have come in with it, and their coupons. 대표 6680·6693.
export async function GET(req: NextRequest) {
  const me = await caller(req);
  if (!me) return NextResponse.json({ error: "sign_in" }, { status: 401 });
  const sb = getServiceClient();
  const config = await inviteConfig();

  let code: string | null = null;
  const { data: row } = await sb.from("invite_codes").select("code").eq("user_id", me.id).maybeSingle();
  code = row?.code ?? null;
  // A new code; on the rare clash with someone else's, try again.
  for (let i = 0; !code && i < 5; i++) {
    const candidate = makeCode(Math.random);
    const { error } = await sb.from("invite_codes").insert({ user_id: me.id, code: candidate });
    if (!error) code = candidate;
    else if (error.code === "23505") {
      // Either the code is taken, or this reader's code was made meanwhile.
      const { data: again } = await sb.from("invite_codes").select("code").eq("user_id", me.id).maybeSingle();
      code = again?.code ?? null;
    } else {
      console.error("invite code", error.message);
      return NextResponse.json({ error: "failed" }, { status: 500 });
    }
  }
  if (!code) return NextResponse.json({ error: "failed" }, { status: 500 });

  const [{ count: friends }, { data: coupons }, { data: redeemed }] = await Promise.all([
    sb.from("invite_redemptions").select("invitee_id", { count: "exact", head: true }).eq("inviter_id", me.id),
    sb.from("coupons").select("id, days, source, status, expires_at, used_at, created_at").eq("user_id", me.id).neq("status", "revoked").order("created_at", { ascending: false }),
    sb.from("invite_redemptions").select("invitee_id").eq("invitee_id", me.id).maybeSingle(),
  ]);
  const given = coupons?.length ?? 0;
  const canEnterCode = !redeemed && Date.now() - me.createdAt <= config.new_account_days * 86_400_000;

  return NextResponse.json({
    code,
    friends: friends ?? 0,
    coupons: coupons ?? [],
    cap: config.cap,
    capLeft: Math.max(0, config.cap - given),
    milestones: config.milestones,
    canEnterCode,
  });
}
