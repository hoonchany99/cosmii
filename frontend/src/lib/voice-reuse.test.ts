// Run: node --test src/lib/voice-reuse.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore -- node --test needs the .ts extension; the Next build does not read this file.
import { reusePlan, runs, worthReusing, type Latest } from "./voice-reuse.ts";

const before = ["가", "나", "다", "라", "마"];

test("one changed card is the only line voiced", () => {
  const plan = reusePlan(before, ["가", "나", "다!", "라", "마"]);
  assert.deepEqual(plan, [0, 1, null, 3, 4]);
  assert.deepEqual(runs(plan), [[2, 3]]);
});

test("an added and a removed card", () => {
  assert.deepEqual(reusePlan(before, ["가", "새", "나", "라", "마"]), [0, null, 1, 3, 4]);
});

test("a card that moved is voiced again, not reused out of place", () => {
  assert.deepEqual(reusePlan(before, ["가", "라", "나", "다", "마"]), [0, 3, null, null, 4]);
});

test("consecutive changes are voiced as one run", () => {
  assert.deepEqual(runs([0, null, null, 3, null]), [[1, 3], [4, 5]]);
});

const latest: Latest = { key: "k", model: "eleven_v3", direction: "L1", lines: before, directed: before, urls: before.map((l) => `u/${l}`) };

test("reuse only with the same model and direction, and half the lines kept", () => {
  const plan = reusePlan(before, ["가", "나", "다!", "라", "마"]);
  assert.equal(worthReusing(latest, "eleven_v3", "L1", plan), true);
  assert.equal(worthReusing(latest, "eleven_v4", "L1", plan), false);
  assert.equal(worthReusing(latest, "eleven_v3", "L2", plan), false);
  assert.equal(worthReusing(null, "eleven_v3", "L1", plan), false);
  assert.equal(worthReusing(latest, "eleven_v3", "L1", reusePlan(before, ["1", "2", "3", "라", "마"])), false);
});
