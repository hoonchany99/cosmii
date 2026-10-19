// cosmii.vercel.app: an introduction to the iPhone app and the way to it.
// The web app that used to live here is closed (middleware sends its routes
// home); reading happens in the app. The page wears the app's ground, its
// text face and its wordmark, and says what the app does in the app's words.
//
// The notes shown here belong to books whose covers are not shown, so the
// page never sets a note beside its title.
import Image from "next/image";
import Link from "next/link";
import { starfield, withCosmii } from "@/lib/cosmii-text";

const APP_STORE_URL = "https://apps.apple.com/kr/app/cosmii/id6812843004";

const serif = "font-[family-name:var(--font-serif)]";
const link =
  "text-white/64 underline underline-offset-4 decoration-white/25 hover:text-white/92 hover:decoration-white/50 transition-colors duration-200";

const OPENERS = [
  { id: "bc977bab", title: "데미안", author: "헤르만 헤세" },
  { id: "cl_odyssey", title: "오디세이아", author: "호메로스" },
  { id: "f_stranger", title: "이방인", author: "알베르 카뮈" },
];

const COVERS = [
  { id: "f_little_prince", title: "어린 왕자" },
  { id: "cl_odyssey", title: "오디세이아" },
  { id: "f_gatsby", title: "위대한 개츠비" },
  { id: "c_metamorphosis", title: "변신" },
  { id: "c_meditations", title: "명상록" },
  { id: "f_1984", title: "1984" },
];

function AppStoreButton() {
  return (
    <a
      href={APP_STORE_URL}
      className="inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-6 text-[#060612] transition-opacity duration-200 hover:opacity-90"
    >
      <svg width="20" height="24" viewBox="0 0 17 21" aria-hidden="true" fill="currentColor">
        <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.5 4.8 1.8 5.8.9 7.4-1 10.7.4 15.6 2.2 18.2c.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.4-2.9 1.4-3-.1 0-2.8-1.1-2.8-4.5zM11.5 3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
      </svg>
      <span className="flex flex-col text-left leading-none">
        <span className="text-[11px] font-semibold opacity-70">App Store에서</span>
        <span className="mt-1 text-[17px] font-semibold">받기</span>
      </span>
    </a>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="py-20 sm:py-24">
      <p className="text-[13px] font-semibold tracking-wide text-[#e8c77b]">{eyebrow}</p>
      <h2 className="mt-3 text-[26px] sm:text-[32px] font-semibold leading-snug tracking-tight text-white break-keep">
        {title}
      </h2>
      <div className="mt-6 text-[16px] leading-[1.85] text-white/64 break-keep">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen bg-[#060612] text-white font-[family-name:var(--font-app)]"
      style={{ backgroundImage: starfield("cosmii"), backgroundAttachment: "fixed" }}
    >
      <div className="mx-auto max-w-[44rem] px-6 sm:px-10">
        <header className="flex items-center justify-between pt-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image src="/cosmii-mark.png" alt="" width={28} height={28} priority className="h-7 w-7" />
            <span className={`${serif} text-[22px] font-bold text-white/92`}>Cosmii</span>
          </Link>
          <a href={APP_STORE_URL} className="text-[14px] font-semibold text-white/80 transition-colors hover:text-white">
            앱 받기
          </a>
        </header>

        <section className="pt-20 pb-16 text-center sm:pt-28">
          <Image
            src="/landing/mark-1024.png"
            alt=""
            width={96}
            height={96}
            priority
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24"
          />
          <h1 className="mt-8 text-[34px] font-semibold leading-[1.25] tracking-tight text-white break-keep sm:text-[46px]">
            고전을 읽는
            <br />
            가장 쉬운 방법
          </h1>
          <p className="mx-auto mt-6 max-w-[30rem] text-[17px] leading-[1.8] text-white/70 break-keep">
            {withCosmii("어렵던 고전, 쉽게 설명해 주니 읽혀요. 한 장은 3분이고, Cosmii가 소리 내어 읽어 주고, 막히면 언제든 물어볼 수 있어요.")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <AppStoreButton />
            <p className="text-[13px] text-white/40">iPhone · 무료로 시작해요</p>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6">
            {OPENERS.map((b) => (
              <Link key={b.id} href={`/book/${b.id}`} className="flex flex-col items-center transition-opacity hover:opacity-80">
                <Image
                  src={`/covers/${b.id}.jpg`}
                  alt={b.title}
                  width={600}
                  height={900}
                  className="w-full max-w-[160px] rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
                />
                <span className="mt-4 text-[13px] leading-[1.6] text-white/80 break-keep sm:text-[15px]">
                  {b.title}
                  <span className="block text-white/45">{b.author}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="h-px bg-white/10" />

        <Section eyebrow="끝까지" title="읽다 만 책이 되지 않게">
          <p>
            고전은 사두고 못 읽는 책이에요. 매일 조금씩이면 한 권이 끝나요. 한 권에만 매달릴 필요도, 하루를 통째로 비울 필요도 없어요.
          </p>
        </Section>

        <div className="h-px bg-white/10" />

        <Section eyebrow="한 장 3분" title="어려운 대목은 풀어서 들려줘요">
          <p>
            고전이 어려운 건 머리가 나빠서가 아니라 설명해 주는 사람이 없어서예요. 짧은 장으로 나누고 어려운 대목은 풀어서 들려줘요. 한 장을 읽고 퀴즈 하나를 풀면 끝이에요.
          </p>
        </Section>

        <div className="h-px bg-white/10" />

        <Section eyebrow={withCosmii("Cosmii")} title={withCosmii("읽다가 막히면, Cosmii에게 물어봐요")}>
          <p>
            {withCosmii("인물이 왜 그랬는지, 이 장면이 무슨 뜻인지 편하게 물어보세요. 내가 읽은 곳까지만 이야기해서 결말을 먼저 말하지 않아요. 모든 장은 Cosmii의 목소리로 들을 수도 있어요.")}
          </p>
        </Section>

        <div className="h-px bg-white/10" />

        <Section eyebrow="다 읽으면" title="한 권을 끝내면 장서표가 남아요">
          <p>
            다 읽은 책마다 내 이름이 찍힌 장서표가 서재에 걸려요. 첫 장, 두 번째 책, 연속 읽기 같은 순간에는 인장이 찍혀요.
          </p>
        </Section>

        <div className="h-px bg-white/10" />

        <Section eyebrow="29권" title="읽고 싶은 책이 따로 있다면">
          <p>스물아홉 권이 주제별로 놓여 있어요. 어느 책이든 바로 펼칠 수 있어요.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {COVERS.map((c) => (
              <Link key={c.id} href={`/book/${c.id}`} className="transition-opacity hover:opacity-80">
                <Image
                  src={`/covers/${c.id}.jpg`}
                  alt={c.title}
                  width={600}
                  height={900}
                  className="w-full rounded-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                />
              </Link>
            ))}
          </div>
        </Section>

        <div className="h-px bg-white/10" />

        <Section eyebrow={withCosmii("Cosmii Premium")} title="고전을 끝까지 읽게 해주는 구독">
          <ul className="space-y-2">
            <li>하루 제한 없이, 읽고 싶은 만큼</li>
            <li>모든 책의 모든 장</li>
            <li>{withCosmii("읽다가 궁금한 건 Cosmii와 제한 없이 대화")}</li>
          </ul>
          <p className="mt-4 text-[14px] text-white/40">처음이라면 7일 무료 체험으로 시작해요. 언제든 해지할 수 있어요.</p>
        </Section>

        <section className="py-24 text-center">
          <h2 className="text-[28px] font-semibold leading-snug tracking-tight text-white break-keep sm:text-[34px]">
            읽다 만 고전, 이번엔 끝까지
          </h2>
          <div className="mt-8 flex justify-center">
            <AppStoreButton />
          </div>
        </section>

        <footer className="border-t border-white/10 py-10 text-[13px]">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/support" className={link}>고객 지원</Link>
            <Link href="/terms" className={link}>이용약관</Link>
            <Link href="/privacy" className={link}>개인정보처리방침</Link>
            <span className={`ml-auto text-white/25 ${serif} font-bold`}>© 2026 Utopify</span>
          </nav>
        </footer>
      </div>
    </div>
  );
}
