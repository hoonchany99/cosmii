"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BrainCanvas3D } from "@/components/brain-canvas-3d";
import { BookDetailPanel } from "@/components/book-detail-panel";
import { ChatInput } from "@/components/chat-input";
import { getGraph } from "@/lib/api";
import { getBookColorById } from "@/lib/colors";
import type { BookInfo, UploadingBook, GraphData } from "@/lib/types";

interface BrainViewProps {
  books: BookInfo[];
  uploadingBooks: UploadingBook[];
  onStartChat: (bookIds: string[], firstMessage: string) => void;
  onUpload: (file: File) => void;
  onDeleteBook: (bookId: string) => void;
  onRefreshBooks: () => void;
}

export function BrainView({
  books,
  uploadingBooks,
  onStartChat,
  onUpload,
  onDeleteBook,
  onRefreshBooks,
}: BrainViewProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    getGraph().then(setGraphData).catch(() => {});
  }, [books]);

  const selectedBook = books.find((b) => b.book_id === selectedBookId) ?? null;

  const handleSend = useCallback(
    (message: string) => {
      const bookIds = selectedBookId
        ? [selectedBookId]
        : books.map((b) => b.book_id);
      onStartChat(bookIds, message);
    },
    [selectedBookId, books, onStartChat],
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
      e.target.value = "";
    },
    [onUpload],
  );

  const handleDeleted = useCallback(() => {
    setSelectedBookId(null);
    onDeleteBook(selectedBookId!);
    onRefreshBooks();
  }, [selectedBookId, onDeleteBook, onRefreshBooks]);

  const placeholder = selectedBookId
    ? `Ask about "${selectedBook?.title}"…`
    : books.length > 0
      ? "Ask about your books…"
      : "Add a book first to start chatting";

  return (
    <div className="relative h-full flex flex-col bg-[#0a0a1a]">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.epub,.txt,.md"
        onChange={handleFileChange}
      />

      <div className="flex-1 relative min-h-0 overflow-hidden">
        <div className="absolute inset-0">
          {mounted && (
            <BrainCanvas3D
              books={books}
              uploadingBooks={uploadingBooks}
              selectedBookId={selectedBookId}
              onSelectBook={setSelectedBookId}
              onUploadClick={handleUploadClick}
            />
          )}
        </div>

        <AnimatePresence>
          {selectedBook && (
            <BookDetailPanel
              book={selectedBook}
              color={getBookColorById(selectedBook.book_id)}
              graphData={graphData}
              onClose={() => setSelectedBookId(null)}
              onChat={() => {
                onStartChat([selectedBook.book_id], "");
              }}
              onDeleted={handleDeleted}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex-shrink-0 border-t border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto w-full px-4 py-3">
          <ChatInput
            onSend={handleSend}
            disabled={books.length === 0 && uploadingBooks.length === 0}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}
