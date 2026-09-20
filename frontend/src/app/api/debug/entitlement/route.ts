// Temporary: says whether the server can ask RevenueCat about a reader, and
// what RevenueCat answers. No key or customer data is returned - only whether
// a key is set and the status code that came back. Delete once the setting is
// confirmed.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.REVENUECAT_SECRET_KEY;
  const id = req.nextUrl.searchParams.get("id") ?? "debug-reader";
  if (!key) return NextResponse.json({ hasKey: false });

  const shape = key.startsWith("sk_") ? "sk_ (v2 style)" : "legacy";
  let v1: number | string = "not tried";
  let v2: number | string = "not tried";
  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    v1 = res.status;
  } catch (e) {
    v1 = `error: ${(e as Error).message}`;
  }
  const project = process.env.REVENUECAT_PROJECT_ID;
  if (project) {
    try {
      const res = await fetch(
        `https://api.revenuecat.com/v2/projects/${encodeURIComponent(project)}/customers/${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" },
      );
      v2 = res.status;
    } catch (e) {
      v2 = `error: ${(e as Error).message}`;
    }
  } else {
    v2 = "no REVENUECAT_PROJECT_ID";
  }
  return NextResponse.json({ hasKey: true, shape, v1, v2 });
}
