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
import { BookPlate } from "@/components/book-plate";
import { APP_STORE_URL, AppStoreLink, Footer, Hairline, Label, Masthead, textLink } from "@/components/editorial";

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

// A section of the page set the way a screen of the app is: a Label, a
// screen title, then the app speaking in the body face. The words keep the
// column (460px); only rows of covers may run wider.
function Section({ label, title, children }: { label: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-column py-20 sm:py-24">
      <Label>{label}</Label>
      <h2 className="type-screen-title mt-3 text-ink break-keep">{title}</h2>
      <div className="type-body mt-5 text-ink-muted break-keep">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen bg-night font-ui text-ink"
      style={{ backgroundImage: starfield("cosmii"), backgroundAttachment: "fixed" }}
    >
      <div className="mx-auto max-w-[44rem] px-gutter">
        <Masthead
          right={
            <a href={APP_STORE_URL} className={`type-meta ${textLink}`}>
              앱 받기
            </a>
          }
        />

        <section className="mx-auto max-w-column pt-16 pb-16 text-center sm:pt-24">
          <Image
            src="/landing/mark-1024.png"
            alt=""
            width={96}
            height={96}
            priority
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24"
          />
          <h1 className="type-large-title mt-8 text-ink break-keep">
            고전을 읽는
            <br />
            가장 쉬운 방법
          </h1>
          <p className="type-body mt-5 text-ink-70 break-keep">
            {withCosmii("한 장은 3분. 어려운 대목은 Cosmii가 풀어서 들려주고, 막히면 언제든 물어볼 수 있어요.")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <AppStoreLink />
            <p className="type-caption text-ink-muted">iPhone · 무료로 시작해요</p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3 pb-20 sm:gap-6">
          {OPENERS.map((b) => (
            <Link key={b.id} href={`/book/${b.id}`} className="flex flex-col items-center text-center transition-opacity hover:opacity-80">
              <Image
                src={`/covers/${b.id}.jpg`}
                alt={b.title}
                width={600}
                height={900}
                className="w-full max-w-[160px] rounded-[4px]"
              />
              <span className="mt-4 font-read text-[15px] font-bold leading-[22px] text-ink break-keep sm:text-[17px] sm:leading-[24px]">
                {b.title}
              </span>
              <span className="type-small mt-1 text-ink-muted break-keep">{b.author}</span>
            </Link>
          ))}
        </div>

        <Hairline />

        <Section label="끝까지" title="읽다 만 책이 되지 않게">
          <p>
            고전은 사두고 못 읽는 책이에요. 매일 조금씩이면 한 권이 끝나요. 한 권에만 매달릴 필요도, 하루를 통째로 비울 필요도 없어요.
          </p>
        </Section>

        <Hairline />

        <Section label="한 장 3분" title="어려운 대목은 풀어서 들려줘요">
          <p>
            고전이 어려운 건 머리가 나빠서가 아니라 설명해 주는 사람이 없어서예요. 짧은 장으로 나누고 어려운 대목은 풀어서 들려줘요. 한 장을 읽고 퀴즈 하나를 풀면 끝이에요.
          </p>
        </Section>

        <Hairline />

        <Section label={withCosmii("Cosmii")} title={withCosmii("읽다가 막히면, Cosmii에게 물어봐요")}>
          <p>
            {withCosmii("인물이 왜 그랬는지, 이 장면이 무슨 뜻인지 편하게 물어보세요. 내가 읽은 곳까지만 이야기해서 결말을 먼저 말하지 않아요. 모든 장은 Cosmii의 목소리로 들을 수도 있어요.")}
          </p>
        </Section>

        <Hairline />

        <Section label="다 읽으면" title="한 권을 끝내면 장서표가 남아요">
          <p>
            다 읽은 책마다 내 이름이 찍힌 장서표가 서재에 걸려요. 읽는 동안에는 네 조각 중 읽은 만큼만 보이고, 다 읽어야 그림이 온전해져요.
          </p>
          <div className="mt-10 flex justify-center">
            <BookPlate
              bookId="bc977bab"
              title="데미안"
              tint="#8A9FCF"
              number="02"
              owner="지우"
              date="2026. 10. 20"
              width={260}
            />
          </div>
        </Section>

        <Hairline />

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-column">
            <Label>29권</Label>
            <h2 className="type-screen-title mt-3 text-ink break-keep">읽고 싶은 책이 따로 있다면</h2>
            <p className="type-body mt-5 text-ink-muted break-keep">스물아홉 권이 주제별로 놓여 있어요. 어느 책이든 바로 펼칠 수 있어요.</p>
          </div>
          {/* A row of covers is "several things", the one kind of content the
              system lets run wider than the column. */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {COVERS.map((c) => (
              <Link key={c.id} href={`/book/${c.id}`} className="transition-opacity hover:opacity-80">
                <Image
                  src={`/covers/${c.id}.jpg`}
                  alt={c.title}
                  width={600}
                  height={900}
                  className="w-full rounded-[3px]"
                />
              </Link>
            ))}
          </div>
        </section>

        <Hairline />

        <Section label={withCosmii("Cosmii Premium")} title="고전을 끝까지 읽게 해주는 구독">
          <ul>
            {["하루 제한 없이, 읽고 싶은 만큼", "모든 책의 모든 장", "읽다가 궁금한 건 Cosmii와 제한 없이 대화"].map((line, i, all) => (
              <li key={line} className={`type-item py-4 text-ink ${i < all.length - 1 ? "border-b border-hairline" : ""}`}>
                {withCosmii(line)}
              </li>
            ))}
          </ul>
          <p className="type-small mt-4 text-ink-muted">처음이라면 7일 무료 체험으로 시작해요. 언제든 해지할 수 있어요.</p>
        </Section>

        <section className="mx-auto max-w-column py-24 text-center">
          <h2 className="type-screen-title text-ink break-keep">읽다 만 고전, 이번엔 끝까지</h2>
          <div className="mt-8 flex justify-center">
            <AppStoreLink />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
