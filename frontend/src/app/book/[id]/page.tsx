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
import { starfield } from "@/lib/cosmii-text";
import { bookNote } from "@/lib/book-notes";

// The app's four faces, named the way src/lib/theme.ts names them, so a line
// changed on one side can be matched on the other. IBM Plex Sans KR is what
// the reader operates; MaruBuri is what the reader reads; EB Garamond Bold is
// the wordmark and nothing else.
// Korean breaks at word boundaries, not between any two syllables: without
// this the browser wraps 「…낯설어진 너에게」 as 「너 / 에게」, which the app never
// does (its text sets lineBreakStrategyIOS="hangul-word"). `anywhere` is the
// escape hatch for a token with no break in it - a long URL or title - so
// keep-all cannot push one past the edge of the page.
const HANGUL = { wordBreak: "keep-all", overflowWrap: "anywhere" } as const;

const SANS = { fontFamily: "var(--font-app), 'IBM Plex Sans KR', sans-serif", fontWeight: 400 } as const;
const SANS_BOLD = { fontFamily: "var(--font-app), 'IBM Plex Sans KR', sans-serif", fontWeight: 600 } as const;
const READING = { fontFamily: "var(--font-reading), 'MaruBuri', Georgia, serif", fontWeight: 400 } as const;
const READING_BOLD = { fontFamily: "var(--font-reading), 'MaruBuri', Georgia, serif", fontWeight: 700 } as const;
const WORDMARK = { fontFamily: "var(--font-serif), 'EB Garamond', Georgia, serif", fontWeight: 700 } as const;

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
  // The line Cosmii wrote for whoever needs this book, where the blurb used
  // to be. A card that says "슬퍼해야 할 때 슬프지 않아서 당황한 너에게" is
  // read by the person it is addressed to; a plot summary is skipped.
  const description = bookNote(book.id) ?? book.description ?? "고전을 읽는 가장 쉬운 방법, Cosmii.";
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
  const sky = starfield(book.id);
  const note = bookNote(book.id);

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
      {/* Set like the book's page in the app: everything starts at the same
          left margin, so the eye goes down one edge instead of hunting the
          middle of each line. Centred, the cover floated and the note and the
          blurb were ragged on both sides. */}
      <div style={{ width: "100%", maxWidth: 420, textAlign: "left" }}>
        {/* The head of the page, set the way the app sets it: a small cover
            with the title and author standing beside it, not a poster with
            the title underneath. Cosmii's own cover art, the same files the
            app carries; the book's colour stands behind it for the case
            where one is missing. */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, margin: "0 0 22px" }}>
          <div
            style={{
              width: 96,
              height: 140,
              flexShrink: 0,
              borderRadius: 4,
              background: book.color ?? "#2A2433",
              backgroundImage: `url(/covers/${book.id}.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ ...SANS_BOLD, ...HANGUL, fontSize: 26, lineHeight: "34px", color: "#fff", margin: "0 0 6px" }}>{book.title}</h1>
            <p style={{ ...SANS, ...HANGUL, fontSize: 15, color: "rgba(255,255,255,0.6)", margin: 0 }}>{book.author}</p>
          </div>
        </div>
        {/* The rule the app draws under the head, before what the book is. */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "0 0 26px" }} />
        {note && (
          <>
            <p style={{ ...SANS, ...HANGUL, fontSize: 13, letterSpacing: "0.3px", color: "rgba(255,255,255,0.64)", margin: "0 0 10px" }}>
              <span style={WORDMARK}>Cosmii</span>의 한 줄
            </p>
            <p style={{ ...READING_BOLD, ...HANGUL, fontSize: 19, lineHeight: "30px", color: "#fff", margin: "0 0 26px" }}>{note}</p>
          </>
        )}
        {book.description && (
          <p style={{ ...READING, ...HANGUL, fontSize: 16, lineHeight: "27px", color: "rgba(255,255,255,0.7)", margin: "0 0 32px" }}>
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
            textAlign: "center",
          }}
        >
          <span style={WORDMARK}>Cosmii</span>
          <span style={SANS_BOLD}>에서 읽기</span>
        </a>
      </div>
    </main>
  );
}
