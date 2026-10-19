// 장서표, as the app draws it: an old bookplate on paper stock, a double rule,
// EX · LIBRIS at the head, an arched window holding the book's picture, the
// title, whose book it is, and the plate's number with the day it was
// finished. See the app's src/components/ex-libris/book-plate.tsx - the
// measurements here are the same ones, as fractions of the width.
//
// In the app the window opens a quarter at a time as the book is read; a
// plate shown here is a finished one, so the window is whole.
const PAPER = "#EDE6D8";
const PAPER_SHADE = "#DCD3C2";
const INK = "#23202C";
const INK_SOFT = "#6B6574";

/** The app's FAMILY_COLORS, which tint a plate's inner rule. */
export const FAMILY_COLORS = {
  thought: "#8A9FCF",
  epic: "#C49A6C",
  power: "#CF8A86",
  drama: "#B08FCF",
  dark: "#6FB5B8",
  life: "#D19A82",
} as const;

const WORDMARK = "var(--font-serif), 'EB Garamond', Georgia, serif";
const READING = "var(--font-ko-serif), 'Nanum Gothic', serif";

export function BookPlate({
  bookId,
  title,
  tint,
  number,
  owner,
  date,
  width = 260,
}: {
  bookId: string;
  title: string;
  /** The book's family colour, which tints the inner rule and the EX · LIBRIS dot. */
  tint: string;
  /** Its place in the catalogue, two digits. */
  number: string;
  owner?: string;
  date?: string;
  width?: number;
}) {
  const height = Math.round(width * 1.56);
  const pad = Math.max(3, width * 0.034);
  const inner = Math.max(5, width * 0.05);
  const head = Math.max(6.5, width * 0.05);
  const titleSize = Math.max(10.5, width * 0.085);
  const foot = Math.max(6.5, width * 0.042);

  return (
    <div
      style={{
        width,
        height,
        padding: pad,
        borderRadius: Math.max(2, width * 0.012),
        background: PAPER,
        boxShadow: "0 5px 10px rgba(0,0,0,0.45)",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          border: `1px solid ${INK}`,
          padding: inner,
          paddingBottom: inner * 0.8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* The second rule, a hairline inside the first, in the book's colour. */}
        <div
          aria-hidden
          style={{ position: "absolute", inset: 2.5, border: `1px solid ${tint}`, opacity: 0.8, pointerEvents: "none" }}
        />
        <div style={{ fontFamily: WORDMARK, fontSize: head, letterSpacing: head * 0.32, color: INK, whiteSpace: "nowrap" }}>
          EX<span style={{ color: tint }}> · </span>LIBRIS
        </div>

        {/* The window: a true half-circle at the crown, so the radius is half
            the window's own width rather than a large number to be clamped. */}
        <div style={{ flex: 1, alignSelf: "stretch", marginTop: inner * 0.7, minHeight: 0 }}>
          <div
            style={{
              position: "relative",
              height: "100%",
              overflow: "hidden",
              background: PAPER_SHADE,
              borderTopLeftRadius: "50% 28%",
              borderTopRightRadius: "50% 28%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/covers/${bookId}.jpg`}
              alt=""
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
            {/* The arch's line is drawn over the picture: on the view that
                clips it, the crown covered the line where the curve is
                tightest. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                border: `1px solid ${INK}`,
                borderTopLeftRadius: "50% 28%",
                borderTopRightRadius: "50% 28%",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: READING,
            fontWeight: 700,
            fontSize: titleSize,
            lineHeight: 1.3,
            color: INK,
            textAlign: "center",
            marginTop: inner * 0.6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {title}
        </div>
        {owner && (
          <div style={{ fontFamily: READING, fontSize: Math.max(8, width * 0.048), color: INK_SOFT, marginTop: 1 }}>
            {owner}의 책
          </div>
        )}
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            justifyContent: "space-between",
            marginTop: inner * 0.45,
            paddingTop: inner * 0.35,
            borderTop: "1px solid rgba(35,32,44,0.35)",
          }}
        >
          <span style={{ fontFamily: WORDMARK, fontSize: foot, color: INK_SOFT, letterSpacing: 0.3 }}>No. {number}</span>
          <span style={{ fontFamily: WORDMARK, fontSize: foot, color: INK_SOFT, letterSpacing: 0.3 }}>{date ?? "완독"}</span>
        </div>
      </div>
    </div>
  );
}
