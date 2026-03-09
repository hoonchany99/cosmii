"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MainContent } from "@/components/main-content";
import { listBooks, getGraph, uploadBookWithProgress, deleteBook, updateBook } from "@/lib/api";
import type { BookInfo, UploadingBook, UploadProgress, GraphData } from "@/lib/types";
import { UPLOAD_STAGE_LABELS, type UploadStage } from "@/lib/types";

export default function UniversePage() {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [uploadingBooks, setUploadingBooks] = useState<UploadingBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [celebrateDance, setCelebrateDance] = useState(false);
  const [selectedUploadingId, setSelectedUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const refreshBooks = useCallback(async () => {
    try { setBooks(await listBooks()); } catch { /* API not ready */ }
  }, []);

  const refreshGraph = useCallback(async (bookId?: string) => {
    try { setGraphData(await getGraph(bookId)); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshBooks();
    refreshGraph();
  }, [refreshBooks, refreshGraph]);

  useEffect(() => {
    if (selectedBookId) {
      refreshGraph(selectedBookId);
    } else {
      refreshGraph();
    }
  }, [selectedBookId, refreshGraph]);

  const handleUpload = useCallback((file: File) => {
    const tempId = `uploading-${Date.now()}`;
    const entry: UploadingBook = { tempId, filename: file.name, progress: null };
    setUploadingBooks((prev) => [...prev, entry]);

    uploadBookWithProgress(file, (p: UploadProgress) => {
      setUploadingBooks((prev) =>
        prev.map((u) => (u.tempId === tempId ? { ...u, progress: p } : u)),
      );
      if (p.stage === "complete") {
        setCelebrateDance(true);
        setTimeout(() => setCelebrateDance(false), 3500);
      }
      if (p.stage === "complete" || p.stage === "error") {
        setTimeout(async () => {
          await Promise.all([refreshBooks(), refreshGraph()]);
          setUploadingBooks((prev) => prev.filter((u) => u.tempId !== tempId));
        }, 1500);
      }
    }).catch((err) => {
      console.error("[BookMind] Upload stream error:", err);
      const errorProgress: UploadProgress = {
        stage: "error",
        status: "error",
        current: 0,
        total: 0,
        elapsed_ms: 0,
        avg_ms_per_item: 0,
        estimated_remaining_ms: 0,
        pipeline_elapsed_ms: 0,
        message: "Upload failed — please try again",
      };
      setUploadingBooks((prev) =>
        prev.map((u) => (u.tempId === tempId ? { ...u, progress: errorProgress } : u)),
      );
      setTimeout(() => {
        setUploadingBooks((prev) => prev.filter((u) => u.tempId !== tempId));
      }, 4000);
    });
  }, [refreshBooks, refreshGraph]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDeleteBook = useCallback(async (bookId: string) => {
    try {
      await deleteBook(bookId);
      if (selectedBookId === bookId) setSelectedBookId(null);
      await refreshBooks();
      await refreshGraph();
    } catch { /* ignore */ }
  }, [selectedBookId, refreshBooks, refreshGraph]);

  const handleRenameBook = useCallback(async (bookId: string, title: string) => {
    try {
      await updateBook(bookId, { title });
      setBooks((prev) => prev.map((b) => b.book_id === bookId ? { ...b, title } : b));
    } catch { /* ignore */ }
  }, []);

  const handleSelectBook = useCallback((bookId: string | null) => {
    setSelectedBookId(bookId);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050510] relative">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.epub,.txt,.md"
        onChange={handleFileChange}
      />

      {/* Full-screen main content (canvas + panels + chat) */}
      <MainContent
        books={books}
        uploadingBooks={uploadingBooks}
        selectedBookId={selectedBookId}
        selectedUploadingId={selectedUploadingId}
        graphData={graphData}
        onSelectBook={handleSelectBook}
        onSelectUploading={setSelectedUploadingId}
        onDeleteBook={handleDeleteBook}
        onRenameBook={handleRenameBook}
        onUpload={() => fileRef.current?.click()}
        triggerDance={celebrateDance}
        onSettingsChange={setSettingsOpen}
      />

      {/* ── Floating logo (top-left) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-5 left-5 z-30 flex items-center gap-2 pointer-events-none"
      >
        <span className="text-[22px] font-bold tracking-tight text-white/70">Cosmii</span>
      </motion.div>

      {/* ── Floating upload status ── */}
      <AnimatePresence>
        {uploadingBooks.length > 0 && !selectedBookId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex flex-col gap-1.5">
              {uploadingBooks.map((u) => {
                const p = u.progress;
                const stage = p?.stage as UploadStage | undefined;
                const label = stage ? (UPLOAD_STAGE_LABELS[stage] ?? stage) : "Preparing…";
                const isError = stage === "error";
                const isDone = stage === "complete";
                const total = p?.total ?? 0;
                const current = p?.current ?? 0;
                const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                const name = u.filename.replace(/\.[^.]+$/, "");
                const isActive = selectedUploadingId === u.tempId;
                return (
                  <button
                    key={u.tempId}
                    onClick={() => setSelectedUploadingId(isActive ? null : u.tempId)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-full backdrop-blur-md border text-[13px] font-medium shadow-lg shadow-black/30 transition-all duration-200 cursor-pointer ${
                      isError
                        ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        : isDone
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          : isActive
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
                            : "border-amber-500/20 bg-amber-500/5 text-amber-200/90 hover:bg-amber-500/10"
                    }`}
                  >
                    {!isDone && !isError && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                      </span>
                    )}
                    <span className="truncate max-w-[160px]">{name}</span>
                    <span className="text-white/40">·</span>
                    <span>{label}</span>
                    {total > 0 && !isDone && !isError && (
                      <span className="text-white/40">{pct}%</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Add Book button (top-right) ── */}
      <AnimatePresence>
        {!selectedBookId && !selectedUploadingId && !settingsOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
            className="fixed top-5 right-5 z-30 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[12px] font-medium text-white/60 hover:text-white hover:border-indigo-400/30 hover:bg-indigo-400/5 transition-all duration-200 shadow-lg shadow-black/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Book
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
