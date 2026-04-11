import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cosmii — 좋아하는 책을, 이번엔 끝까지";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont() {
  const res = await fetch(
    "https://fonts.gstatic.com/s/nanumgothic/v26/PN_oRfi-oW3hYwmKDpxS7F_LQv37zg.ttf",
  );
  return res.arrayBuffer();
}

export default async function OGImage() {
  const fontData = await loadFont();

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

        {/* Cosmii character glow */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(110,231,183,0.15) 0%, transparent 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6ee7b7, #34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(110,231,183,0.3)",
            }}
          >
            <div
              style={{
                fontSize: 64,
                color: "#065f46",
                fontWeight: 700,
                lineHeight: 1,
                marginTop: -6,
                display: "flex",
              }}
            >
              ,
            </div>
          </div>
        </div>

        {/* Cosmii logo text */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.01em",
            marginBottom: 20,
            display: "flex",
          }}
        >
          Cosmii
        </div>

        {/* Oneliner */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "rgba(255,255,255,0.40)",
            letterSpacing: "-0.01em",
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
      ],
    },
  );
}
