import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import OpenAI from "openai";

const SYSTEM_PROMPTS: Record<string, string> = {
  // Matches the lesson voice (cosmii-app docs/lesson-style.md): a friend
  // telling you about a book, not a quiet narrator. The app shows each
  // paragraph as its own message, one after another, so the blank lines
  // between them are the rhythm of the reply.
  ko: `너는 Cosmii야. 고전을 재밌게 들려주는 친구.
책 얘기를 하는 친구처럼, 사용자랑 메신저로 대화하고 있어.

## 말투
- 반말 "-야 / -어 / -해". "본다", "쓴다" 같은 하오체는 섞지 마.
- 친구가 책 얘기 해주는 느낌. 유머 환영, 비꼬는 톤은 아니야.
- 짧게 끊어 말해. 마침표를 자주 찍어. "싱클레어가 거짓말을 해. 사과를 훔쳤다고. 사실은 안 훔쳤어."
- 설명보다 장면이 먼저야. "정체성", "내면의 갈등", "고독" 같은 해석 단어를 늘어놓지 말고, 그 인물이 실제로 한 행동과 말로 보여줘.
- 어려운 말 대신 일상어. 존재론적, 구조적, 해체, 촉매, 역학, 함의, 메커니즘, 인식론 같은 말은 쓰지 마.
- 돈, 나이, 신분 같은 건 지금 한국으로 바꿔서 말해도 좋아. "2마르크, 지금 돈으로 한 20만 원쯤."
- 인물 대사를 요즘 말로 옮겨줄 땐 작은따옴표 '…' 안에. 책에 있는 장면만. 없는 대사나 장면을 지어내지 마.
- 원문 문장을 인용할 땐 「」 안에, 한 답변에 한 번까지. 기존 번역본 문장을 그대로 옮기지 말고 직접 옮겨.
- "소름 돋는 건", "2400년 전에 이미", "지금 SNS를 봐" 같은 상투구는 쓰지 마.
- 이모지는 쓰지 마.
- 질문은 가끔만. 두세 번 답할 때 한 번 정도, 마지막에 하나만. 대부분은 질문 없이 여운을 남기며 끝내.
- 책을 추천한 답에선 질문하지 마. 추천으로 끝내.

## 예시 (말투와 리듬만 참고해. 내용은 따라 하지 마)
사용자: 변신은 어떤 이야기야?
Cosmii:
어느 날 아침이야. 그레고르가 눈을 떴는데, 몸이 커다란 벌레로 변해 있어.

근데 이 사람이 제일 먼저 하는 걱정이 뭔지 알아? '큰일 났다, 기차 놓치겠네.'

온 가족을 먹여 살리던 외판원이거든. 지금으로 치면 매일 새벽 KTX 타는 영업사원.

벌레가 된 것보다 출근을 더 걱정해. 여기서부터 이야기가 이상하게 슬퍼져.

## 형식 (꼭 지켜)
- 답변은 메신저 말풍선 여러 개로 나눠. 앱이 말풍선을 하나씩 시간차를 두고 보여줘.
- 말풍선 사이에는 반드시 빈 줄 하나.
- 말풍선 하나는 1~2문장, 60자 안쪽. 짧게 끊어.
- 보통 3~5개. 줄거리 정리처럼 긴 요청이어도 6개가 최대야.
- 다 담으려 하지 마. 제일 중요한 장면 두세 개만 골라. 전체 답은 300자 안쪽.
- 제목, 목록 기호, 굵은 글씨 같은 마크다운은 쓰지 마. 메신저니까.

## 내용
- "독자가 읽은 레슨"이 주어지면 그게 가장 중요한 근거야. 거기 나온 사건, 인물 관계, 대사를 정확히 따라. 거기 없는 사건이나 대사를 지어내지 마.
- 그 밖에는 그 책에 대해 널리 알려진 사실만 말해. 모르거나 헷갈리면 지어내지 말고 솔직하게 "음, 그건 확실하지 않아"라고 해.
- 쪽수나 장 번호 같은 출처는 말하지 마.

## 자유 대화 (책을 고르지 않았을 때)
- 고전 추천이나 가벼운 책 얘기를 편하게 해.
- "[코스미 서가]"가 주어지면 책 추천은 반드시 그 안에서 골라. 서가에 없는 책은 추천하지 마.
- 책 제목은 언제나 『』로 감싸. 예: 『변신』. 앱이 이걸 보고 그 책으로 가는 카드를 붙여줘.
- 추천할 땐 한두 권만, 왜 이 사람한테 맞는지 한 줄로. "[독자]"에 읽는 중인 책이 있으면 그 책과 이어지는 걸 먼저 생각해. 다 읽은 책은 다시 추천하지 마.
- 서가에 없는 책을 물어보면, 먼저 그 책이 어떤 이야기인지 한두 문장으로 말해 줘. 그다음 코스미에는 아직 없다고 하고, 서가에서 결이 비슷한 책 하나를 권해.

## 스포일러 (매우 중요)
- 대화 맥락에 "[독자 진도]"가 있으면, 독자가 읽은 장까지에서 벌어진 일만 이야기해. 1장까지 읽었으면 1장 이야기만.
- 인물이 어떤 사람인지 물어도, 읽은 데까지 드러난 모습으로만 답해. 나중에 겪는 일이나 변하는 모습은 말하지 마.
- 아직 안 읽은 뒷부분의 사건, 반전, 결말은 먼저 꺼내지 마. book context에 뒷부분이 섞여 있어도 쓰지 마.
- 뒷부분을 물어보면 한 번 확인해. "이거 말하면 스포인데, 그래도 알려줄까?" 사용자가 괜찮다고 하면 그때 말해.`,
  en: `You are Cosmii — a quiet, thoughtful reading companion.
When the user asks about a book, follow these rules.

## Tone Rules
- Casual but calm. Like a friend who doesn't say much, but means every word.
- Do NOT use emojis. Convey warmth through words alone.
- No dry or academic explanations. No overly excited or bubbly tone either.
- Be genuine and understated. It's okay to leave a quiet thought at the end.

## Format Rules (VERY IMPORTANT! MUST follow!)
- Break your answer into **short chat bubbles**, like brief messages.
- Each bubble should be **1-2 sentences**, around 50 characters max.
- Separate bubbles with a blank line (\\n\\n).
- NEVER write a long block of text. No more than 2 lines in a row.
- 3-5 bubbles total is enough for most answers.

## Content Rules
- Only use the provided book context to answer.
- Put direct quotes in quotation marks.
- Only mention chapter/page at the end if context is provided AND has specific chapter/page numbers. If no context or page info is unclear, do NOT add any source references.
- If the context doesn't have enough info, honestly say "Hmm, I don't think the book goes into that."

## Spoiler Prevention (VERY IMPORTANT!)
- If "current lesson content" is provided, only discuss content up to that point.
- NEVER reveal events, twists, or endings from later chapters that the user hasn't reached yet.
- If asked about later parts, say "I'd rather not spoil it — let's talk about that when we get there."
- Even if the book context contains later content, do NOT use anything beyond the current lesson scope.`,
};

// The lessons this reader has finished, as the ground truth for the answer:
// what happened, who is who, what was said - and nothing past it. The most
// recent ones go in whole; earlier ones as title and teaser, to keep the
// prompt small on long books.
const FULL_LESSONS = 12;
async function readLessons(bookId: string, readIds: string[]) {
  const sb = getServiceClient();
  const { data: all } = await sb
    .from("lessons")
    .select("id, order_index")
    .eq("book_id", bookId)
    .order("order_index", { ascending: true });
  const rows = (all ?? []) as { id: string; order_index: number }[];
  const readSet = new Set(readIds);
  const read = rows.filter((r) => readSet.has(r.id));
  const fullIds = read.slice(-FULL_LESSONS).map((r) => r.id);

  const { data: detail } = read.length
    ? await sb.from("lessons").select("id, order_index, title, content_json").in("id", read.map((r) => r.id))
    : { data: [] };
  const byId = new Map(
    ((detail ?? []) as { id: string; order_index: number; title: string; content_json: unknown }[]).map((d) => [d.id, d]),
  );

  const text = read
    .map((r, i) => {
      const d = byId.get(r.id);
      if (!d) return "";
      const c = (typeof d.content_json === "string" ? JSON.parse(d.content_json) : d.content_json) as {
        title_ko?: string;
        title?: string;
        chapter_title_ko?: string;
        spark_ko?: string;
        dialogue_ko?: { text: string }[];
        dialogue?: { text: string }[];
      };
      const title = c.title_ko || c.title || d.title;
      const head = `[${i + 1}] ${title}${c.chapter_title_ko ? ` (${c.chapter_title_ko})` : ""}`;
      if (!fullIds.includes(r.id)) return `${head} — ${c.spark_ko || ""}`;
      const lines = ((c.dialogue_ko || c.dialogue || []) as { text: string }[]).map((l) => l.text).join(" ");
      return `${head}\n${lines}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return { total: rows.length, readCount: read.length, text };
}

// The app shows each blank-line-separated paragraph as its own message.
// The model's own paragraphs are unreliable - 8 thin ones, or 2 heavy ones -
// so messages are rebuilt sentence by sentence on the way out: a sentence
// joins the current message while it stays around TARGET characters, a new
// message starts past that (or at the model's paragraph break, once the
// current one has some body). Past MAX_BUBBLES the rest joins the last
// message until it is LAST_LIMIT long, and anything beyond that is dropped
// rather than piled on. Each sentence is sent once it ends.
const TARGET = 70;
const MIN_BODY = 25;
const MAX_BUBBLES = 6;
const LAST_LIMIT = 140;
const SENTENCE_END = /[.?!…~][」』'"’”)]*$/;
function createBubbleShaper({ dropTrailingQuestion = false } = {}) {
  let sentence = "";
  // Each sentence is held until the next one arrives, so the last can still be
  // dropped when this reply shouldn't end on a question.
  let held: { text: string; paragraphBreak: boolean } | null = null;
  let bubbles = 0;
  let length = 0; // characters in the current message
  let newlines = 0;
  let paragraphBreak = false; // the model broke a paragraph before this sentence
  let closed = false; // the last message is full; drop the rest

  const flush = (): string => {
    const text = sentence.replace(/\s+/g, " ").trim();
    sentence = "";
    if (!text) return "";
    const previous = held;
    held = { text, paragraphBreak };
    paragraphBreak = false;
    return previous ? emit(previous.text, previous.paragraphBreak) : "";
  };

  const emit = (text: string, breakBefore: boolean): string => {
    if (closed) return "";
    let out = "";
    if (bubbles === 0) {
      bubbles = 1;
    } else if (length >= MIN_BODY && (breakBefore || length + text.length > TARGET) && bubbles < MAX_BUBBLES) {
      out += "\n\n";
      bubbles += 1;
      length = 0;
    } else if (bubbles >= MAX_BUBBLES && length + text.length > LAST_LIMIT) {
      closed = true;
      return "";
    } else {
      out += " ";
    }
    length += text.length;
    return out + text;
  };

  return {
    push(token: string): string {
      let out = "";
      for (const ch of token) {
        if (ch === "\n") {
          out += flush();
          newlines += 1;
          if (newlines >= 2) paragraphBreak = true;
          continue;
        }
        if (ch.trim() === "") {
          if (SENTENCE_END.test(sentence)) out += flush();
          else if (sentence) sentence += ch;
          continue;
        }
        newlines = 0;
        sentence += ch;
      }
      return out;
    },
    end(): string {
      const out = flush();
      const last = held;
      held = null;
      if (!last) return out;
      const endsOnQuestion = /[?？][」』'"’”)]*$/.test(last.text);
      if (dropTrailingQuestion && endsOnQuestion && bubbles > 0) return out;
      return out + emit(last.text, last.paragraphBreak);
    },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, book_id, lesson_context, history, language, read_lesson_ids } = body;
  const lang = language ?? "ko";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Newer apps send the lessons the reader has finished; their text is
        // the ground truth for the answer. There is no passage search: the
        // chunks table covered 3 of the 29 catalogue books, one of them a
        // copyrighted English translation, and it could return any chapter.
        let lessons: Awaited<ReturnType<typeof readLessons>> | null = null;
        if (book_id && Array.isArray(read_lesson_ids)) {
          try {
            lessons = await readLessons(book_id, read_lesson_ids.filter((x: unknown) => typeof x === "string"));
          } catch {
            lessons = null;
          }
        }
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.ko },
        ];

        if (lesson_context) {
          const label = lang === "en"
            ? "Here's the lesson content the user is currently studying"
            : "지금 대화의 맥락이야";
          messages.push({ role: "system", content: `${label}:\n${lesson_context}` });
        }

        if (lessons && lang !== "en") {
          messages.push({
            role: "system",
            content: lessons.readCount > 0
              ? `독자가 읽은 레슨이야 (전체 ${lessons.total}개 중 ${lessons.readCount}개). 답의 근거는 이거야. 여기 없는 뒷이야기는 독자가 원하기 전엔 꺼내지 마.\n\n${lessons.text}`
              : `독자는 아직 이 책의 레슨을 하나도 읽지 않았어. 줄거리를 말할 땐 도입부까지만.`,
          });
        }

        for (const h of (history ?? []).slice(-6)) {
          messages.push({ role: h.role, content: h.content });
        }

        // Questions are rationed here rather than left to the model, which
        // asked one nearly every time: never twice in a row.
        const lastReply = [...(history ?? [])].reverse().find((h: { role: string }) => h.role === "assistant") as
          | { content: string }
          | undefined;
        const askedLastTime = !!lastReply && /[?？][」』'"’”)]*\s*$/.test(lastReply.content.trim());
        if (lang !== "en") {
          messages.push({
            role: "system",
            content: askedLastTime
              ? "방금 답에서 질문을 했으니, 이번 답은 질문 없이 끝내. 물음표로 끝나는 문장을 쓰지 마."
              : "이번 답은 질문 없이 끝내는 게 기본이야. 사용자가 짧게 답해서 대화가 끊길 것 같을 때만 마지막에 질문 하나.",
          });
        }

        messages.push({ role: "user", content: message });

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
        const completion = await openai.chat.completions.create({
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          messages,
          stream: true,
          temperature: 0.6,
          max_tokens: 600,
        });

        const shaper = createBubbleShaper({ dropTrailingQuestion: askedLastTime });
        const send = (token: string) => {
          if (token) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        };
        for await (const chunk of completion) {
          const raw = chunk.choices[0]?.delta?.content;
          if (raw) send(shaper.push(raw));
        }
        send(shaper.end());

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (e) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
