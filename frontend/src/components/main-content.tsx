"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useIsMobile } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  MessageCircle,
  Sparkles,
  Trash2,
  History,
  X,
  ArrowLeft,
  Network,
  BookOpen,
  Clock3,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UniverseCanvas } from "@/components/universe-canvas";
import { FloatingCosmii3D } from "@/components/floating-cosmii";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { WarpOverlay } from "@/components/warp-overlay";
import { GearConstellation } from "@/components/gear-constellation";
import { CosmiiConstellation } from "@/components/cosmii-constellation";
import { getModelCard, streamChat, type AnswerPartData } from "@/lib/api";
import { getBookColorById } from "@/lib/colors";
import { getChatState, setChatState } from "@/lib/store";
import type {
  BookInfo,
  BookModelCard,
  GraphData,
  ChatMessage as ChatMessageType,
  ThinkingProcess,
  Source,
  UploadingBook,
  UploadStage,
} from "@/lib/types";
import { UPLOAD_STAGES, UPLOAD_STAGE_LABELS } from "@/lib/types";

type View = "graph" | "detail" | "chat";
type DemoStep = "diagnostic" | "lecture" | "check" | "discussion";

interface DemoSession {
  id: string;
  chapter: number;
  chapterTitle: string;
  part: number;
  parts: number;
  words: number;
  range: string;
  spark: string;
  question: string;
  options: [string, string, string];
  answerIndex: 0 | 1 | 2;
  cliffhanger: string;
}

const DEMO_SESSIONS: DemoSession[] = [
  {
    id: "S01",
    chapter: 1,
    chapterTitle: "Two Worlds",
    part: 1,
    parts: 3,
    words: 2203,
    range: "paras 1-22",
    spark: "Today we watch the first crack between Sinclair's safe world and shadow world.",
    question: "What first pushes Sinclair into the other world most strongly?",
    options: ["Curiosity", "Fear of an older boy", "Religious doubt"],
    answerIndex: 1,
    cliffhanger: "Tomorrow, that fear hardens into a trap.",
  },
  {
    id: "S02",
    chapter: 1,
    chapterTitle: "Two Worlds",
    part: 2,
    parts: 3,
    words: 2137,
    range: "paras 23-65",
    spark: "Now watch how fear becomes routine and silence becomes strategy.",
    question: "What keeps the trap alive in this section?",
    options: ["Physical injury", "Ongoing intimidation", "Exam anxiety"],
    answerIndex: 1,
    cliffhanger: "Someone notices what Sinclair never says out loud.",
  },
  {
    id: "S03",
    chapter: 1,
    chapterTitle: "Two Worlds",
    part: 3,
    parts: 3,
    words: 2158,
    range: "paras 66-93",
    spark: "Relief appears, but the inner split does not disappear.",
    question: "After the crisis eases, what remains strongest?",
    options: ["Pure confidence", "Inner division", "Social popularity"],
    answerIndex: 1,
    cliffhanger: "A new classmate will redefine good and bad.",
  },
  {
    id: "S04",
    chapter: 2,
    chapterTitle: "Cain",
    part: 1,
    parts: 3,
    words: 2266,
    range: "paras 1-29",
    spark: "Demian enters as a reader of symbols, not rules.",
    question: "Demian's reading of Cain treats the mark as:",
    options: ["Pure shame", "A sign of strength", "A random detail"],
    answerIndex: 1,
    cliffhanger: "Theory and Kromer's reality are about to collide.",
  },
  {
    id: "S05",
    chapter: 2,
    chapterTitle: "Cain",
    part: 2,
    parts: 3,
    words: 2102,
    range: "paras 30-73",
    spark: "Power shifts before Sinclair fully understands why.",
    question: "Who changes the balance of power around Kromer?",
    options: ["Sinclair's father", "Demian", "A school teacher"],
    answerIndex: 1,
    cliffhanger: "Freedom comes with a cost Sinclair did not expect.",
  },
  {
    id: "S06",
    chapter: 2,
    chapterTitle: "Cain",
    part: 3,
    parts: 3,
    words: 2171,
    range: "paras 74-118",
    spark: "Rescue is real, but dependence is real too.",
    question: "What mixed state follows Kromer's disappearance?",
    options: ["Relief and unease", "Only happiness", "Total indifference"],
    answerIndex: 0,
    cliffhanger: "Demian's ideas will get even more dangerous.",
  },
  {
    id: "S07",
    chapter: 3,
    chapterTitle: "The Thief on the Cross",
    part: 1,
    parts: 3,
    words: 2452,
    range: "paras 1-20",
    spark: "Friendship turns into intellectual provocation.",
    question: "Demian influences Sinclair mainly through:",
    options: ["Threats", "Reinterpretation", "Social status"],
    answerIndex: 1,
    cliffhanger: "A sacred story will be turned inside out.",
  },
  {
    id: "S08",
    chapter: 3,
    chapterTitle: "The Thief on the Cross",
    part: 2,
    parts: 3,
    words: 2028,
    range: "paras 21-39",
    spark: "One moral story, multiple meanings.",
    question: "What is the core move in this part?",
    options: ["Literal obedience", "Alternative interpretation", "Historical trivia"],
    answerIndex: 1,
    cliffhanger: "A life transition closes in.",
  },
  {
    id: "S09",
    chapter: 3,
    chapterTitle: "The Thief on the Cross",
    part: 3,
    parts: 3,
    words: 2156,
    range: "paras 40-65",
    spark: "Belief, resistance, and separation tighten together.",
    question: "What concrete change ends this chapter?",
    options: ["Military service", "Move to a new school", "Family relocation abroad"],
    answerIndex: 1,
    cliffhanger: "Isolation becomes the next battlefield.",
  },
  {
    id: "S10",
    chapter: 4,
    chapterTitle: "Beatrice",
    part: 1,
    parts: 3,
    words: 2460,
    range: "paras 1-26",
    spark: "New city, old loneliness.",
    question: "What pattern dominates Sinclair's social life here?",
    options: ["Stable belonging", "Drifting between circles", "Complete withdrawal"],
    answerIndex: 1,
    cliffhanger: "An image starts to become discipline.",
  },
  {
    id: "S11",
    chapter: 4,
    chapterTitle: "Beatrice",
    part: 2,
    parts: 3,
    words: 2464,
    range: "paras 27-49",
    spark: "Beatrice shifts from fascination to inner form.",
    question: "In this arc, Beatrice functions mainly as:",
    options: ["A practical tutor", "An inner ideal", "A family authority"],
    answerIndex: 1,
    cliffhanger: "A dream-image is about to fuse identities.",
  },
  {
    id: "S12",
    chapter: 4,
    chapterTitle: "Beatrice",
    part: 3,
    parts: 3,
    words: 2364,
    range: "paras 50-86",
    spark: "Art becomes a mirror of hidden connection.",
    question: "The painted face starts to resemble whom?",
    options: ["Kromer", "Demian", "Pistorius"],
    answerIndex: 1,
    cliffhanger: "Next chapter opens with the Abraxas shock.",
  },
  {
    id: "S13",
    chapter: 5,
    chapterTitle: "The Bird Fights Its Way Out of the Egg",
    part: 1,
    parts: 3,
    words: 2045,
    range: "paras 1-22",
    spark: "Neat binaries collapse.",
    question: "Abraxas points toward:",
    options: ["Only good", "Only evil", "A unity beyond both"],
    answerIndex: 2,
    cliffhanger: "Sinclair now needs a guide, not an answer.",
  },
  {
    id: "S14",
    chapter: 5,
    chapterTitle: "The Bird Fights Its Way Out of the Egg",
    part: 2,
    parts: 3,
    words: 1868,
    range: "paras 23-62",
    spark: "Inner turmoil meets symbolic language.",
    question: "Who emerges as the new mentor figure?",
    options: ["Alfons Beck", "Pistorius", "Demian's father"],
    answerIndex: 1,
    cliffhanger: "Teaching deepens, and so does the risk.",
  },
  {
    id: "S15",
    chapter: 5,
    chapterTitle: "The Bird Fights Its Way Out of the Egg",
    part: 3,
    parts: 3,
    words: 1822,
    range: "paras 63-81",
    spark: "Recognition feels like destiny and danger at once.",
    question: "Sinclair's response to insight is mostly:",
    options: ["Pure peace", "Mixed awe and fear", "Dismissal"],
    answerIndex: 1,
    cliffhanger: "Soon he must outgrow the guide.",
  },
  {
    id: "S16",
    chapter: 6,
    chapterTitle: "Jacob Wrestles with the Angel",
    part: 1,
    parts: 3,
    words: 2334,
    range: "paras 1-47",
    spark: "Practice begins: live from inner law, not habit.",
    question: "Main tension in this part:",
    options: ["Grades vs sports", "Conformity vs inner necessity", "Money vs status"],
    answerIndex: 1,
    cliffhanger: "Another person's crisis will test Sinclair's ethic.",
  },
  {
    id: "S17",
    chapter: 6,
    chapterTitle: "Jacob Wrestles with the Angel",
    part: 2,
    parts: 3,
    words: 2388,
    range: "paras 48-87",
    spark: "Compassion gets tested by responsibility.",
    question: "This section pushes Sinclair toward:",
    options: ["Saving everyone by force", "Respecting inner development", "Total detachment"],
    answerIndex: 1,
    cliffhanger: "The mentor bond nears rupture.",
  },
  {
    id: "S18",
    chapter: 6,
    chapterTitle: "Jacob Wrestles with the Angel",
    part: 3,
    parts: 3,
    words: 2277,
    range: "paras 88-112",
    spark: "A true teacher eventually becomes a limit.",
    question: "Why does Sinclair separate from Pistorius?",
    options: ["External scandal", "Inner growth outpaces the bond", "Financial conflict"],
    answerIndex: 1,
    cliffhanger: "The search bends back toward Demian.",
  },
  {
    id: "S19",
    chapter: 7,
    chapterTitle: "Eve",
    part: 1,
    parts: 4,
    words: 2158,
    range: "paras 1-38",
    spark: "Signs return and old threads reactivate.",
    question: "What draws Sinclair back into Demian's orbit?",
    options: ["Career plans", "Signs and longing", "Family pressure"],
    answerIndex: 1,
    cliffhanger: "A new center appears.",
  },
  {
    id: "S20",
    chapter: 7,
    chapterTitle: "Eve",
    part: 2,
    parts: 4,
    words: 1975,
    range: "paras 39-79",
    spark: "Frau Eva appears as gravity, not comfort.",
    question: "Eve's role is best read as:",
    options: ["Comfort only", "Transformative center", "Social distraction"],
    answerIndex: 1,
    cliffhanger: "Desire now changes form.",
  },
  {
    id: "S21",
    chapter: 7,
    chapterTitle: "Eve",
    part: 3,
    parts: 4,
    words: 2186,
    range: "paras 80-93",
    spark: "Love shifts from possession toward becoming.",
    question: "Sinclair's love here becomes more:",
    options: ["Possessive", "Formative", "Casual"],
    answerIndex: 1,
    cliffhanger: "History outside starts pressing in.",
  },
  {
    id: "S22",
    chapter: 7,
    chapterTitle: "Eve",
    part: 4,
    parts: 4,
    words: 1909,
    range: "paras 94-139",
    spark: "Private destiny meets collective foreboding.",
    question: "What mood dominates this close?",
    options: ["Stability", "Foreboding", "Celebration"],
    answerIndex: 1,
    cliffhanger: "The final chapter opens with rupture.",
  },
  {
    id: "S23",
    chapter: 8,
    chapterTitle: "The Beginning of the End",
    part: 1,
    parts: 1,
    words: 2821,
    range: "paras 1-59",
    spark: "War turns symbols into fate.",
    question: "What survives destruction most clearly?",
    options: ["Childhood innocence", "Inner awakening", "Social certainty"],
    answerIndex: 1,
    cliffhanger: "The ending gives a key, not closure.",
  },
];

interface DemoRuntime {
  sessionIndex: number;
  step: DemoStep;
  mastery: number;
}

const DEMO_BOOK_TITLE = "Demian";
const DEMO_TUTOR_MINUTES = 12;

function estimatedPages(words: number): number {
  return Math.max(1, Math.round(words / 280));
}

function chapterThemeKorean(chapter: number): string {
  if (chapter === 1) return "안전한 세계와 충동의 세계가 처음 충돌하는 순간";
  if (chapter === 2) return "권위와 해석이 뒤집히며 힘의 균형이 바뀌는 과정";
  if (chapter === 3) return "같은 사건을 다른 눈으로 읽는 해석의 전환";
  if (chapter === 4) return "동경이 자기 훈련으로 바뀌는 내면의 정렬";
  if (chapter === 5) return "선과 악의 이분법이 무너지며 시야가 넓어지는 구간";
  if (chapter === 6) return "멘토를 넘어 자기 기준을 세우는 독립의 단계";
  if (chapter === 7) return "사적 욕망과 운명 감각이 만나는 응축 구간";
  return "개인적 각성과 시대적 충돌이 맞물리는 마지막 전환";
}

function moduleHook(session: DemoSession): string {
  return `이번 모듈 핵심: ${chapterThemeKorean(session.chapter)}`;
}

function storyBeat(session: DemoSession): string {
  if (session.chapter === 1 && session.part === 1) {
    return "독일의 한 마을. 열 살 남짓한 소년 싱클레어는 '선의 세계' 안에서 안전하게 자라고 있었어. 그런데 어느 날, 집 안 어둠의 소리가 그의 세계를 흔들기 시작해.";
  }
  if (session.chapter === 1 && session.part === 2) {
    return "허세로 시작된 작은 거짓말이 협박으로 번지고, 공포는 하루치 감정이 아니라 생활 패턴이 돼. 싱클레어는 점점 침묵으로 버티는 법을 배워.";
  }
  if (session.chapter === 1 && session.part === 3) {
    return "위기는 잠시 잦아들지만, 그 사건은 사라지지 않아. 싱클레어 안에는 이미 '두 세계'의 균열이 남아 다음 선택을 기다리고 있어.";
  }
  if (session.chapter === 2) {
    return "데미안은 문제를 풀어주는 친구가 아니라, 해석의 각도를 바꿔버리는 인물이야. 그래서 같은 사건도 완전히 다른 의미로 보이기 시작해.";
  }
  if (session.chapter === 3 || session.chapter === 4) {
    return "이 시기 싱클레어는 관계와 욕망, 동경을 통해 자신을 다시 읽어. 겉으론 조용하지만, 안에서는 기준이 계속 재편돼.";
  }
  if (session.chapter === 5 || session.chapter === 6) {
    return "이제 주제는 단순한 선악이 아니야. 인물은 모순을 견디며 자기 기준을 세우는 훈련에 들어가.";
  }
  if (session.chapter === 7) {
    return "개인적 사랑과 운명감, 시대의 공기가 한 장면에서 겹쳐지기 시작해. 내면의 선택이 더 이상 사적이지 않게 돼.";
  }
  if (session.chapter === 8) {
    return "전쟁은 개인의 성장을 강제로 시험해. 마지막 장면들은 사건의 결말보다 '너는 이제 어떻게 살 것인가'를 묻는 방식으로 끝나.";
  }

  const phase =
    session.part === 1
      ? "이야기의 문이 열리고, 인물의 균열이 처음 드러나는 구간이야."
      : session.part === session.parts
        ? "앞에서 쌓인 긴장이 한 번 정리되지만, 더 큰 질문을 남기는 구간이야."
        : "긴장이 깊어지고 선택의 무게가 커지는 중간 구간이야.";

  return `장면 감각부터 잡아보자. ${phase}`;
}

function moduleQuote(session: DemoSession): { text: string; source: string } {
  if (session.chapter === 1) {
    return {
      text: "새는 알에서 나오려고 투쟁한다. 알은 세계다. 태어나려는 자는 한 세계를 깨뜨려야 한다.",
      source: "데미안 · 핵심 구절",
    };
  }
  if (session.chapter <= 4) {
    return {
      text: "중요한 건 사건 자체보다, 그 사건을 읽는 너의 해석이 어떻게 바뀌는가야.",
      source: "코스미 해설 포인트",
    };
  }
  if (session.chapter <= 6) {
    return {
      text: "성장은 정답을 얻는 일이 아니라, 스스로 판단할 기준을 세우는 일이야.",
      source: "코스미 해설 포인트",
    };
  }
  return {
    text: "내가 나 자신 안으로 충분히 내려가면, 운명의 얼굴은 낯설지 않게 보인다.",
    source: "데미안 · 엔딩 테마",
  };
}

function chapterLectureNarrative(session: DemoSession): string[] {
  if (session.chapter === 1) {
    return [
      "좋아, 이번엔 정말 길게 풀어볼게. 무대는 100여 년 전 독일의 한 마을이야. 아직 어린 싱클레어는 엄숙한 기독교 가정 안에서, 말 그대로 질서와 선의 공기 속에 살아.",
      "그런데 어느 나이쯤부터, 집 안 한구석에서 이전에는 들리지 않던 소리가 들리기 시작해. 부엌 쪽, 작업장 쪽, 말로 설명하기 어려운 불안의 소리야. 이 장면이 왜 중요하냐면, 싱클레어가 처음으로 '세계가 하나가 아닐 수 있다'는 감각을 얻는 순간이기 때문이야.",
      "학교로 가보자. 싱클레어는 귀족형 학교를 다니지만, 동네의 거친 아이들과도 엮여. 그 중심에 프란츠 크로머가 있어. 나이가 좀 더 많고, 말투도 거칠고, 분위기로 사람을 누르는 타입이지.",
      "싱클레어는 센 척하고 싶어서 사과를 훔쳤다는 거짓말을 해버려. 반응이 좋으니까 과장까지 붙여. 그런데 거짓말은 무대 위에서 박수받을 때는 재밌지만, 무대가 꺼지고 나면 청구서가 날아와.",
      "크로머가 붙잡고 속삭여. '진짜냐?' 그리고 그 순간부터 싱클레어의 일상은 공포의 스케줄표가 돼. 돈을 뜯기고, 거절하면 협박받고, 집 근처에서 이름이 불리고, 몸이 굳고, 오한이 오고, 구역감이 올라와.",
      "한 번만 상상해보자. 열 살짜리가 자기 집에서조차 안심하지 못하는 상태야. 창문 밖 인기척이 나면 심장이 먼저 반응하고, 머리는 나중에 따라와.",
      "돈을 빼앗기는 장면보다 더 무서운 건, 자기 세계가 무너졌다는 사실을 누구에게도 말할 수 없다는 점이야.",
      "그래서 싱클레어의 공포는 사건형 공포가 아니라 지속형 공포로 변해. 하루가 아니라 매일 반복되는 압박 말이야.",
      "여기서 작가가 잘하는 게 뭐냐면, 도덕 교훈으로 가지 않고 감각으로 밀어붙인다는 점이야. 오한, 구토, 굳어버린 몸, 이런 신체의 언어로 내면 붕괴를 보여줘.",
      "핵심은 단순한 왕따 에피소드가 아니야. 이건 내면이 처음으로 균열되는 과정이야. 선한 집안의 아이가 악의 세계를 '구경'한 게 아니라, 그 세계의 룰에 '인질'로 잡히는 과정.",
      "그때 데미안이 등장해. 신비롭고, 단정하고, 강하고, 이상하게 격조가 있는 아이. 특히 카인과 아벨을 해석하는 장면이 중요해. 모두가 익숙하게 읽는 이야기를 데미안은 완전히 다른 각도로 읽어버려.",
      "이 장면을 지나면서 싱클레어는 처음 배우게 돼. 누가 옳은 말을 하느냐보다, 누가 해석의 축을 옮기느냐가 더 결정적이라는 걸.",
      "데미안은 싱클레어에게 위로만 주지 않아. 더 위험한 걸 줘. 질문하는 습관을 줘.",
      "이 대목에서 싱클레어는 두 번 흔들려. 하나는 크로머라는 현실의 공포, 또 하나는 데미안이 열어버린 해석의 공포. 익숙한 세계관이 무너지는 공포지.",
      "결국 크로머의 압박은 사라져. 그런데 사건이 끝났다고 문제가 끝나진 않아. 싱클레어 안에는 이미 질문이 남아: 나는 누구 쪽 세계에 속하는가? 그리고 그 질문이 다음 모듈들의 엔진이 돼.",
      "그래서 1장은 프롤로그가 아니야. 성장 소설의 핵심 엔진이 시동 걸리는 장이야.",
      "정리하면 이 장의 핵심은 한 줄이야. 공포를 통해 균열이 열리고, 질문을 통해 성장이 시작된다.",
    ];
  }

  if (session.chapter === 2) {
    return [
      "여기서부터는 '사건 해결'이 아니라 '해석 혁명'이 본격화돼. 데미안은 싱클레어 대신 싸워주는 영웅이 아니고, 싱클레어의 사고 프레임을 갈아끼우는 촉매야.",
      "카인의 표식을 약함의 낙인이 아니라 힘의 표식으로 읽는 순간, 싱클레어는 도덕을 암기된 규칙이 아니라 해석의 문제로 보기 시작해.",
      "이게 위험한 이유는 단순해. 이전 세계에서는 '좋다/나쁘다'가 정해져 있었어. 그런데 이제는 스스로 판단해야 해. 자유가 늘어나면 동시에 불안도 늘어나.",
      "데미안의 방식은 늘 비슷해. 답을 길게 주지 않아. 대신 질문의 프레임을 바꿔. 그리고 그 프레임이 한번 박히면 싱클레어는 예전처럼 세상을 못 봐.",
      "즉, 이 파트의 드라마는 외부 악당 퇴치가 아니야. 내부 기준 재편이야. 무엇을 옳다고 느끼는지, 왜 끌리는지, 왜 두려운지를 다시 쓰는 작업이지.",
    ];
  }

  if (session.chapter === 3 || session.chapter === 4) {
    return [
      "이 구간의 정서는 조금 다르다. 큰 사건이 폭발하기보다, 감정의 결이 길게 흐르면서 인물을 바꿔.",
      "싱클레어는 관계를 통해 자신을 읽는다. 누군가를 동경하고, 거리 두고, 부끄러워하고, 다시 끌리고. 이 반복이 곧 사춘기 내면의 리듬이야.",
      "특히 베아트리체 구간은 연애담처럼 보이지만 핵심은 그게 아니야. 타인을 향한 감정이 자기 형성의 도구로 전환되는 장면이 핵심이야.",
      "그림, 이미지, 상징이 튀어나오는 이유도 여기에 있어. 말로 정리되지 않는 감정은 먼저 이미지로 나타나. 그러니까 텍스트를 눈으로만 읽지 말고, 장면의 온도로 읽어야 해.",
      "이 파트에서 잘 읽은 사람은 '누가 누구를 좋아했나'보다 '그 감정이 싱클레어의 자기 해석을 어떻게 바꿨나'를 말할 수 있어.",
    ];
  }

  if (session.chapter === 5 || session.chapter === 6) {
    return [
      "이제 본격적으로 어렵고 중요한 구간이 온다. 선과 악을 칼로 자르듯 나누던 세계가 무너지고, 모순을 견디는 훈련이 시작돼.",
      "아브락사스 같은 개념이 나오는 이유도 같아. 싱클레어가 이제는 단순한 교과서 도덕으로는 자기 내면을 설명할 수 없기 때문이야.",
      "피스토리우스의 역할을 봐. 멘토는 답안지를 주는 사람이 아니라, 네가 스스로 기준을 세우도록 밀어붙이는 사람이어야 해. 그래서 멘토 관계의 끝도 성장의 일부야.",
      "중요한 포인트 하나. 성장은 '덜 흔들리는 상태'가 아니야. 오히려 더 깊이 흔들리는데도, 그 흔들림을 자기 언어로 견디는 능력이 생기는 거야.",
      "이 챕터를 제대로 읽으면, 싱클레어가 왜 누군가의 세계관을 빌려 쓰는 단계를 지나 자기 기준을 세우려 하는지 분명해져.",
    ];
  }

  return [
    "후반부는 사적인 성장과 시대적 위기가 겹친다. 즉, 개인의 심리극이 역사와 충돌해.",
    "에바 부인과 데미안 곁에서 싱클레어는 사랑, 경외, 운명감 같은 감정을 동시에 경험해. 이건 단순한 로맨스가 아니라 존재론적 전환이야.",
    "그리고 전쟁. 이 소설에서 전쟁은 영웅 서사가 아니라, 집단의 이상이 개인의 몸과 마음을 어떻게 소모하는지 보여주는 장치야.",
    "마지막 장면의 핵심도 같다. 누가 곁에 남느냐보다, 결국 너는 네 안으로 내려가 스스로 판단하고 살아야 한다는 선언.",
    "그래서 데미안의 엔딩은 닫힘이 아니라 개시야. 이제부터는 안내자가 아니라, 네가 네 삶의 해석자가 되어야 한다는 뜻.",
  ];
}

function preDiagnosticItem(session: DemoSession): {
  question: string;
  options: [string, string, string];
  answerIndex: 0 | 1 | 2;
} {
  if (session.chapter <= 2) {
    return {
      question: "십대의 내적 갈등이 본격적으로 시작되는 가장 흔한 계기는 무엇일까?",
      options: [
        "겉으로 요구되는 규범과 속마음의 욕망이 충돌할 때",
        "아무 변화 없는 평온한 일상이 계속될 때",
        "감정적 의미가 없는 사건이 지나갈 때",
      ],
      answerIndex: 0,
    };
  }
  if (session.chapter <= 4) {
    return {
      question: "사람이 도덕 규칙을 다시 보기 시작할 때 가장 먼저 바뀌는 것은?",
      options: [
        "옷차림 같은 겉모습",
        "행동과 상징을 해석하는 방식",
        "주변 환경의 물리적 조건",
      ],
      answerIndex: 1,
    };
  }
  if (session.chapter <= 6) {
    return {
      question: "성장 서사에서 멘토가 가장 잘 기능하는 방식은 무엇일까?",
      options: [
        "학습자의 판단을 끝까지 대신해줄 때",
        "학습자가 자기 기준을 세우도록 밀어줄 때",
        "삶의 모호함을 완전히 제거해줄 때",
      ],
      answerIndex: 1,
    };
  }
  return {
    question: "개인의 정체성과 시대적 위기가 맞부딪힐 때 가장 커지는 압력은?",
    options: [
      "자기 가치 기준을 스스로 정해야 한다는 압력",
      "서사적 장식 요소의 개수",
      "단순한 답에 대한 확신",
    ],
    answerIndex: 0,
  };
}

function checkItem(session: DemoSession): {
  question: string;
  options: [string, string, string];
  answerIndex: 0 | 1 | 2;
} {
  if (session.chapter <= 2) {
    return {
      question: "이 모듈에서 가장 중요한 독해 초점은 무엇이었지?",
      options: [
        "인물의 겉행동만 사실처럼 나열하기",
        "욕망-규범 충돌이 의사결정을 어떻게 바꾸는지 추적하기",
        "배경 묘사의 화려함만 비교하기",
      ],
      answerIndex: 1,
    };
  }
  if (session.chapter <= 4) {
    return {
      question: "해석 전환 구간에서 우리가 확인해야 할 핵심은?",
      options: [
        "같은 사건을 읽는 기준이 바뀌는 지점",
        "등장인물 이름의 길이",
        "문장 부호의 개수",
      ],
      answerIndex: 0,
    };
  }
  if (session.chapter <= 6) {
    return {
      question: "멘토 서사가 성숙으로 이어질 때의 신호는?",
      options: [
        "멘토 의존이 강화되어 독립이 사라짐",
        "멘토를 넘어서 자기 기준으로 판단하기 시작함",
        "모든 갈등을 회피함",
      ],
      answerIndex: 1,
    };
  }
  return {
    question: "후반부 핵심 독해 질문으로 가장 적절한 것은?",
    options: [
      "개인 각성이 집단적 위기와 만날 때 무엇이 변하는가",
      "소품의 색채 대비가 얼마나 강한가",
      "대화 길이가 얼마나 짧은가",
    ],
    answerIndex: 0,
  };
}

function lectureParts(session: DemoSession): string[] {
  const intro =
    session.chapter === 1 && session.part === 1
      ? "싱클레어는 이 이야기의 화자야. 겉으로는 단정한 세계에 살지만, 안쪽에서는 설명하기 어려운 충동과 두려움이 동시에 자라나고 있어."
      : "이번 구간은 싱클레어가 편안함이 아니라 압력 속에서 자기 정체성을 조립해가는 장면을 다뤄.";
  const quote = moduleQuote(session);
  const narrative = chapterLectureNarrative(session);

  return [
    `좋아, 지금부터는 내가 길게 이야기로 풀어줄게.`,
    `${storyBeat(session)}`,
    `${intro}`,
    `${moduleHook(session)}`,
    `이번 범위는 ${session.range} (대략 ${estimatedPages(session.words)}쪽, 보통 ${DEMO_TUTOR_MINUTES}분 설명 분량)야.`,
    "혹시 이런 문장, 어디선가 들어본 적 있어?",
    `> ${quote.text}\n— ${quote.source}`,
    "이 인용은 멋있는 문장이라서가 아니라, 싱클레어의 성장 방식 전체를 압축해 보여주기 때문에 중요해.",
    ...narrative,
    "여기서 핵심만 다시 묶어볼게. 사건 자체보다 '해석이 어떻게 바뀌었는지'를 잡는 게 중요해.",
    "준비되면 아래 버튼 눌러줘. 바로 확인 질문으로 넘어갈게.",
  ];
}

function diagnosticPrompt(session: DemoSession): string {
  const item = preDiagnosticItem(session);
  return [
    `들어가기 전에 워밍업 질문 하나 할게. (${session.id})`,
    item.question,
    `A) ${item.options[0]}`,
    `B) ${item.options[1]}`,
    `C) ${item.options[2]}`,
    "A/B/C 중 하나로 답해줘.",
  ].join("\n");
}

function checkPrompt(session: DemoSession): string {
  const item = checkItem(session);
  return [
    "좋아, 방금 설명 기준으로 확인 질문 하나 갈게.",
    item.question,
    `A) ${item.options[0]}`,
    `B) ${item.options[1]}`,
    `C) ${item.options[2]}`,
    "A/B/C로 답해줘.",
  ].join("\n");
}

function discussionPrompt(session: DemoSession): string {
  return [
    `이제 네 해석을 듣고 싶어. (${session.id})`,
    "한두 문장으로 답해줘. 이 구간에서 가장 강하게 느껴진 내적 갈등은 무엇이었고, 왜 그렇게 느꼈는지.",
    "정답은 없어. 네 해석의 논리를 보고 피드백할게.",
  ].join("\n");
}

function parseDemoChoice(
  input: string,
  options: [string, string, string],
): 0 | 1 | 2 | null {
  const normalized = input.toLowerCase().trim();
  if (/\b(a|1)\b/.test(normalized)) return 0;
  if (/\b(b|2)\b/.test(normalized)) return 1;
  if (/\b(c|3)\b/.test(normalized)) return 2;

  const matched = options.findIndex((opt) =>
    normalized.includes(opt.toLowerCase()),
  );
  if (matched === 0 || matched === 1 || matched === 2) return matched;
  return null;
}

function splitAssistantBubbles(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Keep quiz blocks and markdown quote blocks intact.
  if (/\nA\)/.test(trimmed) || /\nB\)/.test(trimmed) || trimmed.startsWith("> ")) {
    return [trimmed];
  }

  const lines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const line of lines) {
    const sentences = line
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length === 0) continue;
    out.push(...sentences);
  }
  return out.length > 0 ? out : [trimmed];
}

function isQuestionInterrupt(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed === "A" || trimmed === "B" || trimmed === "C") return false;
  return (
    trimmed.includes("?") ||
    /^(q|question|ask)\s*[:\-]/i.test(trimmed) ||
    /^(왜|뭐|무엇|어떻게|how|why|what)\b/i.test(trimmed)
  );
}

function tutorQuestionReply(session: DemoSession, step: DemoStep, question: string): string[] {
  return [
    `좋은 질문이야. "${question}"`,
    `짧게 답하면, 지금 ${session.id}에서는 '${chapterThemeKorean(session.chapter)}'를 기준으로 보면 흐름이 또렷해져.`,
    `지금 단계는 ${demoStepLabel(step)}이야. 이어서 진행해도 되고, 한 번 더 물어봐도 좋아.`,
  ];
}

function demoStepLabel(step: DemoStep): string {
  if (step === "diagnostic") return "워밍업";
  if (step === "lecture") return "스토리";
  if (step === "check") return "확인";
  return "대화";
}

function demoStepPrompt(step: DemoStep, session: DemoSession): string {
  if (step === "diagnostic") return diagnosticPrompt(session);
  if (step === "lecture") {
    return lectureParts(session).join("\n\n");
  }
  if (step === "check") return checkPrompt(session);
  return discussionPrompt(session);
}

interface MainContentProps {
  books: BookInfo[];
  uploadingBooks?: UploadingBook[];
  selectedBookId: string | null;
  selectedUploadingId: string | null;
  graphData: GraphData | null;
  onSelectBook: (id: string | null) => void;
  onSelectUploading: (id: string | null) => void;
  onDeleteBook?: (bookId: string) => void;
  onRenameBook?: (bookId: string, title: string) => void;
  onUpload?: () => void;
  triggerDance?: boolean;
  onSettingsChange?: (active: boolean) => void;
}

export function MainContent({
  books,
  uploadingBooks,
  selectedBookId,
  graphData,
  onSelectBook,
  onDeleteBook,
  onRenameBook,
  onUpload,
  triggerDance,
  selectedUploadingId,
  onSelectUploading,
  onSettingsChange,
}: MainContentProps) {
  const mobile = useIsMobile();
  const selectedBook =
    books.find((b) => b.book_id === selectedBookId) ?? null;
  const bookColor =
    selectedBookId ? getBookColorById(selectedBookId) : "#6366f1";

  const [view, setView] = useState<View>(mobile ? "graph" : "detail");
  const [chatMode, setChatMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDemoProgress, setShowDemoProgress] = useState(false);
  const [warping, setWarping] = useState(false);
  const [settingsActive, setSettingsActive] = useState(false);
  const [aboutActive, setAboutActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoRuntime, setDemoRuntime] = useState<DemoRuntime | null>(null);
  const [arrivalPulse, setArrivalPulse] = useState(false);
  const anyOverlayActive = settingsActive || aboutActive;
  useEffect(() => { onSettingsChange?.(anyOverlayActive); }, [anyOverlayActive, onSettingsChange]);
  const warpDirection = useRef<"forward" | "reverse">("forward");
  const warpTarget = useRef<"settings" | "about" | "demo">("settings");
  const demoSnapshotRef = useRef<{
    messages: ChatMessageType[];
    conversationId: string | null;
  } | null>(null);
  const [lastUserBubble, setLastUserBubble] = useState<string | null>(null);
  const userBubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [card, setCard] = useState<BookModelCard | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [draftSessionIndex, setDraftSessionIndex] = useState(0);
  const [draftStep, setDraftStep] = useState<DemoStep>("diagnostic");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [, setTimerTick] = useState(0);

  const selectedUploading = uploadingBooks?.find(
    (u) => u.tempId === selectedUploadingId,
  ) ?? null;

  const uploadTimingRef = useRef<{
    lastEventAt: number;
    lastPipelineMs: number;
    lastStageMs: number;
    lastStage: string | null;
    lastUploadId: string | null;
    stageStartPipelineMs: number;
    stageDurations: Map<string, number>;
  }>({
    lastEventAt: 0, lastPipelineMs: 0, lastStageMs: 0,
    lastStage: null, lastUploadId: null, stageStartPipelineMs: 0,
    stageDurations: new Map(),
  });

  useEffect(() => {
    const p = selectedUploading?.progress;
    const ref = uploadTimingRef.current;
    const uploadId = selectedUploading?.tempId ?? null;

    if (uploadId !== ref.lastUploadId) {
      ref.lastEventAt = 0;
      ref.lastPipelineMs = 0;
      ref.lastStageMs = 0;
      ref.lastStage = null;
      ref.lastUploadId = uploadId;
      ref.stageStartPipelineMs = 0;
      ref.stageDurations = new Map();
    }

    if (!p) return;

    const now = Date.now();
    ref.lastEventAt = now;
    ref.lastPipelineMs = p.pipeline_elapsed_ms || 0;
    ref.lastStageMs = p.elapsed_ms || 0;

    if (p.stage !== ref.lastStage) {
      if (ref.lastStage && ref.lastStage !== "complete" && ref.lastStage !== "error") {
        const prevDuration = ref.lastPipelineMs - ref.stageStartPipelineMs;
        if (prevDuration > 0) ref.stageDurations.set(ref.lastStage, prevDuration);
      }
      ref.stageStartPipelineMs = ref.lastPipelineMs - (p.elapsed_ms || 0);
      ref.lastStage = p.stage;
    }
  });

  useEffect(() => {
    const p = selectedUploading?.progress;
    if (!p || p.stage === "complete" || p.stage === "error") return;
    const interval = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [selectedUploading?.progress?.stage]);

  const handleSelectUploading = useCallback(
    (tempId: string | null) => {
      onSelectUploading(tempId);
      if (tempId) onSelectBook(null);
    },
    [onSelectBook, onSelectUploading],
  );

  const handleSelectBookWrapped = useCallback(
    (id: string | null) => {
      onSelectBook(id);
      if (id) onSelectUploading(null);
    },
    [onSelectBook, onSelectUploading],
  );

  const bookIds = useMemo(
    () =>
      selectedBookId ? [selectedBookId] : books.map((b) => b.book_id),
    [selectedBookId, books],
  );

  const saved = getChatState(bookIds);
  const [messages, setMessages] = useState<ChatMessageType[]>(saved.messages as ChatMessageType[]);
  const [conversationId, setConversationId] = useState<string | null>(
    saved.conversationId,
  );
  const [isLoading, setIsLoading] = useState(false);
  const historyBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedBookId) {
      setCard(null);
      return;
    }
    setCardLoading(true);
    setCard(null);
    getModelCard(selectedBookId)
      .then(setCard)
      .catch((e) => console.error("model card error:", e))
      .finally(() => setCardLoading(false));
  }, [selectedBookId]);

  useEffect(() => {
    if (selectedUploadingId && !selectedUploading) {
      onSelectUploading(null);
    }
  }, [selectedUploadingId, selectedUploading, onSelectUploading]);

  useEffect(() => {
    setView(mobile ? "graph" : "detail");
    setChatMode(false);
    setShowHistory(false);
    setConfirmDelete(false);
    const s = getChatState(bookIds);
    setMessages(s.messages as ChatMessageType[]);
    setConversationId(s.conversationId);
  }, [bookIds, mobile]);

  useEffect(() => {
    if (!selectedBookId) setChatMode(false);
  }, [selectedBookId]);

  useEffect(() => {
    if (demoMode) return;
    setChatState(bookIds, { messages, conversationId });
  }, [messages, conversationId, bookIds, demoMode]);

  useEffect(() => {
    if (showHistory) {
      historyBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showHistory]);

  useEffect(() => {
    if (!chatMode) {
      setShowHistory(false);
      setShowDemoProgress(false);
    }
  }, [chatMode]);

  useEffect(() => {
    if (!demoMode) {
      setShowDemoProgress(false);
      return;
    }
    if (showDemoProgress) {
      const runtime = demoRuntime ?? { sessionIndex: 0, step: "diagnostic" as const, mastery: 0.5 };
      setDraftSessionIndex(runtime.sessionIndex);
      setDraftStep(runtime.step);
    }
  }, [demoMode, demoRuntime, showDemoProgress]);

  const startDemoChat = useCallback(() => {
    demoSnapshotRef.current = { messages, conversationId };
    const first = DEMO_SESSIONS[0];
    setDemoMode(true);
    setDemoRuntime({ sessionIndex: 0, step: "diagnostic", mastery: 0.5 });
    setShowHistory(false);
    setShowDemoProgress(false);
    setConversationId(null);
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `코스미 데모: ${DEMO_BOOK_TITLE}. 흐름은 워밍업 -> 스토리 -> 확인 -> 대화야. 중간 질문은 언제든 가능해.`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `세션 ${first.id} 시작.\n${moduleHook(first)}`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: diagnosticPrompt(first),
        timestamp: new Date(),
        isGrouped: true,
      },
    ]);
    setChatMode(true);
    setView("chat");
  }, [conversationId, messages]);

  const exitChatMode = useCallback(() => {
    if (demoMode) {
      const snapshot = demoSnapshotRef.current;
      setDemoMode(false);
      setDemoRuntime(null);
      setShowHistory(false);
      setShowDemoProgress(false);
      setLastUserBubble(null);
      if (snapshot) {
        setMessages(snapshot.messages);
        setConversationId(snapshot.conversationId);
      }
    }
    setChatMode(false);
    setView("graph");
  }, [demoMode]);

  const applyDemoProgress = useCallback(() => {
    if (!demoMode) return;
    const boundedIndex = Math.max(0, Math.min(draftSessionIndex, DEMO_SESSIONS.length - 1));
    const session = DEMO_SESSIONS[boundedIndex];
    const runtime: DemoRuntime = {
      sessionIndex: boundedIndex,
      step: draftStep,
      mastery: demoRuntime?.mastery ?? 0.5,
    };
    setDemoRuntime(runtime);
    setShowDemoProgress(false);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `진도 업데이트: ${session.id} (챕터 ${session.chapter}, 파트 ${session.part}/${session.parts}) · ${demoStepLabel(draftStep)} 단계`,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: demoStepPrompt(draftStep, session),
        timestamp: new Date(),
        isGrouped: true,
      },
    ]);
  }, [demoMode, draftSessionIndex, draftStep, demoRuntime?.mastery]);

  /* ── Chat handler ── */

  const handleSend = useCallback(
    async (content: string) => {
      if (!chatMode) {
        setChatMode(true);
      setView("chat");
      }
      if (userBubbleTimer.current) clearTimeout(userBubbleTimer.current);
      setLastUserBubble(content);
      userBubbleTimer.current = setTimeout(() => setLastUserBubble(null), 4000);

      const userMsg: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      let currentMessages: ChatMessageType[] = [];
      setMessages((prev) => {
        currentMessages = [...prev, userMsg];
        return currentMessages;
      });
      setIsLoading(true);

      if (demoMode) {
        const currentDemo = demoRuntime ?? { sessionIndex: 0, step: "diagnostic" as const, mastery: 0.5 };
        const session = DEMO_SESSIONS[Math.min(currentDemo.sessionIndex, DEMO_SESSIONS.length - 1)];
        const normalized = content.trim().toLowerCase();
        const wantsStop = /\b(stop|pause|later|quit)\b/.test(normalized);
        const wantsNext = /\b(next|continue|go|ready|proceed|start|다음|계속|넘어가|진행)\b/.test(normalized);
        const isInterruptQuestion = isQuestionInterrupt(content);

        await new Promise((resolve) => setTimeout(resolve, 450));

        const replies: string[] = [];

        if (wantsStop) {
          replies.push(
            `저장했어. ${session.id} · ${demoStepLabel(currentDemo.step)} 단계에서 멈춰둘게.`,
          );
          replies.push(`다음 떡밥: ${session.cliffhanger}`);
          replies.push("돌아오면 여기서 바로 이어서 갈게.");
        } else if (isInterruptQuestion) {
          replies.push(...tutorQuestionReply(session, currentDemo.step, content));
        } else if (currentDemo.step === "diagnostic") {
          const diagnostic = preDiagnosticItem(session);
          const choice = parseDemoChoice(content, diagnostic.options);
          if (choice === null) {
            replies.push("좋아, 워밍업 질문은 A/B/C 중 하나로 답해줘.");
            replies.push(diagnosticPrompt(session));
          } else {
            const correct = choice === diagnostic.answerIndex;
            const nextMastery = Math.max(
              0,
              Math.min(1, currentDemo.mastery + (correct ? 0.08 : -0.05)),
            );
            replies.push(
              correct
                ? "좋아. 기본 감각이 이미 꽤 좋아."
                : "좋아. 여기서 헷갈릴 수 있어. 지금 스토리에서 정확히 잡아줄게.",
            );
            replies.push(...lectureParts(session));
            setDemoRuntime({
              sessionIndex: currentDemo.sessionIndex,
              step: "lecture",
              mastery: nextMastery,
            });
          }
        } else if (currentDemo.step === "lecture") {
          if (wantsNext) {
            replies.push(checkPrompt(session));
            setDemoRuntime({
              sessionIndex: currentDemo.sessionIndex,
              step: "check",
              mastery: currentDemo.mastery,
            });
          } else {
            replies.push("여기까지 이해됐으면 아래 버튼 눌러서 확인 질문으로 넘어가자.");
            replies.push("아직 애매하면 질문 먼저 해도 돼.");
          }
        } else if (currentDemo.step === "check") {
          const item = checkItem(session);
          const choice = parseDemoChoice(content, item.options);
          if (choice === null) {
            replies.push("확인 질문이야. A/B/C로 답해줘.");
            replies.push(checkPrompt(session));
          } else {
            const correct = choice === item.answerIndex;
            const nextMastery = Math.max(
              0,
              Math.min(1, currentDemo.mastery + (correct ? 0.1 : -0.06)),
            );
            if (correct) {
              replies.push("정확해. 방금 이야기의 핵심을 잘 잡았어.");
            } else {
              replies.push(`좋은 시도야. 정답은 ${String.fromCharCode(65 + item.answerIndex)}였어.`);
              replies.push(`보강 포인트: '${chapterThemeKorean(session.chapter)}' 관점에서 동기와 결과를 다시 연결해봐.`);
            }
            replies.push(discussionPrompt(session));
            setDemoRuntime({
              sessionIndex: currentDemo.sessionIndex,
              step: "discussion",
              mastery: nextMastery,
            });
          }
        } else {
          const responseLen = normalized.replace(/\s+/g, " ").trim().split(" ").length;
          replies.push(
            responseLen <= 3
              ? "좋아, 한 문장만 더. 왜 그렇게 해석했는지 근거를 하나만 붙여줘."
              : "좋아, 해석의 논리가 살아있어. 동기와 긴장을 잘 연결했어.",
          );
          replies.push(`떡밥: ${session.cliffhanger}`);

          const nextIndex = Math.min(currentDemo.sessionIndex + 1, DEMO_SESSIONS.length - 1);
          const nextSession = DEMO_SESSIONS[nextIndex];
          if (nextIndex === currentDemo.sessionIndex) {
            replies.push("준비된 데모는 여기까지야.");
          } else {
            replies.push(`다음 모듈: ${nextSession.id} · 챕터 ${nextSession.chapter} (${nextSession.chapterTitle})`);
            replies.push(moduleHook(nextSession));
            replies.push(diagnosticPrompt(nextSession));
          }
          setDemoRuntime({
            sessionIndex: nextIndex,
            step: "diagnostic",
            mastery: currentDemo.mastery,
          });
        }

        const bubbledReplies = replies.flatMap(splitAssistantBubbles);
        setMessages((prev) => [
          ...prev,
          ...bubbledReplies.map((reply, idx) => ({
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: reply,
            timestamp: new Date(),
            isGrouped: idx > 0,
          })),
        ]);
        setIsLoading(false);
        return;
      }

      let finalThinking: ThinkingProcess | null = null;
      let partIndex = 0;

      const history = currentMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        await streamChat(
          content,
          conversationId,
          {
            onThinkingStep: () => {},
            onThinkingDone: (process: ThinkingProcess) => {
              finalThinking = process;
            },
            onAnswerPart: (data: AnswerPartData) => {
              const isCasual = finalThinking?.selected_mode === "casual";
              const isFirst = data.index === 0;
              const assistantMsg: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.text,
                thinking: isFirst && !isCasual ? finalThinking || undefined : undefined,
                sources: data.is_last ? (data.sources as Source[]) : undefined,
                timestamp: new Date(),
                isGrouped: !isFirst,
              };
              setMessages((prev) => [...prev, assistantMsg]);
              if (data.is_last) {
                setConversationId(data.conversation_id);
              }
              partIndex++;
            },
            onAnswer: (data) => {
              if (partIndex > 0) return;
              const isCasual = finalThinking?.selected_mode === "casual";
              const assistantMsg: ChatMessageType = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.text,
                thinking: isCasual ? undefined : finalThinking || undefined,
                sources: isCasual ? [] : (data.sources as Source[]),
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setConversationId(data.conversation_id);
            },
            onError: (error) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `Error: ${error.message}`,
                  timestamp: new Date(),
                },
              ]);
            },
          },
          bookIds,
          history,
        );
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, bookIds, chatMode, demoMode, demoRuntime],
  );

  const currentTurnResponses = useMemo(() => {
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) {
      return messages.filter((m) => m.role === "assistant");
    }
    return messages.slice(lastUserIdx + 1).filter((m) => m.role === "assistant");
  }, [messages]);

  const [bubbleIndex, setBubbleIndex] = useState(0);

  useEffect(() => {
    if (isLoading && currentTurnResponses.length > 0) {
      setBubbleIndex(currentTurnResponses.length - 1);
    }
  }, [isLoading, currentTurnResponses.length]);

  const prevLoadingRef = useRef(false);
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && currentTurnResponses.length > 1) {
      setBubbleIndex(0);
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, currentTurnResponses.length]);

  const handleBubbleNext = useCallback(() => {
    setBubbleIndex((prev) => Math.min(prev + 1, currentTurnResponses.length - 1));
  }, [currentTurnResponses.length]);

  const chatResponse = currentTurnResponses.length > 0
    ? currentTurnResponses[bubbleIndex]?.content ?? null
    : null;

  const bubbleInfo = currentTurnResponses.length > 1 && !isLoading
    ? { current: bubbleIndex, total: currentTurnResponses.length }
    : null;
  const hasNextBubble = !!bubbleInfo && bubbleInfo.current < bubbleInfo.total - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!chatMode || isLoading || !hasNextBubble || showHistory || showDemoProgress) return;
      if (event.code !== "Space" || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("input, textarea, [contenteditable='true']") !== null);
      if (isTypingTarget) return;

      event.preventDefault();
      handleBubbleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatMode, hasNextBubble, isLoading, showHistory, showDemoProgress, handleBubbleNext]);

  const panelWidth = 300;
  const hideUniverseForDemo = demoMode && chatMode;
  const activeDemoRuntime = demoRuntime ?? { sessionIndex: 0, step: "diagnostic" as const, mastery: 0.5 };
  const boundedCurrentDemoIndex = Math.max(
    0,
    Math.min(activeDemoRuntime.sessionIndex, DEMO_SESSIONS.length - 1),
  );
  const currentDemoSession = DEMO_SESSIONS[boundedCurrentDemoIndex];
  const currentModuleQuote = moduleQuote(currentDemoSession);
  const currentDemoPct = Math.round(
    ((boundedCurrentDemoIndex + 1) / DEMO_SESSIONS.length) * 100,
  );
  const boundedDraftDemoIndex = Math.max(
    0,
    Math.min(draftSessionIndex, DEMO_SESSIONS.length - 1),
  );
  const targetDemoPct = Math.round(
    ((boundedDraftDemoIndex + 1) / DEMO_SESSIONS.length) * 100,
  );
  const activeChoiceOptions = demoMode
    ? activeDemoRuntime.step === "diagnostic"
      ? preDiagnosticItem(currentDemoSession).options
      : activeDemoRuntime.step === "check"
        ? checkItem(currentDemoSession).options
        : null
    : null;
  const demoActionBottom = mobile ? 188 : 162;
  const placeholder = demoMode
    ? activeDemoRuntime.step === "diagnostic" || activeDemoRuntime.step === "check"
      ? "아래 객관식 버튼을 누르거나 질문을 입력해줘…"
      : activeDemoRuntime.step === "lecture"
        ? '"다음" 또는 질문을 입력해줘…'
        : "네 해석을 말해줘. 중간 질문도 가능해…"
    : selectedBook
    ? `Ask about "${selectedBook.title}"…`
    : books.length > 0
      ? "Ask about all your books…"
      : "Add a book first";

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="relative h-full w-full overflow-hidden">
      <FloatingCosmii3D
        triggerDance={triggerDance}
        chatMode={chatMode}
        chatResponse={chatMode ? chatResponse : null}
        chatLoading={chatMode && isLoading}
        bubbleInfo={chatMode ? bubbleInfo : null}
        onBubbleNext={handleBubbleNext}
        hidden={warping || settingsActive || aboutActive}
        onSettings={() => {
          warpTarget.current = "settings";
          warpDirection.current = "forward";
          setWarping(true);
        }}
        onAbout={() => {
          warpTarget.current = "about";
          warpDirection.current = "forward";
          setWarping(true);
        }}
        onDemo={() => {
          warpTarget.current = "demo";
          warpDirection.current = "forward";
          setWarping(true);
        }}
        welcomeText={
          demoMode
            ? "데모 모드야. 답하고, 질문하고, 같이 한 단계씩 가보자."
            : selectedBook
            ? `Ask anything about "${selectedBook.title}"!`
            : "Ask anything about this book!"
        }
      />

      {/* 3D Universe Canvas — always mounted, full-screen */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `${
            (selectedBookId || selectedUploadingId) && !chatMode && !mobile
              ? `translateX(-${panelWidth / 2}px)`
              : "translateX(0)"
          } scale(${!anyOverlayActive && arrivalPulse ? 1.04 : 1})`,
          transition: arrivalPulse
            ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease"
            : "transform 1.6s cubic-bezier(0.33, 0, 0.2, 1), opacity 0.3s ease",
          opacity: anyOverlayActive || hideUniverseForDemo ? 0 : 1,
          pointerEvents: anyOverlayActive || hideUniverseForDemo ? "none" : "auto",
        }}
      >
        <UniverseCanvas
          books={books}
          uploadingBooks={uploadingBooks}
          graphData={graphData}
          selectedBookId={selectedBookId}
          selectedUploadingId={selectedUploadingId}
          onSelectBook={handleSelectBookWrapped}
          onSelectUploading={handleSelectUploading}
          isThinking={isLoading}
          triggerDance={triggerDance}
        />
      </div>

      {/* ── Chat Mode: Floating top bar ── */}
      <AnimatePresence>
        {chatMode && (selectedBook || demoMode) && (
          <motion.div
            key="chat-topbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#060612]/90 border border-white/10"
          >
            <button
              onClick={exitChatMode}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-[13px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="w-px h-4 bg-white/15" />
            <motion.div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: demoMode ? "#67e8f9" : bookColor,
                boxShadow: `0 0 6px ${demoMode ? "#67e8f9" : bookColor}40`,
              }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[13px] font-medium text-white/70 max-w-[200px] truncate">
              {demoMode
                ? `${DEMO_BOOK_TITLE} 데모 ${demoRuntime ? `${demoRuntime.sessionIndex + 1}/${DEMO_SESSIONS.length}` : ""}`
                : selectedBook?.title}
            </span>
            <div className="w-px h-4 bg-white/15" />
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) setShowDemoProgress(false);
              }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-[13px]"
            >
              <History className="w-3.5 h-3.5" />
              {messages.length > 0 && (
                <span className="text-[10px] text-white/40">{messages.length}</span>
              )}
            </button>
            {demoMode && (
              <>
                <div className="w-px h-4 bg-white/15" />
                <button
                  onClick={() => {
                    setShowDemoProgress(!showDemoProgress);
                    if (!showDemoProgress) setShowHistory(false);
                  }}
                  className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-[13px]"
                >
                  <Network className="w-3.5 h-3.5" />
                  진도
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Demo Mode: Tutor status card ── */}
      <AnimatePresence>
        {chatMode &&
          demoMode &&
          !showHistory &&
          !showDemoProgress && (
            <motion.div
              key="demo-tutor-status"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed z-50 right-4"
              style={{ top: mobile ? 76 : 70, width: mobile ? "calc(100% - 32px)" : 360 }}
            >
              <div className="rounded-2xl bg-[#060612]/90 border border-white/15 shadow-xl px-4 py-3">
                <div className="flex items-center gap-2 text-white/70">
                  <BookOpen className="w-3.5 h-3.5" />
                  <p className="text-[12px] font-semibold tracking-wide">모듈 진행 상태</p>
                </div>
                <p className="mt-2 text-[13px] text-white/85">
                  {currentDemoSession.id} · 챕터 {currentDemoSession.chapter}: {currentDemoSession.chapterTitle} · 파트 {currentDemoSession.part}/{currentDemoSession.parts}
                </p>
                <p className="mt-1 text-[12px] text-white/65">
                  현재 단계: {demoStepLabel(activeDemoRuntime.step)}
                </p>
                <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[11px] text-white/75 italic">&quot;{currentModuleQuote.text}&quot;</p>
                  <p className="text-[10px] text-white/40 mt-1">{currentModuleQuote.source}</p>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/55">
                  <Clock3 className="w-3 h-3" />
                  중간 질문은 언제든 가능해. 스토리 단계에서는 아래 버튼으로 넘어가.
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ── Demo Mode: Choice buttons ── */}
      <AnimatePresence>
        {chatMode && demoMode && activeChoiceOptions && !showHistory && !showDemoProgress && (
          <motion.div
            key="demo-choice-buttons"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed z-50 left-1/2 -translate-x-1/2"
            style={{
              bottom: demoActionBottom,
              width: mobile ? "calc(100% - 32px)" : 520,
              maxWidth: mobile ? "calc(100% - 32px)" : 520,
            }}
          >
            <div className="space-y-2">
              {activeChoiceOptions.map((option, idx) => {
                const label = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={label}
                    onClick={() => {
                      void handleSend(label);
                    }}
                    disabled={isLoading}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] text-[12px] text-white/85 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <span className="text-white/70 font-semibold mr-2">{label}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Demo Mode: Next button in lecture step ── */}
      <AnimatePresence>
        {chatMode &&
          demoMode &&
          activeDemoRuntime.step === "lecture" &&
          !showHistory &&
          !showDemoProgress && (
            <motion.div
              key="demo-next-button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed z-50 left-1/2 -translate-x-1/2"
              style={{
                bottom: demoActionBottom,
                width: mobile ? "calc(100% - 32px)" : 520,
                maxWidth: mobile ? "calc(100% - 32px)" : 520,
              }}
            >
              <button
                onClick={() => {
                  void handleSend("다음");
                }}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.15] bg-white/[0.08] text-[13px] text-white/80 hover:bg-white/[0.12] transition-colors disabled:opacity-50"
              >
                다음으로 진행
              </button>
          </motion.div>
          )}
      </AnimatePresence>

      {/* ── Chat Mode: Floating input ── */}
      <AnimatePresence>
        {chatMode && (
          <motion.div
            key="floating-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50 left-1/2 bottom-16 -translate-x-1/2"
            style={{
              width: mobile ? "calc(100% - 32px)" : 520,
              maxWidth: mobile ? "calc(100% - 32px)" : 520,
            }}
          >
            <div className="bg-white/[0.07] rounded-2xl border border-white/20 px-1.5 py-1.5">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                placeholder={placeholder}
              />
        </div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* ── Chat Mode: Floating user message bubble ── */}
      <AnimatePresence>
        {chatMode && lastUserBubble && (
          <motion.div
            key="user-bubble"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed z-50"
            style={{
              right: mobile ? 16 : 30,
              ...(mobile ? { top: 200 } : { bottom: 100 }),
              maxWidth: mobile ? "60vw" : 320,
            }}
          >
            <div className="rounded-2xl rounded-br-md bg-white/[0.06] border border-white/[0.10] px-4 py-3 shadow-lg">
              <p className="text-[14px] text-white/80 leading-relaxed">{lastUserBubble}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Mode: History overlay ── */}
      <AnimatePresence>
        {chatMode && showHistory && (
          <motion.div
            key="history-overlay"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col bg-[#060612]/90 border-l border-white/10"
            style={{ width: mobile ? "85vw" : 420 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-white/40" />
                <span className="text-[14px] font-semibold text-white/70">Chat History</span>
                {messages.length > 0 && (
                  <span className="text-[11px] text-white/30">{messages.length} messages</span>
                )}
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-white/30 text-center py-6">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 300,
                        damping: 26,
                      }}
                    >
                      <ChatMessage message={msg} />
                    </motion.div>
                  ))
                )}
                <div ref={historyBottomRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Demo Mode: Progress editor ── */}
      <AnimatePresence>
        {chatMode && demoMode && showDemoProgress && (
          <motion.div
            key="demo-progress-overlay"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col bg-[#060612]/90 border-l border-white/10"
            style={{ width: mobile ? "88vw" : 420 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <p className="text-[14px] font-semibold text-white/80">데모 진도</p>
                <p className="text-[11px] text-white/35">원하는 세션/단계로 바로 이동</p>
              </div>
              <button
                onClick={() => setShowDemoProgress(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-white/45">현재</p>
                <p className="text-[11px] font-mono text-white/60">{currentDemoPct}%</p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentDemoPct}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
              <p className="text-[11px] text-white/50">
                {currentDemoSession.id} · 챕터 {currentDemoSession.chapter} 파트 {currentDemoSession.part}/{currentDemoSession.parts} · {demoStepLabel(activeDemoRuntime.step)}
              </p>
              <p className="text-[11px] text-white/40">
                이해도 추정: {Math.round(activeDemoRuntime.mastery * 100)}%
              </p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-white/40">편집 목표</p>
                <p className="text-[11px] font-mono text-white/60">{targetDemoPct}%</p>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-[11px] text-white/45 mb-2">단계</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDraftStep("diagnostic")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                    draftStep === "diagnostic"
                      ? "bg-white/[0.08] border border-white/[0.15] text-white/80"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  워밍업
                </button>
                <button
                  onClick={() => setDraftStep("lecture")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                    draftStep === "lecture"
                      ? "bg-white/[0.08] border border-white/[0.15] text-white/80"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  스토리
                </button>
                <button
                  onClick={() => setDraftStep("check")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                    draftStep === "check"
                      ? "bg-white/[0.08] border border-white/[0.15] text-white/80"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  확인
                </button>
                <button
                  onClick={() => setDraftStep("discussion")}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                    draftStep === "discussion"
                      ? "bg-white/[0.08] border border-white/[0.15] text-white/80"
                      : "bg-white/5 border border-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  대화
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="px-3 py-3 space-y-2">
                {DEMO_SESSIONS.map((session, idx) => {
                  const active = idx === draftSessionIndex;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setDraftSessionIndex(idx)}
                      className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                        active
                          ? "border-white/[0.15] bg-white/[0.06]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className="text-[11px] text-white/45">{session.id}</p>
                      <p className="text-[12px] text-white/90 font-medium mt-0.5">
                        챕터 {session.chapter} · 파트 {session.part}/{session.parts}
                      </p>
                      <p className="text-[11px] text-white/55 mt-1 truncate">{session.chapterTitle}</p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="px-4 py-3 border-t border-white/10 bg-white/[0.03]">
              <button
                onClick={applyDemoProgress}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg text-[12px] font-medium bg-white/[0.08] border border-white/[0.15] text-white/80 hover:bg-white/[0.12] transition-colors disabled:opacity-40"
              >
                진도 적용
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabbed Side Panel (Info only — Chat opens chatMode) ── */}
      <AnimatePresence>
        {selectedBookId && selectedBook && !chatMode && !mobile && (
          <motion.div
            key="side-panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: panelWidth }}
            exit={{ x: 420, opacity: 0 }}
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 30,
              width: { duration: 0.3, ease: "easeInOut" },
            }}
            className="absolute right-0 top-0 h-full z-20 flex flex-col bg-[#060612]/90 border-l border-white/10"
          >
            {/* Book header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onSelectBook(null)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <motion.div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: bookColor,
                    boxShadow: `0 0 8px ${bookColor}40`,
                  }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="min-w-0 flex-1">
                  {editingTitle ? (
                    <input
                      ref={titleInputRef}
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => {
                        const trimmed = titleDraft.trim();
                        if (trimmed && trimmed !== selectedBook.title) {
                          onRenameBook?.(selectedBook.book_id, trimmed);
                        }
                        setEditingTitle(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") { setEditingTitle(false); }
                      }}
                      className="w-full text-[15px] font-semibold text-white bg-white/10 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-white/20"
                    />
                  ) : (
                    <h3
                      className="text-[15px] font-semibold text-white truncate cursor-pointer hover:text-white/80 transition-colors"
                      onClick={() => {
                        setTitleDraft(selectedBook.title);
                        setEditingTitle(true);
                        setTimeout(() => titleInputRef.current?.select(), 0);
                      }}
                      title="Click to rename"
                    >
                    {selectedBook.title}
                  </h3>
                  )}
                  <p className="text-xs text-white/50 truncate">
                    {selectedBook.author !== "Unknown"
                      ? selectedBook.author
                      : ""}
                    {selectedBook.domain
                      ? `${selectedBook.author !== "Unknown" ? " · " : ""}${selectedBook.domain}`
                      : ""}
                  </p>
                </div>
                {onDeleteBook && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/15 text-white/25 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Delete confirmation */}
              <AnimatePresence>
                {confirmDelete && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-2 flex items-center gap-2">
                      <p className="flex-1 text-[13px] text-red-400/80">Delete this book?</p>
                      <button
                        onClick={() => {
                          onDeleteBook?.(selectedBookId!);
                          setConfirmDelete(false);
                        }}
                        className="px-3 py-1 rounded-md bg-red-500/20 text-[13px] font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1 rounded-md bg-white/5 text-[13px] font-medium text-white/50 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tab headers */}
            <div className="flex px-4 gap-1 pb-2">
              <button
                onClick={() => setView("detail")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  view === "detail"
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Info
              </button>
              <button
                onClick={() => setChatMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 text-white/40 hover:text-white/60 hover:bg-white/5"
              >
                <MessageCircle className="w-3 h-3" />
                Chat
                {messages.length > 0 && (
                  <span className="ml-0.5 text-[10px] text-white/40">{messages.length}</span>
                )}
              </button>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* ── Info tab content ── */}
            {view === "detail" && (
              <>
            <ScrollArea className="flex-1 min-h-0">
              <div
                className="px-4 py-4 space-y-4"
                key={selectedBookId}
              >
                {cardLoading ? (
                  <div className="space-y-3 py-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="space-y-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="h-2.5 w-16 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                      </motion.div>
                    ))}
                  </div>
                ) : card ? (
                  <>
                    <CardItem
                      title="Core Thesis"
                      icon="💡"
                      content={card.core_thesis}
                      delay={0.05}
                    />
                    <CardItem
                      title="Worldview"
                      icon="🌍"
                      content={card.worldview}
                      delay={0.1}
                    />
                    <CardItem
                      title="Author Bias"
                      icon="⚖️"
                      content={card.author_bias}
                      delay={0.15}
                    />
                    <CardList
                      title="Key Principles"
                      icon="📌"
                      items={card.key_principles}
                      delay={0.2}
                    />
                    {card.key_metaphors.length > 0 && (
                      <CardList
                        title="Key Metaphors"
                        icon="🔮"
                        items={card.key_metaphors}
                        delay={0.35}
                      />
                    )}
                    {card.strategic_patterns.length > 0 && (
                      <CardList
                        title="Strategic Patterns"
                        icon="🎯"
                        items={card.strategic_patterns}
                        delay={0.45}
                      />
                    )}
                  </>
                ) : (
                      <p className="text-sm text-white/30 text-center py-6">
                    Unable to load model card
                  </p>
                )}
              </div>
            </ScrollArea>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Info overlay card ── */}
      <AnimatePresence>
        {selectedBookId && selectedBook && mobile && view === "detail" && !chatMode && (
          <>
              <motion.div
              key="info-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[45] bg-[#060612]/60"
              onClick={() => setView("graph")}
            />
            <motion.div
              key="info-overlay"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute left-4 right-4 top-[12vh] z-[46] max-h-[70vh] rounded-2xl bg-[#060612]/90 border border-white/10 shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            >
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: bookColor }}
                  />
                  <span className="text-[14px] font-semibold text-white/90 truncate">
                    {selectedBook.title}
                  </span>
                </div>
                <button
                  onClick={() => setView("graph")}
                  className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 py-4 space-y-4" key={selectedBookId}>
                  {cardLoading ? (
                    <div className="space-y-3 py-4">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="space-y-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className="h-2.5 w-16 bg-white/10 rounded animate-pulse" />
                          <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                          <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              </motion.div>
                      ))}
            </div>
                  ) : card ? (
                    <>
                      <CardItem title="Core Thesis" icon="💡" content={card.core_thesis} delay={0.05} />
                      <CardItem title="Worldview" icon="🌍" content={card.worldview} delay={0.1} />
                      <CardItem title="Author Bias" icon="⚖️" content={card.author_bias} delay={0.15} />
                      <CardList title="Key Principles" icon="📌" items={card.key_principles} delay={0.2} />
                      {card.key_metaphors.length > 0 && (
                        <CardList title="Key Metaphors" icon="🔮" items={card.key_metaphors} delay={0.35} />
                      )}
                      {card.strategic_patterns.length > 0 && (
                        <CardList title="Strategic Patterns" icon="🎯" items={card.strategic_patterns} delay={0.45} />
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white/30 text-center py-6">
                      Unable to load model card
                    </p>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile floating tab bar ── */}
      <AnimatePresence>
        {selectedBookId && mobile && !chatMode && (
          <motion.div
            key="mobile-tab-bar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[50] flex gap-1 px-2 py-1.5 rounded-full bg-[#060612]/90 border border-white/10 shadow-lg shadow-black/30"
          >
            <button
              onClick={() => { onSelectBook(null); setChatMode(false); setView("graph"); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium text-white/40 hover:text-white/60 transition-all duration-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 self-center bg-white/10" />
            {([
              { key: "graph" as const, icon: Network, label: "Graph" },
              { key: "detail" as const, icon: Sparkles, label: "Info" },
              { key: "chat" as const, icon: MessageCircle, label: "Chat", badge: messages.length },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "chat") {
                    setChatMode(true);
                    setView("chat");
                  } else {
                    setChatMode(false);
                    setView(tab.key);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  view === tab.key
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-0.5 text-[10px] text-white/40">{tab.badge}</span>
                ) : null}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload progress panel ── */}
      <AnimatePresence>
        {selectedUploadingId && selectedUploading && (
          <motion.div
            key="upload-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-[300px] z-20 flex flex-col bg-[#060612]/90 border-l border-white/10"
          >
            {(() => {
              const p = selectedUploading.progress;
              const currentStage = p?.stage ?? null;
              const isComplete = currentStage === "complete";
              const isError = currentStage === "error";
              const currentIdx = currentStage
                ? UPLOAD_STAGES.indexOf(currentStage as UploadStage)
                : -1;

              const overallDone = isComplete
                ? UPLOAD_STAGES.length
                : currentIdx >= 0
                  ? currentIdx + (p?.status === "complete" ? 1 : 0)
                  : 0;
              const overallPct = Math.round((overallDone / UPLOAD_STAGES.length) * 100);

              const formatTime = (ms: number) => {
                if (!ms || ms < 1000) return "< 1s";
                const sec = Math.floor(ms / 1000);
                if (sec < 60) return `${sec}s`;
                const min = Math.floor(sec / 60);
                const s = sec % 60;
                if (min < 60) return `${min}m ${s}s`;
                return `${Math.floor(min / 60)}h ${min % 60}m`;
              };

              const timing = uploadTimingRef.current;
              const now = Date.now();
              const deltaSinceEvent = timing.lastEventAt > 0 ? now - timing.lastEventAt : 0;
              const livePipelineElapsed = timing.lastPipelineMs + deltaSinceEvent;
              const liveStageElapsed = timing.lastStageMs + deltaSinceEvent;

              const completedDurations = timing.stageDurations;
              let totalCompletedMs = 0;
              completedDurations.forEach((v) => { totalCompletedMs += v; });
              const completedCount = completedDurations.size;
              const avgStageDuration = completedCount > 0 ? totalCompletedMs / completedCount : 0;
              const remainingStages = UPLOAD_STAGES.length - overallDone;
              const pipelineEta = remainingStages > 0 && avgStageDuration > 0
                ? Math.round(avgStageDuration * remainingStages)
                : 0;

              return (
                <>
            <div className="px-4 py-4">
              <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onSelectUploading(null)}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {isComplete ? (
                        <div className="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-400" />
                      ) : isError ? (
                        <div className="w-3 h-3 rounded-full flex-shrink-0 bg-red-400" />
                      ) : (
                <motion.div
                          className="w-3 h-3 rounded-full flex-shrink-0 bg-amber-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                      )}
                <div className="min-w-0 flex-1">
                        <h3 className="text-[15px] font-semibold text-white truncate">
                    {selectedUploading.filename.replace(/\.[^.]+$/, "")}
                  </h3>
                        <p className="text-xs text-white/50">
                          {isComplete ? "Complete" : isError ? "Failed" : "Processing…"}
                  </p>
                </div>
                      <span className="text-xs font-mono text-white/40">{overallPct}%</span>
              </div>

                    {/* Overall progress bar */}
                    <div className="mt-3 w-full h-[3px] rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isComplete
                            ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                            : isError
                              ? "linear-gradient(90deg, #f87171, #fca5a5)"
                              : "linear-gradient(90deg, #f0a030, #f5c060)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${overallPct}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Pipeline elapsed + ETA */}
                    {!isComplete && !isError && livePipelineElapsed > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/40">
                          {formatTime(livePipelineElapsed)}
                        </span>
                        {pipelineEta > 0 && overallDone >= 2 && (
                          <span className="text-[11px] font-mono text-white/35">
                            ~{formatTime(pipelineEta)} left
                          </span>
                        )}
                      </div>
                    )}
                    {isComplete && livePipelineElapsed > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-white/30">Total</span>
                        <span className="text-[11px] font-mono text-white/50">
                          {formatTime(livePipelineElapsed)}
                        </span>
                      </div>
                    )}
            </div>

            <div className="w-full h-px bg-white/10" />

                  <div className="px-4 py-4 space-y-2.5 overflow-y-auto flex-1">
                    {UPLOAD_STAGES.map((stage, i) => {
                      const stageDone = currentIdx > i || (currentIdx === i && p?.status === "complete") || isComplete;
                      const stageCurrent = stage === currentStage && p?.status !== "complete" && !isComplete;
                      const stageError = currentStage === "error" && currentIdx === i;
                      const hasItems = stageCurrent && p && p.total > 0;
                      const stagePct = hasItems
                        ? Math.min(100, Math.round(((p?.current ?? 0) / (p?.total ?? 1)) * 100))
                        : 0;
                      const doneMs = completedDurations.get(stage);

                  return (
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                          className={`rounded-lg px-3 py-2 transition-colors ${
                            stageCurrent ? "bg-white/[0.03]" : ""
                          }`}
                    >
                          <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                              {stageDone ? (
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              ) : stageCurrent ? (
                                stageError ? (
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                          ) : (
                            <motion.div
                                    className="w-2 h-2 rounded-full bg-amber-400"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            />
                          )
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-[13px] font-medium ${
                                  stageDone
                            ? "text-white/50"
                                    : stageCurrent
                                      ? stageError ? "text-red-400" : "text-white/90"
                              : "text-white/25"
                        }`}>
                          {UPLOAD_STAGE_LABELS[stage]}
                              </span>
                                <div className="flex items-center gap-2">
                                  {hasItems && (
                                    <span className="text-[11px] font-mono text-white/40">
                                      {p?.current}/{p?.total}
                              </span>
                                  )}
                                  {stageDone && doneMs != null && (
                                    <span className="text-[10px] font-mono text-white/25">
                                      {formatTime(doneMs)}
                                    </span>
                                  )}
                                  {stageCurrent && !stageError && liveStageElapsed > 0 && (
                                    <span className="text-[10px] font-mono text-white/30">
                                      {formatTime(liveStageElapsed)}
                                    </span>
                                  )}
                            </div>
                              </div>
                            </div>
                          </div>

                          {/* Detail text (e.g. sub-pass info) */}
                          {stageCurrent && p?.detail && !stageError && (
                            <p className="text-[11px] text-white/40 mt-0.5 ml-[30px]">{p.detail}</p>
                          )}

                          {/* Per-stage progress bar + timing */}
                          {hasItems && p && (
                            <div className="mt-1.5 ml-[30px]">
                            <div className="w-full h-[2px] rounded-full bg-white/8 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                  style={{ background: "linear-gradient(90deg, #f0a030, #f5c060)" }}
                                initial={{ width: 0 }}
                                  animate={{ width: `${stagePct}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                              <div className="flex items-center justify-between mt-1.5">
                                {(p.avg_ms_per_item ?? 0) > 0 && (
                                  <span className="text-[10px] text-white/25">
                                    ~{formatTime(p.avg_ms_per_item ?? 0)}/item
                                  </span>
                                )}
                                {(p.estimated_remaining_ms ?? 0) > 0 && (p.current ?? 0) > 0 && (
                                  <span className="text-[10px] text-white/35">
                                    ~{formatTime(p.estimated_remaining_ms ?? 0)} left
                                  </span>
                        )}
                      </div>
                            </div>
                          )}

                          {stageCurrent && stageError && p?.message && (
                            <p className="text-[11px] text-red-400/60 mt-1 ml-[30px]">{p.message}</p>
                          )}
                    </motion.div>
                  );
                    })}
            </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings: Gear Constellation background + right panel ── */}
      <AnimatePresence>
        {settingsActive && (
          <motion.div
            key="gear-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: arrivalPulse ? 1.05 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.4 }, scale: { type: "spring", stiffness: 170, damping: 14 } }}
            className="absolute inset-0 z-10 origin-center"
          >
            <motion.div
              className="absolute inset-0 will-change-transform"
              initial={{ x: 0 }}
              animate={{ x: !warping && !mobile ? -panelWidth / 2 : 0 }}
              transition={{ delay: !warping ? 0.3 : 0, type: "spring", stiffness: 260, damping: 28 }}
            >
              <GearConstellation />
            </motion.div>

            {/* Settings right panel — appears after warp completes */}
                  <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={!warping ? { x: 0, opacity: 1 } : { x: 420, opacity: 0 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ delay: !warping ? 0.3 : 0, type: "spring", stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 h-full z-20 flex flex-col bg-[#060612]/90 border-l border-white/10"
              style={{ width: mobile ? "100%" : panelWidth }}
            >
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      warpDirection.current = "reverse";
                      setWarping(true);
                    }}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-[14px] font-semibold text-white/90 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                    </h2>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-4 py-5 space-y-5">
                  <p className="text-[13px] text-white/40 text-center py-8">
                    Coming soon
                  </p>
                </div>
              </ScrollArea>
            </motion.div>
                  </motion.div>
                )}
      </AnimatePresence>

      {/* ── About: Cosmii Constellation background + right panel ── */}
      <AnimatePresence>
        {aboutActive && (
                    <motion.div
            key="about-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: arrivalPulse ? 1.05 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.4 }, scale: { type: "spring", stiffness: 170, damping: 14 } }}
            className="absolute inset-0 z-10 origin-center"
          >
            <motion.div
              className="absolute inset-0 will-change-transform"
              initial={{ x: 0 }}
              animate={{ x: !warping && !mobile ? -panelWidth / 2 : 0 }}
              transition={{ delay: !warping ? 0.3 : 0, type: "spring", stiffness: 260, damping: 28 }}
            >
              <CosmiiConstellation animate={false} />
                    </motion.div>

            {/* About right panel */}
                  <motion.div
              initial={{ x: 420, opacity: 0 }}
              animate={!warping ? { x: 0, opacity: 1 } : { x: 420, opacity: 0 }}
              exit={{ x: 420, opacity: 0 }}
              transition={{ delay: !warping ? 0.3 : 0, type: "spring", stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 h-full z-20 flex flex-col bg-[#060612]/90 border-l border-white/10"
              style={{ width: mobile ? "100%" : panelWidth }}
            >
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      warpDirection.current = "reverse";
                      warpTarget.current = "about";
                      setWarping(true);
                    }}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-[14px] font-semibold text-white/90 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    About
                  </h2>
                    </div>
                      </div>
              <ScrollArea className="flex-1">
                <div className="px-4 py-5 space-y-5">
                  <p className="text-[13px] text-white/40 text-center py-8">
                    Coming soon
                  </p>
              </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Warp effect overlay ── */}
      <WarpOverlay
        active={warping}
        onMidpoint={() => {
          const target = warpTarget.current;
          if (warpDirection.current === "forward") {
            if (target === "settings") setSettingsActive(true);
            else if (target === "about") setAboutActive(true);
            else if (target === "demo") startDemoChat();
          } else {
            setSettingsActive(false);
            setAboutActive(false);
          }
        }}
        onComplete={() => {
          setWarping(false);
          setArrivalPulse(true);
          setTimeout(() => setArrivalPulse(false), 500);
        }}
      />

    </div>
  );
}

/* ================================================================ */
/*  Sub-components                                                    */
/* ================================================================ */

function CardItem({
  title,
  icon,
  content,
  delay,
}: {
  title: string;
  icon: string;
  content: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-white/5 border border-white/10 p-3"
    >
      <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h4>
      <p className="text-[13px] text-white/70 leading-relaxed">{content}</p>
    </motion.div>
  );
}

function CardList({
  title,
  icon,
  items,
  delay,
}: {
  title: string;
  icon: string;
  items: string[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h4 className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.05 + i * 0.04 }}
            className="text-[13px] text-white/60 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-white/30 leading-relaxed"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
