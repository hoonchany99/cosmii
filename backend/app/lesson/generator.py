"""Lesson & quiz generation from book chunks using LLM.

Generates Cosmii-style dialogue sessions modeled after the DEMIAN_SESSIONS
structure from companion-demo-panel.tsx, but with much richer content:
- 5-8 dialogue parts per session (each 200-400 chars)
- 2 quizzes per session with detailed explanations
- Spark hooks and cliffhangers for engagement
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any

from openai import OpenAI

from app.config import settings
from app.db import get_supabase

logger = logging.getLogger(__name__)

LESSON_SYSTEM_PROMPT = """You are Cosmii, a warm and wise learning companion who teaches book content through engaging dialogue. You speak in Korean.

Your task: Given book content (chunks from a specific chapter/section), generate a structured learning session.

Output JSON with this exact structure:
{
  "title": "레슨 제목 (핵심 개념 한 줄)",
  "chapter": "챕터 번호 or 이름",
  "chapter_title": "챕터 제목",
  "spark": "이 레슨의 핵심 훅 (한 줄, 호기심 유발)",
  "dialogue": [
    {"speaker": "cosmii", "text": "대화 내용 (200-400자)", "highlight": "강조할 키워드 (optional)"},
    {"speaker": "cosmii", "text": "..."},
    ...
  ],
  "quizzes": [
    {
      "question": "퀴즈 질문",
      "options": ["선택지A", "선택지B", "선택지C", "선택지D"],
      "correct_index": 0,
      "explanation": "정답 설명 (2-3문장, 왜 이것이 정답인지)"
    }
  ],
  "cliffhanger": "다음 레슨 예고 (한 줄, 기대감 유발)"
}

Guidelines:
- dialogue should have 5-8 parts, each 200-400 characters
- Speak naturally, like a knowledgeable friend explaining the book
- Highlight key concepts, quotes, and insights from the original text
- Include original quotes from the book when relevant (in quotation marks)
- Make quizzes test understanding, not memorization
- Each quiz should have exactly 4 options
- Explanations should reference the book content
- Cliffhanger should connect to what comes next in the book
"""

QUIZ_ONLY_PROMPT = """Based on this book content, generate {count} quiz questions in Korean.

Output JSON array:
[
  {{
    "question": "퀴즈 질문",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "정답 설명 (2-3문장)"
  }}
]

Make questions that test genuine understanding of the concepts, not trivial facts.
"""


def _get_openai() -> OpenAI:
    return OpenAI(api_key=settings.llm_api_key)


async def generate_lessons_for_book(
    book_id: str,
    sessions_per_chapter: int = 3,
    dialogue_parts: int = 6,
    quizzes_per_session: int = 2,
    on_progress: Any = None,
) -> int:
    """Generate all lessons and quizzes for a book from its chunks.

    Returns the number of lessons generated.
    """
    sb = get_supabase()

    chunks_result = (
        sb.table("chunks")
        .select("id, content, chapter, page_num")
        .eq("book_id", book_id)
        .order("id")
        .execute()
    )
    chunks = chunks_result.data
    if not chunks:
        logger.warning(f"No chunks found for book {book_id}")
        return 0

    chapters: dict[str, list[dict]] = {}
    for chunk in chunks:
        ch = chunk.get("chapter", "") or "Unknown"
        chapters.setdefault(ch, []).append(chunk)

    client = _get_openai()
    lesson_idx = 0
    total_chapters = len(chapters)

    for ch_idx, (chapter_name, ch_chunks) in enumerate(chapters.items()):
        chunk_texts = [c["content"] for c in ch_chunks]
        total_text = "\n\n---\n\n".join(chunk_texts)

        chunks_per_session = max(1, len(ch_chunks) // sessions_per_chapter)
        for session_num in range(sessions_per_chapter):
            start = session_num * chunks_per_session
            end = start + chunks_per_session if session_num < sessions_per_chapter - 1 else len(ch_chunks)
            session_chunks = ch_chunks[start:end]
            if not session_chunks:
                continue

            session_text = "\n\n".join(c["content"] for c in session_chunks)

            try:
                lesson_data = _generate_single_lesson(
                    client, session_text, chapter_name,
                    session_num + 1, sessions_per_chapter,
                    dialogue_parts, quizzes_per_session,
                )
            except Exception as e:
                logger.error(f"Failed to generate lesson for {chapter_name} part {session_num + 1}: {e}")
                continue

            lesson_id = str(uuid.uuid4())
            lesson_row = {
                "id": lesson_id,
                "book_id": book_id,
                "order_index": lesson_idx,
                "title": lesson_data.get("title", f"{chapter_name} Part {session_num + 1}"),
                "lesson_type": "dialogue",
                "content_json": json.dumps(lesson_data, ensure_ascii=False),
            }
            sb.table("lessons").upsert(lesson_row).execute()

            for quiz in lesson_data.get("quizzes", []):
                quiz_row = {
                    "id": str(uuid.uuid4()),
                    "lesson_id": lesson_id,
                    "question": quiz["question"],
                    "options_json": json.dumps(quiz["options"], ensure_ascii=False),
                    "correct_index": quiz["correct_index"],
                    "explanation": quiz.get("explanation", ""),
                }
                sb.table("quizzes").upsert(quiz_row).execute()

            lesson_idx += 1
            if on_progress:
                await on_progress(ch_idx + 1, total_chapters, lesson_idx)

            logger.info(f"Generated lesson {lesson_idx}: {lesson_data.get('title', 'untitled')}")

    return lesson_idx


def _generate_single_lesson(
    client: OpenAI,
    content: str,
    chapter: str,
    part: int,
    total_parts: int,
    dialogue_parts: int,
    quiz_count: int,
) -> dict:
    """Call LLM to generate a single lesson from content."""
    user_prompt = f"""Book content (Chapter: {chapter}, Part {part}/{total_parts}):

{content[:8000]}

Generate a learning session with {dialogue_parts} dialogue parts and {quiz_count} quizzes.
"""

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": LESSON_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)

    data["chapter"] = chapter
    data["part"] = part
    data["total_parts"] = total_parts

    return data
