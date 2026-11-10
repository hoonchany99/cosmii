// The card a messaging app draws when someone shares their invitation
// (대표 TG 164: 「책 공유할때처럼」 - the link alone, the card says the rest).
// The app sends only the address now, so the gift is on the card. The code
// stays on the page itself (대표 TG 168: 카드에 코드는 없어도 돼, 글씨는 크게).
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Cosmii Premium 하루 이용권 선물";
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

async function loadMark() {
  const buf = await readFile(join(process.cwd(), "public", "landing", "mark-1024.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export default async function InviteCard() {
  const [fontData, wordmarkData, mark] = await Promise.all([loadFont(), loadWordmarkFont(), loadMark()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          background: "#060612",
          fontFamily: "NanumGothic, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "0 80px",
          gap: 64,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(242,200,110,0.10) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 1 + (i % 2),
                height: 1 + (i % 2),
                borderRadius: "50%",
                background: "#fff",
                opacity: 0.1 + (i % 4) * 0.04,
                left: `${(i * 23 + 7) % 100}%`,
                top: `${(i * 17 + 11) % 100}%`,
              }}
            />
          ))}
        </div>

        <img src={mark} alt="" width={220} height={220} style={{ objectFit: "contain", flexShrink: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              fontFamily: "EBGaramond, serif",
              color: "rgba(255,255,255,0.6)",
              marginBottom: 18,
              display: "flex",
            }}
          >
            Cosmii
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.3, display: "flex" }}>
            Premium 하루 이용권을
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff", lineHeight: 1.3, display: "flex" }}>
            선물 받았어요
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NanumGothic", data: fontData, style: "normal" as const, weight: 700 },
        { name: "EBGaramond", data: wordmarkData, style: "normal" as const, weight: 700 },
      ],
    },
  );
}
