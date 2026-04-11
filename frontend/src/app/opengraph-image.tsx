import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cosmii — 좋아하는 책을, 이번엔 끝까지";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const title = "좋아하는 책을,\n이번엔 끝까지";
  const sub = "하루 3분 · 대화형 레슨 · 퀴즈로 완독";
  const tags = ["하루 3분", "대화형 독서", "첫 책 무료"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "#060612",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(110,220,180,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: 100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Stars */}
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${1 + (i % 2)}px`,
                height: `${1 + (i % 2)}px`,
                borderRadius: "50%",
                background: "#fff",
                opacity: 0.15 + (i % 4) * 0.05,
                left: `${(i * 23 + 7) % 100}%`,
                top: `${(i * 17 + 11) % 100}%`,
              }}
            />
          ))}
        </div>

        {/* Left content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 70px",
            position: "relative",
          }}
        >
          {/* Cosmii Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(110, 231, 183, 0.25)",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  color: "#065f46",
                  fontWeight: 700,
                  lineHeight: 1,
                  marginTop: -4,
                  display: "flex",
                }}
              >
                ,
              </div>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "-0.01em",
                display: "flex",
              }}
            >
              Cosmii
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              whiteSpace: "pre-wrap",
              marginBottom: 20,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.5,
              marginBottom: 36,
              display: "flex",
            }}
          >
            {sub}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 10 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 15,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Right side — Phone mockup area */}
        <div
          style={{
            width: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Phone frame */}
          <div
            style={{
              width: 260,
              height: 480,
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              flexDirection: "column",
              padding: "32px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Inner glow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 200,
                background: "linear-gradient(180deg, rgba(110,220,180,0.06) 0%, transparent 100%)",
                display: "flex",
              }}
            />

            {/* Mock cosmii avatar */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6ee7b7, #34d399)",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(110,231,183,0.2)",
              }}
            >
              <div style={{ fontSize: 36, color: "#065f46", fontWeight: 700, marginTop: -4, display: "flex" }}>,</div>
            </div>

            {/* Mock chat bubbles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  maxWidth: "85%",
                  display: "flex",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, display: "flex" }}>
                  습관이 바뀌면 정체성이 바뀐다는 건 어떤 뜻일까요?
                </div>
              </div>
              <div
                style={{
                  background: "rgba(139,92,246,0.12)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  maxWidth: "85%",
                  alignSelf: "flex-end",
                  border: "1px solid rgba(139,92,246,0.15)",
                  display: "flex",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(167,139,250,0.7)", lineHeight: 1.5, display: "flex" }}>
                  반복하면 그 사람이 되는 거죠
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  maxWidth: "85%",
                  display: "flex",
                }}
              >
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, display: "flex" }}>
                  맞아요! 바로 그거예요 ✨
                </div>
              </div>
            </div>

            {/* Mock progress bar */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", display: "flex" }}>
                3/10 레슨 완료
              </div>
              <div
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: "30%",
                    height: "100%",
                    borderRadius: 2,
                    background: "rgba(139,92,246,0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
