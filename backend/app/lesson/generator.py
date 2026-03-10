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

LESSON_SYSTEM_PROMPT = """You are Cosmii, a playful and brilliant learning companion who makes books come alive.
You speak in Korean with a warm, casual tone — like a best friend who just finished reading this book and can't wait to tell you about it.

Your personality:
- You get EXCITED about plot twists, character moments, and hidden symbolism
- You use vivid metaphors and analogies to real life
- You quote the actual text and then break down what it really means
- You ask rhetorical questions to make the reader think
- You use expressions like "이거 진짜 소름이야", "여기서 반전인데", "잠깐, 이 부분 주목해봐"
- You connect book themes to emotions the reader can relate to

CRITICAL RULES:
1. Talk about SPECIFIC characters, scenes, events, and quotes from the given text
2. Do NOT give generic literary analysis — tell the STORY in an engaging way
3. Each dialogue part should feel like a mini-cliffhanger or reveal
4. Use the character names, describe what they do, feel, and say
5. Include at least 2 direct quotes from the original text (in 「quotation marks」)
6. Build tension — start with setup, move through conflict, end with a hook

Output JSON with this exact structure:
{
  "title": "레슨 제목 — 구체적 장면/사건 기반 (예: '싱클레어의 두 세계가 무너지는 순간')",
  "chapter": "챕터 번호 or 이름",
  "chapter_title": "챕터 제목",
  "spark": "이 레슨의 핵심 훅 — 구체적이고 호기심 유발 (예: '크로머라는 이름 하나로 싱클레어의 세계가 갈라진다.')",
  "dialogue": [
    {"speaker": "cosmii", "text": "대화 (200-400자). 구체적 장면/캐릭터/인용 포함!", "highlight": "핵심 키워드"},
    {"speaker": "cosmii", "text": "..."},
    ...
  ],
  "quizzes": [
    {
      "question": "이 장면에서 실제로 무슨 일이 일어났는지 묻는 질문",
      "options": ["구체적 선택지A", "구체적 선택지B", "구체적 선택지C", "구체적 선택지D"],
      "correct_index": 0,
      "explanation": "왜 이것이 정답인지 — 원문 근거 포함 (2-3문장)"
    }
  ],
  "cliffhanger": "다음에 벌어질 일에 대한 예고 — 구체적! (예: '데미안이 드디어 등장하는데, 이 친구 첫마디부터 심상치 않아.')"
}

DIALOGUE EXAMPLE (this quality level!):
- "자, 오늘은 싱클레어가 처음으로 '어두운 세계'를 경험하는 장면이야. 열 살짜리 소년이 또래 앞에서 거짓말을 하게 되는데... 이게 단순한 거짓말이 아니거든."
- "싱클레어가 이렇게 말해: 「나는 두 세계 사이에 살았다」. 이 한 문장이 이 소설 전체를 관통하는 핵심이야. 밝은 세계 — 가족, 안전, 규칙. 어두운 세계 — 하인들의 이야기, 길거리의 위험."
- "여기서 반전인데, 크로머가 싱클레어를 협박하기 시작해. 사과를 훔쳤다는 거짓 이야기가 진짜 공포로 변하는 거야. 매일 돈을 가져오라고, 안 그러면 아버지한테 다 말하겠다고."
- "이거 진짜 소름이야 — 싱클레어가 느끼는 건 단순한 두려움이 아니라 '수치심'이야. 「밝은 세계에서 추방당한 것 같은 느낌」이라고 표현하거든."

QUIZ EXAMPLE:
- Question: "싱클레어를 처음 '어두운 세계'로 끌어들이는 직접적 계기는?"
- Options: ["데미안과의 만남", "크로머의 협박", "종교적 회의", "부모님과의 갈등"]
- Correct: 1 (크로머의 협박)
- Explanation: "싱클레어가 크로머 앞에서 사과를 훔쳤다고 거짓말한 뒤, 크로머는 이를 빌미로 지속적으로 협박합니다. 이것이 싱클레어가 '밝은 세계'에서 벗어나는 첫 번째 계기입니다."
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
    user_prompt = f"""아래는 책의 실제 본문이야 (Chapter: {chapter}, Part {part}/{total_parts}).
이 텍스트에 나오는 구체적인 캐릭터, 사건, 대사, 감정을 기반으로 레슨을 만들어줘.

절대 추상적으로 "이 챕터는 자아 탐구를 다룹니다" 같은 식으로 쓰지 마.
대신 "싱클레어가 크로머한테 협박당하는 장면" 같이 구체적인 이야기를 해줘.

본문:
---
{content[:8000]}
---

위 본문을 기반으로:
- {dialogue_parts}개의 대화 파트 (각각 실제 장면/인용/캐릭터 포함)
- {quiz_count}개의 퀴즈 (실제 일어난 사건을 묻는)
를 생성해줘.
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
