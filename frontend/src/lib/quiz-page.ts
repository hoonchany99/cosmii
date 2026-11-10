// The personality quiz (Marissa v27, 대표 마케팅 방 2416): one HTML page from
// public/quiz/app.html, served with its head filled in here. A link preview is
// read by a crawler that runs no script, so each result's address has to carry
// its own title and picture in the HTML itself.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { QUIZ_RESULTS } from "./quiz-results";

export { QUIZ_RESULTS };

export const QUIZ_TITLE = "나는 고전 속 누구와 닮았을까?";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The <head> lines for the start page (slug null) or one result. */
export function quizHead(origin: string, slug: string | null): string {
  const r = slug ? QUIZ_RESULTS[slug] : null;
  const title = r ? r.title : QUIZ_TITLE;
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
