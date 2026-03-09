"""RAG retrieval using Supabase pgvector."""
from __future__ import annotations

from dataclasses import dataclass, field

from app.config import settings
from app.db import get_supabase
from app.ingestion.embedder import embed_texts


@dataclass
class RetrievedChunk:
    chunk_id: str
    content: str
    book_id: str
    chapter: str = ""
    page: str = ""
    similarity: float = 0.0


async def search(
    query: str,
    book_id: str,
    top_k: int = 8,
) -> list[RetrievedChunk]:
    """Semantic search over book chunks using pgvector cosine similarity.

    Requires the `match_chunks` RPC function in Supabase:

    CREATE OR REPLACE FUNCTION match_chunks(
      query_embedding vector(1536),
      match_count int DEFAULT 8,
      filter_book_id text DEFAULT NULL
    )
    RETURNS TABLE (
      id text,
      book_id text,
      content text,
      chapter text,
      page_num text,
      similarity float
    )
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN QUERY
      SELECT
        c.id,
        c.book_id,
        c.content,
        c.chapter,
        c.page_num,
        1 - (c.embedding <=> query_embedding) AS similarity
      FROM chunks c
      WHERE (filter_book_id IS NULL OR c.book_id = filter_book_id)
      ORDER BY c.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$;
    """
    embeddings = embed_texts([query])
    query_embedding = embeddings[0]

    sb = get_supabase()
    result = sb.rpc("match_chunks", {
        "query_embedding": query_embedding,
        "match_count": top_k,
        "filter_book_id": book_id,
    }).execute()

    chunks = []
    for row in result.data:
        chunks.append(RetrievedChunk(
            chunk_id=row["id"],
            content=row["content"],
            book_id=row["book_id"],
            chapter=row.get("chapter", ""),
            page=row.get("page_num", ""),
            similarity=row.get("similarity", 0.0),
        ))

    return chunks


async def get_book_context(book_id: str, max_chunks: int = 5) -> list[RetrievedChunk]:
    """Get the first few chunks of a book for overview context."""
    sb = get_supabase()
    result = (
        sb.table("chunks")
        .select("id, book_id, content, chapter, page_num")
        .eq("book_id", book_id)
        .order("id")
        .limit(max_chunks)
        .execute()
    )

    return [
        RetrievedChunk(
            chunk_id=row["id"],
            content=row["content"],
            book_id=row["book_id"],
            chapter=row.get("chapter", ""),
            page=row.get("page_num", ""),
        )
        for row in result.data
    ]
