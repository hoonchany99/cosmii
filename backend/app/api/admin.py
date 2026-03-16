"""Admin API: book upload, management, lesson generation."""
from __future__ import annotations

import json
import logging
import uuid

from fastapi import APIRouter, File, Form, UploadFile
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.db import get_supabase
from app.ingestion.parser import BookParser
from app.ingestion.smart_chunker import smart_chunk
from app.ingestion.embedder import store_chunks
from app.api.schemas import AdminBookUploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()


def _save_cover(parser: BookParser, content: bytes, filename: str, book_id: str) -> str | None:
    """Extract cover from book file and save to covers dir. Returns URL path or None."""
    cover_bytes, ext = parser.extract_cover(content=content, filename=filename)
    if not cover_bytes:
        return None

    settings.covers_dir.mkdir(parents=True, exist_ok=True)
    cover_filename = f"{book_id}.{ext}"
    cover_path = settings.covers_dir / cover_filename
    cover_path.write_bytes(cover_bytes)
    logger.info("Saved cover for book %s: %s", book_id, cover_path)
    return f"/covers/{cover_filename}"


@router.post("/books/upload")
async def upload_book(
    file: UploadFile = File(...),
    title: str = Form(""),
    author: str = Form(""),
    color: str = Form("#6366f1"),
):
    """Upload a book, parse, chunk, embed, and store.

    Returns SSE events for progress tracking.
    """
    content = await file.read()
    filename = file.filename or "unknown.pdf"

    async def event_stream():
        try:
            yield {"event": "status", "data": json.dumps({"step": "parsing", "message": "Parsing book..."})}

            parser = BookParser()
            sections = parser.parse(content=content, filename=filename)
            inferred_title = title or filename.rsplit(".", 1)[0]

            yield {"event": "status", "data": json.dumps({
                "step": "parsed", "message": f"Parsed {len(sections)} sections"
            })}

            book_id = str(uuid.uuid4())[:8]
            cover_url = _save_cover(parser, content, filename, book_id)

            chunks = smart_chunk(sections, book_id)

            yield {"event": "status", "data": json.dumps({
                "step": "chunked", "message": f"Created {len(chunks)} chunks"
            })}

            sb = get_supabase()
            book_row = {
                "id": book_id,
                "title": inferred_title,
                "author": author,
                "cover_url": cover_url,
                "color": color,
            }
            sb.table("books").upsert(book_row).execute()

            async def on_embed_progress(stored: int, total: int):
                pass

            stored = await store_chunks(chunks, on_progress=on_embed_progress)

            yield {"event": "status", "data": json.dumps({
                "step": "embedded", "message": f"Embedded {stored} chunks"
            })}

            yield {"event": "complete", "data": json.dumps({
                "book_id": book_id,
                "title": inferred_title,
                "author": author,
                "total_chunks": stored,
                "status": "processed",
            })}

        except Exception as e:
            logger.exception("Book upload failed")
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_stream())


@router.get("/books")
async def list_books():
    """List all books."""
    sb = get_supabase()
    result = sb.table("books").select("*").order("created_at", desc=True).execute()
    return result.data


@router.delete("/books/{book_id}")
async def delete_book(book_id: str):
    """Delete a book and all related data."""
    sb = get_supabase()
    sb.table("quizzes").delete().in_(
        "lesson_id",
        [r["id"] for r in sb.table("lessons").select("id").eq("book_id", book_id).execute().data]
    ).execute()
    sb.table("lessons").delete().eq("book_id", book_id).execute()
    sb.table("chunks").delete().eq("book_id", book_id).execute()
    sb.table("books").delete().eq("id", book_id).execute()
    return {"status": "deleted", "book_id": book_id}


@router.get("/books/{book_id}/lessons")
async def get_book_lessons(book_id: str):
    """Get all lessons for a book."""
    sb = get_supabase()
    result = (
        sb.table("lessons")
        .select("*")
        .eq("book_id", book_id)
        .order("order_index")
        .execute()
    )
    return result.data
