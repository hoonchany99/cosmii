// The card a messaging app draws when someone pastes a shared book. Without
// it the link arrives as a title and a line of grey text, which is not what
// anyone means by sharing a book.
//
// The cover is drawn here rather than loaded: only a handful of the cover
// files are published to the web, while every book has a colour, so the card
// is set on the book's own colour and carries its title.
import { ImageResponse } from "next/og";
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
  const [fontData, wordmarkData] = await Promise.all([loadFont(), loadWordmarkFont()]);

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
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 700, color: "#0b0b18", textAlign: "center", lineHeight: 1.25 }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{title}</div>
          <div style={{ fontSize: 34, color: "rgba(255,255,255,0.64)", marginTop: 14 }}>{author}</div>
          {/* The app signs the card: its name in the wordmark face it is
              always set in, and the line the App Store carries under it. */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 48 }}>
            <div style={{ fontFamily: "Wordmark", fontSize: 40, color: "#e8c77b" }}>Cosmii</div>
            <div style={{ fontSize: 26, color: "rgba(255,255,255,0.5)" }}>하루 3분씩, 한 권을 끝까지</div>
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
