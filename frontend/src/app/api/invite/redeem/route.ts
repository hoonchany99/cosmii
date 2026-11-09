import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { decideRedeem, deviceHash, normalizeCode, type Grant } from "@/lib/invite-rules";
import { markPhoneInvited, phoneInvited } from "@/lib/devicecheck";
import { caller, inviteConfig } from "@/lib/invite-server";

// A friend's code entered: both sides get their coupon at once (대표 6680).
// Body: { code, device_token?, install_id, development? }. device_token is the
// phone's DeviceCheck token; install_id the app's own id for this install,
// kept as a hash so the same phone can be recognised without DeviceCheck.
export async function POST(req: NextRequest) {
  const me = await caller(req);
  if (!me) return NextResponse.json({ error: "sign_in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const code = normalizeCode(body?.code);
  if (!code) return NextResponse.json({ error: "not_found" }, { status: 400 });
  const token = typeof body?.device_token === "string" && body.device_token.length < 10_000 ? body.device_token : "";
  const install = typeof body?.install_id === "string" && body.install_id.length < 200 ? body.install_id : "";
  const development = body?.development === true;

  const sb = getServiceClient();
  const config = await inviteConfig();
  const salt = process.env.SUPABASE_SERVICE_KEY?.slice(-16) ?? "cosmii";
  const hash = install ? await deviceHash(install, salt) : null;

  const { data: owner } = await sb.from("invite_codes").select("user_id").eq("code", code).maybeSingle();
  const inviterId: string | null = owner?.user_id ?? null;
  const since = new Date(Date.now() - 86_400_000).toISOString();

  const [already, byDevice, apple, inviterRows] = await Promise.all([
    sb.from("invite_redemptions").select("invitee_id").eq("invitee_id", me.id).maybeSingle(),
    hash ? sb.from("invite_redemptions").select("invitee_id, inviter_id").eq("device_hash", hash) : Promise.resolve({ data: [] as { invitee_id: string; inviter_id: string }[] }),
    token ? phoneInvited(token, development) : Promise.resolve("unavailable" as const),
    inviterId
      ? Promise.all([
          sb.from("coupons").select("id", { count: "exact", head: true }).eq("user_id", inviterId).neq("status", "revoked"),
          sb.from("invite_redemptions").select("invitee_id", { count: "exact", head: true }).eq("inviter_id", inviterId).gte("created_at", since),
          sb.from("invite_redemptions").select("invitee_id", { count: "exact", head: true }).eq("inviter_id", inviterId),
        ])
      : Promise.resolve(null),
  ]);

  const deviceRows = byDevice.data ?? [];
  const decision = decideRedeem({
    now: Date.now(),
    config,
    inviteeId: me.id,
    inviteeCreatedAt: me.createdAt,
    inviteeAlreadyRedeemed: !!already.data,
    deviceUsed: apple === "invited" || deviceRows.length > 0,
    // This phone already carried the inviter (they were invited on it).
    inviterDevice: !!inviterId && deviceRows.some((r) => r.invitee_id === inviterId),
    inviter:
      inviterId && inviterRows
        ? {
            id: inviterId,
            couponsGiven: inviterRows[0].count ?? 0,
            rewardedToday: inviterRows[1].count ?? 0,
            friendsBefore: inviterRows[2].count ?? 0,
          }
        : null,
  });
  if (!decision.ok) return NextResponse.json({ error: decision.reason }, { status: 409 });

  // The account can be invited once: the primary key settles a race.
  const { error: insertError } = await sb
    .from("invite_redemptions")
    .insert({ invitee_id: me.id, inviter_id: inviterId, code, device_hash: hash });
  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ error: "already" }, { status: 409 });
    console.error("invite redeem", insertError.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  const expires = new Date(Date.now() + config.valid_days * 86_400_000).toISOString();
  const rows = (userId: string, grants: Grant[]) =>
    grants.map((g) => ({ user_id: userId, days: g.days, source: g.source, redemption_invitee: me.id, expires_at: expires }));
  const { error: couponError } = await sb.from("coupons").insert([...rows(me.id, decision.invitee), ...rows(inviterId!, decision.inviter)]);
  if (couponError) console.error("invite coupons", couponError.message);

  // Marked last: a phone is used up only once the invitation went through.
  if (token) await markPhoneInvited(token, development);

  return NextResponse.json({
    status: "ok",
    coupons: decision.invitee.length,
    inviterRewarded: decision.inviter.length > 0,
    deviceCheck: apple,
  });
}
