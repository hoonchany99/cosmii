interface BookConstellation {
  image: string;
  color: string;
  starDensity?: { edge: number; interior: number };
  edgeBold?: boolean;
}

const BOOK_CONSTELLATIONS: Record<string, BookConstellation> = {
  bc977bab: { image: "/constellations/demian-bird.jpg", color: "#6BC5A0" },
  "45b77580": { image: "/constellations/sapiens-evolution.png", color: "#e67e22" },
  e40c0e43: { image: "/constellations/divine-comedy-inferno.png", color: "#e74c3c" },
};

const FALLBACK: BookConstellation = {
  image: "/cosmii-constellation.png",
  color: "#6BC5A0",
};

export function getBookConstellation(bookId: string): BookConstellation {
  return BOOK_CONSTELLATIONS[bookId] ?? FALLBACK;
}
