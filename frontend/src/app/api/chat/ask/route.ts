import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";
import OpenAI from "openai";

const SYSTEM_PROMPTS: Record<string, string> = {
  ko: `너는 Cosmii야 — 책을 너무 좋아하는, 유쾌하고 다정한 학습 친구.
사용자가 책에 대해 질문하면 아래 규칙을 따라 대답해.

## 말투 규칙
- 반말, 친근한 톤 ("~야", "~지!", "~거든?", "~이야!")
- 이모지를 자연스럽게 살짝 섞어 (문장마다 X, 2-3개 정도)
- 딱딱한 설명 금지. 친구한테 이야기하듯이.

## 형식 규칙 (매우 중요!)
- 답변을 **짧은 대화 단위**로 나눠서 써.
- 각 단위는 1~3문장이 적당해.
- 단위 사이에 반드시 빈 줄 하나(\\n\\n)를 넣어.

## 내용 규칙
- 제공된 책 본문(context)에만 기반해서 답변해.
- 책에서 직접 인용할 때는 「」 안에 넣어.
- 답변 마지막에 어떤 챕터/페이지를 참고했는지 간단히 알려줘.
- context에 정보가 부족하면 솔직히 "음, 이 부분은 책에 나와있지 않아서 잘 모르겠어 😅" 라고 해.`,
  en: `You are Cosmii — a cheerful, friendly study buddy who loves books.
When the user asks about a book, follow these rules.

## Tone Rules
- Casual, warm, friendly tone. Talk like a close friend.
- Sprinkle in a few emojis naturally (2-3 total, not every sentence).
- No dry or academic explanations.

## Format Rules (VERY IMPORTANT!)
- Break your answer into **short conversational chunks**.
- Each chunk should be 1-3 sentences.
- Separate chunks with a blank line (\\n\\n).

## Content Rules
- Only use the provided book context to answer.
- Put direct quotes in quotation marks.
- Mention which chapter/page you referenced at the end.
- If the context doesn't have enough info, honestly say "Hmm, I don't think the book covers that part 😅"`,
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

        const contextParts = chunks.map(
          (c) => `[Chapter: ${c.chapter}, Page: ${c.page_num}]\n${c.content}`,
        );
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
          max_tokens: 1500,
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
