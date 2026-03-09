"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, BookOpen, Eye, EyeOff } from "lucide-react";
import { getGraph } from "@/lib/api";
import type { BookInfo, GraphData } from "@/lib/types";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const NODE_COLORS: Record<string, string> = {
  Person: "#3b82f6",
  Concept: "#8b5cf6",
  Event: "#f59e0b",
  Strategy: "#10b981",
  Place: "#ec4899",
  Book: "#6366f1",
};

const BOOK_PALETTE = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
];

interface GraphViewProps {
  books: BookInfo[];
  enabledBooks: Set<string>;
  onToggleBook: (bookId: string) => void;
}

export function GraphView({ books, enabledBooks, onToggleBook }: GraphViewProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const graphRes = await getGraph();
      setGraphData(graphRes);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setDimensions({
          width: w,
          height: Math.max(500, window.innerHeight - 300),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      ro.disconnect();
    };
  }, []);

  const bookColorMap = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach((b, i) => map.set(b.book_id, BOOK_PALETTE[i % BOOK_PALETTE.length]));
    return map;
  }, [books]);

  const toggleAll = () => {
    books.forEach((b) => {
      const isOn = enabledBooks.has(b.book_id);
      const shouldBeOn = enabledBooks.size !== books.length;
      if (isOn !== shouldBeOn) onToggleBook(b.book_id);
    });
  };

  const filteredGraphData = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };

    const visibleNodes = graphData.nodes.filter((n) =>
      n.book_ids.some((bid) => enabledBooks.has(bid))
    );
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

    const nodes = visibleNodes.map((n) => {
      const primaryBook = n.book_ids.find((bid) => enabledBooks.has(bid)) || n.book_ids[0];
      return {
        ...n,
        val: n.book_ids.filter((bid) => enabledBooks.has(bid)).length > 1 ? 4 : 1.5,
        color: n.book_ids.filter((bid) => enabledBooks.has(bid)).length > 1
          ? "#ffffff"
          : bookColorMap.get(primaryBook) || NODE_COLORS[n.node_type] || "#94a3b8",
        isMultiBook: n.book_ids.filter((bid) => enabledBooks.has(bid)).length > 1,
        bookColors: n.book_ids
          .filter((bid) => enabledBooks.has(bid))
          .map((bid) => bookColorMap.get(bid) || "#94a3b8"),
      };
    });

    const links = graphData.edges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        relation: e.relation,
      }));

    return { nodes, links };
  }, [graphData, enabledBooks, bookColorMap]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Knowledge Graph</h2>
          <p className="text-sm text-muted-foreground">
            책에서 추출된 개념과 관계의 시각화
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">새로고침</span>
        </Button>
      </div>

      {books.length > 0 && (
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                책 필터
              </div>
              <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs h-7">
                {enabledBooks.size === books.length ? "전체 끄기" : "전체 켜기"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {books.map((book) => {
                const isOn = enabledBooks.has(book.book_id);
                const color = bookColorMap.get(book.book_id) || "#94a3b8";
                return (
                  <button
                    key={book.book_id}
                    onClick={() => onToggleBook(book.book_id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isOn
                        ? "text-white shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-transparent opacity-50"
                    }`}
                    style={isOn ? { backgroundColor: color, borderColor: color } : {}}
                  >
                    {isOn ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {book.title}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <Badge key={type} variant="outline" style={{ borderColor: color, color }}>
            {type}
          </Badge>
        ))}
        <Badge variant="outline" className="border-white text-foreground">
          ● 크로스북
        </Badge>
      </div>

      <Card ref={containerRef}>
        <CardContent className="p-0 overflow-hidden rounded-lg">
          {filteredGraphData.nodes.length > 0 ? (
            <ForceGraph2D
              graphData={filteredGraphData}
              width={dimensions.width}
              height={dimensions.height}
              nodeLabel={(node) => `${node.label} (${node.node_type})`}
              nodeColor={(node) => node.color || "#94a3b8"}
              nodeVal={(node) => node.val || 1}
              linkLabel={(link) => (link as Record<string, string>).relation}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={0.9}
              linkColor={() => "#d1d5db"}
              onNodeClick={(node) => setSelectedNode(node)}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.label as string;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const size = ((node.val as number) || 1) * 3;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const n = node as any;
                if (n.isMultiBook && n.bookColors?.length > 1) {
                  const colors = n.bookColors as string[];
                  const sliceAngle = (2 * Math.PI) / colors.length;
                  colors.forEach((c: string, i: number) => {
                    ctx.beginPath();
                    ctx.moveTo(node.x!, node.y!);
                    ctx.arc(node.x!, node.y!, size, sliceAngle * i, sliceAngle * (i + 1));
                    ctx.fillStyle = c;
                    ctx.fill();
                  });
                  ctx.beginPath();
                  ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 1.5 / globalScale;
                  ctx.stroke();
                } else {
                  ctx.beginPath();
                  ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
                  ctx.fillStyle = (node.color as string) || "#94a3b8";
                  ctx.fill();
                }

                if (globalScale > 0.8) {
                  ctx.fillStyle = "#1a1a1a";
                  ctx.fillText(label, node.x!, node.y! + size + fontSize);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              {loading
                ? "그래프 로딩 중..."
                : enabledBooks.size === 0
                  ? "책을 선택하세요"
                  : "아직 그래프 데이터가 없습니다"}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedNode && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedNode.label}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                닫기
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Badge style={{ backgroundColor: NODE_COLORS[selectedNode.node_type] || "#94a3b8" }}>
                {selectedNode.node_type}
              </Badge>
              {selectedNode.book_ids.map((bid: string) => {
                const book = books.find((b) => b.book_id === bid);
                const color = bookColorMap.get(bid) || "#94a3b8";
                return (
                  <Badge key={bid} variant="outline" style={{ borderColor: color, color }}>
                    {book?.title || bid}
                  </Badge>
                );
              })}
            </div>
            {selectedNode.book_ids.length > 1 && (
              <p className="text-muted-foreground">
                이 개념은 {selectedNode.book_ids.length}개 책에 걸쳐 등장합니다 (크로스북 연결)
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
