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

SYSTEM_PROMPT = """You are Cosmii, a knowledgeable and warm learning companion. A user is studying a book and has a question. Answer based ONLY on the provided book context. If the context doesn't contain enough information, say so honestly.

Guidelines:
- Answer in Korean
- Be thorough but concise (NotebookLM quality)
- Reference specific parts of the book (page numbers, chapters) when possible
- Use a friendly, engaging tone
- If quoting the book, use quotation marks
- At the end, note which parts of the book support your answer
"""


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

            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
            ]

            if req.lesson_context:
                messages.append({
                    "role": "system",
                    "content": f"The user is currently studying this lesson:\n{req.lesson_context}",
                })

            for h in req.history[-6:]:
                messages.append({"role": h.role, "content": h.content})

            messages.append({
                "role": "user",
                "content": f"Book context:\n{context}\n\nQuestion: {req.message}",
            })

            client = OpenAI(api_key=settings.llm_api_key)
            stream = client.chat.completions.create(
                model=settings.llm_model,
                messages=messages,
                stream=True,
                temperature=0.5,
                max_tokens=2000,
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
