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
import { OutlineLink } from "@/components/editorial";

// Set from the Cosmii design system (globals.css @theme and type-* styles):
// the book's title, its note and its description are what a reader reads,
// so they are MaruBuri (book-title, note, description); the author and the
// labels are the interface face; the name Cosmii is the wordmark.
// Korean breaks at word boundaries, not between any two syllables: without
// this the browser wraps 「…낯설어진 너에게」 as 「너 / 에게」, which the app never
// does (its text sets lineBreakStrategyIOS="hangul-word"). `anywhere` is the
// escape hatch for a token with no break in it - a long URL or title - so
// keep-all cannot push one past the edge of the page.
const HANGUL = "break-keep [overflow-wrap:anywhere]";

const APP_STORE = "https://apps.apple.com/kr/app/apple-store/id6812843004?pt=129389248&ct=share_book&mt=8";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cosmii.vercel.app";

const bookUrl = (id: string) => `${SITE_URL}/book/${id}`;

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
  // Without this the page inherits the root layout's canonical, which points
  // at the front door, so every book page declares itself a copy of the home
  // page and none of them is indexed. These are the only pages Cosmii has
  // that answer a search for a particular book.
  const url = bookUrl(book.id);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "book", url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const book = await readBook((await params).id);
  if (!book) notFound();
  const sky = starfield(book.id);
  const note = bookNote(book.id);

  // The page's own schema. The root layout describes Cosmii the application,
  // which is true of every page and tells a search engine nothing about this
  // one. Only the original work is described here - its title, who wrote it,
  // the language it is read in - all of it long out of copyright. Cosmii's
  // own writing about the book is not part of the record.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    inLanguage: "ko",
    url: bookUrl(book.id),
    isPartOf: { "@type": "MobileApplication", name: "Cosmii", url: SITE_URL },
  };

  return (
    <main
      className="box-border flex min-h-dvh items-center justify-center bg-night px-gutter py-8 font-ui text-ink"
      style={{ backgroundImage: sky }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Set like the book's page in the app: everything starts at the same
          left margin, so the eye goes down one edge instead of hunting the
          middle of each line. Centred, the cover floated and the note and the
          blurb were ragged on both sides. */}
      <div className="w-full max-w-column text-left">
        {/* The head of the page, set the way the app sets it: a small cover
            with the title and author standing beside it, not a poster with
            the title underneath. Cosmii's own cover art, the same files the
            app carries; the book's colour stands behind it for the case
            where one is missing. */}
        <div className="mb-6 flex items-start gap-[18px]">
          <div
            className="h-[140px] w-24 shrink-0 rounded-[4px]"
            style={{ background: book.color ?? "#2A2433", backgroundImage: `url(/covers/${book.id}.jpg)`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="min-w-0">
            <h1 className={`type-book-title mb-1.5 text-white ${HANGUL}`}>{book.title}</h1>
            <p className={`type-meta text-ink-muted ${HANGUL}`}>{book.author}</p>
          </div>
        </div>
        {/* The rule the app draws under the head, before what the book is. */}
        <div className="mb-6 h-px bg-hairline" />
        {note && (
          <>
            <p className={`type-label mb-2.5 text-ink-70 ${HANGUL}`}>
              <span className="font-wordmark font-bold">Cosmii</span>의 한 줄
            </p>
            <p className={`type-note mb-6 text-white ${HANGUL}`}>{note}</p>
          </>
        )}
        {book.description && (
          <p className={`type-description mb-8 text-ink-70 ${HANGUL}`}>{book.description}</p>
        )}
        <OutlineLink href={APP_STORE}>
          <span>
            <span className="font-wordmark font-bold">Cosmii</span>에서 읽기
          </span>
        </OutlineLink>
      </div>
    </main>
  );
}
