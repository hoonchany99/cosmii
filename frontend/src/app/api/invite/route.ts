import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { makeCode } from "@/lib/invite-rules";
import { caller, inviteConfig } from "@/lib/invite-server";

// The signed-in reader's invitation: their code (made on first ask), how many
// friends have come in with it, and their coupons. 대표 6680·6693.
// The screen waited on four questions to the database in a row (대표 TG 212:
// 친구초대·쿠폰 보관함이 오래 걸림); now two. The functions run in Tokyo beside
// it (vercel.json regions).

export async function GET(req: NextRequest) {
  const sb = getServiceClient();
  const [me, config] = await Promise.all([caller(req), inviteConfig()]);
  if (!me) return NextResponse.json({ error: "sign_in" }, { status: 401 });

  // Everything about this reader at once; the code is made below only the first time.
  const [{ data: row }, { count: friends }, { data: coupons }, { data: redeemed }] = await Promise.all([
    sb.from("invite_codes").select("code").eq("user_id", me.id).maybeSingle(),
    sb.from("invite_redemptions").select("invitee_id", { count: "exact", head: true }).eq("inviter_id", me.id),
    sb.from("coupons").select("id, days, source, status, expires_at, used_at, created_at").eq("user_id", me.id).neq("status", "revoked").order("created_at", { ascending: false }),
    sb.from("invite_redemptions").select("invitee_id").eq("invitee_id", me.id).maybeSingle(),
  ]);

  let code: string | null = row?.code ?? null;
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

  const given = coupons?.length ?? 0;
  const canEnterCode = !redeemed && (config.new_account_days === 0 || Date.now() - me.createdAt <= config.new_account_days * 86_400_000);

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
