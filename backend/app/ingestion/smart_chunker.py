"""Smart chunking with chapter/section awareness and token-based splitting."""
from __future__ import annotations

import re
from dataclasses import dataclass

import tiktoken

from app.config import settings
from app.ingestion.parser import ParsedSection


@dataclass
class Chunk:
    chunk_id: str
    book_id: str
    content: str
    chapter: str
    page: str
    token_count: int
    chunk_index: int


_enc: tiktoken.Encoding | None = None


def _get_encoder() -> tiktoken.Encoding:
    global _enc
    if _enc is None:
        _enc = tiktoken.encoding_for_model("gpt-4o-mini")
    return _enc


def count_tokens(text: str) -> int:
    return len(_get_encoder().encode(text))


def smart_chunk(
    sections: list[ParsedSection],
    book_id: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[Chunk]:
    """Split parsed sections into overlapping token-based chunks.

    Respects paragraph boundaries and preserves chapter metadata.
    """
    chunk_size = chunk_size or settings.chunk_size
    chunk_overlap = chunk_overlap or settings.chunk_overlap

    all_text = "\n\n".join(s.text for s in sections if s.text.strip())
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", all_text) if p.strip()]

    section_map: dict[int, ParsedSection] = {}
    char_offset = 0
    for s in sections:
        section_map[char_offset] = s
        char_offset += len(s.text) + 2

    chunks: list[Chunk] = []
    current_tokens: list[str] = []
    current_text_parts: list[str] = []
    current_token_count = 0
    chunk_idx = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        if para_tokens > chunk_size:
            if current_text_parts:
                chunks.append(_make_chunk(
                    current_text_parts, book_id, chunk_idx, current_token_count, sections
                ))
                chunk_idx += 1
                current_text_parts, current_token_count = _overlap_tail(
                    current_text_parts, chunk_overlap
                )

            sentences = re.split(r"(?<=[.!?。？！])\s+", para)
            for sent in sentences:
                sent_tokens = count_tokens(sent)
                if current_token_count + sent_tokens > chunk_size and current_text_parts:
                    chunks.append(_make_chunk(
                        current_text_parts, book_id, chunk_idx, current_token_count, sections
                    ))
                    chunk_idx += 1
                    current_text_parts, current_token_count = _overlap_tail(
                        current_text_parts, chunk_overlap
                    )
                current_text_parts.append(sent)
                current_token_count += sent_tokens
            continue

        if current_token_count + para_tokens > chunk_size and current_text_parts:
            chunks.append(_make_chunk(
                current_text_parts, book_id, chunk_idx, current_token_count, sections
            ))
            chunk_idx += 1
            current_text_parts, current_token_count = _overlap_tail(
                current_text_parts, chunk_overlap
            )

        current_text_parts.append(para)
        current_token_count += para_tokens

    if current_text_parts:
        chunks.append(_make_chunk(
            current_text_parts, book_id, chunk_idx, current_token_count, sections
        ))

    return chunks


def _make_chunk(
    parts: list[str],
    book_id: str,
    idx: int,
    token_count: int,
    sections: list[ParsedSection],
) -> Chunk:
    text = "\n\n".join(parts)
    chapter, page = _find_section_meta(text, sections)
    return Chunk(
        chunk_id=f"{book_id}_c{idx:04d}",
        book_id=book_id,
        content=text,
        chapter=chapter,
        page=page,
        token_count=token_count,
        chunk_index=idx,
    )


def _overlap_tail(parts: list[str], target_tokens: int) -> tuple[list[str], int]:
    """Keep the tail of parts that fits within target_tokens for overlap."""
    tail: list[str] = []
    total = 0
    for p in reversed(parts):
        t = count_tokens(p)
        if total + t > target_tokens:
            break
        tail.insert(0, p)
        total += t
    return tail, total


def _find_section_meta(text: str, sections: list[ParsedSection]) -> tuple[str, str]:
    """Find the most relevant section metadata for a chunk."""
    snippet = text[:200].lower()
    best_section = None
    best_overlap = 0
    for s in sections:
        s_snippet = s.text[:200].lower()
        overlap = len(set(snippet.split()) & set(s_snippet.split()))
        if overlap > best_overlap:
            best_overlap = overlap
            best_section = s
    if best_section:
        return best_section.chapter, best_section.page
    return "", ""
