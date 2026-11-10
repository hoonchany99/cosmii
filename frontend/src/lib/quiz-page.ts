// The personality quiz (Marissa v27, 대표 마케팅 방 2416): one HTML page from
// public/quiz/app.html, served with its head filled in here. A link preview is
// read by a crawler that runs no script, so each result's address has to carry
// its own title and picture in the HTML itself.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const QUIZ_TITLE = "나는 고전 속 누구와 닮았을까?";

export const QUIZ_RESULTS: Record<string, { name: string; book: string; line: string }> = {
  elizabeth: { name: "엘리자베스", book: "오만과 편견", line: "싫은 건 싫다고 말하는 사람" },
  odysseus: { name: "오디세우스", book: "오디세이아", line: "위기에서 머리가 먼저 도는 사람" },
  hamlet: { name: "햄릿", book: "햄릿", line: "한 번 더 생각하고 움직이는 사람" },
  faust: { name: "파우스트", book: "파우스트 1부", line: "다 알아도 더 궁금한 사람" },
  dante: { name: "단테", book: "신곡", line: "길을 잃어도 일단 걷는 사람" },
  gregor: { name: "그레고르 잠자", book: "변신", line: "말없이 책임지는 사람" },
  achilles: { name: "아킬레우스", book: "일리아스", line: "자존심이 먼저 반응하는 사람" },
  hector: { name: "헥토르", book: "일리아스", line: "가까운 사람부터 챙기는 사람" },
  cordelia: { name: "코딜리아", book: "리어 왕", line: "듣기 좋은 말보다 진심을 말하는 사람" },
  penelope: { name: "페넬로페", book: "오디세이아", line: "서두르지 않고 수를 두는 사람" },
  epictetus: { name: "에픽테토스", book: "엥케이리디온", line: "스스로 정할 수 있는 것만 붙드는 사람" },
  marcus: { name: "마르쿠스 아우렐리우스", book: "명상록", line: "아침마다 마음부터 정리하는 사람" },
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The <head> lines for the start page (slug null) or one result. */
export function quizHead(origin: string, slug: string | null): string {
  const r = slug ? QUIZ_RESULTS[slug] : null;
  const title = r ? `${r.name} — 『${r.book}』 속 인물` : QUIZ_TITLE;
  const url = `${origin}/quiz${r ? `/r/${slug}` : ""}`;
  const lines = [
    `<title>${esc(r ? `${title} · ${QUIZ_TITLE}` : QUIZ_TITLE)}</title>`,
    `<meta property="og:site_name" content="${esc(QUIZ_TITLE)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
  ];
  if (r) {
    const image = `${origin}/quiz/og/${slug}.png`;
    lines.push(
      `<meta property="og:description" content="${esc(r.line)}">`,
      `<meta name="description" content="${esc(r.line)}">`,
      `<meta property="og:image" content="${esc(image)}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:image" content="${esc(image)}">`,
      // The page opens straight on this result; the quiz's own table has the rest.
      `<script>window.__QUIZ_RESULT__=${JSON.stringify(r.name)}</script>`,
    );
  }
  return lines.join("\n");
}

export async function quizResponse(origin: string, slug: string | null): Promise<Response> {
  const html = await readFile(join(process.cwd(), "public", "quiz", "app.html"), "utf8");
  return new Response(html.replace("<!--HEAD-->", quizHead(origin, slug)), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
