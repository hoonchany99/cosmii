// node --test src/lib/lesson-tags.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error -- node --test needs the .ts extension; the Next build does not read this file.
import { dropRepeatedTags, sentences, taggedLine } from "./lesson-tags.ts";

const card = (text: string, voice?: unknown) => ({ kind: "beat", text, voice });

test("sentences split as the app's checker does: a quote or a spoken line is one", () => {
  assert.deepEqual(sentences("텔레마코스가 웃어. '엄마는 그렇대요. 전 모르죠.' 그리고 가."), ["텔레마코스가 웃어.", "'엄마는 그렇대요. 전 모르죠.'", "그리고 가."]);
  assert.deepEqual(sentences("아테나가 남겨. 「이제 아니야.」 그러고는 날아가."), ["아테나가 남겨.", "「이제 아니야.」", "그러고는 날아가."]);
  assert.deepEqual(sentences("왜일까? 답은 이거야!"), ["왜일까?", "답은 이거야!"]);
});

test("each sentence is read after its own tag, without the 「」 and '' marks", () => {
  const c = card("손님이 묻자 텔레마코스가 웃어. '엄마는 그렇대요. 전 모르죠.'", ["[quieter, wry]", "[bitter, half laughing]"]);
  assert.equal(taggedLine(c.text, c), "[quieter, wry] 손님이 묻자 텔레마코스가 웃어. [bitter, half laughing] 엄마는 그렇대요. 전 모르죠.");
  const q = card("아테나 말은 이래. 「이제 어린애가 아니야.」", ["[quiet]", "[slow, firm]"]);
  assert.equal(taggedLine(q.text, q), "[quiet] 아테나 말은 이래. [slow, firm] 이제 어린애가 아니야.");
});

test("a card without fitting tags goes the old way (null)", () => {
  const t = "하나야. 둘이야.";
  assert.equal(taggedLine(t, card(t)), null);
  assert.equal(taggedLine(t, card(t, "[calm]")), null);
  assert.equal(taggedLine(t, card(t, ["[calm]"])), null);
  assert.equal(taggedLine(t, card(t, ["[calm]", "sad"])), null);
  assert.equal(taggedLine(t, card(t, ["[calm]", `[${"x".repeat(39)}]`])), null);
  assert.equal(taggedLine("다른 글이야.", card(t, ["[calm]", "[sad]"])), null);
  assert.equal(taggedLine("하나야. 둘", card(t, ["[calm]", "[sad]"])), null);
  assert.equal(taggedLine(t, undefined), null);
});

test("a card's kind is never sent as a tag (October: the narrator read [hook])", () => {
  const t = "하나야. 둘이야.";
  assert.equal(taggedLine(t, card(t, ["[hook]", "[calm]"])), null);
  assert.equal(taggedLine(t, card(t, ["[ Reveal ]", "[calm]"])), null);
  assert.notEqual(taggedLine(t, card(t, ["[hooked on it, eager]", "[calm]"])), null);
});

test("a long card the app cuts into bubbles: each bubble takes its own sentences' tags", () => {
  const c = card("하나야. 둘이야. 셋이야.", ["[a]", "[b]", "[c]"]);
  assert.equal(taggedLine("하나야. 둘이야.", c), "[a] 하나야. [b] 둘이야.");
  assert.equal(taggedLine("셋이야.", c), "[c] 셋이야.");
  assert.equal(taggedLine("하나야. 둘이야. 셋이야.", c), "[a] 하나야. [b] 둘이야. [c] 셋이야.");
});

test("dropRepeatedTags: a repeat in the same take goes, the first stays (TG 1095)", () => {
  assert.equal(
    dropRepeatedTags("[warm, gentle storytelling] 저녁이면 모여. [warm, gentle storytelling] 다정해."),
    "[warm, gentle storytelling] 저녁이면 모여. 다정해.",
  );
  assert.equal(dropRepeatedTags("[a] 하나. [b] 둘. [a] 셋."), "[a] 하나. [b] 둘. [a] 셋.");
  assert.equal(dropRepeatedTags("[calm] 하나."), "[calm] 하나.");
});
