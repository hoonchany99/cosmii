"""Generate embeddings and store in Supabase pgvector."""
from __future__ import annotations

import logging
from typing import Callable, Awaitable

from openai import OpenAI

from app.config import settings
from app.db import get_supabase
from app.ingestion.smart_chunker import Chunk

logger = logging.getLogger(__name__)

BATCH_SIZE = 100
EMBEDDING_DIMENSIONS = 1536


def _get_openai() -> OpenAI:
    return OpenAI(api_key=settings.llm_api_key)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    client = _get_openai()
    response = client.embeddings.create(
        model=settings.embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def store_chunks(
    chunks: list[Chunk],
    on_progress: Callable[[int, int], Awaitable[None]] | None = None,
) -> int:
    """Embed chunks and store them in Supabase pgvector.

    Returns the number of chunks stored.
    """
    sb = get_supabase()
    total = len(chunks)
    stored = 0

    for i in range(0, total, BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c.content for c in batch]

        embeddings = embed_texts(texts)

        rows = [
            {
                "id": c.chunk_id,
                "book_id": c.book_id,
                "content": c.content,
                "chapter": c.chapter,
                "page_num": c.page,
                "embedding": emb,
            }
            for c, emb in zip(batch, embeddings)
        ]

        sb.table("chunks").upsert(rows).execute()
        stored += len(batch)

        if on_progress:
            await on_progress(stored, total)

        logger.info(f"Embedded and stored {stored}/{total} chunks")

    return stored
