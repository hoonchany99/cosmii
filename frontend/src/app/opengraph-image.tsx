import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cosmii — AI Reading Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Stars */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexWrap: "wrap",
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                borderRadius: "50%",
                background: "#fff",
                left: `${(i * 31) % 100}%`,
                top: `${(i * 17 + 13) % 100}%`,
              }}
            />
          ))}
        </div>

        {/* Logo placeholder (comma shape) */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6ee7b7, #34d399)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 0 60px rgba(110, 231, 183, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: 72,
              color: "#065f46",
              fontWeight: 700,
              lineHeight: 1,
              marginTop: -8,
            }}
          >
            ,
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Cosmii
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          An AI reading companion that truly understands books
        </div>

        {/* Tag line */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["Knowledge Graph", "Cognitive Loop", "Multi-Book RAG"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#cbd5e1",
                  fontSize: 16,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
