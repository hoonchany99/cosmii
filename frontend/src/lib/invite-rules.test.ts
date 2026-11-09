// node --test src/lib/invite-rules.test.ts  (대표 6680·6693 초대 규칙)
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONFIG, decideRedeem, decideUse, makeCode, normalizeCode, readConfig, type RedeemInput } from "./invite-rules.ts";

const NOW = Date.parse("2026-11-10T12:00:00Z");
const base = (over: Partial<RedeemInput> = {}): RedeemInput => ({
  now: NOW,
  config: DEFAULT_CONFIG,
  inviteeId: "b",
  inviteeCreatedAt: NOW - 60_000,
  inviteeAlreadyRedeemed: false,
  deviceUsed: false,
  inviterDevice: false,
  inviter: { id: "a", couponsGiven: 0, rewardedToday: 0, friendsBefore: 0 },
  ...over,
});

test("codes are six readable characters, typed any way", () => {
  const c = makeCode(() => 0.5);
  assert.equal(c.length, 6);
  assert.equal(normalizeCode(" ab-c d2 "), null); // five characters
  assert.equal(normalizeCode("abc-d2e"), "ABCD2E");
  assert.equal(normalizeCode("ABCD0E"), null); // 0 is not used
  assert.equal(normalizeCode(42), null);
});

test("config: bad values keep the defaults", () => {
  assert.deepEqual(readConfig(null), DEFAULT_CONFIG);
  const c = readConfig({ cap: 12, daily_max: -1, milestones: { "3": 3, x: 9 } });
  assert.equal(c.cap, 12);
  assert.equal(c.daily_max, 5);
  assert.deepEqual(c.milestones, { "3": 3 });
});

test("both sides get a coupon at once", () => {
  const d = decideRedeem(base());
  assert.deepEqual(d, { ok: true, invitee: [{ days: 1, source: "invite" }], inviter: [{ days: 1, source: "invite" }], friendsAfter: 1 });
});

test("refusals: no code, oneself, twice, old account, used phone", () => {
  assert.deepEqual(decideRedeem(base({ inviter: null })), { ok: false, reason: "not_found" });
  assert.deepEqual(decideRedeem(base({ inviteeId: "a" })), { ok: false, reason: "self" });
  assert.deepEqual(decideRedeem(base({ inviterDevice: true })), { ok: false, reason: "self" });
  assert.deepEqual(decideRedeem(base({ inviteeAlreadyRedeemed: true })), { ok: false, reason: "already" });
  assert.deepEqual(decideRedeem(base({ inviteeCreatedAt: NOW - 8 * 86_400_000 })), { ok: false, reason: "too_old" });
  assert.deepEqual(decideRedeem(base({ deviceUsed: true })), { ok: false, reason: "device_used" });
});

test("the third friend brings the inviter three extra days", () => {
  const d = decideRedeem(base({ inviter: { id: "a", couponsGiven: 2, rewardedToday: 2, friendsBefore: 2 } }));
  assert.ok(d.ok);
  assert.deepEqual(d.inviter, [{ days: 1, source: "invite" }, { days: 3, source: "milestone" }]);
});

test("at the cap or the day's limit the friend counts but the inviter gets nothing", () => {
  const capped = decideRedeem(base({ inviter: { id: "a", couponsGiven: 10, rewardedToday: 0, friendsBefore: 9 } }));
  assert.ok(capped.ok);
  assert.deepEqual(capped.inviter, []);
  assert.equal(capped.friendsAfter, 10);
  assert.deepEqual(capped.invitee.length, 1);
  const busy = decideRedeem(base({ inviter: { id: "a", couponsGiven: 3, rewardedToday: 5, friendsBefore: 5 } }));
  assert.ok(busy.ok);
  assert.deepEqual(busy.inviter, []);
});

test("one coupon short of the cap: the friend's coupon, not the milestone", () => {
  const d = decideRedeem(base({ inviter: { id: "a", couponsGiven: 9, rewardedToday: 0, friendsBefore: 4 } }));
  assert.ok(d.ok);
  assert.deepEqual(d.inviter, [{ days: 1, source: "invite" }]);
});

test("a coupon is used once, before it expires, and not on top of a subscription", () => {
  const c = { status: "unused", expires_at: "2026-12-01T00:00:00Z", days: 1 };
  assert.deepEqual(decideUse(c, NOW, false), { ok: true });
  assert.deepEqual(decideUse({ ...c, status: "used" }, NOW, false), { ok: false, reason: "used" });
  assert.deepEqual(decideUse({ ...c, status: "revoked" }, NOW, false), { ok: false, reason: "revoked" });
  assert.deepEqual(decideUse({ ...c, expires_at: "2026-11-01T00:00:00Z" }, NOW, false), { ok: false, reason: "expired" });
  assert.deepEqual(decideUse(c, NOW, true), { ok: false, reason: "premium" });
});
