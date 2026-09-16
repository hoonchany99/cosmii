"use client";

import { ReaderPage, h2, strong, link } from "@/components/reader-page";

export default function SupportPage() {
  return (
    <ReaderPage
      title="고객 지원"
      note="막히는 것이 있으면 언제든 메일 주세요. 하루 안에 답합니다."
      current="/support"
    >
      <section>
        <h2 className={h2}>메일로 문의</h2>
        <p>
          <a href="mailto:hoonchany99@gmail.com" className={link}>
            hoonchany99@gmail.com
          </a>
        </p>
        <p className="mt-3 text-white/40">
          쓰시는 iPhone 기종과 앱 버전(설정 화면 맨 아래)을 함께 적어 주시면 더 빨리 찾아드릴 수 있어요.
        </p>
      </section>

      <section>
        <h2 className={h2}>자주 묻는 것</h2>
        <ul className="space-y-6 list-none">
          <li>
            <strong className={strong}>폰을 바꿨는데 읽은 기록이 없어요</strong>
            <p className="mt-1">
              로그인하지 않으면 기록은 그 기기에만 남습니다. 예전 폰에서 쓰던 Apple 또는 Google 계정으로 로그인하면 읽은 장, 뜯은 책, 장서표가 따라옵니다. 설정 › 기록 백업하기에서 로그인할 수 있어요.
            </p>
          </li>
          <li>
            <strong className={strong}>Premium을 샀는데 켜지지 않아요</strong>
            <p className="mt-1">
              Premium 화면 아래 구매 복원을 눌러 보세요. 구독은 결제한 Apple ID에 붙기 때문에, 살 때와 같은 Apple ID로 로그인되어 있어야 합니다.
            </p>
          </li>
          <li>
            <strong className={strong}>구독을 해지하고 싶어요</strong>
            <p className="mt-1">
              iPhone 설정 › 맨 위 이름 › 구독 › Cosmii에서 해지합니다. 해지해도 이미 결제한 기간이 끝날 때까지는 그대로 쓸 수 있어요. 환불은 Apple에 요청해야 합니다 —{" "}
              <a href="https://reportaproblem.apple.com" className={link} target="_blank" rel="noreferrer">
                reportaproblem.apple.com
              </a>
            </p>
          </li>
          <li>
            <strong className={strong}>목소리가 나오지 않아요</strong>
            <p className="mt-1">
              처음 듣는 장은 목소리를 만드는 데 1분쯤 걸립니다. 화면 위 헤드폰 버튼이 꺼져 있지 않은지, 무료로는 책마다 첫 장까지 들을 수 있다는 점도 확인해 주세요.
            </p>
          </li>
          <li>
            <strong className={strong}>계정과 기록을 지우고 싶어요</strong>
            <p className="mt-1">
              설정 › 계정 삭제에서 직접 지울 수 있습니다. 서버에 있는 기록과 Apple 로그인 연결까지 함께 지워지며, 되돌릴 수 없습니다.
            </p>
          </li>
          <li>
            <strong className={strong}>책에 오타가 있거나 내용이 이상해요</strong>
            <p className="mt-1">
              어느 책의 몇 번째 장인지 적어서 메일 주세요. 고쳐서 다음 업데이트에 반영합니다.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>의견과 제안</h2>
        <p>
          읽고 싶은 책, 불편한 곳, 있었으면 하는 기능 — 전부 같은 주소로 받습니다. 어떤 책을 넣을지는 실제로 받은 요청을 보고 정하고 있어요.
        </p>
      </section>
    </ReaderPage>
  );
}
