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

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const book = await readBook((await params).id);
  if (!book) notFound();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#060612",
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
          Cosmii에서 읽기
        </a>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 16 }}>
          고전을 읽는 가장 쉬운 방법 · 매일 세 장 무료
        </p>
      </div>
    </main>
  );
}
