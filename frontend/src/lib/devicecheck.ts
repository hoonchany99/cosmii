import { createPrivateKey, randomUUID, sign } from "node:crypto";

// Apple DeviceCheck: two bits Apple keeps per phone for this developer, which
// survive the app being deleted and the phone being erased. Cosmii uses bit0
// for "this phone has been invited" (대표 6693), so a second account on the
// same phone can't be invited again.
//
// Needs, from Apple Developer > Keys (a key with DeviceCheck enabled):
//   APPLE_TEAM_ID, DEVICECHECK_KEY_ID, DEVICECHECK_PRIVATE_KEY (the .p8 contents).
// Without them every answer is "unavailable" and the server falls back to its
// own record of phones (invite_redemptions.device_hash), which a reinstall
// can get around.

const PROD = "https://api.devicecheck.apple.com/v1";
const DEV = "https://api.development.devicecheck.apple.com/v1";

const b64url = (data: Buffer | string) => Buffer.from(data).toString("base64url");

function jwt(teamId: string, keyId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const payload = b64url(JSON.stringify({ iss: teamId, iat: now }));
  const key = createPrivateKey(privateKey.replace(/\\n/g, "\n"));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(signature)}`;
}

function config() {
  const { APPLE_TEAM_ID, DEVICECHECK_KEY_ID, DEVICECHECK_PRIVATE_KEY } = process.env;
  if (!APPLE_TEAM_ID || !DEVICECHECK_KEY_ID || !DEVICECHECK_PRIVATE_KEY) return null;
  return { teamId: APPLE_TEAM_ID, keyId: DEVICECHECK_KEY_ID, privateKey: DEVICECHECK_PRIVATE_KEY };
}

async function call(path: string, deviceToken: string, development: boolean, extra: Record<string, unknown> = {}) {
  const c = config();
  if (!c) return null;
  return fetch(`${development ? DEV : PROD}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt(c.teamId, c.keyId, c.privateKey)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ device_token: deviceToken, transaction_id: randomUUID(), timestamp: Date.now(), ...extra }),
    cache: "no-store",
  });
}

export type DeviceAnswer = "invited" | "fresh" | "unavailable";

/** Whether this phone has been invited before, as far as Apple knows. */
export async function phoneInvited(deviceToken: string, development = false): Promise<DeviceAnswer> {
  try {
    const res = await call("query_two_bits", deviceToken, development);
    if (!res) return "unavailable";
    if (!res.ok) {
      console.warn("devicecheck query", res.status);
      return "unavailable";
    }
    const text = await res.text();
    // Apple answers 200 with this text, not JSON, for a phone never marked.
    if (/failed to find bit state/i.test(text)) return "fresh";
    const body = JSON.parse(text) as { bit0?: boolean };
    return body.bit0 ? "invited" : "fresh";
  } catch (e) {
    console.warn("devicecheck query failed", e instanceof Error ? e.message : e);
    return "unavailable";
  }
}

/** Marks this phone as invited. True when Apple took it. */
export async function markPhoneInvited(deviceToken: string, development = false): Promise<boolean> {
  try {
    const res = await call("update_two_bits", deviceToken, development, { bit0: true, bit1: false });
    if (!res) return false;
    if (!res.ok) console.warn("devicecheck update", res.status);
    return res.ok;
  } catch (e) {
    console.warn("devicecheck update failed", e instanceof Error ? e.message : e);
    return false;
  }
}

export const deviceCheckConfigured = () => config() !== null;
