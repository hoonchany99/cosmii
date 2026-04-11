export interface BetaCurationSection {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  bookIds: string[];
}

export interface BookTagline {
  ko: string;
  en: string;
}

export const BETA_BOOK_IDS = [
  // 고전 / 철학 (20)
  "c_meditations",
  "cl_enchiridion",
  "cl_letters_stoic",
  "cl_republic",
  "cl_symposium",
  "cl_ethics",
  "cl_politics",
  "cl_prince",
  "cl_discourses",
  "cl_utopia",
  "2021cd07",
  "cl_macbeth",
  "cl_lear",
  "cl_odyssey",
  "cl_iliad",
  "e40c0e43",
  "cl_faust",
  "cl_frankenstein",
  "cl_pride",
  "cl_ivan_ilyich",
  // 한국 소설 (6)
  "k_almond",
  "k_convenience",
  "k_vegetarian",
  "k_pachinko",
  "k_dream_dept",
  "k_boy_comes",
  // 한국 에세이 (1)
  "k_tteokbokki",
  // 글로벌 소설 (14)
  "g_alchemist",
  "g_kite_runner",
  "f_little_prince",
  "f_stranger",
  "bc977bab",
  "f_norwegian",
  "f_1984",
  "f_gatsby",
  "f_catcher",
  "f_solitude",
  "f_namiya",
  "f_brave_new",
  "f_old_man_sea",
  "f_mockingbird",
  // 글로벌 논픽션 / 에세이 (4)
  "g_mans_search",
  "g_ikigai",
  "g_midnight_lib",
  "g_shoe_dog",
  // 자기계발 / 비즈니스 (10)
  "g_art_of_war",
  "s_atomic",
  "s_money_psych",
  "s_courage",
  "s_fastlane",
  "s_habit_power",
  "s_grit",
  "s_one_thing",
  "s_rich_dad",
  "s_titan_tools",
  // 인문 / 교양 / 과학 (8)
  "45b77580",
  "h_guns_germs",
  "afd7a4b0",
  "h_selfish_gene",
  "h_factfulness",
  "h_thinking",
  "h_justice",
  "h_nudge",
  // 고전 문학 추가 (5)
  "c_animal_farm",
  "c_metamorphosis",
  "c_crime",
  "c_plague",
  "c_unbearable",
  // 신규 (3)
  "n_museum_guard",
  "n_stolen_focus",
  "n_contradiction",
] as const;

export const BOOK_TAGLINES: Record<string, BookTagline> = {
  // ─── 고전 / 철학 (기존 20) ───
  c_meditations: {
    ko: "감정에 휘둘리지 않는 연습",
    en: "Learning not to be ruled by feelings",
  },
  cl_enchiridion: {
    ko: "내가 바꿀 수 있는 것에만 집중하기",
    en: "Focus only on what you can control",
  },
  cl_letters_stoic: {
    ko: "시간을 낭비하지 않는 법",
    en: "How to stop wasting your time",
  },
  cl_republic: {
    ko: "정의란 도대체 뭘까",
    en: "What does justice actually mean?",
  },
  cl_symposium: {
    ko: "사랑의 정체에 대한 가장 오래된 대화",
    en: "The oldest conversation about what love is",
  },
  cl_ethics: {
    ko: "좋은 삶이란 뭔지 진지하게 묻다",
    en: "A serious question: what's a good life?",
  },
  cl_politics: {
    ko: "함께 사는 건 왜 이렇게 어려울까",
    en: "Why is living together so hard?",
  },
  cl_prince: {
    ko: "현실적인 인간 이해",
    en: "Understanding people as they really are",
  },
  cl_discourses: {
    ko: "자유와 부패 사이에서",
    en: "Between freedom and corruption",
  },
  cl_utopia: {
    ko: "이상 사회는 진짜 가능할까",
    en: "Is a perfect society actually possible?",
  },
  "2021cd07": {
    ko: "망설임과 결단 사이에서",
    en: "Caught between hesitation and action",
  },
  cl_macbeth: {
    ko: "야망이 사람을 어떻게 삼키는지",
    en: "How ambition swallows you whole",
  },
  cl_lear: {
    ko: "판단 착오가 모든 걸 무너뜨릴 때",
    en: "When one bad call brings everything down",
  },
  cl_odyssey: {
    ko: "집으로 돌아가는 가장 긴 여정",
    en: "The longest road home",
  },
  cl_iliad: {
    ko: "분노가 전쟁을 만들 때",
    en: "When anger starts a war",
  },
  "e40c0e43": {
    ko: "길을 잃었을 때 다시 나아가는 법",
    en: "How to find your way when you're lost",
  },
  cl_faust: {
    ko: "모든 걸 가져도 채워지지 않는 것",
    en: "Having it all and still feeling empty",
  },
  cl_frankenstein: {
    ko: "만들어놓고 책임지지 않으면",
    en: "What happens when you create and abandon",
  },
  cl_pride: {
    ko: "관계와 판단의 착각",
    en: "When your judgment about people is wrong",
  },
  cl_ivan_ilyich: {
    ko: "죽음 앞에서야 삶이 보일 때",
    en: "When death finally shows you how to live",
  },

  // ─── 한국 소설 ───
  k_almond: {
    ko: "감정을 모르는 소년이 감정을 배울 때",
    en: "When a boy who can't feel learns to feel",
  },
  k_convenience: {
    ko: "작은 친절이 인생을 바꾸는 순간들",
    en: "Small acts of kindness that change everything",
  },
  k_vegetarian: {
    ko: "조용한 거부가 세상을 뒤흔들 때",
    en: "When a quiet refusal shakes the world",
  },
  k_pachinko: {
    ko: "역사가 빼앗을 수 없었던 것",
    en: "What history couldn't take away",
  },
  k_dream_dept: {
    ko: "오늘 밤 꾸고 싶은 꿈을 골라봐",
    en: "Pick the dream you want tonight",
  },
  k_boy_comes: {
    ko: "그날 이후에도 삶은 계속된다",
    en: "Life goes on even after that day",
  },

  // ─── 한국 에세이 ───
  k_tteokbokki: {
    ko: "괜찮지 않아도 괜찮다는 것",
    en: "It's okay to not be okay",
  },

  // ─── 글로벌 소설 ───
  g_alchemist: {
    ko: "꿈을 따라가면 우주가 도와준다",
    en: "Chase your dream and the universe conspires to help",
  },
  g_kite_runner: {
    ko: "속죄는 가능할까",
    en: "Is redemption possible?",
  },
  f_little_prince: {
    ko: "어른이 잊어버린 가장 중요한 것",
    en: "The most important thing adults forget",
  },
  f_stranger: {
    ko: "세상의 규칙에 맞추지 않으면",
    en: "What happens when you refuse to play along",
  },
  bc977bab: {
    ko: "진짜 나를 찾아가는 가장 외로운 여정",
    en: "The loneliest journey to finding yourself",
  },
  f_norwegian: {
    ko: "사랑과 상실 사이, 스물의 기록",
    en: "Between love and loss at twenty",
  },
  f_1984: {
    ko: "생각마저 감시당하는 세상",
    en: "A world where even thoughts are watched",
  },
  f_gatsby: {
    ko: "가질 수 없는 것을 쫓는 비극",
    en: "The tragedy of chasing what you can't have",
  },
  f_catcher: {
    ko: "세상이 전부 가짜로 느껴질 때",
    en: "When the whole world feels fake",
  },
  f_solitude: {
    ko: "100년간 반복되는 사랑과 고독",
    en: "Love and solitude repeating for a hundred years",
  },
  f_namiya: {
    ko: "시간을 넘은 편지가 인생을 바꿀 때",
    en: "When a letter across time changes a life",
  },
  f_brave_new: {
    ko: "행복이 의무인 세상의 공포",
    en: "The terror of a world where happiness is mandatory",
  },
  f_old_man_sea: {
    ko: "포기하지 않는 자의 품격",
    en: "The dignity of never giving up",
  },
  f_mockingbird: {
    ko: "올바르게 산다는 것의 무게",
    en: "The weight of doing what's right",
  },

  // ─── 글로벌 논픽션 / 에세이 ───
  g_mans_search: {
    ko: "모든 것을 빼앗겨도 남는 한 가지",
    en: "The one thing no one can ever take from you",
  },
  g_ikigai: {
    ko: "아침에 일어나는 이유를 찾는 법",
    en: "Finding your reason to get up each morning",
  },
  g_midnight_lib: {
    ko: "다른 인생을 살 수 있었다면",
    en: "What if you could live a different life?",
  },
  g_shoe_dog: {
    ko: "세계 최대 브랜드의 가장 불안했던 시절",
    en: "The most uncertain days behind the world's biggest brand",
  },

  // ─── 자기계발 / 비즈니스 ───
  g_art_of_war: {
    ko: "싸우지 않고 이기는 기술",
    en: "The art of winning without fighting",
  },
  s_atomic: {
    ko: "매일 1%가 인생을 바꾸는 원리",
    en: "How 1% daily changes everything",
  },
  s_money_psych: {
    ko: "돈을 대하는 태도가 부를 결정한다",
    en: "Your relationship with money decides your wealth",
  },
  s_courage: {
    ko: "남의 시선에서 자유로워지는 법",
    en: "How to free yourself from others' expectations",
  },
  s_fastlane: {
    ko: "65세까지 기다릴 수 없다면",
    en: "If you can't wait until 65 to be rich",
  },
  s_habit_power: {
    ko: "무의식이 당신의 하루를 지배한다",
    en: "Your unconscious habits rule your entire day",
  },
  s_grit: {
    ko: "재능보다 중요한 단 한 가지",
    en: "The one thing that matters more than talent",
  },
  s_one_thing: {
    ko: "딱 하나에 집중하면 전부 달라진다",
    en: "Focus on one thing and everything changes",
  },
  s_rich_dad: {
    ko: "학교가 안 가르쳐준 돈의 규칙",
    en: "The money rules school never taught you",
  },
  s_titan_tools: {
    ko: "세계 최고들의 아침 루틴",
    en: "Morning routines of the world's top performers",
  },

  // ─── 인문 / 교양 / 과학 ───
  "45b77580": {
    ko: "인류 7만 년의 가장 큰 비밀",
    en: "The biggest secret of 70,000 years of humanity",
  },
  h_guns_germs: {
    ko: "문명의 운명을 가른 건 지리였다",
    en: "Geography decided the fate of civilizations",
  },
  afd7a4b0: {
    ko: "밤하늘을 올려다보게 만드는 책",
    en: "A book that makes you look up at the night sky",
  },
  h_selfish_gene: {
    ko: "당신의 모든 행동에 숨겨진 이유",
    en: "The hidden reason behind everything you do",
  },
  h_factfulness: {
    ko: "세상은 당신 생각보다 나아지고 있다",
    en: "The world is getting better than you think",
  },
  h_thinking: {
    ko: "당신의 직감이 틀리는 이유",
    en: "Why your gut feeling is wrong",
  },
  h_justice: {
    ko: "정답 없는 질문이 가장 중요하다",
    en: "The questions without answers matter most",
  },
  h_nudge: {
    ko: "작은 설계가 큰 선택을 바꾼다",
    en: "Small designs change big decisions",
  },

  // ─── 고전 문학 추가 ───
  c_animal_farm: {
    ko: "권력은 어떻게 부패하는가",
    en: "How power corrupts, every single time",
  },
  c_metamorphosis: {
    ko: "어느 날 갑자기 세상에서 밀려나면",
    en: "When you're suddenly pushed out of the world",
  },
  c_crime: {
    ko: "한 번의 선택이 영혼을 집어삼킬 때",
    en: "When one choice devours your soul",
  },
  c_plague: {
    ko: "전염병이 인간의 본성을 드러낼 때",
    en: "When a plague reveals who we really are",
  },
  c_unbearable: {
    ko: "삶이 한 번뿐이라는 건 가벼울까 무거울까",
    en: "Is living only once light — or unbearably heavy?",
  },

  // ─── 신규 ───
  n_museum_guard: {
    ko: "슬픔 한가운데서 아름다움을 찾다",
    en: "Finding beauty in the middle of grief",
  },
  n_stolen_focus: {
    ko: "왜 우리는 점점 집중을 못 할까",
    en: "Why we can't focus anymore",
  },
  n_contradiction: {
    ko: "모순을 받아들이면 자유로워진다",
    en: "Accepting contradictions sets you free",
  },
};

export const BOOK_TITLES: Record<string, { ko: string; en: string }> = {
  c_meditations: { ko: "명상록", en: "Meditations" },
  cl_enchiridion: { ko: "엔키리디온", en: "Enchiridion" },
  cl_letters_stoic: { ko: "세네카 서한집", en: "Letters from a Stoic" },
  cl_republic: { ko: "국가", en: "Republic" },
  cl_symposium: { ko: "향연", en: "Symposium" },
  cl_ethics: { ko: "니코마코스 윤리학", en: "Nicomachean Ethics" },
  cl_politics: { ko: "정치학", en: "Politics" },
  cl_prince: { ko: "군주론", en: "The Prince" },
  cl_discourses: { ko: "리비우스 논고", en: "Discourses" },
  cl_utopia: { ko: "유토피아", en: "Utopia" },
  "2021cd07": { ko: "햄릿", en: "Hamlet" },
  cl_macbeth: { ko: "맥베스", en: "Macbeth" },
  cl_lear: { ko: "리어왕", en: "King Lear" },
  cl_odyssey: { ko: "오디세이아", en: "Odyssey" },
  cl_iliad: { ko: "일리아스", en: "Iliad" },
  "e40c0e43": { ko: "신곡", en: "Divine Comedy" },
  cl_faust: { ko: "파우스트", en: "Faust" },
  cl_frankenstein: { ko: "프랑켄슈타인", en: "Frankenstein" },
  cl_pride: { ko: "오만과 편견", en: "Pride and Prejudice" },
  cl_ivan_ilyich: { ko: "이반 일리치의 죽음", en: "The Death of Ivan Ilyich" },
  k_almond: { ko: "아몬드", en: "Almond" },
  k_convenience: { ko: "편의점 가는 기분", en: "Convenience Store Woman" },
  k_vegetarian: { ko: "채식주의자", en: "The Vegetarian" },
  k_pachinko: { ko: "파친코", en: "Pachinko" },
  k_dream_dept: { ko: "꿈의 백화점", en: "Dream Department Store" },
  k_boy_comes: { ko: "소년이 온다", en: "Human Acts" },
  k_tteokbokki: { ko: "떡볶이 에세이", en: "Tteokbokki Essay" },
  g_alchemist: { ko: "연금술사", en: "The Alchemist" },
  g_kite_runner: { ko: "연을 쫓는 아이", en: "The Kite Runner" },
  f_little_prince: { ko: "어린 왕자", en: "The Little Prince" },
  f_stranger: { ko: "이방인", en: "The Stranger" },
  bc977bab: { ko: "데미안", en: "Demian" },
  f_norwegian: { ko: "상실의 시대", en: "Norwegian Wood" },
  f_1984: { ko: "1984", en: "1984" },
  f_gatsby: { ko: "위대한 개츠비", en: "The Great Gatsby" },
  f_catcher: { ko: "호밀밭의 파수꾼", en: "The Catcher in the Rye" },
  f_solitude: { ko: "백년의 고독", en: "One Hundred Years of Solitude" },
  f_namiya: { ko: "나미야 잡화점의 기적", en: "Miracles of the Namiya General Store" },
  f_brave_new: { ko: "멋진 신세계", en: "Brave New World" },
  f_old_man_sea: { ko: "노인과 바다", en: "The Old Man and the Sea" },
  f_mockingbird: { ko: "앵무새 죽이기", en: "To Kill a Mockingbird" },
  g_mans_search: { ko: "죽음의 수용소에서", en: "Man's Search for Meaning" },
  g_ikigai: { ko: "이키가이", en: "Ikigai" },
  g_midnight_lib: { ko: "미드나잇 라이브러리", en: "The Midnight Library" },
  g_shoe_dog: { ko: "슈독", en: "Shoe Dog" },
  g_art_of_war: { ko: "손자병법", en: "The Art of War" },
  s_atomic: { ko: "아토믹 해빗", en: "Atomic Habits" },
  s_money_psych: { ko: "돈의 심리학", en: "The Psychology of Money" },
  s_courage: { ko: "미움받을 용기", en: "The Courage to Be Disliked" },
  s_fastlane: { ko: "부의 추월차선", en: "The Millionaire Fastlane" },
  s_habit_power: { ko: "습관의 힘", en: "The Power of Habit" },
  s_grit: { ko: "그릿", en: "Grit" },
  s_one_thing: { ko: "원씽", en: "The ONE Thing" },
  s_rich_dad: { ko: "부자 아빠 가난한 아빠", en: "Rich Dad Poor Dad" },
  s_titan_tools: { ko: "타이탄의 도구들", en: "Tools of Titans" },
  "45b77580": { ko: "사피엔스", en: "Sapiens" },
  h_guns_germs: { ko: "총, 균, 쇠", en: "Guns, Germs, and Steel" },
  afd7a4b0: { ko: "코스모스", en: "Cosmos" },
  h_selfish_gene: { ko: "이기적 유전자", en: "The Selfish Gene" },
  h_factfulness: { ko: "팩트풀니스", en: "Factfulness" },
  h_thinking: { ko: "생각에 관한 생각", en: "Thinking, Fast and Slow" },
  h_justice: { ko: "정의란 무엇인가", en: "Justice" },
  h_nudge: { ko: "넛지", en: "Nudge" },
  c_animal_farm: { ko: "동물농장", en: "Animal Farm" },
  c_metamorphosis: { ko: "변신", en: "The Metamorphosis" },
  c_crime: { ko: "죄와 벌", en: "Crime and Punishment" },
  c_plague: { ko: "페스트", en: "The Plague" },
  c_unbearable: { ko: "참을 수 없는 존재의 가벼움", en: "The Unbearable Lightness of Being" },
  n_museum_guard: { ko: "황금빛 찬미가", en: "The Goldfinch" },
  n_stolen_focus: { ko: "도둑맞은 집중력", en: "Stolen Focus" },
  n_contradiction: { ko: "모순", en: "Contradiction" },
};

const OL = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

export const BOOK_COVER_MAP: Record<string, string> = {
  // 로컬 커버 (8권)
  bc977bab: "/covers/bc977bab.jpg",
  "45b77580": "/covers/45b77580.jpg",
  e40c0e43: "/covers/e40c0e43.jpg",
  afd7a4b0: "/covers/afd7a4b0.jpg",
  "2021cd07": "/covers/2021cd07.jpg",
  s_atomic: "/covers/s_atomic.jpg",
  s_money_psych: "/covers/s_money_psych.jpg",
  s_courage: "/covers/s_courage.jpg",
  // 고전 / 철학
  c_meditations: OL("9780140449334"),
  cl_enchiridion: OL("9780486433592"),
  cl_letters_stoic: OL("9780140442106"),
  cl_republic: OL("9780140455113"),
  cl_symposium: OL("9780140449273"),
  cl_ethics: OL("9780140449495"),
  cl_politics: OL("9780140444216"),
  cl_prince: OL("9780140449150"),
  cl_discourses: OL("9780140444285"),
  cl_utopia: OL("9780140449105"),
  cl_macbeth: OL("9780743477109"),
  cl_lear: OL("9780743482769"),
  cl_odyssey: OL("9780140268867"),
  cl_iliad: OL("9780140275360"),
  cl_faust: OL("9780140449013"),
  cl_frankenstein: OL("9780141439471"),
  cl_pride: OL("9780141439518"),
  cl_ivan_ilyich: OL("9780140449617"),
  // 한국 소설
  k_almond: OL("9781538541364"),
  k_convenience: OL("9780802128256"),
  k_vegetarian: OL("9780553448184"),
  k_pachinko: OL("9781455563937"),
  k_dream_dept: OL("9791191056075"),
  k_boy_comes: OL("9781101906743"),
  k_tteokbokki: OL("9791190382632"),
  // 글로벌 소설
  g_alchemist: OL("9780062315007"),
  g_kite_runner: OL("9781594631931"),
  f_little_prince: OL("9780156012195"),
  f_stranger: OL("9780679720201"),
  f_norwegian: OL("9780375704024"),
  f_1984: OL("9780451524935"),
  f_gatsby: OL("9780743273565"),
  f_catcher: OL("9780316769488"),
  f_solitude: OL("9780060883287"),
  f_namiya: OL("9784041012017"),
  f_brave_new: OL("9780060850524"),
  f_old_man_sea: OL("9780684801223"),
  f_mockingbird: OL("9780060935467"),
  // 글로벌 논픽션
  g_mans_search: OL("9780807014295"),
  g_ikigai: OL("9780143130727"),
  g_midnight_lib: OL("9780525559474"),
  g_shoe_dog: OL("9781501135910"),
  g_art_of_war: OL("9781590302255"),
  // 자기계발 / 비즈니스
  s_fastlane: OL("9780984358106"),
  s_habit_power: OL("9780812981605"),
  s_grit: OL("9781501111112"),
  s_one_thing: OL("9781885167774"),
  s_rich_dad: OL("9781612680194"),
  s_titan_tools: OL("9781328683786"),
  // 인문 / 교양 / 과학
  h_guns_germs: OL("9780393317558"),
  h_selfish_gene: OL("9780199291151"),
  h_factfulness: OL("9781250107817"),
  h_thinking: OL("9780374533557"),
  h_justice: OL("9780374532505"),
  h_nudge: OL("9780143115267"),
  // 고전 문학 추가
  c_animal_farm: OL("9780451526342"),
  c_metamorphosis: OL("9780553213690"),
  c_crime: OL("9780486415871"),
  c_plague: OL("9780679720218"),
  c_unbearable: OL("9780060932138"),
  // 신규
  n_museum_guard: OL("9780316055437"),
  n_stolen_focus: OL("9781526620224"),
  n_contradiction: OL("9788937460548"),
};

const CARD_COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
  "#ef4444", "#3b82f6", "#84cc16", "#e879f9", "#22d3ee",
];

export function getCardColor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export const BETA_RECOMMENDED_IDS = [
  "s_atomic",
  "g_alchemist",
  "k_almond",
  "c_meditations",
  "f_1984",
];

export const BETA_CURATION_SECTIONS: BetaCurationSection[] = [
  // ── TOP TIER: 가장 보편적으로 관심 끄는 주제 ──
  {
    id: "all_night_reads",
    title: "밤새 읽게 되는 소설",
    titleEn: "Novels you'll stay up all night reading",
    subtitle: "한 챕터만 더… 하다가 날이 밝는 책들",
    subtitleEn: "Just one more chapter… and suddenly it's dawn",
    bookIds: ["g_kite_runner", "c_crime", "k_pachinko", "f_solitude", "c_unbearable", "k_almond"],
  },
  {
    id: "must_read_20s",
    title: "20대에 안 읽으면 후회하는 책",
    titleEn: "Books you'll regret not reading in your 20s",
    subtitle: "지금 읽어야 10년 뒤가 달라진다",
    subtitleEn: "Read them now — your future self will thank you",
    bookIds: ["bc977bab", "s_atomic", "f_norwegian", "s_courage", "g_alchemist"],
  },
  {
    id: "comfort",
    title: "지친 하루 끝, 위로가 되는 책",
    titleEn: "Books that comfort you after a rough day",
    subtitle: "따뜻한 한 문장이 하루를 바꿔줄 때가 있어",
    subtitleEn: "Sometimes one warm sentence changes your whole day",
    bookIds: ["k_tteokbokki", "f_namiya", "k_dream_dept", "k_convenience", "g_mans_search", "n_contradiction"],
  },
  {
    id: "money_start",
    title: "돈 공부, 어디서부터 시작하지?",
    titleEn: "Where to start learning about money",
    subtitle: "월급만으로는 안 되는 시대, 돈의 언어를 배우자",
    subtitleEn: "In a world where salary alone won't cut it — learn the language of money",
    bookIds: ["s_money_psych", "s_rich_dad", "s_fastlane", "g_shoe_dog", "s_titan_tools"],
  },
  {
    id: "one_day_classics",
    title: "하루 만에 끝내는 명작",
    titleEn: "Masterpieces you can finish in a day",
    subtitle: "200페이지 이하, 짧지만 인생이 달라지는 책",
    subtitleEn: "Under 200 pages — short reads that hit different",
    bookIds: ["c_metamorphosis", "f_little_prince", "c_animal_farm", "f_old_man_sea", "cl_ivan_ilyich", "g_art_of_war"],
  },
  {
    id: "honest_love",
    title: "사랑에 대한 가장 솔직한 책들",
    titleEn: "The most honest books about love",
    subtitle: "달콤한 로맨스 말고, 진짜 사랑 이야기",
    subtitleEn: "Not fairy tales — real stories about what love actually is",
    bookIds: ["f_norwegian", "cl_pride", "k_almond", "c_unbearable", "cl_symposium"],
  },

  // ── MID TIER: 관심 유발하는 다양한 주제 ──
  {
    id: "solo_night",
    title: "혼자만의 밤, 생각이 깊어지는 시간",
    titleEn: "Alone at night — when thoughts go deep",
    subtitle: "조용한 밤, 나만의 시간에 어울리는 책",
    subtitleEn: "Perfect reads for a quiet night with just yourself",
    bookIds: ["c_meditations", "f_stranger", "c_plague", "cl_letters_stoic", "n_museum_guard"],
  },
  {
    id: "crossroads",
    title: "인생의 갈림길에 서 있다면",
    titleEn: "When you're standing at a crossroads",
    subtitle: "방향을 잃은 순간, 다시 길을 찾게 해준 이야기들",
    subtitleEn: "Stories that helped people find their way again",
    bookIds: ["g_alchemist", "bc977bab", "g_midnight_lib", "e40c0e43", "cl_faust"],
  },
  {
    id: "phone_off",
    title: "SNS 끄고 나에게 집중하는 시간",
    titleEn: "Turn off your phone and focus on you",
    subtitle: "스크롤 멈추고 나를 들여다보는 시간",
    subtitleEn: "Stop scrolling — give yourself undivided attention",
    bookIds: ["n_stolen_focus", "s_one_thing", "s_atomic", "g_ikigai", "cl_letters_stoic"],
  },
  {
    id: "korean_lit",
    title: "한국 문학의 힘",
    titleEn: "The power of Korean literature",
    subtitle: "세계가 주목하는 한국 작가들의 목소리",
    subtitleEn: "Korean voices the world is listening to",
    bookIds: ["k_vegetarian", "k_pachinko", "k_boy_comes", "k_almond", "k_tteokbokki", "k_convenience"],
  },
  {
    id: "identity",
    title: "내가 누군지 모르겠을 때",
    titleEn: "When you don't know who you are",
    subtitle: "나를 찾아가는 여정이 담긴 이야기들",
    subtitleEn: "Stories about the journey of finding yourself",
    bookIds: ["bc977bab", "f_catcher", "k_almond", "cl_faust", "f_stranger", "n_contradiction"],
  },
  {
    id: "quit_job",
    title: "퇴사를 고민하는 당신에게",
    titleEn: "For anyone thinking about quitting",
    subtitle: "나다운 삶은 어디서 시작되는가",
    subtitleEn: "Where does living on your own terms actually begin?",
    bookIds: ["g_ikigai", "s_grit", "g_alchemist", "g_shoe_dog", "s_fastlane"],
  },
  {
    id: "travel_reads",
    title: "여행 가방에 넣고 싶은 책",
    titleEn: "Books to pack in your travel bag",
    subtitle: "비행기에서, 카페에서, 낯선 도시에서 읽기 좋은 책",
    subtitleEn: "Perfect for the plane, a café, or a new city",
    bookIds: ["f_little_prince", "g_alchemist", "g_ikigai", "f_old_man_sea", "cl_odyssey"],
  },
  {
    id: "reread_adult",
    title: "어른이 되어 다시 읽는 책",
    titleEn: "Books that hit different as an adult",
    subtitle: "어렸을 때 몰랐던 게 지금은 보여",
    subtitleEn: "You missed so much the first time around",
    bookIds: ["f_little_prince", "cl_pride", "f_catcher", "k_dream_dept", "c_animal_farm"],
  },

  // ── LOWER TIER: 지적 호기심, 깊은 주제 ──
  {
    id: "how_world_works",
    title: "세상이 왜 이렇게 돌아갈까",
    titleEn: "Why does the world work this way?",
    subtitle: "뉴스보다 세상을 잘 설명해주는 책들",
    subtitleEn: "Books that explain the world better than the news",
    bookIds: ["45b77580", "h_guns_germs", "h_selfish_gene", "h_factfulness", "afd7a4b0"],
  },
  {
    id: "must_read_classics",
    title: "죽기 전에 한 번은 읽어야 할 고전",
    titleEn: "Classics you must read at least once",
    subtitle: "수천 년 동안 살아남은 데는 이유가 있다",
    subtitleEn: "There's a reason they've survived for centuries",
    bookIds: ["cl_odyssey", "c_crime", "f_gatsby", "e40c0e43", "f_solitude", "cl_iliad"],
  },
  {
    id: "conversation_upgrade",
    title: "읽으면 대화가 달라지는 책",
    titleEn: "Books that upgrade your conversations",
    subtitle: "생각의 깊이가 달라지면 말도 달라진다",
    subtitleEn: "Think deeper, speak differently",
    bookIds: ["h_justice", "h_thinking", "h_nudge", "cl_republic", "45b77580"],
  },
  {
    id: "habit_system",
    title: "습관을 바꾸면 인생이 바뀐다",
    titleEn: "Change your habits, change your life",
    subtitle: "의지력 말고, 시스템으로 바꿔라",
    subtitleEn: "Don't rely on willpower — redesign the system",
    bookIds: ["s_atomic", "s_habit_power", "s_grit", "s_one_thing", "s_titan_tools"],
  },
  {
    id: "award_winners",
    title: "수상작에는 이유가 있다",
    titleEn: "Award winners earn their titles",
    subtitle: "노벨상, 퓰리처상, 부커상 — 검증된 감동",
    subtitleEn: "Nobel, Pulitzer, Booker — proven to move you",
    bookIds: ["k_vegetarian", "f_old_man_sea", "f_solitude", "f_mockingbird", "c_plague"],
  },
  {
    id: "stoic_calm",
    title: "감정에 휘둘리지 않는 연습",
    titleEn: "Practicing emotional steadiness",
    subtitle: "2,000년 전 스토아 철학자들의 마음 훈련법",
    subtitleEn: "Mental training techniques from Stoic philosophers, 2,000 years ago",
    bookIds: ["c_meditations", "cl_enchiridion", "cl_letters_stoic", "s_courage", "cl_ethics"],
  },
  {
    id: "dystopia",
    title: "이 세상은 디스토피아인가",
    titleEn: "Are we living in a dystopia?",
    subtitle: "소설이라고 넘기기엔 너무 현실적인 이야기들",
    subtitleEn: "Too real to dismiss as just fiction",
    bookIds: ["f_1984", "f_brave_new", "c_animal_farm", "cl_utopia", "cl_frankenstein"],
  },
  {
    id: "under_stars",
    title: "밤하늘 아래 읽고 싶은 책",
    titleEn: "Books to read under the stars",
    subtitle: "우주, 삶, 아름다움에 대한 깊은 대화",
    subtitleEn: "Deep conversations about the universe, life, and beauty",
    bookIds: ["afd7a4b0", "f_little_prince", "g_mans_search", "c_meditations", "n_museum_guard"],
  },
  {
    id: "ambition_power",
    title: "야망이 사람을 어떻게 바꾸는가",
    titleEn: "How ambition changes people",
    subtitle: "권력을 가진 자들의 흥망성쇠",
    subtitleEn: "The rise and fall of those who hold power",
    bookIds: ["cl_macbeth", "cl_prince", "2021cd07", "cl_lear", "f_gatsby", "cl_discourses"],
  },
  {
    id: "philosophy_easy",
    title: "철학이 어렵다면 이것부터",
    titleEn: "If philosophy scares you, start here",
    subtitle: "어렵지 않아, 그냥 삶에 대한 솔직한 질문이야",
    subtitleEn: "It's not hard — just honest questions about life",
    bookIds: ["cl_enchiridion", "s_courage", "f_stranger", "bc977bab", "cl_symposium"],
  },

  // ── 추가 큐레이션 (25~40) ──
  {
    id: "first_page_hook",
    title: "첫 페이지부터 몰입되는 책",
    titleEn: "Hooked from the very first page",
    subtitle: "첫 문장에 잡혀서 끝까지 놓을 수 없는 책들",
    subtitleEn: "One sentence in and you can't put it down",
    bookIds: ["c_metamorphosis", "g_kite_runner", "f_1984", "c_crime", "k_vegetarian"],
  },
  {
    id: "family_pain",
    title: "가족이라서 더 아픈 이야기",
    titleEn: "It hurts more because it's family",
    subtitle: "사랑하니까 상처받는, 가장 가까운 관계의 이야기",
    subtitleEn: "The closest relationships leave the deepest wounds",
    bookIds: ["k_pachinko", "cl_lear", "k_boy_comes", "f_mockingbird", "2021cd07"],
  },
  {
    id: "mind_blown",
    title: "읽으면 세계관이 바뀌는 책",
    titleEn: "Books that completely shift your worldview",
    subtitle: "같은 세상이 다르게 보이기 시작하는 순간",
    subtitleEn: "The moment the same world starts looking completely different",
    bookIds: ["45b77580", "h_selfish_gene", "afd7a4b0", "h_guns_germs", "f_brave_new"],
  },
  {
    id: "mz_trending",
    title: "요즘 2030이 가장 많이 읽는 책",
    titleEn: "What people in their 20s–30s are reading now",
    subtitle: "SNS에서 가장 많이 언급되는 그 책들",
    subtitleEn: "The books everyone's talking about on social media",
    bookIds: ["s_atomic", "k_almond", "s_courage", "n_stolen_focus", "g_midnight_lib", "k_tteokbokki"],
  },
  {
    id: "death_reflection",
    title: "죽음에 대해 생각하게 되는 밤",
    titleEn: "Nights that make you think about death",
    subtitle: "끝을 생각하면 오히려 지금이 선명해져",
    subtitleEn: "Thinking about the end makes the present sharper",
    bookIds: ["cl_ivan_ilyich", "g_mans_search", "c_plague", "c_unbearable", "f_old_man_sea"],
  },
  {
    id: "unforgettable_ending",
    title: "절대 잊히지 않는 엔딩",
    titleEn: "Endings you'll never forget",
    subtitle: "마지막 페이지를 덮고도 한참을 멍하게 된 책",
    subtitleEn: "Books that left you staring at the wall after the last page",
    bookIds: ["f_gatsby", "k_vegetarian", "c_crime", "f_norwegian", "f_solitude"],
  },
  {
    id: "leadership",
    title: "리더가 되고 싶다면 읽어야 할 책",
    titleEn: "Essential reads for aspiring leaders",
    subtitle: "팀을 이끌고, 판단하고, 결정하는 기술",
    subtitleEn: "The art of leading, judging, and deciding",
    bookIds: ["cl_prince", "g_art_of_war", "cl_politics", "s_titan_tools", "g_shoe_dog"],
  },
  {
    id: "rainy_day",
    title: "비 오는 날 읽기 좋은 책",
    titleEn: "Perfect reads for a rainy day",
    subtitle: "창밖에 빗소리, 손에는 따뜻한 차와 책 한 권",
    subtitleEn: "Rain on the window, warm tea in hand, and a good book",
    bookIds: ["f_norwegian", "k_dream_dept", "f_namiya", "n_museum_guard", "f_little_prince"],
  },
  {
    id: "human_nature",
    title: "인간은 원래 이런 존재일까",
    titleEn: "Is this just who we are?",
    subtitle: "선한가, 악한가 — 인간 본성에 대한 가장 오래된 질문",
    subtitleEn: "Good or evil — the oldest question about human nature",
    bookIds: ["h_selfish_gene", "f_stranger", "c_animal_farm", "cl_prince", "45b77580"],
  },
  {
    id: "inspired_true",
    title: "실화에서 영감을 받은 이야기",
    titleEn: "Stories inspired by true events",
    subtitle: "현실이 소설보다 더 극적일 때",
    subtitleEn: "When reality is more dramatic than fiction",
    bookIds: ["k_pachinko", "g_kite_runner", "g_shoe_dog", "g_mans_search", "k_boy_comes"],
  },
  {
    id: "loneliness",
    title: "결국 혼자라는 걸 알게 될 때",
    titleEn: "When you realize you're truly alone",
    subtitle: "외로움을 직시하면 오히려 단단해지는 법",
    subtitleEn: "Facing loneliness head-on makes you stronger",
    bookIds: ["c_metamorphosis", "f_stranger", "k_almond", "f_catcher", "c_unbearable"],
  },
  {
    id: "self_esteem",
    title: "자존감이 바닥일 때 읽는 책",
    titleEn: "When your self-esteem hits rock bottom",
    subtitle: "다시 나를 믿을 수 있게 해주는 문장들",
    subtitleEn: "Sentences that help you believe in yourself again",
    bookIds: ["s_courage", "k_tteokbokki", "g_mans_search", "n_contradiction", "s_grit"],
  },
  {
    id: "better_than_movies",
    title: "영화보다 재밌는 소설",
    titleEn: "Novels more thrilling than movies",
    subtitle: "스크린으로는 담을 수 없는 원작의 힘",
    subtitleEn: "The power of the original that no screen can capture",
    bookIds: ["f_1984", "g_kite_runner", "f_gatsby", "k_pachinko", "cl_frankenstein", "f_mockingbird"],
  },
  {
    id: "no_easy_answers",
    title: "정답이 없는 질문을 던지는 책",
    titleEn: "Books that ask questions with no easy answers",
    subtitle: "읽고 나면 며칠째 생각에 잠기게 돼",
    subtitleEn: "You'll be thinking about these for days",
    bookIds: ["h_justice", "cl_republic", "f_mockingbird", "cl_ethics", "c_plague"],
  },
  {
    id: "morning_routine",
    title: "아침에 읽으면 하루가 달라지는 책",
    titleEn: "Books that transform your mornings",
    subtitle: "출근 전 10분, 하루의 마인드셋을 바꿔주는 한 페이지",
    subtitleEn: "10 minutes before work — one page that resets your mindset",
    bookIds: ["s_atomic", "c_meditations", "s_one_thing", "g_ikigai", "cl_enchiridion"],
  },
  {
    id: "banned_books",
    title: "한때 금서였던 책들",
    titleEn: "Books that were once banned",
    subtitle: "세상이 두려워했던 생각들, 지금은 고전이 됐다",
    subtitleEn: "Ideas the world once feared — now they're classics",
    bookIds: ["f_1984", "c_animal_farm", "f_brave_new", "f_catcher", "k_vegetarian", "cl_utopia"],
  },
];
