export interface DemoBook {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  authorEn: string;
  color: string;
  tagline: string;
  taglineEn: string;
  coverUrl?: string;
}

export interface DemoDialoguePart {
  speaker: string;
  text: string;
  highlight?: string | null;
}

export interface DemoQuiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DemoLesson {
  title: string;
  titleEn: string;
  chapter: string;
  chapterEn: string;
  dialogue: DemoDialoguePart[];
  dialogueEn: DemoDialoguePart[];
  quizzes: DemoQuiz[];
  quizzesEn: DemoQuiz[];
  cliffhanger: string;
  cliffhangerEn: string;
  nextTitle: string;
  nextTitleEn: string;
  totalLessons: number;
}

function d(text: string, highlight?: string | null): DemoDialoguePart {
  return { speaker: "cosmii", text, highlight: highlight ?? null };
}

function q(question: string, options: string[], correct: number, explanation: string): DemoQuiz {
  return { id: `q-${Math.random().toString(36).slice(2, 8)}`, question, options, correctIndex: correct, explanation };
}

export const DEMO_BOOKS: DemoBook[] = [
  {
    id: "s_atomic",
    title: "아토믹 해빗",
    titleEn: "Atomic Habits",
    author: "제임스 클리어",
    authorEn: "James Clear",
    color: "#10b981",
    tagline: "매일 1%가 인생을 바꾸는 원리",
    taglineEn: "How 1% daily changes everything",
    coverUrl: "/covers/s_atomic.jpg",
  },
  {
    id: "s_money_psych",
    title: "돈의 심리학",
    titleEn: "The Psychology of Money",
    author: "모건 하우절",
    authorEn: "Morgan Housel",
    color: "#2B9348",
    tagline: "돈은 수학이 아니라 심리학이다",
    taglineEn: "Money is psychology, not math",
    coverUrl: "/covers/s_money_psych.jpg",
  },
  {
    id: "45b77580",
    title: "사피엔스",
    titleEn: "Sapiens",
    author: "유발 하라리",
    authorEn: "Yuval Noah Harari",
    color: "#f59e0b",
    tagline: "인류 7만 년의 가장 큰 비밀",
    taglineEn: "The biggest secret of 70,000 years of humanity",
    coverUrl: "/covers/45b77580.jpg",
  },
];

export const DEMO_LESSONS: Record<string, DemoLesson> = {
  s_atomic: {
    title: "1%의 놀라운 힘",
    titleEn: "The Surprising Power of 1%",
    chapter: "1% 개선",
    chapterEn: "1% Improvement",
    dialogue: [
      d("영국 사이클링 팀이 100년간 메달을 못 땄어. 2003년에 데이브 브레일스포드가 감독이 돼. 그가 한 건 딱 하나야. 1% 개선."),
      d("선수들의 베개를 바꿨어. 안장 높이를 밀리미터 단위로 조절했어. 손 씻는 법까지 가르쳤어. 미세한 이득의 집합체야.", "미세한 이득의 집합"),
      d("결과는 놀라워. 5년 만에 투르 드 프랑스를 지배했어. 올림픽 금메달을 쓸어 담았어. 비밀은 천재가 아니라 시스템이야."),
      d("상상해봐. 매일 1%씩 나아지면 1년 뒤에 37배가 돼. 매일 1%씩 나빠지면 1년 뒤에 거의 0이 돼. 이게 복리의 수학이야."),
      d("너도 한 번쯤 거대한 목표를 세우고 작심삼일에 끝난 적 있잖아. 목표가 문제가 아니야. 시스템이 없었던 게 문제야."),
      d("「목표를 달성하는 사람과 실패하는 사람은 같은 목표를 갖고 있다. 차이는 시스템에 있다.」 클리어의 핵심 통찰이야."),
      d("목표는 방향을 알려줘. 근데 매일의 실제 행동을 바꾸는 건 목표가 아니라 시스템이야. 시스템이 곧 습관이야.", "시스템이 곧 습관"),
      d("올림픽 금메달리스트나 시험 탈락자나 같은 목표를 가졌어. '성공하고 싶다.' 차이는 매일의 1%를 쌓았느냐 안 쌓았느냐야."),
      d("변화는 눈에 안 보여. 헬스장 한 달 다녀도 몸이 안 변하는 것처럼. 근데 어느 순간 빙하가 녹듯 결과가 터져 나와."),
      d("클리어는 이걸 '실망의 계곡'이라고 불러. 노력은 쌓이는데 결과가 안 보이는 구간이야. 대부분 여기서 포기해."),
      d("넌 지금 실망의 계곡에 있어? 결과가 안 보여도 시스템을 유지하고 있어? 그 대답이 1년 뒤의 너를 결정해."),
    ],
    dialogueEn: [
      d("British Cycling hadn't won medals for 100 years. In 2003, Dave Brailsford became coach. He did one thing: 1% improvements."),
      d("Changed riders' pillows. Adjusted saddle height by millimeters. Taught proper hand-washing. An aggregation of marginal gains.", "aggregation of marginal gains"),
      d("Results were stunning. Dominated Tour de France within 5 years. Swept Olympic gold medals. The secret was system, not genius."),
      d("Imagine improving 1% daily — you're 37 times better in a year. Decline 1% daily — you're nearly zero. That's the math of compounding."),
      d("You've set a massive goal and quit after three days. The goal wasn't the problem. The missing system was the problem."),
      d("'The people who achieve goals and those who fail have the same goals. The difference is the system.' Clear's core insight."),
      d("Goals tell you direction. But what changes daily behavior isn't goals — it's systems. Systems are habits.", "systems are habits"),
      d("Olympic gold medalists and exam failures had the same goal: 'succeed.' The difference is whether they stacked daily 1% improvements."),
      d("Change is invisible. Like working out for a month with no visible results. But at some point, results erupt like melting ice."),
      d("Clear calls this the 'Valley of Disappointment.' Effort accumulates but results aren't visible. Most people quit here."),
      d("Are you in the Valley of Disappointment right now? Maintaining systems despite invisible results? That answer determines you in one year."),
    ],
    quizzes: [
      q("'같은 목표를 가진 사람들의 차이가 시스템에 있다'는 말의 의미는?", ["목표 자체가 불필요하다는 뜻", "매일의 습관 시스템이 결과를 만든다는 뜻", "시스템 공학을 도입해야 한다는 뜻", "목표를 더 낮게 잡아야 한다는 뜻"], 1, "목표는 다 같아. 차이를 만드는 건 매일의 습관이야. 시스템이 없으면 목표는 그냥 소원이야."),
      q("'실망의 계곡'이 습관 형성에서 중요한 이유는?", ["실패를 합리화하는 장치이므로", "결과가 안 보이는 구간을 버텨야 복리 효과가 터지므로", "심리적 위안을 주는 개념이므로", "운동 과학에서 온 비유이므로"], 1, "결과가 바로 안 보여서 포기하는 거야. 근데 이 계곡만 통과하면 결과가 폭발해. 포기하지 않는 게 능력이야."),
    ],
    quizzesEn: [
      q("What does 'people with the same goals differ in their systems' mean?", ["Goals themselves are unnecessary", "Daily habit systems create the real results", "Systems engineering should be adopted", "Goals should be set much lower"], 1, "Goals are the same. What makes the difference is daily habits. Without a system, a goal is just a wish."),
      q("Why is the 'Valley of Disappointment' crucial in habit formation?", ["It helps rationalize failure", "Persisting through invisible results unlocks compound growth", "It provides psychological comfort", "It's a metaphor from exercise science"], 1, "People quit because results aren't visible yet. But cross the valley and results explode. Not quitting is the real skill."),
    ],
    cliffhanger: "1%를 쌓는 방법은 알겠어. 근데 진짜 중요한 건 '누가 되느냐'야. 습관의 정체성.",
    cliffhangerEn: "You know how to stack 1%. But what truly matters is 'who you become.' The identity of habits.",
    nextTitle: "정체성 기반의 습관",
    nextTitleEn: "Identity-Based Habits",
    totalLessons: 12,
  },

  s_money_psych: {
    title: "아무도 미치지 않았다",
    titleEn: "No One's Crazy",
    chapter: "아무도 미치지 않았다",
    chapterEn: "No One's Crazy",
    dialogue: [
      d("모건 하우절은 이렇게 시작해. 돈에 대한 너의 모든 판단은 네 경험에서 나와. 경험이 다르니까 판단도 달라. 아무도 미치지 않았어."),
      d("1970년에 태어난 사람과 1950년에 태어난 사람은 주식시장을 완전히 다르게 봐. 경험한 시장이 달라서야. 둘 다 합리적이야.", "경험이 렌즈다"),
      d("너도 한 번쯤 돈에 대해 누군가와 의견이 완전히 다른 적 있잖아. 그 사람이 틀린 게 아니야. 경험이 다를 뿐이야."),
      d("상상해봐. 대공황을 겪은 할머니가 현금을 매트리스 밑에 숨겨. 미친 짓일까? 아니야. 그 경험 안에서는 완벽히 합리적이야."),
      d("하우절의 핵심 통찰. 금융 결정은 스프레드시트에서 나오지 않아. 저녁 식탁에서 나와. 가족, 문화, 시대가 네 돈 감각을 만들어."),
      d("「돈에 대한 당신의 경험은 전체 세계 인구의 0.00000001%에 불과하다. 하지만 그것이 당신이 세상을 보는 방식의 80%를 결정한다.」"),
      d("이건 겸손의 초대야. 내 판단이 절대적이지 않다는 걸 인정하는 거야. 다른 사람의 금융 결정을 이해하려면 그의 경험을 봐야 해.", "겸손의 초대"),
      d("하우절이 이 책에서 하려는 건 금융 조언이 아니야. 돈에 대한 인간의 심리를 탐구하는 거야. 왜 사람들이 그렇게 행동하는지."),
      d("경제학은 인간을 합리적이라 가정해. 하우절은 반대로 시작해. 인간은 합리적이지 않아. 근데 이해할 수 있어. 맥락을 보면."),
      d("이 책은 20개의 짧은 에세이야. 각각이 독립적이야. 근데 하나의 주제로 관통돼. 돈은 수학이 아니라 심리학이라는 것."),
      d("넌 지금 돈에 대해 어떤 경험을 가지고 있어? 그 경험이 네 모든 금융 판단을 만들고 있다는 걸 알고 있었어?"),
    ],
    dialogueEn: [
      d("Morgan Housel starts like this: all your money judgments come from your experience. Different experiences, different judgments. No one's crazy."),
      d("Someone born in 1970 and someone born in 1950 see the stock market completely differently. Different experienced markets. Both are rational.", "experience is the lens"),
      d("You've completely disagreed with someone about money. They're not wrong. Their experience is just different."),
      d("Imagine a grandmother who lived through the Great Depression hiding cash under her mattress. Crazy? No. Perfectly rational within that experience."),
      d("Housel's core insight: financial decisions don't come from spreadsheets. They come from dinner tables. Family, culture, era shape your money sense."),
      d("'Your experience with money represents 0.00000001% of the world's population. But it determines 80% of how you see the world.'"),
      d("This is an invitation to humility. Admitting your judgment isn't absolute. To understand others' financial decisions, see their experience.", "invitation to humility"),
      d("What Housel does in this book isn't financial advice. It's exploring human psychology about money. Why people behave the way they do."),
      d("Economics assumes humans are rational. Housel starts from the opposite. Humans aren't rational. But they're understandable. Look at the context."),
      d("This book is 20 short essays. Each independent. But unified by one theme: money is psychology, not math."),
      d("What experience with money do you have right now? Did you know that experience shapes all your financial judgments?"),
    ],
    quizzes: [
      q("하우절이 '아무도 미치지 않았다'고 주장하는 근거는?", ["사람들이 본질적으로 낙관적이라서", "각자의 경험 안에서는 누구나 합리적이라서", "모든 투자 결정은 항상 합리적이라서", "심리학은 금융과 무관하다고 보므로"], 1, "네 경험 안에서 넌 합리적이야. 남도 마찬가지야. 비합리적으로 보이는 건 경험을 모르기 때문이야."),
      q("'돈은 수학이 아니라 심리학'이라는 전제가 중요한 이유는?", ["재무 분석에 수학이 불필요해서", "같은 데이터를 보고도 심리 때문에 다르게 행동하므로", "감정에 따라 투자하는 것이 더 나아서", "기존 경제학 이론을 비판하기 위해서"], 1, "같은 숫자를 보고 다르게 행동해. 왜? 심리 때문이야. 심리를 알면 더 나은 결정을 할 수 있어."),
    ],
    quizzesEn: [
      q("What's Housel's basis for claiming 'no one's crazy'?", ["People are inherently optimistic", "Everyone acts rationally within their own experience", "All investment decisions are always rational", "Psychology is irrelevant to finance"], 1, "Within your experience, you're rational. So is everyone else. What looks irrational is because you don't know their experience."),
      q("Why is this book's premise 'money is psychology, not math' important?", ["Math is unnecessary for financial analysis", "Same data leads to different decisions due to psychology", "Emotional investing produces better returns", "It's meant to criticize existing economics"], 1, "Same numbers, different behavior. Why? Psychology. Understanding psychology enables better decisions."),
    ],
    cliffhanger: "경험이 판단을 만든다. 근데 경험 말고도 돈에 영향을 주는 게 있어. 운이야.",
    cliffhangerEn: "Experience shapes judgment. But there's something else affecting money. Luck.",
    nextTitle: "경험이라는 렌즈",
    nextTitleEn: "The Lens of Experience",
    totalLessons: 12,
  },

  "45b77580": {
    title: "살인자의 후예",
    titleEn: "Descendants of Killers",
    chapter: "인지혁명",
    chapterEn: "The Cognitive Revolution",
    dialogue: [
      d("너 혹시 자기가 특별한 존재라고 생각해? 250만 년 전까지 인간은 그냥 먹이사슬 중간에 있던 평범한 동물이었어."),
      d("7만 년 전, 지구에는 최소 여섯 종의 인간이 동시에 살았어. 호모 사피엔스는 그중 하나일 뿐이었고, 가장 강하지도 않았어.", "여섯 종의 인간"),
      d("네안데르탈인은 뇌도 크고 근육도 강했어. 유럽의 혹독한 추위를 30만 년이나 견딘 진짜 생존 전문가였지. 사피엔스보다 훨씬 터프했어."),
      d("호모 에렉투스는 무려 200만 년을 살아남았어. 사피엔스? 겨우 30만 년째야. 우리가 대단한 게 아니라 타이밍이 좋았을 수도 있어."),
      d("그런데 이상한 일이 벌어져. 사피엔스가 아프리카를 떠나자 다른 인류 종들이 하나둘 사라지기 시작해. 호주에선 대형 동물 24종 중 23종이 멸종했어.", "대멸종의 시작"),
      d("상상해봐. 네안데르탈인과 사피엔스가 같은 계곡에서 마주치는 장면을. 결과는 항상 똑같았어. 한쪽이 사라졌지. 예외는 없었어."),
      d("「사피엔스가 다른 인류 종들에게 무슨 짓을 했는지, 우리는 차마 입에 올리기 어렵다.」 하라리의 표현 그대로야."),
      d("소름 끼치는 건 이거야. 우리 DNA에 네안데르탈인의 흔적이 1~4% 남아 있어. 형제를 죽이면서도 일부는 섞이기도 했다는 뜻이야.", "혼혈의 증거"),
      d("너 학교에서 인류 진화 배울 때 이런 얘기 들은 적 있어? 교과서에선 안 알려줘. 우리 조상이 형제 종을 멸종시켰다는 사실."),
      d("넌 지금 이 순간에도 살인자의 유전자를 갖고 살아가고 있어. 그게 우리 종의 출발점이야. 불편하지만 부정할 수 없는 사실이지."),
      d("넌 살인자의 후예야. 근데 그 불편함을 느끼는 것 자체가 사피엔스만이 가진 능력이야. 불편한 진실을 마주할 준비 됐어?"),
    ],
    dialogueEn: [
      d("Think you're a special being? Until 2.5 million years ago, humans were just ordinary animals in the middle of the food chain."),
      d("70,000 years ago, at least six human species coexisted. Homo sapiens was just one of them — and not even the strongest.", "six human species"),
      d("Neanderthals had bigger brains and stronger muscles. They survived 300,000 years of brutal European cold. Way tougher than Sapiens."),
      d("Homo erectus lasted 2 million years. Sapiens? Only 300,000 so far. Maybe we're not great — just well-timed."),
      d("Then something strange happened. When Sapiens left Africa, other human species started vanishing. In Australia, 23 of 24 megafauna went extinct.", "the great extinction"),
      d("Imagine Neanderthals and Sapiens meeting in the same valley. The outcome was always the same — one side disappeared. No exceptions."),
      d("'What Sapiens did to the other human species is something we can barely bring ourselves to describe.' Harari's exact words."),
      d("Here's the chilling part: our DNA carries 1–4% Neanderthal traces. While killing our siblings, some interbreeding happened.", "evidence of hybridization"),
      d("Did you ever learn this in school? Textbooks don't tell you — our ancestors drove their sibling species to extinction."),
      d("Right now, you're living with a killer's genes. That's our species' starting point. Uncomfortable, but undeniable."),
      d("You're a descendant of killers. But feeling that discomfort is uniquely sapiens. Ready to face uncomfortable truths?"),
    ],
    quizzes: [
      q("사피엔스가 도착한 지역에서 대형 동물이 대량 멸종한 사실이 시사하는 바는?", ["사피엔스가 생태계 파괴의 주범이었을 가능성", "기후변화가 멸종의 유일한 원인이었을 가능성", "대형 동물들이 자발적으로 이주했을 가능성", "사피엔스와 대형 동물이 공존했을 가능성"], 0, "사피엔스 도착 시점과 멸종 시점이 정확히 일치하는 건 우연으로 보기 어려워."),
      q("네안데르탈인 DNA가 현대인에 1~4% 남아 있다는 사실의 의미는?", ["두 종 사이에 부분적 혼혈이 있었다는 증거", "네안데르탈인이 사피엔스의 직계 조상이라는 증거", "두 종이 생물학적으로 완전히 달랐다는 증거", "현재 DNA 분석 기술이 부정확하다는 증거"], 0, "완전한 교체가 아니라 일부 혼합이 일어났다는 유전학적 증거야."),
    ],
    quizzesEn: [
      q("What does the mass extinction of megafauna upon Sapiens' arrival suggest?", ["Sapiens likely caused the ecological collapse", "Climate change was the sole cause of extinction", "Large animals voluntarily migrated elsewhere", "Sapiens and megafauna coexisted peacefully"], 0, "The timing of Sapiens' arrival and extinction events aligning is hard to dismiss as mere coincidence."),
      q("What can we infer from 1–4% Neanderthal DNA in modern humans?", ["Partial interbreeding occurred between the two species", "Neanderthals were direct ancestors of all Sapiens", "The two species were completely biologically separate", "Current DNA analysis technology is still unreliable"], 0, "It wasn't full replacement — partial hybridization occurred, as genetic evidence shows."),
    ],
    cliffhanger: "살인자의 후예가 살아남았어. 근데 수만 명이 뭉치려면 뭔가 더 필요해. 존재하지 않는 걸 믿는 능력.",
    cliffhangerEn: "The killers' descendants survived. But uniting tens of thousands requires more — believing in what doesn't exist.",
    nextTitle: "뒷담화의 혁명",
    nextTitleEn: "The Gossip Revolution",
    totalLessons: 20,
  },
};
