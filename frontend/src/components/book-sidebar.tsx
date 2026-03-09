"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Loader2, Check, AlertCircle, Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBookColorById } from "@/lib/colors";
import { UPLOAD_STAGE_LABELS, UPLOAD_STAGES } from "@/lib/types";
import type { BookInfo, UploadingBook } from "@/lib/types";

interface BookSidebarProps {
  books: BookInfo[];
  uploadingBooks: UploadingBook[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onUpload: (file: File) => void;
  onDeleteBook: (bookId: string) => void;
}

const listItem = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, x: 0, scale: 1,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 24 },
  }),
  exit: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
};

export function BookSidebar({
  books, uploadingBooks, selectedBookId, onSelectBook, onUpload, onDeleteBook,
}: BookSidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  const handleDelete = async (bookId: string) => {
    setDeletingId(bookId);
    try { await onDeleteBook(bookId); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div
      className="w-[240px] flex-shrink-0 h-full flex flex-col border-r border-white/8 bg-[#0a0a1a]/80 backdrop-blur-xl overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input ref={fileRef} type="file" className="hidden" accept=".pdf,.epub,.txt,.md" onChange={handleFile} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary/5 backdrop-blur-sm border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <Upload className="w-8 h-8 text-primary/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-primary/80">Drop here</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-7 flex-shrink-0 flex items-center justify-center"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            <img src="/cosmii-logo.png" alt="Cosmii" className="w-full h-auto" />
          </motion.div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-white">Cosmii</h1>
            <p className="text-xs text-white/40">AI Reading Companion</p>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/8" />

      {/* Section label */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-white/30 uppercase tracking-widest">Library</span>
        <span className="text-[12px] text-white/20">{books.length}</span>
      </div>

      {/* Book list */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 scrollbar-thin">
        <div className="space-y-0.5 pb-2">
          <AnimatePresence initial={false} mode="popLayout">
            {books.map((book, i) => {
              const color = getBookColorById(book.book_id);
              const isActive = book.book_id === selectedBookId;
              return (
                <motion.div
                  key={book.book_id}
                  custom={i}
                  variants={listItem}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="group relative"
                >
                  <Tooltip delayDuration={600}>
                    <TooltipTrigger asChild>
                      <button
                        className={`w-full flex items-center gap-2.5 pl-3 pr-8 py-2.5 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? "bg-white/8 ring-1 ring-white/10"
                            : "hover:bg-white/5"
                        }`}
                        onClick={() => onSelectBook(isActive ? null : book.book_id)}
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                          animate={{
                            scale: isActive ? [1, 1.3, 1] : 1,
                            boxShadow: isActive ? `0 0 8px ${color}40` : "none",
                          }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-[13px] font-medium truncate transition-colors duration-200 ${isActive ? "text-white" : "text-white/60"}`}>
                            {book.title}
                          </div>
                          {book.author !== "Unknown" && (
                            <div className="text-[11px] text-white/30 truncate">{book.author}</div>
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      <p className="font-medium text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author !== "Unknown" ? `${book.author} · ` : ""}{book.total_chunks} chunks</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Delete area */}
                  <AnimatePresence>
                    {confirmId === book.book_id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-[#0e0e20] border border-white/10 rounded-lg shadow-lg px-0.5 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(book.book_id)} disabled={deletingId === book.book_id}>
                          {deletingId === book.book_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-white/10 text-white/50" onClick={() => setConfirmId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ) : (
                      <Button variant="ghost" size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => { e.stopPropagation(); setConfirmId(book.book_id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Uploading */}
            {uploadingBooks.map((u) => {
              const p = u.progress;
              const stageIdx = p ? UPLOAD_STAGES.indexOf(p.stage) : 0;
              const pct = p ? Math.round(((stageIdx + (p.total > 0 ? p.current / p.total : 0)) / UPLOAD_STAGES.length) * 100) : 0;
              const isError = p?.stage === "error";
              return (
                <motion.div
                  key={u.tempId}
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  layout
                  className="px-3 py-3 rounded-xl bg-white/5 border border-white/8"
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={isError ? {} : { rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      {isError
                        ? <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        : <Loader2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate text-white/50">
                        {u.filename.replace(/\.[^.]+$/, "")}
                      </div>
                      <div className="text-[11px] text-white/30">
                        {p ? (isError ? p.message : UPLOAD_STAGE_LABELS[p.stage]) : "Preparing…"}
                      </div>
                    </div>
                    {!isError && <span className="text-[11px] font-mono text-indigo-400/60">{pct}%</span>}
                  </div>
                  {!isError && (
                    <div className="mt-2">
                      <Progress value={pct} className="h-[3px]" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {books.length === 0 && uploadingBooks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-10 px-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-10 h-10 mx-auto text-white/10 mb-3" />
              </motion.div>
              <p className="text-sm text-white/25 leading-relaxed">
                No books added yet<br />
                Add a book below to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-white/8" />

      {/* Upload button */}
      <div className="p-3">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full gap-2 text-sm h-9 rounded-xl border-dashed border-white/15 hover:border-indigo-400/30 hover:bg-indigo-400/5 text-white/50 hover:text-white/70 transition-all duration-200"
            onClick={() => fileRef.current?.click()}
          >
            <Plus className="w-3.5 h-3.5" /> Add Book
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
