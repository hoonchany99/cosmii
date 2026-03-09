"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Brain } from "lucide-react";
import { BookNode } from "@/components/book-node";
import { getBookColorById } from "@/lib/colors";
import type { BookInfo, UploadingBook, GraphData } from "@/lib/types";

interface BrainCanvasProps {
  books: BookInfo[];
  uploadingBooks: UploadingBook[];
  selectedBookId: string | null;
  graphData: GraphData | null;
  onSelectBook: (bookId: string | null) => void;
  onUploadClick: () => void;
}

export function BrainCanvas({
  books,
  uploadingBooks,
  selectedBookId,
  graphData,
  onSelectBook,
  onUploadClick,
}: BrainCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setSize({ w, h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2 - 20;
  const radius = Math.min(size.w, size.h) * 0.32;

  const allNodes = useMemo(() => {
    const completed = books.map((b, i) => ({
      id: b.book_id,
      label: b.title,
      isUploading: false,
      progress: null as UploadingBook["progress"],
    }));
    const uploading = uploadingBooks.map((u, i) => ({
      id: u.tempId,
      label: u.filename.replace(/\.[^.]+$/, ""),
      isUploading: true,
      progress: u.progress,
    }));
    return [...completed, ...uploading];
  }, [books, uploadingBooks]);

  const getNodePos = useCallback(
    (index: number, total: number) => {
      if (total === 0) return { x: cx, y: cy - radius };
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    },
    [cx, cy, radius],
  );

  const selectedEntities = useMemo(() => {
    if (!selectedBookId || !graphData) return [];
    return graphData.nodes
      .filter((n) => n.book_ids.includes(selectedBookId))
      .slice(0, 20);
  }, [selectedBookId, graphData]);

  const selectedBookIdx = allNodes.findIndex((n) => n.id === selectedBookId);
  const selectedPos =
    selectedBookIdx >= 0
      ? getNodePos(selectedBookIdx, allNodes.length)
      : { x: cx, y: cy };

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && selectedBookId) {
        onSelectBook(null);
      }
    },
    [selectedBookId, onSelectBook],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onClick={handleBackgroundClick}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {allNodes.map((node, i) => {
          const pos = getNodePos(i, allNodes.length);
          const dimmed = selectedBookId && node.id !== selectedBookId;
          return (
            <motion.path
              key={`line-${node.id}`}
              d={`M ${cx} ${cy} Q ${(cx + pos.x) / 2} ${(cy + pos.y) / 2 - 30} ${pos.x} ${pos.y}`}
              stroke={getBookColorById(node.id)}
              strokeWidth={2}
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: dimmed ? 0.15 : node.isUploading ? 0.3 : 0.4,
              }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          );
        })}

        <AnimatePresence>
          {selectedBookId &&
            selectedEntities.map((entity, i) => {
              const entityAngle =
                ((i / Math.max(selectedEntities.length, 1)) * Math.PI * 1.2 -
                  Math.PI * 0.6) +
                Math.atan2(selectedPos.y - cy, selectedPos.x - cx);
              const entityRadius = radius * 0.45;
              const midX = (cx + selectedPos.x) / 2;
              const midY = (cy + selectedPos.y) / 2;
              const ex = midX + entityRadius * Math.cos(entityAngle);
              const ey = midY + entityRadius * Math.sin(entityAngle);

              return (
                <motion.g key={`entity-${entity.id}`}>
                  <motion.line
                    x1={selectedPos.x}
                    y1={selectedPos.y}
                    x2={ex}
                    y2={ey}
                    stroke={getBookColorById(selectedBookId!)}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                  />
                  <motion.circle
                    cx={ex}
                    cy={ey}
                    r={6}
                    fill={getBookColorById(selectedBookId!)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.7 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                  />
                  <motion.text
                    x={ex}
                    y={ey + 16}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 + 0.1 }}
                  >
                    {entity.label.length > 10
                      ? entity.label.slice(0, 10) + "..."
                      : entity.label}
                  </motion.text>
                </motion.g>
              );
            })}
        </AnimatePresence>
      </svg>

      {/* Brain node */}
      <motion.div
        className="absolute flex flex-col items-center gap-1 pointer-events-none"
        style={{ left: cx, top: cy, x: "-50%", y: "-50%" }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
        </motion.div>
        <span className="text-xs font-medium text-muted-foreground mt-1">
          Book-Mind
        </span>
      </motion.div>

      {/* Book nodes */}
      <AnimatePresence>
        {allNodes.map((node, i) => {
          const pos = getNodePos(i, allNodes.length);
          const dimmed = selectedBookId !== null && node.id !== selectedBookId;
          return (
            <motion.div
              key={node.id}
              className="absolute"
              style={{ left: pos.x, top: pos.y, x: "-50%", y: "-50%" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: dimmed ? 0.7 : 1,
                opacity: dimmed ? 0.3 : 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.08 }}
            >
              <BookNode
                label={node.label}
                color={getBookColorById(node.id)}
                isUploading={node.isUploading}
                progress={node.progress}
                isSelected={node.id === selectedBookId}
                onClick={() => {
                  if (!node.isUploading) {
                    onSelectBook(node.id === selectedBookId ? null : node.id);
                  }
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add book button */}
      <motion.button
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/80 backdrop-blur text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onUploadClick}
      >
        <Plus className="w-4 h-4" />Add Book
      </motion.button>
    </div>
  );
}
