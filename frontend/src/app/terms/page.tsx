"use client";

import { ReaderPage, h2, strong, link } from "@/components/reader-page";

export default function TermsPage() {
  return (
    <ReaderPage title="이용약관" note="시행일: 2026년 9월 17일" current="/terms">
      <section>
        <h2 className={h2}>1. 서비스</h2>
        <p>
          Cosmii는 고전을 짧은 장으로 나누어 읽고, 퀴즈를 풀고, AI 친구 Cosmii와 책 이야기를 나누는 iOS 앱입니다. 이 약관은 앱과 앱이 사용하는 서버(cosmii.vercel.app)의 이용에 적용됩니다. 앱을 쓰면 이 약관에 동의한 것으로 봅니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>2. 계정</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>로그인하지 않고도 앱을 쓸 수 있습니다. 이때 기록은 기기에만 저장됩니다.</li>
          <li>Apple 또는 Google로 로그인하면 읽은 기록, 봉인을 뜯은 책, 별빛 사용 내역이 계정에 저장됩니다.</li>
          <li>설정 › 계정 삭제에서 언제든 계정과 서버에 백업된 기록을 지울 수 있습니다. 기기에 있는 기록은 그대로 남습니다. 지운 기록은 되돌릴 수 없습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>3. 무료 이용과 Premium</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>이번 주의 쪽지</strong> — 매주 월요일 봉인된 책 세 권이 도착합니다. 도착한 책은 제목 대신 한 줄의 쪽지만 보이고, 봉인을 뜯으면 그 책을 끝까지 읽을 수 있습니다.</li>
          <li><strong className={strong}>별빛 책방</strong> — 그 밖의 책은 별빛 책방에서 고릅니다. 제목과 표지를 보고 고르면 별빛 600, 쪽지만 보고 고르면 별빛 300으로 엽니다. 쪽지로 고른 책의 제목은 봉인을 뜯어야 보입니다.</li>
          <li><strong className={strong}>무료</strong> — 매주 도착한 세 권 중 한 권을 별빛 없이 뜯을 수 있고, 그보다 더 뜯으면 한 권에 별빛 300이 듭니다. Cosmii와의 대화는 하루 정해진 횟수까지, 목소리는 책마다 첫 장까지 들을 수 있습니다.</li>
          <li><strong className={strong}>Premium</strong> — 매주 도착한 세 권을 모두 별빛 없이 뜯고, 매달 별빛을 받으며, 모든 장을 Cosmii의 목소리로 듣고, 횟수 제한 없이 대화할 수 있는 구독입니다.</li>
          <li>무료로 제공되는 책의 수와 대화 횟수, Premium의 혜택은 서비스 운영에 따라 바뀔 수 있으며, 바뀌기 전에 앱에서 알립니다.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>4. 구독과 결제</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>Premium은 Apple App Store를 통해 결제되며, 결제와 환불에는 Apple의 정책이 적용됩니다.</li>
          <li>구독은 기간이 끝나기 최소 24시간 전에 해지하지 않으면 같은 기간으로 자동 갱신되고, 갱신 요금은 기간 종료 전 24시간 안에 청구됩니다.</li>
          <li>구독 관리와 해지는 iPhone의 설정 › Apple ID › 구독에서 할 수 있습니다. 해지해도 이미 결제한 기간이 끝날 때까지 Premium을 쓸 수 있습니다.</li>
          <li>환불은 Apple에 요청해야 합니다. Cosmii가 직접 결제 금액을 돌려드릴 수는 없습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>5. 별빛</h2>
        <p>
          별빛은 장을 읽고 퀴즈를 맞히거나, 인장을 받거나(계정에 기록을 남기는 것 포함), Premium으로 매달 받아 쌓이는 앱 안의 점수로, 책을 여는 데 쓸 수 있습니다. 별빛은 돈으로 사거나 현금으로 바꾸거나 다른 사람에게 넘길 수 없고, 계정을 삭제하면 함께 사라집니다. 별빛으로 얻을 수 있는 것은 운영에 따라 바뀔 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>6. AI 대화와 음성</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>Cosmii의 대화 답변은 AI가 만들며, 틀리거나 부정확할 수 있습니다. 학업이나 중요한 판단의 유일한 근거로 쓰지 마세요.</li>
          <li>레슨을 읽어주는 목소리는 AI로 만든 음성입니다.</li>
          <li>대화에 개인정보나 다른 사람을 해치는 내용을 쓰지 말아 주세요. 대화가 처리되는 방식은 개인정보처리방침에 적혀 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>7. 콘텐츠와 권리</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>앱에서 다루는 원작은 저작권 보호 기간이 끝난 고전입니다.</li>
          <li>레슨 글, 퀴즈, 표지와 장서표 그림, 음성 등 Cosmii가 만든 콘텐츠의 권리는 Cosmii에 있습니다. 개인적으로 읽고 즐기는 것 외에 복제, 배포, 판매, 자동 수집을 할 수 없습니다.</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>8. 금지 행위</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>서비스를 해킹하거나, 과도한 요청으로 운영을 방해하는 행위</li>
          <li>이용 제한(대화 횟수, 책 열기 등)을 부정한 방법으로 우회하는 행위</li>
          <li>다른 사람의 계정을 쓰거나 법을 어기는 행위</li>
        </ul>
        <p className="mt-3">이런 행위가 확인되면 이용을 제한하거나 계정을 정지할 수 있습니다.</p>
      </section>

      <section>
        <h2 className={h2}>9. 서비스의 변경과 책임</h2>
        <p>
          Cosmii는 서비스를 개선하기 위해 기능이나 서가 구성을 바꿀 수 있습니다. 천재지변, 외부 서비스(Apple, Supabase, OpenAI, ElevenLabs 등)의 장애처럼 Cosmii가 통제할 수 없는 사유로 생긴 손해에 대해서는, 관련 법령이 허용하는 범위에서 책임을 지지 않습니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>10. 약관의 변경과 준거법</h2>
        <p>
          약관이 바뀌면 시행 7일 전(이용자에게 불리한 변경은 30일 전)부터 앱 또는 이 페이지로 알립니다. 이 약관은 대한민국 법률에 따르며, 분쟁은 민사소송법에 따른 관할 법원에서 해결합니다. 앱 이용에는 이 약관과 함께 Apple의 표준 사용권 계약(EULA)이 적용됩니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>11. 문의</h2>
        <p>
          <a
            href="mailto:hoonchany99@gmail.com"
            className={link}
          >
            hoonchany99@gmail.com
          </a>
        </p>
      </section>
    </ReaderPage>
  );
}
