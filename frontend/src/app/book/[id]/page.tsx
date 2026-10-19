// A book's page on the web, which is where a shared link lands.
//
// Two readers arrive here. One has Cosmii installed: iOS matches the address
// against the app's associated domain and opens the book in the app, and this
// page is never drawn for them. The other has not, and gets what the link
// promised - the cover, the title, what the book is - and a way to install.
//
// Apple does not carry the address through an install, so the second reader
// opens Cosmii at its front door, not at this book. Carrying it would need a
// measurement partner, which is a separate decision.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase-server";

const APP_STORE = "https://apps.apple.com/kr/app/apple-store/id6812843004?pt=129389248&ct=share_book&mt=8";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  color: string | null;
};

async function readBook(id: string): Promise<Book | null> {
  try {
    const { data } = await getServiceClient()
      .from("books")
      .select("id, title, author, description, color")
      .eq("id", id)
      .maybeSingle();
    return (data as Book | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const book = await readBook((await params).id);
  if (!book) return { title: "Cosmii" };
  // What a messaging app shows when the link is pasted: the book, not the app.
  const title = `『${book.title}』 — ${book.author}`;
  const description = book.description ?? "고전을 읽는 가장 쉬운 방법, Cosmii.";
  return {
    title,
    description,
    openGraph: { title, description, type: "book" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * A night sky behind the book, drawn with gradients rather than loaded as a
 * picture. The positions come from the book's own id, so a book's sky is
 * always the same sky, and no file has to be shipped for it.
 */
function starfield(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  const next = () => {
    h = (h * 1103515245 + 12345) % 2147483648;
    return h / 2147483648;
  };
  const stars: string[] = [];
  for (let i = 0; i < 90; i++) {
    const x = (next() * 100).toFixed(2);
    const y = (next() * 100).toFixed(2);
    const r = (next() * 1.2 + 0.5).toFixed(2);
    const a = (next() * 0.5 + 0.18).toFixed(2);
    stars.push(`radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(255,255,255,${a}) 50%, transparent 51%)`);
  }
  // Two faint clouds of colour, so the sky is not a flat black with dots in it.
  stars.push("radial-gradient(900px 520px at 18% 12%, rgba(90,80,170,0.16), transparent 70%)");
  stars.push("radial-gradient(760px 480px at 86% 88%, rgba(60,110,140,0.13), transparent 70%)");
  return stars.join(", ");
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const book = await readBook((await params).id);
  if (!book) notFound();
  const sky = starfield(book.id);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#060612",
        backgroundImage: sky,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        {/* Cosmii's own cover art, the same files the app carries. The book's
            colour stands behind it for the case where one is missing. */}
        <div
          style={{
            width: 180,
            height: 270,
            margin: "0 auto 28px",
            borderRadius: 4,
            background: book.color ?? "#2A2433",
            backgroundImage: `url(/covers/${book.id}.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>{book.title}</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.64)", margin: "0 0 22px" }}>{book.author}</p>
        {book.description && (
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.7)", margin: "0 0 32px" }}>
            {book.description}
          </p>
        )}
        <a
          href={APP_STORE}
          style={{
            display: "block",
            background: "#fff",
            color: "#0b0b18",
            fontSize: 17,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 14,
            padding: "15px 24px",
          }}
        >
          <span style={{ fontFamily: "var(--font-serif), 'EB Garamond', Georgia, serif", fontWeight: 700 }}>Cosmii</span>
          에서 읽기
        </a>
      </div>
    </main>
  );
}
