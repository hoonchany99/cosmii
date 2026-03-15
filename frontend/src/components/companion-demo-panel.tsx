"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronLeft, Clock3, Flag, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageBubble } from "@/components/chat-message";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

type TimeBudget = 8 | 15 | 25;
type DemoStage = "reading" | "quiz" | "done";

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

const DEMIAN_SESSIONS: DemoSession[] = [
  { id: "S01", chapter: 1, chapterTitle: "Two Worlds", part: 1, parts: 3, words: 2203, range: "paras 1-22", spark: "The first crack appears between Sinclair's safe world and shadow world.", question: "What first pushes Sinclair into the other world most strongly?", options: ["Curiosity", "Fear of an older boy", "Religious doubt"], answerIndex: 1, cliffhanger: "Tomorrow, that fear hardens into a trap." },
  { id: "S02", chapter: 1, chapterTitle: "Two Worlds", part: 2, parts: 3, words: 2137, range: "paras 23-65", spark: "Watch how fear becomes routine and silence becomes strategy.", question: "What keeps the trap alive in this section?", options: ["Physical injury", "Ongoing intimidation", "Exam anxiety"], answerIndex: 1, cliffhanger: "Someone notices what Sinclair never says out loud." },
  { id: "S03", chapter: 1, chapterTitle: "Two Worlds", part: 3, parts: 3, words: 2158, range: "paras 66-93", spark: "Relief arrives, but the inner split does not disappear.", question: "After the crisis eases, what remains strongest?", options: ["Pure confidence", "Inner division", "Social popularity"], answerIndex: 1, cliffhanger: "A new classmate will redefine good and bad." },
  { id: "S04", chapter: 2, chapterTitle: "Cain", part: 1, parts: 3, words: 2266, range: "paras 1-29", spark: "Demian enters as a reader of symbols, not rules.", question: "Demian's reading of Cain treats the mark as:", options: ["Pure shame", "A sign of strength", "A random detail"], answerIndex: 1, cliffhanger: "Theory and Kromer's reality are about to collide." },
  { id: "S05", chapter: 2, chapterTitle: "Cain", part: 2, parts: 3, words: 2102, range: "paras 30-73", spark: "Power shifts before Sinclair fully understands why.", question: "Who changes the balance of power around Kromer?", options: ["Sinclair's father", "Demian", "A school teacher"], answerIndex: 1, cliffhanger: "Freedom comes with a cost Sinclair did not expect." },
  { id: "S06", chapter: 2, chapterTitle: "Cain", part: 3, parts: 3, words: 2171, range: "paras 74-118", spark: "Rescue is real, but dependence is real too.", question: "What mixed state follows Kromer's disappearance?", options: ["Relief and unease", "Only happiness", "Total indifference"], answerIndex: 0, cliffhanger: "Demian's ideas will get even more dangerous." },
  { id: "S07", chapter: 3, chapterTitle: "The Thief on the Cross", part: 1, parts: 3, words: 2452, range: "paras 1-20", spark: "Friendship turns into intellectual provocation.", question: "Demian influences Sinclair mainly through:", options: ["Threats", "Reinterpretation", "Social status"], answerIndex: 1, cliffhanger: "A sacred story will be turned inside out." },
  { id: "S08", chapter: 3, chapterTitle: "The Thief on the Cross", part: 2, parts: 3, words: 2028, range: "paras 21-39", spark: "One moral story, multiple meanings.", question: "What is the core move in this part?", options: ["Literal obedience", "Alternative interpretation", "Historical trivia"], answerIndex: 1, cliffhanger: "A life transition closes in." },
  { id: "S09", chapter: 3, chapterTitle: "The Thief on the Cross", part: 3, parts: 3, words: 2156, range: "paras 40-65", spark: "Belief, resistance, and separation tighten together.", question: "What concrete change ends this chapter?", options: ["Military service", "Move to a new school", "Family relocation abroad"], answerIndex: 1, cliffhanger: "Isolation becomes the next battlefield." },
  { id: "S10", chapter: 4, chapterTitle: "Beatrice", part: 1, parts: 3, words: 2460, range: "paras 1-26", spark: "New city, old loneliness.", question: "What pattern dominates Sinclair's social life here?", options: ["Stable belonging", "Drifting between circles", "Complete withdrawal"], answerIndex: 1, cliffhanger: "An image starts to become discipline." },
  { id: "S11", chapter: 4, chapterTitle: "Beatrice", part: 2, parts: 3, words: 2464, range: "paras 27-49", spark: "Beatrice shifts from fascination to inner form.", question: "In this arc, Beatrice functions mainly as:", options: ["A practical tutor", "An inner ideal", "A family authority"], answerIndex: 1, cliffhanger: "A dream-image is about to fuse identities." },
  { id: "S12", chapter: 4, chapterTitle: "Beatrice", part: 3, parts: 3, words: 2364, range: "paras 50-86", spark: "Art becomes a mirror of hidden connection.", question: "The painted face starts to resemble whom?", options: ["Kromer", "Demian", "Pistorius"], answerIndex: 1, cliffhanger: "Next chapter opens with the Abraxas shock." },
  { id: "S13", chapter: 5, chapterTitle: "The Bird Fights Its Way Out of the Egg", part: 1, parts: 3, words: 2045, range: "paras 1-22", spark: "Neat binaries collapse.", question: "Abraxas points toward:", options: ["Only good", "Only evil", "A unity beyond both"], answerIndex: 2, cliffhanger: "Sinclair now needs a guide, not an answer." },
  { id: "S14", chapter: 5, chapterTitle: "The Bird Fights Its Way Out of the Egg", part: 2, parts: 3, words: 1868, range: "paras 23-62", spark: "Inner turmoil meets symbolic language.", question: "Who emerges as the new mentor figure?", options: ["Alfons Beck", "Pistorius", "Demian's father"], answerIndex: 1, cliffhanger: "Teaching deepens, and so does the risk." },
  { id: "S15", chapter: 5, chapterTitle: "The Bird Fights Its Way Out of the Egg", part: 3, parts: 3, words: 1822, range: "paras 63-81", spark: "Recognition feels like destiny and danger at once.", question: "Sinclair's response to insight is mostly:", options: ["Pure peace", "Mixed awe and fear", "Dismissal"], answerIndex: 1, cliffhanger: "Soon he must outgrow the guide." },
  { id: "S16", chapter: 6, chapterTitle: "Jacob Wrestles with the Angel", part: 1, parts: 3, words: 2334, range: "paras 1-47", spark: "Practice begins: live from inner law, not habit.", question: "Main tension in this part:", options: ["Grades vs sports", "Conformity vs inner necessity", "Money vs status"], answerIndex: 1, cliffhanger: "Another person's crisis will test Sinclair's ethic." },
  { id: "S17", chapter: 6, chapterTitle: "Jacob Wrestles with the Angel", part: 2, parts: 3, words: 2388, range: "paras 48-87", spark: "Compassion gets tested by responsibility.", question: "This section pushes Sinclair toward:", options: ["Saving everyone by force", "Respecting inner development", "Total detachment"], answerIndex: 1, cliffhanger: "The mentor bond nears rupture." },
  { id: "S18", chapter: 6, chapterTitle: "Jacob Wrestles with the Angel", part: 3, parts: 3, words: 2277, range: "paras 88-112", spark: "A true teacher eventually becomes a limit.", question: "Why does Sinclair separate from Pistorius?", options: ["External scandal", "Inner growth outpaces the bond", "Financial conflict"], answerIndex: 1, cliffhanger: "The search bends back toward Demian." },
  { id: "S19", chapter: 7, chapterTitle: "Eve", part: 1, parts: 4, words: 2158, range: "paras 1-38", spark: "Signs return and old threads reactivate.", question: "What draws Sinclair back into Demian's orbit?", options: ["Career plans", "Signs and longing", "Family pressure"], answerIndex: 1, cliffhanger: "A new center appears." },
  { id: "S20", chapter: 7, chapterTitle: "Eve", part: 2, parts: 4, words: 1975, range: "paras 39-79", spark: "Frau Eva appears as gravity, not comfort.", question: "Eve's role is best read as:", options: ["Comfort only", "Transformative center", "Social distraction"], answerIndex: 1, cliffhanger: "Desire now changes form." },
  { id: "S21", chapter: 7, chapterTitle: "Eve", part: 3, parts: 4, words: 2186, range: "paras 80-93", spark: "Love shifts from possession toward becoming.", question: "Sinclair's love here becomes more:", options: ["Possessive", "Formative", "Casual"], answerIndex: 1, cliffhanger: "History outside starts pressing in." },
  { id: "S22", chapter: 7, chapterTitle: "Eve", part: 4, parts: 4, words: 1909, range: "paras 94-139", spark: "Private destiny meets collective foreboding.", question: "What mood dominates this close?", options: ["Stability", "Foreboding", "Celebration"], answerIndex: 1, cliffhanger: "The final chapter opens with rupture." },
  { id: "S23", chapter: 8, chapterTitle: "The Beginning of the End", part: 1, parts: 1, words: 2821, range: "paras 1-59", spark: "War turns symbols into fate.", question: "What survives destruction most clearly?", options: ["Childhood innocence", "Inner awakening", "Social certainty"], answerIndex: 1, cliffhanger: "The ending gives a key, not closure." },
];

function estimatedPages(words: number): number {
  return Math.max(1, Math.round(words / 280));
}

function optionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function buildMessages(
  session: DemoSession,
  timeBudget: TimeBudget,
  stage: DemoStage,
  chosenOption: number | null,
  stopped: boolean,
): ChatMessageType[] {
  const stopLine = `Saved. We will resume at Chapter ${session.chapter}, Part ${session.part}/${session.parts}.`;
  const resumeLine = `Last time you stopped before a turning point in ${session.chapterTitle}. Ready for ${timeBudget} minutes?`;
  const now = new Date();
  const messages: ChatMessageType[] = [
    {
      id: "m1",
      role: "assistant",
      content: `Session ${session.id}. Chapter ${session.chapter}: ${session.chapterTitle} (Part ${session.part}/${session.parts}).`,
      timestamp: now,
    },
    {
      id: "m2",
      role: "assistant",
      content: `Hook: ${session.spark}`,
      timestamp: now,
    },
    {
      id: "m3",
      role: "assistant",
      content: `Read Sprint: ${timeBudget} minutes. Target scope is ${session.range} (~${estimatedPages(session.words)} pages).`,
      timestamp: now,
    },
  ];

  if (stopped) {
    messages.push({
      id: "u-stop",
      role: "user",
      content: "I want to stop here.",
      timestamp: now,
    });
    messages.push({
      id: "m-stop",
      role: "assistant",
      content: `${stopLine}\n${resumeLine}`,
      timestamp: now,
    });
    return messages;
  }

  if (stage === "quiz" || stage === "done") {
    messages.push({
      id: "m4",
      role: "assistant",
      content: `Quick check: ${session.question}`,
      timestamp: now,
    });
  }

  if (chosenOption !== null) {
    messages.push({
      id: "u-answer",
      role: "user",
      content: `${optionLabel(chosenOption)}. ${session.options[chosenOption]}`,
      timestamp: now,
    });
  }

  if (stage === "done" && chosenOption !== null) {
    const correct = chosenOption === session.answerIndex;
    messages.push({
      id: "m5",
      role: "assistant",
      content: correct
        ? "Nice. Your answer is consistent with the current anchor."
        : `Good try. The expected anchor check is ${optionLabel(session.answerIndex)}.`,
      timestamp: now,
    });
    messages.push({
      id: "m6",
      role: "assistant",
      content: `Cliffhanger: ${session.cliffhanger}`,
      timestamp: now,
    });
  }

  return messages;
}

interface CompanionDemoPanelProps {
  onBack?: () => void;
}

export function CompanionDemoPanel({ onBack }: CompanionDemoPanelProps = {}) {
  const [timeBudget, setTimeBudget] = useState<TimeBudget>(15);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(DEMIAN_SESSIONS[0].id);
  const [stage, setStage] = useState<DemoStage>("reading");
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const [stopped, setStopped] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const session = useMemo(
    () => DEMIAN_SESSIONS.find((item) => item.id === selectedSessionId) ?? DEMIAN_SESSIONS[0],
    [selectedSessionId],
  );
  const sessionIndex = useMemo(
    () => DEMIAN_SESSIONS.findIndex((item) => item.id === session.id),
    [session.id],
  );
  const progressPct = Math.round(((sessionIndex + 1) / DEMIAN_SESSIONS.length) * 100);

  const messages = useMemo(
    () => buildMessages(session, timeBudget, stage, chosenOption, stopped),
    [session, timeBudget, stage, chosenOption, stopped],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectSession = (id: string) => {
    setSelectedSessionId(id);
    setStage("reading");
    setChosenOption(null);
    setStopped(false);
  };

  const goToNextSession = () => {
    const next = DEMIAN_SESSIONS[sessionIndex + 1];
    if (!next) return;
    selectSession(next.id);
  };

  return (
    <div className="h-full min-h-[100dvh] flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <Sparkles className="w-4 h-4 text-white/50" />
          <h2 className="text-[14px] font-semibold text-white/90">Companion Demo (Chat Mode)</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/55">
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Demian</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">23 Sessions</span>
          <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Spark - Read - Check - Cliffhanger</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap items-center gap-2">
        <p className="text-[12px] text-white/45 mr-1">Reading time:</p>
        {[8, 15, 25].map((value) => (
          <button
            key={value}
            onClick={() => setTimeBudget(value as TimeBudget)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              timeBudget === value
                ? "bg-white/[0.08] border border-white/[0.15] text-white/80"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white/80"
            }`}
          >
            {value} min
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-0 flex-1">
        <ScrollArea className="border-r border-white/[0.06]">
          <div className="p-3 space-y-2">
            {DEMIAN_SESSIONS.map((item) => {
              const active = item.id === session.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectSession(item.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                    active
                      ? "border-white/[0.15] bg-white/[0.06]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className="text-[11px] text-white/45">{item.id}</p>
                  <p className="text-[12px] text-white/88 font-medium mt-0.5">
                    Ch {item.chapter} · Part {item.part}/{item.parts}
                  </p>
                  <p className="text-[11px] text-white/55 mt-1 truncate">{item.chapterTitle}</p>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="min-h-0 flex flex-col">
          <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/45">Current Session</p>
                <p className="text-[14px] font-semibold text-white mt-0.5">
                  Chapter {session.chapter}: {session.chapterTitle} · Part {session.part}/{session.parts}
                </p>
                <p className="text-[12px] text-white/60 mt-1">
                  {session.range} · {session.words} words · about {estimatedPages(session.words)} pages
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/45">Program</p>
                <p className="text-[13px] font-semibold text-white">
                  {sessionIndex + 1}/{DEMIAN_SESSIONS.length} ({progressPct}%)
                </p>
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/50"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-4 py-4 space-y-3">
              {messages.map((msg) => {
                return (
                  <div key={msg.id}>
                    <ChatMessageBubble message={msg} />
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.03]">
            {!stopped && stage === "reading" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStage("quiz")}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/[0.08] border border-white/[0.15] text-white/80 hover:bg-white/[0.12] transition-colors"
                >
                  I finished reading
                </button>
                <button
                  onClick={() => setStopped(true)}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white/90 transition-colors"
                >
                  I want to stop here
                </button>
              </div>
            )}

            {!stopped && stage === "quiz" && (
              <div className="space-y-2">
                <p className="text-[11px] text-white/45">Choose one answer:</p>
                <div className="flex flex-wrap gap-2">
                  {session.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => {
                        setChosenOption(index);
                        setStage("done");
                      }}
                      className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/[0.09] transition-colors"
                    >
                      {optionLabel(index)}. {option}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStopped(true)}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white/90 transition-colors"
                >
                  I want to stop here
                </button>
              </div>
            )}

            {stopped && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStopped(false)}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/[0.08] border border-white/[0.15] text-white/80 hover:bg-white/[0.12] transition-colors"
                >
                  Resume session
                </button>
                <button
                  onClick={goToNextSession}
                  disabled={sessionIndex >= DEMIAN_SESSIONS.length - 1}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/5 border border-white/10 text-white/70 disabled:opacity-40"
                >
                  Next session
                </button>
              </div>
            )}

            {!stopped && stage === "done" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={goToNextSession}
                  disabled={sessionIndex >= DEMIAN_SESSIONS.length - 1}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/[0.08] border border-white/[0.15] text-white/80 hover:bg-white/[0.12] transition-colors disabled:opacity-40"
                >
                  Next session
                </button>
                <button
                  onClick={() => {
                    setChosenOption(null);
                    setStage("quiz");
                  }}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/[0.09] transition-colors"
                >
                  Try another answer
                </button>
                <button
                  onClick={() => setStopped(true)}
                  className="px-3.5 py-2 rounded-lg text-[12px] font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white/90 transition-colors"
                >
                  I want to stop here
                </button>
              </div>
            )}

            <div className="mt-2 flex items-center gap-4 text-[11px] text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="w-3 h-3" />
                {timeBudget} min target
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Anchor: Ch {session.chapter}, {session.range}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-3 h-3" />
                Session {session.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
