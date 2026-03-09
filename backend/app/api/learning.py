"""Learning API: user-facing endpoints for lessons, progress, stats."""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Header

from app.db import get_supabase
from app.api.schemas import (
    BookOut, LessonOut, LessonDetailOut, QuizOut, DialoguePart,
    LessonCompleteRequest, LessonCompleteResponse,
    UserStatsOut, UserProgressOut,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_user_id(authorization: str | None) -> str:
    """Extract user ID from Supabase JWT. Placeholder for now."""
    return "demo-user"


@router.get("/books")
async def list_books(authorization: str | None = Header(None)):
    """List available books for learning."""
    sb = get_supabase()
    result = sb.table("books").select("*").order("created_at", desc=True).execute()
    return [BookOut(**row) for row in result.data]


@router.get("/books/{book_id}/lessons")
async def get_book_lessons(
    book_id: str,
    authorization: str | None = Header(None),
):
    """Get all lessons for a book with user progress (for skill tree)."""
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    lessons = (
        sb.table("lessons")
        .select("*")
        .eq("book_id", book_id)
        .order("order_index")
        .execute()
    ).data

    progress = (
        sb.table("user_progress")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    ).data
    progress_map = {p["lesson_id"]: p for p in progress}

    result = []
    for lesson in lessons:
        content = json.loads(lesson.get("content_json", "{}"))
        p = progress_map.get(lesson["id"])

        result.append({
            "lesson": {
                "id": lesson["id"],
                "book_id": lesson["book_id"],
                "order_index": lesson["order_index"],
                "title": lesson.get("title", content.get("title", "")),
                "chapter": content.get("chapter", ""),
                "chapter_title": content.get("chapter_title", ""),
                "spark": content.get("spark", ""),
            },
            "completed": p["completed"] if p else False,
            "score": p.get("score") if p else None,
            "review_needed": p.get("review_needed", False) if p else False,
        })

    return result


@router.get("/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: str):
    """Get full lesson detail including dialogue and quizzes."""
    sb = get_supabase()

    lesson = sb.table("lessons").select("*").eq("id", lesson_id).single().execute().data
    content = json.loads(lesson.get("content_json", "{}"))

    quizzes = (
        sb.table("quizzes")
        .select("*")
        .eq("lesson_id", lesson_id)
        .execute()
    ).data

    return LessonDetailOut(
        lesson=LessonOut(
            id=lesson["id"],
            book_id=lesson["book_id"],
            order_index=lesson["order_index"],
            title=lesson.get("title", content.get("title", "")),
            chapter=content.get("chapter", ""),
            chapter_title=content.get("chapter_title", ""),
            part=content.get("part", 1),
            total_parts=content.get("total_parts", 1),
            dialogue=[DialoguePart(**d) for d in content.get("dialogue", [])],
            spark=content.get("spark", ""),
            cliffhanger=content.get("cliffhanger", ""),
        ),
        quizzes=[
            QuizOut(
                id=q["id"],
                lesson_id=q["lesson_id"],
                question=q["question"],
                options=json.loads(q["options_json"]),
                correct_index=q["correct_index"],
                explanation=q.get("explanation", ""),
            )
            for q in quizzes
        ],
    )


@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    req: LessonCompleteRequest,
    authorization: str | None = Header(None),
):
    """Mark a lesson as complete and update XP/streak."""
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    base_xp = 50
    quiz_xp = req.correct_answers * 20
    xp_earned = base_xp + quiz_xp

    sb.table("user_progress").upsert({
        "user_id": user_id,
        "lesson_id": lesson_id,
        "completed": True,
        "score": req.score,
        "completed_at": datetime.utcnow().isoformat(),
    }).execute()

    stats = sb.table("user_stats").select("*").eq("user_id", user_id).execute().data
    if stats:
        current = stats[0]
        new_xp = current["xp"] + xp_earned

        last_study = current.get("last_study_date")
        today = date.today().isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        if last_study == yesterday:
            new_streak = current["streak_days"] + 1
        elif last_study == today:
            new_streak = current["streak_days"]
        else:
            new_streak = 1

        new_level = _calculate_level(new_xp)
        level_up = new_level > current.get("level", 1)

        sb.table("user_stats").update({
            "xp": new_xp,
            "streak_days": new_streak,
            "last_study_date": today,
            "level": new_level,
        }).eq("user_id", user_id).execute()
    else:
        new_xp = xp_earned
        new_streak = 1
        new_level = _calculate_level(new_xp)
        level_up = new_level > 1

        sb.table("user_stats").insert({
            "user_id": user_id,
            "xp": new_xp,
            "streak_days": 1,
            "last_study_date": date.today().isoformat(),
            "level": new_level,
        }).execute()

    return LessonCompleteResponse(
        xp_earned=xp_earned,
        streak_days=new_streak,
        level=new_level,
        level_up=level_up,
    )


@router.get("/user/stats")
async def get_user_stats(authorization: str | None = Header(None)):
    """Get user's XP, streak, and level."""
    user_id = _get_user_id(authorization)
    sb = get_supabase()

    stats = sb.table("user_stats").select("*").eq("user_id", user_id).execute().data
    if stats:
        s = stats[0]
        return UserStatsOut(
            xp=s["xp"],
            streak_days=s["streak_days"],
            last_study_date=s.get("last_study_date"),
            level=s.get("level", 1),
        )
    return UserStatsOut()


def _calculate_level(xp: int) -> int:
    """XP thresholds: 100, 300, 600, 1000, 1500, 2100, 2800, ..."""
    thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
    for i, threshold in enumerate(thresholds):
        if xp < threshold:
            return i
    return len(thresholds)
