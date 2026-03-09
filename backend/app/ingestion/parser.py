from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import ebooklib
import fitz
from bs4 import BeautifulSoup
from ebooklib import epub


@dataclass
class ParsedSection:
    text: str
    chapter: str = ""
    page: str = ""
    section_index: int = 0


class BookParser:
    """Parses PDF, EPUB, and plain text files into structured sections."""

    def parse(self, file_path: Path | None = None, content: bytes | None = None,
              filename: str = "") -> list[ParsedSection]:
        name = filename or (file_path.name if file_path else "")
        suffix = Path(name).suffix.lower()

        if suffix == ".pdf":
            return self._parse_pdf(file_path, content)
        elif suffix == ".epub":
            return self._parse_epub(file_path, content)
        elif suffix in (".txt", ".md"):
            return self._parse_text(file_path, content)
        else:
            raise ValueError(f"Unsupported file format: {suffix}")

    def _parse_pdf(self, file_path: Path | None, content: bytes | None) -> list[ParsedSection]:
        if content:
            doc = fitz.open(stream=content, filetype="pdf")
        else:
            doc = fitz.open(str(file_path))

        sections: list[ParsedSection] = []

        toc = doc.get_toc(simple=True)
        chapter_map: dict[int, str] = {}
        if toc:
            toc_lines = []
            for level, title, page_no in toc:
                indent = "  " * (level - 1)
                toc_lines.append(f"{indent}{title} (p.{page_no})")
                for p in range(page_no, len(doc) + 1):
                    if p not in chapter_map:
                        chapter_map[p] = title

            toc_text = "목차 / Table of Contents:\n" + "\n".join(toc_lines)
            sections.append(ParsedSection(
                text=toc_text,
                chapter="Table of Contents",
                page="0",
                section_index=-1,
            ))

        for page_num, page in enumerate(doc, start=1):
            text = page.get_text().strip()
            if text:
                sections.append(ParsedSection(
                    text=text,
                    chapter=chapter_map.get(page_num, ""),
                    page=str(page_num),
                    section_index=page_num - 1,
                ))
        doc.close()
        return sections

    def _parse_epub(self, file_path: Path | None, content: bytes | None) -> list[ParsedSection]:
        if content:
            book = epub.read_epub(io.BytesIO(content))
        else:
            book = epub.read_epub(str(file_path))

        doc_items = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
        if not doc_items:
            doc_items = [
                item for item in book.get_items()
                if item.get_name().endswith((".html", ".xhtml", ".htm"))
            ]

        sections: list[ParsedSection] = []
        idx = 0
        for item in doc_items:
            soup = BeautifulSoup(item.get_content(), "html.parser")
            text = soup.get_text(separator="\n").strip()
            if not text:
                continue

            chapter_tag = soup.find(["h1", "h2", "h3"])
            chapter = chapter_tag.get_text().strip() if chapter_tag else f"Section {idx + 1}"

            sections.append(ParsedSection(
                text=text,
                chapter=chapter,
                section_index=idx,
            ))
            idx += 1

        return sections

    def _parse_text(self, file_path: Path | None, content: bytes | None) -> list[ParsedSection]:
        if content:
            raw = content.decode("utf-8", errors="replace")
        else:
            raw = file_path.read_text(encoding="utf-8", errors="replace")

        paragraphs = [p.strip() for p in raw.split("\n\n") if p.strip()]

        sections: list[ParsedSection] = []
        for idx, para in enumerate(paragraphs):
            sections.append(ParsedSection(
                text=para,
                section_index=idx,
            ))
        return sections
