// Where an invitation link lands (1.1.3, 대표 6680·6693, 시안 ⑦ TG 79 → 87).
//
// The friend most likely has no Cosmii yet. The page says what was given,
// shows the code large with a way to copy it, and links to the App Store.
// Apple does not carry this address through an install, so the code - not
// the link - is what counts: the friend enters it in the app after signing
// in, and both get their coupon then. ct=invite on the App Store link counts
// these installs in App Store Connect.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { starfield } from "@/lib/cosmii-text";
import { OutlineLink } from "@/components/editorial";
import { normalizeCode } from "@/lib/invite-rules";
import { CopyCode } from "./copy-code";

const HANGUL = "break-keep [overflow-wrap:anywhere]";
const APP_STORE = "https://apps.apple.com/kr/app/apple-store/id6812843004?pt=129389248&ct=invite&mt=8";

export const metadata: Metadata = {
  title: "친구가 Cosmii에 초대했어요",
  description: "어렵기만 하던 고전, 이제는 Cosmii와 함께 쉽게 읽어보세요.",
  // The shared link is the whole message (대표 TG 164), so the card it
  // unfolds into says what was given; the picture is opengraph-image.tsx.
  openGraph: {
    // 그림이 「선물 받았어요」를 말하니 제목·설명은 이게 뭔지만. 문구는 대표 TG 369 그대로.
    title: "코스미(Cosmii) 초대장",
    description: "어렵기만 하던 고전, 이제는 Cosmii와 함께 쉽게 읽어보세요.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "코스미(Cosmii) 초대장" },
  // A personal code is not for search engines.
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  // Only the shape is checked here; whether the code exists is the app's
  // question, asked by a signed-in reader. Nothing is looked up for a visitor.
  const code = normalizeCode(decodeURIComponent((await params).code));
  if (!code) notFound();
  const shown = `${code.slice(0, 3)}-${code.slice(3)}`;

  return (
    <main
      className="box-border flex min-h-dvh items-center justify-center bg-night px-gutter py-8 font-ui text-ink"
      style={{ backgroundImage: starfield(code) }}
    >
      <div className="w-full max-w-column text-left">
        <p className="mb-4 font-wordmark text-[20px] font-bold text-ink-70">Cosmii</p>
        <h1 className={`type-screen-title mb-2 text-white ${HANGUL}`}>
          친구가 <span className="font-wordmark font-bold">Cosmii</span>에 초대했어요
        </h1>
        <p className={`type-description mb-8 text-ink-70 ${HANGUL}`}>
          끝까지 읽기 어려웠던 고전, Cosmii가 재밌는 이야기로 풀어 들려드려요. 아래 코드를 앱에 넣으면 하루 무료 Premium을 받아요.
        </p>

        <CopyCode code={code} shown={shown} />

        <OutlineLink href={APP_STORE} className="mx-auto">App Store에서 받기</OutlineLink>

        <p className={`type-label mt-8 mb-1 text-ink-70 ${HANGUL}`}>어떻게 받나요</p>
        <ol className="m-0 list-none p-0">
          {["위에서 코드를 복사해요", "앱을 받아 「친구한테 받은 코드 있어?」에서 붙여넣어요", "로그인하면 하루 무료 쿠폰이 들어와요"].map((t, i, all) => (
            <li key={t} className={`flex items-center gap-[14px] py-4 ${i < all.length - 1 ? "border-b border-hairline" : ""}`}>
              <span className="w-7 shrink-0 type-meta text-ink-muted">{i + 1}</span>
              <span className={`type-item text-white ${HANGUL}`}>{t}</span>
            </li>
          ))}
        </ol>

        {/* What Cosmii is, for a friend meeting it here first (대표 TG 178).
            Small and last, so it does not compete with getting the app, and
            in the same tab: the code lives only on this page now (the shared
            message is the link alone), so Back must bring it back. */}
        <Link href="/" className={`type-meta mt-6 inline-block text-ink-70 underline underline-offset-4 hover:text-white ${HANGUL}`}>
          Cosmii 알아보기 →
        </Link>
      </div>
    </main>
  );
}
