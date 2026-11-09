// The rules of invitations, apart from the database and the network so they
// can be tested on their own (invite-rules.test.ts). The routes in
// src/app/api/invite/* read what these need, ask, and write what they say.
//
// 대표 6680·6693 (2026-11-10): one-day coupons for both sides the moment a
// code is entered, at most 10 coupons a reader, both signed in, and one phone
// can be invited once (DeviceCheck). Design: team desmond/cosmii-invite-design.md.

export type InviteConfig = {
  cap: number;
  daily_max: number;
  new_account_days: number;
  coupon_days: number;
  valid_days: number;
  /** friends reached -> extra days for the inviter */
  milestones: Record<string, number>;
};

export const DEFAULT_CONFIG: InviteConfig = {
  cap: 10,
  daily_max: 5,
  new_account_days: 7,
  coupon_days: 1,
  valid_days: 30,
  milestones: { "3": 3, "5": 7 },
};

/** The stored row merged over the defaults; a bad value keeps the default. */
export function readConfig(raw: unknown): InviteConfig {
  const v = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const n = (k: keyof InviteConfig) => {
    const x = v[k];
    return typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.floor(x) : (DEFAULT_CONFIG[k] as number);
  };
  const m = v.milestones && typeof v.milestones === "object" ? (v.milestones as Record<string, unknown>) : null;
  const milestones: Record<string, number> = {};
  for (const [k, d] of Object.entries(m ?? DEFAULT_CONFIG.milestones)) {
    if (/^\d+$/.test(k) && typeof d === "number" && d > 0) milestones[k] = Math.floor(d);
  }
  return {
    cap: n("cap"),
    daily_max: n("daily_max"),
    new_account_days: n("new_account_days"),
    coupon_days: Math.max(1, n("coupon_days")),
    valid_days: Math.max(1, n("valid_days")),
    milestones,
  };
}

// Six letters and digits a person can read aloud and type without mixing up:
// no 0/O, 1/I/L.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 6;

/** A new code from six random numbers (0..1). */
export function makeCode(random: () => number): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length) % ALPHABET.length];
  return out;
}

/** What a person typed, as a code: case, spaces and dashes don't matter. Null if it can't be one. */
export function normalizeCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const c = input.toUpperCase().replace(/[\s-]/g, "");
  if (c.length !== CODE_LENGTH) return null;
  for (const ch of c) if (!ALPHABET.includes(ch)) return null;
  return c;
}

export type RedeemRefusal =
  | "not_found" // no such code
  | "self" // one's own code, or the inviter's own phone
  | "already" // this account was invited before
  | "too_old" // the account is older than new_account_days
  | "device_used"; // this phone was invited before, under any account

export type RedeemInput = {
  now: number;
  config: InviteConfig;
  inviteeId: string;
  inviteeCreatedAt: number;
  inviteeAlreadyRedeemed: boolean;
  /** DeviceCheck said this phone was invited before, or a redemption has its hash. */
  deviceUsed: boolean;
  /** The phone is one the inviter entered a code from, or was invited on. */
  inviterDevice: boolean;
  inviter: {
    id: string;
    /** Coupons the inviter has been given in all, revoked ones not counted. */
    couponsGiven: number;
    /** Friends the inviter was rewarded for in the last 24 hours. */
    rewardedToday: number;
    /** Friends who entered the inviter's code before this one. */
    friendsBefore: number;
  } | null;
};

export type Grant = { days: number; source: "invite" | "milestone" };

export type RedeemDecision =
  | { ok: false; reason: RedeemRefusal }
  | { ok: true; invitee: Grant[]; inviter: Grant[]; friendsAfter: number };

const DAY = 24 * 60 * 60 * 1000;

export function decideRedeem(i: RedeemInput): RedeemDecision {
  if (!i.inviter) return { ok: false, reason: "not_found" };
  if (i.inviter.id === i.inviteeId || i.inviterDevice) return { ok: false, reason: "self" };
  if (i.inviteeAlreadyRedeemed) return { ok: false, reason: "already" };
  if (i.now - i.inviteeCreatedAt > i.config.new_account_days * DAY) return { ok: false, reason: "too_old" };
  if (i.deviceUsed) return { ok: false, reason: "device_used" };

  const friendsAfter = i.inviter.friendsBefore + 1;
  const invitee: Grant[] = [{ days: i.config.coupon_days, source: "invite" }];

  // The inviter is rewarded within the day's limit and the cap; past either,
  // the friend still counts but nothing more is given.
  const inviter: Grant[] = [];
  let room = Math.max(0, i.config.cap - i.inviter.couponsGiven);
  if (i.inviter.rewardedToday < i.config.daily_max && room > 0) {
    inviter.push({ days: i.config.coupon_days, source: "invite" });
    room--;
    const extra = i.config.milestones[String(friendsAfter)];
    if (extra && room > 0) inviter.push({ days: extra, source: "milestone" });
  }
  return { ok: true, invitee, inviter, friendsAfter };
}

export type CouponRow = { status: string; expires_at: string; days: number };

export type UseRefusal = "used" | "revoked" | "expired" | "premium";

/** Whether a coupon can be used now. A subscriber is told to keep it for later. */
export function decideUse(c: CouponRow, now: number, alreadyPremium: boolean): { ok: true } | { ok: false; reason: UseRefusal } {
  if (c.status === "used") return { ok: false, reason: "used" };
  if (c.status === "revoked") return { ok: false, reason: "revoked" };
  if (Date.parse(c.expires_at) <= now) return { ok: false, reason: "expired" };
  if (alreadyPremium) return { ok: false, reason: "premium" };
  return { ok: true };
}

/** A phone's DeviceCheck token or install id, never stored as it is. */
export function deviceHash(raw: string, salt: string): Promise<string> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(`${salt}:${raw}`))
    .then((b) => Buffer.from(b).toString("hex").slice(0, 32));
}
