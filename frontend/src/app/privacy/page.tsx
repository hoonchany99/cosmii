"use client";

import { ReaderPage, h2, strong, link } from "@/components/reader-page";

export default function PrivacyPage() {
  return (
    <ReaderPage title="개인정보처리방침" note="시행일: 2026년 9월 26일" current="/privacy">
      <section>
        <h2 className={h2}>1. 수집하는 정보</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>
            <strong className={strong}>계정 정보</strong> — Apple 또는 Google로 로그인하면 이메일 주소, 이름(제공한 경우), 로그인 식별자를 받습니다. 로그인하지 않고도 앱을 쓸 수 있습니다.
          </li>
          <li>
            <strong className={strong}>읽기 기록</strong> — 로그인한 경우 읽은 장, 퀴즈 결과, 별빛(XP)과 사용한 별빛, 레벨, 연속 읽기 일수, 앱이 만든 닉네임, 봉인을 뜯은 책, 완독 날짜, 이번 주 봉인된 책을 저장합니다. 로그인하지 않으면 이 기록은 기기에만 저장되고, 나중에 로그인할 때 계정으로 옮겨집니다.
          </li>
          <li>
            <strong className={strong}>코스미와의 대화</strong> — 대화 기록은 기기에만 저장되며 저희 서버에 보관하지 않습니다. 답을 만들 때 전송되는 내용은 아래 3항에 적었습니다.
          </li>
          <li>
            <strong className={strong}>사용 통계</strong> — 앱을 고치기 위해 앱 안에서 일어난 일을 기록합니다. 온보딩의 어느 단계까지 왔는지, 어떤 책의 장을 시작하고 마쳤는지와 퀴즈를 몇 개 맞혔는지, 구독 화면을 보거나 구매를 시작했는지, 로그인 안내를 보고 로그인했는지 같은 것들입니다. 여기에 앱 버전, 기기 모델과 OS 버전, IP 주소로 추정한 대략적인 위치(국가·지역·도시)가 함께 기록됩니다. 로그인하면 계정 식별자, 이메일, 로그인 방식(Apple 또는 Google)이 이 기록에 연결됩니다. 책의 문장, 코스미와의 대화, 이용자가 쓴 글은 보내지 않습니다.
          </li>
          <li>
            <strong className={strong}>광고 성과 측정</strong> — 광고를 보고 앱을 설치한 것인지 확인하기 위해, 처음 실행할 때 Apple이 주는 기여 토큰을 받아 Apple에 문의하고 그 결과(캠페인·광고그룹·검색어 식별자)를 사용 통계에 함께 기록합니다. 또한 Meta(Facebook·Instagram) 광고의 성과를 확인하기 위해 앱 설치와 실행, 구독 시작 같은 사건을 Meta에 보냅니다. 광고 식별자(IDFA)는 앱에서 추적을 허용한 경우에만 Meta에 전달됩니다. 자세한 내용은 아래 4항에 적었습니다.
          </li>
          <li>
            <strong className={strong}>구독</strong> — Premium을 구독하면 구독 상태와 구매 내역을 계정 식별자와 함께 확인합니다. 결제는 Apple이 처리하며, 저희는 카드 등 결제 정보를 받지 않습니다.
          </li>
          <li>
            <strong className={strong}>기기에만 남는 정보</strong> — 읽기 알림 시간, 하루 목표, 음소거 같은 설정은 기기에 저장됩니다. 로그인하지 않은 동안에는 봉인을 뜯은 책과 완독 날짜도 기기에만 저장됩니다. 알림은 기기에서 예약되며 서버로 전송되지 않습니다.
          </li>
        </ul>
        <p className="mt-3">책의 문장, 코스미와의 대화, 이용자가 쓴 글은 광고 성과 측정에 쓰지 않으며 광고 회사에 보내지 않습니다. 광고 식별자(IDFA)는 추적을 허용한 경우에만 쓰이고, 허용하지 않아도 앱의 모든 기능을 그대로 쓸 수 있습니다.</p>
      </section>

      <section>
        <h2 className={h2}>2. 이용 목적</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>읽기 기록을 기기와 계정 사이에 이어서 보여주기 위해</li>
          <li>코스미의 대화 답변을 만들기 위해</li>
          <li>Premium 구독을 확인하고 혜택을 주기 위해</li>
          <li>어떤 기능이 쓰이고 어디에서 막히는지 알아 앱을 고치기 위해 (사용 통계)</li>
          <li>어떤 광고가 도움이 되었는지 확인하기 위해 (광고 성과 측정)</li>
          <li>서비스 장애를 확인하고 고치기 위해</li>
        </ul>
      </section>

      <section>
        <h2 className={h2}>3. AI 대화와 OpenAI</h2>
        <p>
          코스미의 답은 OpenAI의 AI 모델이 만듭니다. 대화를 시작하기 전에 앱에서 동의를 받으며, 동의는 설정의 ‘AI 대화와 데이터’에서 거둘 수 있습니다.
        </p>
        <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>보내는 것</strong> — 이용자가 쓴 메시지, 같은 대화의 앞선 내용, 이야기 중인 책과 읽은 장</li>
          <li><strong className={strong}>보내지 않는 것</strong> — 이름, 이메일, 로그인 정보 등 계정 정보</li>
        </ul>
        <p className="mt-3">
          OpenAI의 API 정책상 전송된 내용은 모델 학습에 쓰이지 않으며, 남용 방지를 위해 일정 기간(최대 30일) 보관된 뒤 삭제될 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>4. 광고 성과 측정과 추적 동의</h2>
        <p>
          어떤 광고가 실제로 도움이 되었는지 확인하기 위해 아래와 같이 정보를 처리합니다. 읽은 내용이나 대화는 여기에 쓰이지 않습니다.
        </p>
        <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>Apple 검색 광고 기여 확인</strong> — 앱을 처음 실행할 때 Apple이 발급하는 기여 토큰을 저희 서버가 받아 Apple에 문의합니다. 돌아온 캠페인·광고그룹·검색어 식별자를 사용 통계에 함께 기록합니다. 문의가 실패하면 다시 시도하기 위해 토큰과 함께 무작위 설치 식별자를 잠시 저장하며, 이 식별자는 계정이나 기기와 관계가 없고 토큰과 함께 폐기됩니다. 이 과정에는 광고 식별자(IDFA)가 쓰이지 않습니다. 토큰은 확인이 끝나면 곧바로 폐기하며, 확인이 늦어지는 경우에도 24시간 안에 폐기합니다.</li>
          <li><strong className={strong}>Meta 광고 성과 측정</strong> — 앱 설치와 실행, 구독 체험 시작과 결제 같은 사건을 Meta에 보냅니다. 추적을 허용한 경우에는 광고 식별자(IDFA)가 함께 전달되어 광고와 설치를 연결하는 데 쓰이고, 허용하지 않은 경우에는 Apple이 집계한 형태(SKAdNetwork·Aggregated Event Measurement)로만 측정됩니다. Facebook 로그인은 쓰지 않으며, 책의 문장이나 대화는 보내지 않습니다.</li>
          <li><strong className={strong}>구독 사건</strong> — 체험 시작, 결제, 갱신, 해지 여부를 RevenueCat을 통해 사용 통계와 광고 성과 측정에 전달합니다. 카드 등 결제 정보는 저희가 받지 않으며 전달하지도 않습니다.</li>
        </ul>
        <p className="mt-3">
          <strong className={strong}>추적 동의와 철회</strong> — 광고 식별자를 이용하려면 iOS의 추적 허용 창에서 이용자의 동의가 필요합니다. 이 창은 첫 장을 읽은 뒤에 한 번 보여드리며, 허용하지 않아도 앱의 모든 기능을 그대로 쓸 수 있습니다. 한 번 고른 뒤에도 <strong className={strong}>iOS 설정 › 개인정보 보호 및 보안 › 추적</strong>에서 언제든 바꿀 수 있습니다. 허용을 거두면 그때부터 광고 식별자는 더 이상 전달되지 않습니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>5. 처리를 맡기는 곳과 국외 이전</h2>
        <p>서비스 운영을 위해 아래 업체가 정보를 처리합니다. 각 업체의 서버는 해외에 있을 수 있습니다.</p>
        <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>Supabase</strong> — 계정 인증, 읽기 기록 저장</li>
          <li><strong className={strong}>Vercel</strong> — 앱 서버 운영 (대화 요청 전달)</li>
          <li><strong className={strong}>OpenAI</strong> — 대화 답변 생성 (3항)</li>
          <li><strong className={strong}>ElevenLabs</strong> — 레슨 음성 생성 (레슨 문장만 전송하며, 이용자 정보는 보내지 않습니다)</li>
          <li><strong className={strong}>Mixpanel</strong> — 사용 통계 분석 (1항의 사용 통계)</li>
          <li><strong className={strong}>RevenueCat</strong> — 구독 상태 확인 (계정 식별자와 App Store 구매 내역)</li>
          <li><strong className={strong}>Meta Platforms</strong> — 광고 성과 측정 (4항)</li>
          <li><strong className={strong}>Apple, Google</strong> — 로그인, Apple은 결제, Apple은 검색 광고 기여 확인 (4항)</li>
        </ul>
        <p className="mt-3">
          국외로 이전되는 정보는 다음과 같습니다. 이전받는 자와 이전 국가, 이전 항목, 목적, 보유 기간 순으로 적었습니다. 이전은 해당 기능을 쓰는 시점에 정보통신망을 통해 이루어집니다.
        </p>
        <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>Mixpanel (미국)</strong> — 사용 통계(1항), 광고 캠페인 식별자, 로그인한 경우 계정 식별자와 이메일 · 앱 개선과 광고 성과 확인 · 앱을 고치는 데 필요한 동안</li>
          <li><strong className={strong}>Meta Platforms (미국)</strong> — 앱 설치·실행·구독 사건, 추적을 허용한 경우 광고 식별자(IDFA) · 광고 성과 측정 · Meta의 보관 정책에 따름</li>
          <li><strong className={strong}>Apple (미국)</strong> — 검색 광고 기여 토큰을 Apple에 전달 · 광고를 통한 설치인지 확인 · 확인이 끝나면 곧바로, 늦어도 24시간 안에 폐기</li>
          <li><strong className={strong}>OpenAI, ElevenLabs, Supabase, Vercel, RevenueCat (미국 등)</strong> — 3항과 위 목록에 적은 항목 · 각 항에 적은 목적 · 각 업체의 정책과 저희 보관 기간(6항)에 따름</li>
        </ul>
        <p className="mt-3">
          국외 이전을 거부하려면 추적 허용을 거두거나(4항) 앱 이용을 중단할 수 있습니다. 서비스 운영에 꼭 필요한 이전을 거부하는 경우 해당 기능을 쓸 수 없습니다.
        </p>
        <p className="mt-3">위 목적 외에 정보를 판매하거나 제3자에게 제공하지 않습니다.</p>
      </section>

      <section>
        <h2 className={h2}>6. 보관 기간과 삭제</h2>
        <p>
          계정 정보와 읽기 기록은 계정을 삭제할 때까지 보관합니다. 앱의 <strong className={strong}>설정 › 계정 삭제</strong>에서 언제든 계정을 삭제할 수 있으며, 삭제하면 서버의 계정과 읽기 기록, 닉네임이 즉시 지워집니다. 기기에 남은 기록과 대화는 지우지 않으며, 로그인하지 않은 상태로 계속 쓸 수 있습니다. 기기의 기록까지 지우려면 앱을 삭제하면 됩니다. 삭제한 정보는 되돌릴 수 없습니다.
        </p>
        <p className="mt-3">로그인하지 않고 쓴 기록은 기기에만 있으므로 앱을 삭제하면 함께 사라집니다.</p>
        <p className="mt-3">
          광고 성과 측정을 위해 기록한 캠페인 정보는 사용 통계와 함께 보관하며, Meta에 전달된 정보는 Meta의 정책에 따라 보관됩니다. Apple의 기여 토큰은 확인이 끝나면 곧바로 폐기하며, 확인이 늦어지는 경우에도 24시간 안에 폐기합니다.
        </p>
        <p className="mt-3">
          사용 통계는 앱을 고치는 데 필요한 동안 보관합니다. 계정을 삭제한 뒤에는 새 기록이 그 계정에 연결되지 않으며, 이미 쌓인 사용 통계의 삭제를 원하면 아래 연락처로 요청해 주세요.
        </p>
      </section>

      <section>
        <h2 className={h2}>7. 이용자의 권리</h2>
        <p>
          이용자는 자신의 정보를 조회, 정정, 삭제하거나 처리 정지를 요구할 수 있습니다. 앱에서 직접 할 수 없는 요청은 아래 연락처로 보내 주시면 지체 없이 처리합니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>8. 방침의 변경</h2>
        <p>이 방침이 바뀌면 시행 전에 앱 또는 이 페이지로 알립니다.</p>
      </section>

      <section>
        <h2 className={h2}>9. 문의</h2>
        <p>
          개인정보 관련 문의:{" "}
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
