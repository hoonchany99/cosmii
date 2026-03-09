"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookGraph3D } from "@/components/book-graph-3d";
import { getModelCard, deleteBook } from "@/lib/api";
import type { BookInfo, BookModelCard, GraphData } from "@/lib/types";

interface BookDetailPanelProps {
  book: BookInfo;
  color: string;
  graphData: GraphData | null;
  onClose: () => void;
  onChat: () => void;
  onDeleted: () => void;
}

export function BookDetailPanel({
  book,
  color,
  graphData,
  onClose,
  onChat,
  onDeleted,
}: BookDetailPanelProps) {
  const [card, setCard] = useState<BookModelCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setLoading(true);
    setCard(null);
    setConfirmDelete(false);
    getModelCard(book.book_id)
      .then(setCard)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [book.book_id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(book.book_id);
      onDeleted();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="absolute right-0 top-0 bottom-0 w-[360px] bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-20 flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-sm truncate">{book.title}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 3D Graph */}
      <div className="h-[280px] flex-shrink-0 border-b border-border bg-slate-50 rounded-none">
        {mounted && graphData ? (
          <BookGraph3D graphData={graphData} bookId={book.book_id} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Model card (scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <div className="flex items-center gap-2">
            {book.domain && (
              <Badge variant="secondary" className="text-xs">
                {book.domain}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {book.total_chunks} chunks
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : card ? (
          <div className="space-y-4">
            <Section title="Core Thesis" content={card.core_thesis} />
            <Section title="Worldview" content={card.worldview} />
            <Section title="Author Bias" content={card.author_bias} />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Key Principles
              </h4>
              <ul className="space-y-1">
                {card.key_principles.map((p, i) => (
                  <li key={i} className="text-sm text-foreground/80 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {card.key_metaphors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Key Metaphors
                </h4>
                <div className="flex flex-wrap gap-1.5 max-w-full">
                  {card.key_metaphors.map((m, i) => (
                    <Badge key={i} variant="outline" className="text-xs max-w-full truncate">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Unable to load model card
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-3 space-y-2">
        <Button className="w-full" onClick={onChat}>
          <MessageSquare className="w-4 h-4 mr-2" />Chat with this book
        </Button>
        {confirmDelete ? (
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Confirm Delete
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-4 h-4 mr-2" />Delete
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {title}
      </h4>
      <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
    </div>
  );
}
