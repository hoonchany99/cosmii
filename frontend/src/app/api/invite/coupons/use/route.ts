import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { decideUse } from "@/lib/invite-rules";
import { isSubscriber } from "@/lib/reader-access";
import { caller, grantPremium } from "@/lib/invite-server";

// A coupon used: Premium opens for its days, through RevenueCat. The coupon is
// marked used before RevenueCat is asked, so two taps can't use it twice; if
// RevenueCat refuses, it is put back.
export async function POST(req: NextRequest) {
  const me = await caller(req);
  if (!me) return NextResponse.json({ error: "sign_in" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { coupon_id?: unknown } | null;
  const id = typeof body?.coupon_id === "string" ? body.coupon_id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "not_found" }, { status: 400 });

  const sb = getServiceClient();
  const { data: coupon } = await sb.from("coupons").select("id, status, expires_at, days").eq("id", id).eq("user_id", me.id).maybeSingle();
  if (!coupon) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const premium = (await isSubscriber(me.id)) === true;
  const decision = decideUse(coupon, Date.now(), premium);
  if (!decision.ok) return NextResponse.json({ error: decision.reason }, { status: 409 });

  const { data: taken } = await sb
    .from("coupons")
    .update({ status: "used", used_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "unused")
    .select("id");
  if (!taken?.length) return NextResponse.json({ error: "used" }, { status: 409 });

  const granted = await grantPremium(me.id, coupon.days);
  if (granted !== "granted") {
    await sb.from("coupons").update({ status: "unused", used_at: null }).eq("id", id);
    console.error("coupon use: revenuecat", granted);
    return NextResponse.json({ error: granted === "denied" || granted === "no-key" ? "unavailable" : "failed" }, { status: 503 });
  }
  return NextResponse.json({ status: "ok", days: coupon.days });
}
