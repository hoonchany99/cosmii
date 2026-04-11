import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Cosmii — 좋아하는 책을, 이번엔 끝까지";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/nanumgothic/v26/PN_oRfi-oW3hYwmKDpxS7F_LQv37zg.ttf",
  );
  return res.arrayBuffer();
}

async function loadSerifFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/ebgaramond/v32/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-DPNUAw.ttf",
  );
  return res.arrayBuffer();
}

async function loadImage() {
  const buf = await readFile(join(process.cwd(), "public", "cosmii-logo.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export default async function OGImage() {
  const [fontData, serifFontData, imageSrc] = await Promise.all([
    loadFont(),
    loadSerifFont(),
    loadImage(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#060612",
          fontFamily: "NanumGothic, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            marginLeft: -300,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(110,220,180,0.10) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -250,
            left: "50%",
            marginLeft: -350,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Stars */}
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

        {/* Cosmii character */}
        <img
          src={imageSrc}
          width={160}
          height={160}
          style={{ objectFit: "contain", marginBottom: 16 }}
        />

        {/* Cosmii logo text */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "EBGaramond, serif",
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.01em",
            marginBottom: 16,
            display: "flex",
          }}
        >
          Cosmii
        </div>

        {/* Oneliner */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            display: "flex",
          }}
        >
          읽고 싶었던 책, 이번엔 끝까지
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NanumGothic",
          data: fontData,
          style: "normal" as const,
          weight: 700,
        },
        {
          name: "EBGaramond",
          data: serifFontData,
          style: "normal" as const,
          weight: 700,
        },
      ],
    },
  );
}
