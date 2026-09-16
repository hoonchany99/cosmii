"use client";

import { ReaderPage, h2, strong, link } from "@/components/reader-page";

export default function PrivacyPage() {
  return (
    <ReaderPage title="개인정보처리방침" note="시행일: 2026년 9월 15일" current="/privacy">
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
            <strong className={strong}>기기에만 남는 정보</strong> — 읽기 알림 시간, 하루 목표, 음소거 같은 설정은 기기에 저장됩니다. 로그인하지 않은 동안에는 봉인을 뜯은 책과 완독 날짜도 기기에만 저장됩니다. 알림은 기기에서 예약되며 서버로 전송되지 않습니다.
          </li>
        </ul>
        <p className="mt-3">광고 식별자를 수집하지 않고, 광고나 사용자 추적 도구를 사용하지 않습니다.</p>
      </section>

      <section>
        <h2 className={h2}>2. 이용 목적</h2>
        <ul className="space-y-2 list-disc list-outside ml-5">
          <li>읽기 기록을 기기와 계정 사이에 이어서 보여주기 위해</li>
          <li>코스미의 대화 답변을 만들기 위해</li>
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
        <h2 className={h2}>4. 처리를 맡기는 곳과 국외 이전</h2>
        <p>서비스 운영을 위해 아래 업체가 정보를 처리합니다. 각 업체의 서버는 해외에 있을 수 있습니다.</p>
        <ul className="mt-3 space-y-2 list-disc list-outside ml-5">
          <li><strong className={strong}>Supabase</strong> — 계정 인증, 읽기 기록 저장</li>
          <li><strong className={strong}>Vercel</strong> — 앱 서버 운영 (대화 요청 전달)</li>
          <li><strong className={strong}>OpenAI</strong> — 대화 답변 생성 (3항)</li>
          <li><strong className={strong}>ElevenLabs</strong> — 레슨 음성 생성 (레슨 문장만 전송하며, 이용자 정보는 보내지 않습니다)</li>
          <li><strong className={strong}>Apple, Google</strong> — 로그인</li>
        </ul>
        <p className="mt-3">위 목적 외에 정보를 판매하거나 제3자에게 제공하지 않습니다.</p>
      </section>

      <section>
        <h2 className={h2}>5. 보관 기간과 삭제</h2>
        <p>
          계정 정보와 읽기 기록은 계정을 삭제할 때까지 보관합니다. 앱의 <strong className={strong}>설정 › 계정 삭제</strong>에서 언제든 계정을 삭제할 수 있으며, 삭제하면 서버의 계정과 읽기 기록, 닉네임이 즉시 지워지고 기기의 대화 기록도 함께 지워집니다. 삭제한 정보는 되돌릴 수 없습니다.
        </p>
        <p className="mt-3">로그인하지 않고 쓴 기록은 기기에만 있으므로 앱을 삭제하면 함께 사라집니다.</p>
      </section>

      <section>
        <h2 className={h2}>6. 이용자의 권리</h2>
        <p>
          이용자는 자신의 정보를 조회, 정정, 삭제하거나 처리 정지를 요구할 수 있습니다. 앱에서 직접 할 수 없는 요청은 아래 연락처로 보내 주시면 지체 없이 처리합니다.
        </p>
      </section>

      <section>
        <h2 className={h2}>7. 방침의 변경</h2>
        <p>이 방침이 바뀌면 시행 전에 앱 또는 이 페이지로 알립니다.</p>
      </section>

      <section>
        <h2 className={h2}>8. 문의</h2>
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
