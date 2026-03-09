"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  BookOpen,
  Trash2,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadBookWithProgress, listBooks, getModelCard, deleteBook } from "@/lib/api";
import type { BookInfo, BookModelCard, UploadProgress, UploadStage } from "@/lib/types";
import { UPLOAD_STAGES, UPLOAD_STAGE_LABELS } from "@/lib/types";

function formatDuration(ms: number): string {
  if (ms < 1000) return "< 1s";
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min < 60) return `${min}m ${sec}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function stageIndex(stage: UploadStage): number {
  const idx = UPLOAD_STAGES.indexOf(stage);
  return idx >= 0 ? idx : -1;
}

function UploadProgressPanel({ progress, filename }: { progress: UploadProgress; filename: string }) {
  const currentIdx = stageIndex(progress.stage);
  const isError = progress.stage === "error";
  const isComplete = progress.stage === "complete";

  const overallCompleted = isComplete
    ? UPLOAD_STAGES.length
    : currentIdx >= 0
      ? currentIdx + (progress.status === "complete" ? 1 : 0)
      : 0;
  const overallPct = Math.round((overallCompleted / UPLOAD_STAGES.length) * 100);

  const stageHasItems = progress.total > 0;
  const stagePct = stageHasItems
    ? Math.min(100, Math.round((progress.current / progress.total) * 100))
    : progress.status === "complete"
      ? 100
      : 0;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : isError ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            <span className="font-semibold text-sm">
              {isComplete ? "Upload Complete" : isError ? "Upload Failed" : "Processing…"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{overallPct}%</span>
        </div>

        {/* Overall progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete ? "bg-green-500" : isError ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${overallPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]">{filename}</span>
          <div className="flex items-center gap-3">
            {progress.pipeline_elapsed_ms > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(progress.pipeline_elapsed_ms)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage details */}
      <div className="px-5 py-3 space-y-1">
        {UPLOAD_STAGES.map((stage, idx) => {
          const isCurrent = stage === progress.stage && progress.status !== "complete";
          const isDone = idx < currentIdx || (idx === currentIdx && progress.status === "complete") || isComplete;
          const isPending = !isDone && !isCurrent;

          return (
            <div
              key={stage}
              className={`flex items-center gap-3 py-1.5 rounded-md px-2 transition-colors ${
                isCurrent ? "bg-primary/5" : ""
              }`}
            >
              <div className="w-5 flex justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      isCurrent
                        ? "font-medium text-foreground"
                        : isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {UPLOAD_STAGE_LABELS[stage]}
                  </span>

                  {isCurrent && stageHasItems && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {progress.current}/{progress.total}
                    </span>
                  )}
                </div>

                {/* Per-stage progress bar when active */}
                {isCurrent && stageHasItems && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${stagePct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDuration(progress.elapsed_ms)}
                      </span>
                      {progress.avg_ms_per_item > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" />
                          ~{formatDuration(progress.avg_ms_per_item)}/item
                        </span>
                      )}
                      {progress.estimated_remaining_ms > 0 && progress.current > 0 && (
                        <span>
                          ~{formatDuration(progress.estimated_remaining_ms)} left
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {isPending && <div />}
              </div>
            </div>
          );
        })}
      </div>

      {isError && progress.message && (
        <div className="px-5 pb-4">
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
            {progress.message}
          </div>
        </div>
      )}
    </div>
  );
}

export function BookUpload({ onBooksChanged }: { onBooksChanged?: () => void }) {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadFilename, setUploadFilename] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<BookModelCard | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBooks = useCallback(async () => {
    try {
      const data = await listBooks();
      setBooks(data);
      setLoaded(true);
    } catch {
      // API not available yet
    }
  }, []);

  if (!loaded) {
    loadBooks();
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(null);
    setUploadFilename(file.name);

    try {
      await uploadBookWithProgress(file, (p) => {
        setUploadProgress(p);
        if (p.stage === "error") {
          setUploadError(p.message || "Unknown error");
        }
      });
      await loadBooks();
      onBooksChanged?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setUploadError(`Upload failed: ${msg}`);
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (bookId: string) => {
    setDeletingId(bookId);
    try {
      await deleteBook(bookId);
      setConfirmDeleteId(null);
      if (selectedCard?.book_id === bookId) setSelectedCard(null);
      await loadBooks();
      onBooksChanged?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setUploadError(`Delete failed: ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewCard = async (bookId: string) => {
    try {
      const card = await getModelCard(bookId);
      setSelectedCard(card);
    } catch {
      console.error("Failed to load model card");
    }
  };

  const showProgress = uploading || (uploadProgress && uploadProgress.stage === "complete");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Books</h2>
          <p className="text-sm text-muted-foreground">
            Upload a PDF, EPUB, or text file
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.epub,.txt,.md"
            onChange={handleUpload}
          />
          <Button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Processing…" : "Upload Book"}
          </Button>
        </div>
      </div>

      {showProgress && uploadProgress && (
        <UploadProgressPanel progress={uploadProgress} filename={uploadFilename} />
      )}

      {uploadError && !uploadProgress && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {books.length === 0 && !uploading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No books uploaded yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {books.map((book) => (
            <Card key={book.book_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{book.title}</CardTitle>
                  </div>
                  {book.domain && (
                    <Badge variant="secondary" className="text-xs">
                      {book.domain}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    {book.total_chunks} chunks
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCard(book.book_id)}
                    >
                      Model Card
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmDeleteId(book.book_id)}
                      disabled={deletingId === book.book_id}
                    >
                      {deletingId === book.book_id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {confirmDeleteId === book.book_id && (
                  <div className="mt-3 p-3 rounded-md border border-destructive/30 bg-destructive/5">
                    <p className="text-xs text-destructive mb-2">
                      Delete &quot;{book.title}&quot;? This will remove all RAG data, graph, and model card.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => handleDelete(book.book_id)}
                        disabled={deletingId === book.book_id}
                      >
                        {deletingId === book.book_id ? "Deleting…" : "Delete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCard && (
        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedCard.title} — Model Card
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCard(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Core Thesis</h4>
              <p className="text-muted-foreground">{selectedCard.core_thesis}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Key Principles</h4>
              <ul className="list-disc list-inside text-muted-foreground">
                {selectedCard.key_principles.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Worldview</h4>
              <p className="text-muted-foreground">{selectedCard.worldview}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Author Bias / Limitations</h4>
              <p className="text-muted-foreground">{selectedCard.author_bias}</p>
            </div>
            {selectedCard.key_metaphors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Key Metaphors</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCard.key_metaphors.map((m, i) => (
                    <Badge key={i} variant="outline">{m}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
