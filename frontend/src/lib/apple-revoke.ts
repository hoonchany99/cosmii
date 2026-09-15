import { createPrivateKey, sign } from "node:crypto";

// Revokes the iOS app's Sign in with Apple tokens when an account is deleted
// (App Store Review Guideline 5.1.1(v)). The app sends a fresh authorization
// code; it is exchanged for a refresh token, which is then revoked, so the
// app no longer appears under the user's Apple ID > Sign in with Apple.
//
// Needs, from Apple Developer > Keys (a key with Sign in with Apple enabled):
//   APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (the .p8 contents),
// and APPLE_CLIENT_ID, the app's bundle id (com.utopify.cosmii).
// Without them this does nothing and says so.

const b64url = (data: Buffer | string) => Buffer.from(data).toString("base64url");

function clientSecret(teamId: string, keyId: string, clientId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const payload = b64url(JSON.stringify({ iss: teamId, iat: now, exp: now + 300, aud: "https://appleid.apple.com", sub: clientId }));
  const key = createPrivateKey(privateKey.replace(/\\n/g, "\n"));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(signature)}`;
}

export async function revokeAppleTokens(authorizationCode: string): Promise<"revoked" | "not-configured" | "failed"> {
  const { APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CLIENT_ID } = process.env;
  if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY || !APPLE_CLIENT_ID) return "not-configured";
  try {
    const secret = clientSecret(APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID, APPLE_PRIVATE_KEY);
    const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        client_secret: secret,
        code: authorizationCode,
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json().catch(() => ({}))) as { refresh_token?: string; access_token?: string; error?: string };
    const token = tokens.refresh_token ?? tokens.access_token;
    if (!tokenRes.ok || !token) {
      console.error("apple revoke: token exchange", tokenRes.status, tokens.error);
      return "failed";
    }
    const revokeRes = await fetch("https://appleid.apple.com/auth/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        client_secret: secret,
        token,
        token_type_hint: tokens.refresh_token ? "refresh_token" : "access_token",
      }),
    });
    if (!revokeRes.ok) {
      console.error("apple revoke: revoke", revokeRes.status);
      return "failed";
    }
    return "revoked";
  } catch (e) {
    console.error("apple revoke:", e instanceof Error ? e.message : e);
    return "failed";
  }
}
