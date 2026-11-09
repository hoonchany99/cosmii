import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import { readConfig, type InviteConfig } from "@/lib/invite-rules";

// What the invitation routes share: who is asking (signed in only, 대표 6680),
// the numbers from app_config, and opening Premium for a coupon.

export type Caller = { id: string; createdAt: number };

/** The signed-in reader behind the bearer token, or null. A guest can't invite or be invited. */
export async function caller(req: NextRequest): Promise<Caller | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await getServiceClient().auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return { id: data.user.id, createdAt: Date.parse(data.user.created_at) };
}

export async function inviteConfig(): Promise<InviteConfig> {
  const { data } = await getServiceClient().from("app_config").select("value").eq("key", "invite").maybeSingle();
  return readConfig(data?.value);
}

const ENTITLEMENT = "premium";

/**
 * Opens Premium for `days` through RevenueCat's promotional entitlement, for
 * the RevenueCat user the app signs in as (the Supabase user id).
 * "no-key": REVENUECAT_SECRET_KEY isn't set; "denied": the key can't grant.
 */
export async function grantPremium(userId: string, days: number): Promise<"granted" | "no-key" | "denied" | "failed"> {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) return "no-key";
  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}/entitlements/${ENTITLEMENT}/promotional`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ end_time_ms: Date.now() + days * 24 * 60 * 60 * 1000 }),
        cache: "no-store",
      },
    );
    if (res.ok) return "granted";
    console.warn("revenuecat promotional", res.status);
    return res.status === 401 || res.status === 403 ? "denied" : "failed";
  } catch (e) {
    console.warn("revenuecat promotional failed", e instanceof Error ? e.message : e);
    return "failed";
  }
}
