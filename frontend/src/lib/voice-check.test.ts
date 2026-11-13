// Run: node --test src/lib/voice-check.test.ts
// The case is real: 이방인 1장, 2026-11-13 (대표 TG 1123). Times are what the
// transcription heard in the take before it was cut (the first three lines).
import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore -- node --test needs the .ts extension; the Next build does not read this file.
import { heardShare, letters, lineStarts, stumbles, type Word } from "./voice-check.ts";

const lines = [
  "[calm, storytelling] 알제에 사는 회사원 뫼르소한테 전보가 한 통 와. [softly, a little hushed] 양로원에 있는 엄마가 돌아가셨대.",
  "[plain, matter of fact] 카뮈의 소설 『이방인』은 이렇게 시작해. [puzzled, a little wry] 근데 뫼르소는 엄마가 정확히 언제 떠났는지도 잘 모르겠대.",
  "[wry, matter of fact] 전보가 용건만 딱 적힌 사무적인 글이라서 그렇대. [curious, leaning in] 이런 아들은 엄마 장례식에서 무슨 생각을 할까?",
];

const w = (text: string, start: number, end: number): Word => ({ text, start, end });
const words: Word[] = [
  w("알제에", 0.2, 0.46), w("사는", 0.58, 0.78), w("회사원", 0.9, 1.3), w("뫼르소한테", 1.44, 2.24), w("전보가", 2.42, 2.66),
  w("한", 2.72, 2.8), w("통", 2.9, 2.96), w("와.", 3.06, 3.14), w("양로원에", 4.06, 4.4), w("있는", 4.44, 4.6),
  w("엄마가", 4.72, 5), w("돌아가셨대.", 5.14, 5.76), w("카뮈의", 6.62, 6.9), w("소설", 7, 7.28), w("이방인은", 7.38, 7.96),
  w("이렇게", 8.02, 8.32), w("시작해.", 8.38, 8.78),
  // the stumble: read up to 「잘…」, broke off, and read the sentence again
  w("근데", 9.42, 9.86), w("뫼르소는", 9.98, 10.64), w("엄마가", 10.78, 11.02), w("정확히", 11.16, 11.46), w("언제", 11.62, 11.8),
  w("떠났는지도", 11.9, 12.68), w("잘...", 12.88, 13.04),
  w("근데", 13.68, 14.16), w("뫼르소는", 14.28, 14.92), w("엄마가", 15.06, 15.3), w("정확히", 15.44, 15.74), w("언제", 15.9, 16.08),
  w("떠났는지도", 16.18, 16.84), w("잘", 17, 17.04), w("모르겠대.", 17.16, 17.64),
  w("전보가", 18.4, 18.92), w("용건만", 19.1, 19.48), w("딱", 19.68, 19.72), w("적힌", 19.84, 20.1), w("사무적인", 20.28, 20.68),
  w("글이라서", 20.8, 21.1), w("그렇대.", 21.16, 21.48), w("이런", 22.3, 22.48), w("아들은", 22.56, 23.16), w("엄마", 23.32, 23.48),
  w("장례식에서", 23.66, 24.2), w("무슨", 24.32, 24.52), w("생각을", 24.66, 24.9), w("할까?", 25, 25.34),
];

test("letters drops tags, marks and spaces", () => {
  assert.equal(letters("[calm] 『이방인』은 이렇게, 80킬로미터!"), "이방인은이렇게킬로미터");
});

test("each line starts where its opening is heard, not where the letter timing slid to", () => {
  assert.deepEqual(lineStarts(words, lines), [0.2, 6.62, 18.4]);
});

test("the broken-off reading is found, so it can be cut out", () => {
  assert.deepEqual(stumbles(words, lines.join(" ")), [[9.42, 13.68]]);
});

test("a refrain the script says twice is not a stumble", () => {
  const twice = [w("가자", 0, 0.3), w("가자", 0.4, 0.7), w("멀리", 0.8, 1.1), w("가자", 1.2, 1.5), w("가자", 1.6, 1.9), w("멀리", 2, 2.3)];
  assert.deepEqual(stumbles(twice, "가자 가자 멀리. 가자 가자 멀리."), []);
});

test("heardShare is high for a faithful take and drops when words are missing", () => {
  assert.ok(heardShare(words, lines.join(" ")) > 0.95);
  assert.ok(heardShare(words.slice(0, 17), lines.join(" ")) < 0.6);
});
