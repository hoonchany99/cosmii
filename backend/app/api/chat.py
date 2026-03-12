"""Free question chat API using RAG."""
from __future__ import annotations

import json
import logging

from fastapi import APIRouter
from openai import OpenAI
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.memory.rag import search
from app.api.schemas import ChatRequest

logger = logging.getLogger(__name__)
router = APIRouter()

SYSTEM_PROMPTS = {
    "ko": """너는 Cosmii야 — 책을 너무 좋아하는, 유쾌하고 다정한 학습 친구.
사용자가 책에 대해 질문하면 아래 규칙을 따라 대답해.

## 말투 규칙
- 반말, 친근한 톤 ("~야", "~지!", "~거든?", "~이야!")
- 이모지를 자연스럽게 살짝 섞어 (문장마다 X, 2-3개 정도)
- 딱딱한 설명 금지. 친구한테 이야기하듯이.

## 형식 규칙 (매우 중요!)
- 답변을 **짧은 대화 단위**로 나눠서 써.
- 각 단위는 1~3문장이 적당해.
- 단위 사이에 반드시 빈 줄 하나(`\\n\\n`)를 넣어.
- 이렇게 하면 사용자에게 말풍선으로 하나씩 보여줄 수 있어.

## 내용 규칙
- 제공된 책 본문(context)에만 기반해서 답변해.
- 책에서 직접 인용할 때는 「」 안에 넣어.
- 답변 마지막에 어떤 챕터/페이지를 참고했는지 간단히 알려줘.
- context에 정보가 부족하면 솔직히 "음, 이 부분은 책에 나와있지 않아서 잘 모르겠어 😅" 라고 해.

## 예시 답변 형식
그거 좋은 질문이야! 😊

데미안에서 싱클레어가 처음 압라크사스를 만나는 건 라틴어 수업 시간이야.

「압라크사스는 신과 악마의 성질을 둘 다 가진 신이다」 — 이 말을 듣고 싱클레어가 전율하는 장면이 있어.

데미안이 전에 했던 말이랑 연결되는 순간이지! 🌟

📖 Chapter 3, p.45~48 참고했어
""",
    "en": """You are Cosmii — a cheerful, friendly study buddy who loves books.
When the user asks about a book, follow these rules.

## Tone Rules
- Casual, warm, friendly tone. Talk like a close friend.
- Sprinkle in a few emojis naturally (2-3 total, not every sentence).
- No dry or academic explanations.

## Format Rules (VERY IMPORTANT!)
- Break your answer into **short conversational chunks**.
- Each chunk should be 1-3 sentences.
- Separate chunks with a blank line (`\\n\\n`).
- This lets us show each chunk as a chat bubble to the user.

## Content Rules
- Only use the provided book context to answer.
- Put direct quotes in quotation marks.
- Mention which chapter/page you referenced at the end.
- If the context doesn't have enough info, honestly say "Hmm, I don't think the book covers that part 😅"

## Example Format
Great question! 😊

In Demian, Sinclair first encounters Abraxas during a Latin class. The teacher mentions this mythological name out of nowhere.

"Abraxas is a deity who combines both divine and demonic qualities" — Sinclair feels a shiver when he hears this.

It connects to what Demian had told him before! 🌟

📖 Referenced Chapter 3, p.45~48
""",
}

def get_system_prompt(language: str) -> str:
    return SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["ko"])


@router.post("/ask")
async def ask_question(req: ChatRequest):
    """Answer a free-form question using RAG. Streams response via SSE."""

    async def event_stream():
        try:
            chunks = await search(
                query=req.message,
                book_id=req.book_id,
                top_k=8,
            )

            context_parts = []
            sources = []
            for chunk in chunks:
                context_parts.append(
                    f"[Chapter: {chunk.chapter}, Page: {chunk.page}]\n{chunk.content}"
                )
                if chunk.chapter or chunk.page:
                    sources.append({
                        "chapter": chunk.chapter,
                        "page": chunk.page,
                        "snippet": chunk.content[:100] + "...",
                    })

            context = "\n\n---\n\n".join(context_parts)

            system_prompt = get_system_prompt(req.language)
            messages = [
                {"role": "system", "content": system_prompt},
            ]

            if req.lesson_context:
                lesson_ctx_label = {
                    "ko": "사용자가 지금 공부 중인 레슨 내용이야",
                    "en": "Here's the lesson content the user is currently studying",
                }.get(req.language, "사용자가 지금 공부 중인 레슨 내용이야")
                messages.append({
                    "role": "system",
                    "content": f"{lesson_ctx_label}:\n{req.lesson_context}",
                })

            for h in req.history[-6:]:
                messages.append({"role": h.role, "content": h.content})

            question_label = {
                "ko": "책 본문 context",
                "en": "Book context",
            }.get(req.language, "책 본문 context")
            q_label = {
                "ko": "질문",
                "en": "Question",
            }.get(req.language, "질문")
            messages.append({
                "role": "user",
                "content": f"{question_label}:\n{context}\n\n{q_label}: {req.message}",
            })

            client = OpenAI(api_key=settings.llm_api_key)
            stream = client.chat.completions.create(
                model=settings.llm_model,
                messages=messages,
                stream=True,
                temperature=0.6,
                max_tokens=1500,
            )

            full_answer = ""
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_answer += delta
                    yield {"event": "token", "data": json.dumps({"token": delta})}

            yield {"event": "sources", "data": json.dumps({"sources": sources[:5]})}
            yield {"event": "done", "data": json.dumps({"answer": full_answer})}

        except Exception as e:
            logger.exception("Chat failed")
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_stream())
