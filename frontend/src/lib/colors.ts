export const BOOK_PALETTE = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
];

export const NODE_TYPE_COLORS: Record<string, string> = {
  Person: "#3b82f6",
  Concept: "#8b5cf6",
  Event: "#f59e0b",
  Strategy: "#10b981",
  Place: "#ec4899",
  Book: "#6366f1",
};

export function getBookColor(index: number): string {
  return BOOK_PALETTE[index % BOOK_PALETTE.length];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getBookColorById(bookId: string): string {
  return BOOK_PALETTE[hashString(bookId) % BOOK_PALETTE.length];
}
