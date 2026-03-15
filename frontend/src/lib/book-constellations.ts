interface BookConstellation {
  image: string;
  color: string;
}

const BOOK_CONSTELLATIONS: Record<string, BookConstellation> = {
  bc977bab: { image: "/constellations/demian-bird.jpg", color: "#6BC5A0" },
};

const FALLBACK: BookConstellation = {
  image: "/cosmii-constellation.png",
  color: "#6BC5A0",
};

export function getBookConstellation(bookId: string): BookConstellation {
  return BOOK_CONSTELLATIONS[bookId] ?? FALLBACK;
}
