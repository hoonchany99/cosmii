import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

// Which Apple Search Ads campaign, if any, brought an install.
//
// The app reads Apple's attribution token once and posts it here with a name
// for the install. Only Apple can say what a token means, so we ask its
// endpoint; it answers nothing for the first seconds after an install and
// rate-limits, so a token that isn't ready yet is kept and tried again.
//
// **The token is deleted the moment Apple answers, and in any case within 24
// hours**, which is what the privacy policy promises and also when Apple's
// token expires. Only what Apple returns is kept: whether an ad was involved
// and the campaign, ad group and keyword numbers from the ad account. None of
// it describes the reader, and no account is attached to it.
//
// See scripts/add-ad-attribution.sql for the table.
export const maxDuration = 30;

const APPLE = "https://api-adservices.apple.com/api/v1/";
const A_DAY = 24 * 60 * 60 * 1000;

type Attribution = {
  attributed: boolean;
  campaign_id: number | null;
  ad_group_id: number | null;
  keyword_id: number | null;
  conversion_type: string | null;
};

type AppleAnswer = {
  attribution?: boolean;
  campaignId?: number;
  adGroupId?: number;
  keywordId?: number;
  conversionType?: string;
};

function shape(a: AppleAnswer): Attribution {
  const attributed = a.attribution === true;
  return {
    attributed,
    campaign_id: attributed ? a.campaignId ?? null : null,
    ad_group_id: attributed ? a.adGroupId ?? null : null,
    keyword_id: attributed ? a.keywordId ?? null : null,
    conversion_type: attributed ? a.conversionType ?? null : null,
  };
}

/**
 * Asks Apple what a token means.
 * - 200: the answer, whether or not an ad was involved.
 * - 404: too early, or this token will never resolve. Worth another try.
 * - 429: too many asks. Worth another try.
 * - 400: the token is not a token. Nothing to keep.
 */
async function ask(token: string): Promise<{ answer: Attribution | null; retry: boolean }> {
  const res = await fetch(APPLE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: token,
    cache: "no-store",
  });
  if (res.ok) {
    const body = (await res.json().catch(() => null)) as AppleAnswer | null;
    return { answer: body ? shape(body) : null, retry: !body };
  }
  return { answer: null, retry: res.status === 404 || res.status === 429 || res.status >= 500 };
}

function isId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 64 && /^[A-Za-z0-9_-]+$/.test(v);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { install_id?: unknown; token?: unknown } | null;
  const installId = body?.install_id;
  const token = body?.token;
  if (!isId(installId) || typeof token !== "string" || token.length < 16 || token.length > 4096) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const db = getServiceClient();
  const { answer, retry } = await ask(token).catch(() => ({ answer: null, retry: true }));
  if (answer) {
    // Apple has answered: the token has done its work and is not stored at all.
    await db.from("ad_attribution").upsert(
      { install_id: installId, ...answer, token: null, resolved_at: new Date().toISOString() },
      { onConflict: "install_id" },
    );
    return NextResponse.json({ attribution: answer });
  }
  if (!retry) {
    await db.from("ad_attribution").upsert(
      { install_id: installId, attributed: false, token: null, resolved_at: new Date().toISOString() },
      { onConflict: "install_id" },
    );
    return NextResponse.json({ attribution: { attributed: false, campaign_id: null, ad_group_id: null, keyword_id: null, conversion_type: null } });
  }
  // Not ready. The token waits here, and no longer than a day.
  await db.from("ad_attribution").upsert(
    { install_id: installId, token, token_expires_at: new Date(Date.now() + A_DAY).toISOString() },
    { onConflict: "install_id" },
  );
  return NextResponse.json({ pending: true }, { status: 202 });
}

/** The app asking again on a later launch; this is where a retry happens. */
export async function GET(req: NextRequest) {
  const installId = req.nextUrl.searchParams.get("install_id");
  if (!isId(installId)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const db = getServiceClient();
  const { data } = await db
    .from("ad_attribution")
    .select("attributed, campaign_id, ad_group_id, keyword_id, conversion_type, token, token_expires_at, resolved_at")
    .eq("install_id", installId)
    .maybeSingle();
  if (!data) return NextResponse.json({ pending: true }, { status: 202 });
  if (data.resolved_at) {
    return NextResponse.json({
      attribution: {
        attributed: !!data.attributed,
        campaign_id: data.campaign_id,
        ad_group_id: data.ad_group_id,
        keyword_id: data.keyword_id,
        conversion_type: data.conversion_type,
      },
    });
  }
  const expired = !data.token_expires_at || new Date(data.token_expires_at).getTime() < Date.now();
  if (!data.token || expired) {
    // A day has passed with no answer: the token goes, and this install stays
    // unknown rather than being called organic.
    await db.from("ad_attribution").update({ token: null }).eq("install_id", installId);
    return NextResponse.json({ pending: false }, { status: 204 });
  }
  const { answer, retry } = await ask(data.token).catch(() => ({ answer: null, retry: true }));
  if (answer) {
    await db
      .from("ad_attribution")
      .update({ ...answer, token: null, resolved_at: new Date().toISOString() })
      .eq("install_id", installId);
    return NextResponse.json({ attribution: answer });
  }
  if (!retry) {
    await db
      .from("ad_attribution")
      .update({ attributed: false, token: null, resolved_at: new Date().toISOString() })
      .eq("install_id", installId);
    return NextResponse.json({ attribution: { attributed: false, campaign_id: null, ad_group_id: null, keyword_id: null, conversion_type: null } });
  }
  return NextResponse.json({ pending: true }, { status: 202 });
}
