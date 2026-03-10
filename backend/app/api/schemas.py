from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


# ── Books ──

class BookOut(BaseModel):
    id: str
    title: str
    author: str
    cover_url: str | None = None
    color: str = "#6366f1"
    total_chunks: int = 0
    created_at: datetime | None = None


# ── Lessons ──

class DialoguePart(BaseModel):
    speaker: str = "cosmii"
    text: str
    highlight: str | None = None


class LessonOut(BaseModel):
    id: str
    book_id: str
    order_index: int
    title: str
    chapter: str = ""
    chapter_title: str = ""
    part: int = 1
    total_parts: int = 1
    dialogue: list[DialoguePart] = Field(default_factory=list)
    spark: str = ""
    cliffhanger: str = ""


class QuizOut(BaseModel):
    id: str
    lesson_id: str
    question: str
    options: list[str]
    correct_index: int
    explanation: str = ""


class LessonDetailOut(BaseModel):
    lesson: LessonOut
    quizzes: list[QuizOut] = Field(default_factory=list)


# ── Learning Progress ──

class LessonCompleteRequest(BaseModel):
    score: int
    total_questions: int
    correct_answers: int


class LessonCompleteResponse(BaseModel):
    xp_earned: int
    streak_days: int
    level: int
    level_up: bool = False


# ── User Stats ──

class UserStatsOut(BaseModel):
    xp: int = 0
    streak_days: int = 0
    last_study_date: str | None = None
    level: int = 1


class UserProgressOut(BaseModel):
    lesson_id: str
    completed: bool = False
    score: int | None = None
    completed_at: datetime | None = None
    review_needed: bool = False


# ── Chat (Free Question) ──

class ChatHistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    book_id: str
    lesson_context: str | None = None
    history: list[ChatHistoryItem] = Field(default_factory=list)
    language: str = "ko"


class SourceReference(BaseModel):
    chapter: str = ""
    page: str = ""
    snippet: str = ""


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceReference] = Field(default_factory=list)


# ── Admin ──

class AdminBookUploadResponse(BaseModel):
    book_id: str
    title: str
    author: str
    total_chunks: int
    status: str = "processed"


class LessonGenerateRequest(BaseModel):
    sessions_per_chapter: int = 3
    dialogue_parts_per_session: int = 6
    quizzes_per_session: int = 2
