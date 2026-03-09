import type { BookInfo, BookModelCard, Citation, GraphData, ThinkingStep, ThinkingProcess, UploadProgress } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadBook(file: File): Promise<BookInfo> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/books/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function uploadBookWithProgress(
  file: File,
  onProgress: (p: UploadProgress) => void,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/books/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";
  let eventData = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        // SSE event type — we parse stage from the data payload instead
        continue;
      } else if (line.startsWith("data: ")) {
        eventData += line.slice(6);
      } else if (line === "") {
        if (eventData) {
          try {
            const parsed = JSON.parse(eventData) as UploadProgress;
            onProgress(parsed);
          } catch { /* skip malformed */ }
        }
        eventData = "";
      }
    }
  }
}

export async function listBooks(): Promise<BookInfo[]> {
  const res = await fetch(`${API_BASE}/api/books/`);
  if (!res.ok) throw new Error(`Failed to list books: ${res.statusText}`);
  return res.json();
}

export async function deleteBook(bookId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/books/${bookId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
}

export async function updateBook(bookId: string, updates: { title?: string; author?: string }): Promise<BookInfo> {
  const res = await fetch(`${API_BASE}/api/books/${bookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
  return res.json();
}

export async function getModelCard(bookId: string): Promise<BookModelCard> {
  const res = await fetch(`${API_BASE}/api/books/${bookId}/model-card`);
  if (!res.ok) throw new Error(`Failed to get model card: ${res.statusText}`);
  return res.json();
}

export async function getGraph(bookId?: string): Promise<GraphData> {
  const url = bookId
    ? `${API_BASE}/api/books/graph/full?book_id=${encodeURIComponent(bookId)}`
    : `${API_BASE}/api/books/graph/full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to get graph: ${res.statusText}`);
  return res.json();
}

export interface AnswerPartData {
  text: string;
  index: number;
  is_last: boolean;
  citations: Citation[];
  sources: unknown[];
  conversation_id: string;
  reactions_stored: unknown[];
}

export interface StreamCallbacks {
  onThinkingStep: (step: ThinkingStep) => void;
  onThinkingDone: (process: ThinkingProcess) => void;
  onAnswer: (data: { text: string; conversation_id: string; sources: unknown[] }) => void;
  onAnswerPart?: (data: AnswerPartData) => void;
  onError?: (error: Error) => void;
}

export async function streamChat(
  message: string,
  conversationId: string | null,
  callbacks: StreamCallbacks,
  bookIds?: string[],
  history?: { role: string; content: string }[]
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      book_ids: bookIds,
      history: history || [],
    }),
  });

  if (!res.ok) {
    callbacks.onError?.(new Error(`Chat failed: ${res.statusText}`));
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";
  let eventType = "";
  let eventData = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        eventData += line.slice(6);
      } else if (line === "") {
        if (eventType && eventData) {
          try {
            const parsed = JSON.parse(eventData);
            switch (eventType) {
              case "thinking_step":
                callbacks.onThinkingStep(parsed);
                break;
              case "thinking_done":
                callbacks.onThinkingDone(parsed);
                break;
              case "answer_part":
                callbacks.onAnswerPart?.(parsed);
                break;
              case "answer":
                callbacks.onAnswer(parsed);
                break;
            }
          } catch {
            // skip malformed events
          }
        }
        eventType = "";
        eventData = "";
      }
    }
  }
}
