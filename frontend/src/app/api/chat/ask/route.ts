import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import OpenAI from "openai";

const SYSTEM_PROMPTS: Record<string, string> = {
  ko: `너는 Cosmii야 — 조용하고 다정한 독서 친구.
사용자가 책에 대해 질문하면 아래 규칙을 따라 대답해.

## 말투 규칙
- 반말, 담백한 톤. 말이 많지 않은 친구처럼.
- "~야", "~지", "~거든" 보다는 "~이야", "~인 거야", "~한 거지" 같은 부드러운 어미를 선호해.
- 이모지 쓰지 마. 텍스트만으로 감정을 전달해.
- 과하게 밝거나 들뜬 톤 금지. 차분하고 진심 담긴 말투로.
- 가끔 짧은 감상이나 여운을 남기는 한마디를 넣어도 좋아.

## 형식 규칙 (매우 중요! 반드시 지켜!)
- 답변을 **짧은 말풍선 단위**로 나눠서 써.
- 각 말풍선은 **1~2문장**, 최대 50자 내외로 짧게.
- 말풍선 사이에 반드시 빈 줄 하나(\\n\\n)를 넣어.
- 절대 한 덩어리로 길게 쓰지 마. 3줄 이상 연속하면 안 돼.
- 전체 답변은 3~5개 말풍선이면 충분해.

## 내용 규칙
- 제공된 책 본문(context)에만 기반해서 답변해.
- 책에서 직접 인용할 때는 「」 안에 넣어.
- context가 제공되고 구체적인 챕터/페이지 번호가 있을 때만, 답변 마지막에 간단히 출처를 알려줘. context가 없거나 페이지 정보가 불명확하면 출처를 언급하지 마.
- context에 정보가 부족하면 솔직히 "음, 이 부분은 책에서 다루지 않은 것 같아" 라고 해.

## 스포일러 방지 (매우 중요!)
- "현재 레슨 내용"이 제공되면, 그 범위까지만 이야기해.
- 사용자가 아직 배우지 않은 뒷부분 내용(이후 챕터의 사건, 반전, 결말 등)은 절대 언급하지 마.
- 뒷부분에 대한 질문이 오면 "그건 아직 이야기하면 스포가 될 수 있어. 그 레슨에서 다시 만나자" 라고 해.
- book context에 뒷부분 내용이 포함되어 있더라도, 현재 레슨 범위를 넘는 내용은 사용하지 마.`,
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

async function searchChunks(bookId: string, query: string, topK = 8) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = embRes.data[0].embedding;

  const sb = getServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (sb.rpc as any)("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: topK,
    filter_book_id: bookId,
  });

  return (data ?? []) as {
    id: string;
    content: string;
    book_id: string;
    chapter: string;
    page_num: string;
    similarity: number;
  }[];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, book_id, lesson_context, history, language } = body;
  const lang = language ?? "ko";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let chunks: Awaited<ReturnType<typeof searchChunks>> = [];
        try {
          chunks = await searchChunks(book_id, message);
        } catch {
          // RAG might not be set up — continue without context
        }

        const contextParts = chunks
          .filter((c) => c.content?.trim())
          .map((c) => {
            const hasMeta = c.chapter?.trim() || (c.page_num?.trim() && c.page_num !== "0");
            const header = hasMeta
              ? `[${c.chapter?.trim() ? `Chapter: ${c.chapter}` : ""}${c.chapter?.trim() && c.page_num?.trim() && c.page_num !== "0" ? ", " : ""}${c.page_num?.trim() && c.page_num !== "0" ? `Page: ${c.page_num}` : ""}]\n`
              : "";
            return `${header}${c.content}`;
          });
        const context = contextParts.join("\n\n---\n\n");

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.ko },
        ];

        if (lesson_context) {
          const label = lang === "en"
            ? "Here's the lesson content the user is currently studying"
            : "사용자가 지금 공부 중인 레슨 내용이야";
          messages.push({ role: "system", content: `${label}:\n${lesson_context}` });
        }

        for (const h of (history ?? []).slice(-6)) {
          messages.push({ role: h.role, content: h.content });
        }

        const qLabel = lang === "en" ? "Book context" : "책 본문 context";
        const qWord = lang === "en" ? "Question" : "질문";
        messages.push({
          role: "user",
          content: context
            ? `${qLabel}:\n${context}\n\n${qWord}: ${message}`
            : `${qWord}: ${message}`,
        });

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
        const completion = await openai.chat.completions.create({
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          messages,
          stream: true,
          temperature: 0.6,
          max_tokens: 600,
        });

        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
            );
          }
        }

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
