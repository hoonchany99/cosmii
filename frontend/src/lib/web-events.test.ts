// node --test src/lib/web-events.test.ts  (웹 공유 링크 이벤트, 마케팅 대표 2619)
import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore -- node --test needs the .ts extension; the Next build does not read this file.
import { readEvent, isBot, openedIn, toMixpanel } from "./web-events.ts";

const V = "0b6c2f3e-1d2a-4c5b-9e8f-7a6b5c4d3e2f";

test("a book page view needs its book", () => {
  assert.deepEqual(readEvent({ event: "web_book_page_viewed", page: "book", view_id: V, book_id: "c_animal_farm" }),
    { event: "web_book_page_viewed", page: "book", view_id: V, book_id: "c_animal_farm" });
  assert.equal(readEvent({ event: "web_book_page_viewed", page: "book", view_id: V }), null);
  assert.equal(readEvent({ event: "web_book_page_viewed", page: "invite", view_id: V, book_id: "x" }), null);
});

test("only our events, pages and shapes get through", () => {
  assert.equal(readEvent({ event: "page_viewed", page: "book", view_id: V }), null);
  assert.equal(readEvent({ event: "web_store_clicked", page: "home", view_id: V }), null);
  assert.equal(readEvent({ event: "web_store_clicked", page: "invite", view_id: "short" }), null);
  assert.equal(readEvent({ event: "web_store_clicked", page: "book", view_id: V, book_id: "../../x" }), null);
  assert.equal(readEvent([{ event: "web_store_clicked" }]), null);
  assert.equal(readEvent(null), null);
  assert.equal(readEvent("web_store_clicked"), null);
});

test("an invitation code is never carried, even if sent", () => {
  const e = readEvent({ event: "web_invite_page_viewed", page: "invite", view_id: V, code: "ABC123" });
  assert.ok(e);
  assert.equal(JSON.stringify(toMixpanel(e, "Mozilla/5.0", "tok", 1)).includes("ABC123"), false);
  assert.equal(readEvent({ event: "web_invite_code_copied", page: "book", view_id: V }), null);
  assert.equal(readEvent({ event: "web_store_clicked", page: "invite", view_id: V, book_id: "x" }), null);
});

test("link previews and scripts are bots; phones are not", () => {
  for (const ua of ["", "facebookexternalhit/1.1", "Mozilla/5.0 (compatible; kakaotalk-scrap/1.0)", "TelegramBot (like TwitterBot)", "curl/8.0", "Mozilla/5.0 (compatible; Googlebot/2.1)"]) {
    assert.equal(isBot(ua), true, ua);
  }
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.0";
  assert.equal(isBot(iphone), false);
  assert.equal(openedIn(iphone), "kakaotalk");
  assert.equal(openedIn("Mozilla/5.0 (iPhone) Instagram 300.0"), "instagram");
  assert.equal(openedIn("Mozilla/5.0 (iPhone) Version/18.0 Mobile Safari/604.1"), "browser");
});

test("what Mixpanel gets: web, the page, no IP-derived fields", () => {
  const e = readEvent({ event: "web_store_clicked", page: "book", view_id: V, book_id: "c_animal_farm" });
  assert.ok(e);
  const m = toMixpanel(e, "Mozilla/5.0 (iPhone) Mobile Safari", "tok", 1700000000);
  assert.equal(m.event, "web_store_clicked");
  assert.equal(m.properties.platform, "web");
  assert.equal(m.properties.distinct_id, `web-${V}`);
  assert.equal(m.properties.book_id, "c_animal_farm");
  assert.equal("ip" in m.properties, false);
  assert.equal("has_code" in m.properties, false);
});
