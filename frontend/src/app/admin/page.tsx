"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, BookOpen, Trash2, Sparkles, RefreshCw,
  Check, AlertCircle, Loader2, ChevronDown,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Book {
  id: string;
  title: string;
  author: string;
  color: string;
  total_chunks: number;
  created_at: string;
}

interface LessonSummary {
  id: string;
  title: string;
  order_index: number;
  lesson_type: string;
}

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [lessonProgress, setLessonProgress] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [bookLessons, setBookLessons] = useState<Record<string, LessonSummary[]>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/books`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error("Failed to fetch books:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.[^.]+$/, ""));

    setUploadProgress("Uploading...");

    try {
      const res = await fetch(`${API}/admin/books/upload`, {
        method: "POST",
        body: form,
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setUploadProgress(data.message || data.status || "Processing...");
              if (data.status === "processed" || data.book_id) {
                setUploadProgress(null);
                fetchBooks();
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setUploadProgress("Upload failed");
      setTimeout(() => setUploadProgress(null), 3000);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Delete this book and all its lessons?")) return;
    try {
      await fetch(`${API}/admin/books/${bookId}`, { method: "DELETE" });
      fetchBooks();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleGenerateLessons = async (bookId: string) => {
    setLessonProgress(`Generating lessons for ${bookId}...`);
    try {
      const res = await fetch(`${API}/admin/books/${bookId}/generate-lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions_per_chapter: 3, dialogue_parts_per_session: 6, quizzes_per_session: 2 }),
      });

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.lessons_generated) {
                setLessonProgress(`Generated ${data.lessons_generated} lessons`);
              }
              if (data.status === "complete") {
                setLessonProgress(null);
                fetchBookLessons(bookId);
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Lesson generation failed:", e);
      setLessonProgress("Generation failed");
      setTimeout(() => setLessonProgress(null), 3000);
    }
  };

  const fetchBookLessons = async (bookId: string) => {
    try {
      const res = await fetch(`${API}/admin/books/${bookId}/lessons`);
      const data = await res.json();
      setBookLessons(prev => ({ ...prev, [bookId]: data }));
    } catch (e) {
      console.error("Failed to fetch lessons:", e);
    }
  };

  const toggleExpand = (bookId: string) => {
    if (expandedBook === bookId) {
      setExpandedBook(null);
    } else {
      setExpandedBook(bookId);
      if (!bookLessons[bookId]) fetchBookLessons(bookId);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cosmii Admin</h1>
            <p className="text-white/40 mt-2">Manage books, generate lessons</p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.txt"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={!!uploadProgress}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
            >
              {uploadProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploadProgress || "Upload Book"}
            </button>
          </div>
        </div>

        {/* Status banners */}
        <AnimatePresence>
          {lessonProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3"
            >
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-indigo-300">{lessonProgress}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book list */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-white/30" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/30">
            <BookOpen className="w-12 h-12 mb-4" />
            <p className="text-lg">No books yet</p>
            <p className="text-sm mt-1">Upload a PDF, EPUB, or text file to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <motion.div
                key={book.id}
                layout
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden"
              >
                <div className="p-5 flex items-center gap-4">
                  {/* Color dot */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: book.color,
                      boxShadow: `0 0 12px ${book.color}60`,
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{book.title}</h3>
                    <p className="text-white/40 text-sm">{book.author || "Unknown author"} · {book.total_chunks} chunks</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateLessons(book.id)}
                      className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      title="Generate lessons"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleExpand(book.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/80 transition-colors"
                      title="View lessons"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedBook === book.id ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: lessons list */}
                <AnimatePresence>
                  {expandedBook === book.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-5 space-y-2">
                        {!bookLessons[book.id] ? (
                          <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading lessons...
                          </div>
                        ) : bookLessons[book.id].length === 0 ? (
                          <div className="text-white/30 text-sm py-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            No lessons yet. Click
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            to generate.
                          </div>
                        ) : (
                          bookLessons[book.id].map((lesson, i) => (
                            <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-white/20 text-xs font-mono w-6">{String(i + 1).padStart(2, "0")}</span>
                              <span className="text-white/70 text-sm flex-1 truncate">{lesson.title}</span>
                              <Check className="w-3 h-3 text-emerald-400/40" />
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
