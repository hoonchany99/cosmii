// The card a messaging app draws when someone pastes a shared book. Without
// it the link arrives as a title and a line of grey text, which is not what
// anyone means by sharing a book.
//
// The cover is Cosmii's own art, published here beside the app's copy of it.
// `books.cover_url` is not used: those point at publishers' own cover images
// on their own sites, which are theirs and not ours to put on a card.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const alt = "Cosmii에서 읽고 있는 책";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/nanumgothic/v26/PN_oRfi-oW3hYwmKDpxS7F_LQv37zg.ttf",
  );
  return res.arrayBuffer();
}

/** The face the Cosmii wordmark is always set in, in the app and here. */
async function loadWordmarkFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-DPNUAw.ttf",
  );
  return res.arrayBuffer();
}

/** The book's cover, or nothing - a book whose art is missing keeps its colour. */
async function loadCover(id: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", "covers", `${id}.jpg`));
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function BookOGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let title = "Cosmii";
  let author = "";
  let color = "#2A2433";
  try {
    const { data } = await getServiceClient()
      .from("books")
      .select("title, author, color")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      title = (data as { title: string }).title;
      author = (data as { author: string }).author ?? "";
      color = (data as { color: string | null }).color ?? color;
    }
  } catch {
    // The card is drawn either way; a book that cannot be read is still a link.
  }
  const [fontData, wordmarkData, cover] = await Promise.all([loadFont(), loadWordmarkFont(), loadCover(id)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 90px",
          background: "#060612",
          fontFamily: "Nanum",
        }}
      >
        <div
          style={{
            width: 300,
            height: 450,
            borderRadius: 6,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} width={300} height={450} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ fontSize: 44, fontWeight: 700, color: "#0b0b18", textAlign: "center", lineHeight: 1.25 }}>
              {title}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.64)", marginTop: 14 }}>{author}</div>
          {/* The app signs the card: its name in the wordmark face it is
              always set in, and the line that stands beside that name on the
              App Store - the same line the shared message carries. */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 52 }}>
            <div style={{ fontFamily: "Wordmark", fontSize: 54, color: "#e8c77b", lineHeight: 1.1 }}>Cosmii</div>
            <div style={{ fontSize: 26, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>고전을 읽는 가장 쉬운 방법</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nanum", data: fontData, style: "normal", weight: 700 },
        { name: "Wordmark", data: wordmarkData, style: "normal", weight: 700 },
      ],
    },
  );
}
