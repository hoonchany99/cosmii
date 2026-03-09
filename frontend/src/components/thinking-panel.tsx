"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, SkipForward, Clock, Brain } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { ThinkingProcess, ThinkingStep, ThinkingStepName } from "@/lib/types";
import { STEP_LABELS, STEP_DESCRIPTIONS, MODE_LABELS } from "@/lib/types";

interface ThinkingPanelProps {
  thinking: ThinkingProcess | null;
  liveSteps: ThinkingStep[];
  isThinking: boolean;
}

const STEP_ORDER: ThinkingStepName[] = ["recall", "verify", "resolve", "reason", "update"];

function StepIcon({ status }: { status: ThinkingStep["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case "complete":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-muted-foreground" />;
  }
}

function StepDetails({ step }: { step: ThinkingStep }) {
  const [expanded, setExpanded] = useState(false);
  const details = step.details;
  if (!details || Object.keys(details).length === 0) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Details
      </button>
      {expanded && (
        <pre className="mt-1 text-xs bg-muted/50 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

function InlineStepper({ steps }: { steps: ThinkingStep[] }) {
  return (
    <div className="flex items-center gap-1 mb-2 flex-wrap">
      {STEP_ORDER.map((stepName) => {
        const step = steps.find((s) => s.step === stepName);
        const status = step?.status;

        let className =
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-medium transition-all ";

        if (status === "complete") {
          className += "bg-green-500/10 text-green-400 border border-green-500/20";
        } else if (status === "running") {
          className += "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse";
        } else {
          className += "bg-muted/30 text-muted-foreground/40 border border-transparent";
        }

        return (
          <span key={stepName} className={className}>
            {status === "complete" && "✓ "}
            {status === "running" && (
              <Loader2 className="h-2.5 w-2.5 animate-spin mr-0.5" />
            )}
            {STEP_LABELS[stepName]}
          </span>
        );
      })}
    </div>
  );
}

function LiveStepDescription({ steps }: { steps: ThinkingStep[] }) {
  const runningStep = steps.find((s) => s.status === "running");
  if (!runningStep) {
    const lastComplete = [...steps].reverse().find((s) => s.status === "complete");
    if (lastComplete) {
      return (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="font-medium">{STEP_LABELS[lastComplete.step]}</span>
          <span className="text-muted-foreground/70">— {lastComplete.summary}</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="text-xs flex items-center gap-1.5 py-1 text-blue-400">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="font-medium">{STEP_LABELS[runningStep.step]}</span>
      <span className="text-muted-foreground">— {STEP_DESCRIPTIONS[runningStep.step]}</span>
      {runningStep.summary && (
        <span className="text-muted-foreground/70 ml-1">({runningStep.summary})</span>
      )}
    </div>
  );
}

export function ThinkingPanel({ thinking, liveSteps, isThinking }: ThinkingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const steps = thinking?.steps || liveSteps;
  if (steps.length === 0 && !isThinking) return null;

  const completedSteps = steps.filter((s) => s.status === "complete");
  const totalMs = thinking?.total_duration_ms || steps.reduce((sum, s) => sum + s.duration_ms, 0);

  const currentRunning = steps.find((s) => s.status === "running");
  const summaryText = isThinking
    ? currentRunning
      ? `${STEP_LABELS[currentRunning.step]}: ${STEP_DESCRIPTIONS[currentRunning.step]}`
      : "Preparing…"
    : `${completedSteps.length} steps done · ${thinking?.selected_mode ? MODE_LABELS[thinking.selected_mode] : ""} · ${(totalMs / 1000).toFixed(1)}s`;

  return (
    <div className="mb-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50">
          <Brain className="h-4 w-4" />
          <span className="font-medium">Thinking</span>
          {isThinking && <Loader2 className="h-3 w-3 animate-spin" />}
          <span className="text-xs ml-auto truncate max-w-[60%] text-right">{summaryText}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 space-y-1 pl-2 border-l-2 border-muted ml-4">
          {isThinking && <InlineStepper steps={steps} />}
          {isThinking && steps.length > 0 && <LiveStepDescription steps={steps} />}

          {STEP_ORDER.map((stepName) => {
            const step = steps.find((s) => s.step === stepName);
            if (!step) {
              if (isThinking) {
                const currentIdx = steps.length > 0 ? STEP_ORDER.indexOf(steps[steps.length - 1].step) : -1;
                const thisIdx = STEP_ORDER.indexOf(stepName);
                if (thisIdx > currentIdx) {
                  return (
                    <div key={stepName} className="flex items-center gap-2 py-1 text-sm text-muted-foreground/50">
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                      <span>{STEP_LABELS[stepName]}</span>
                      <span className="text-xs">— {STEP_DESCRIPTIONS[stepName]}</span>
                    </div>
                  );
                }
              }
              return null;
            }

            return (
              <div key={stepName} className="py-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <StepIcon status={step.status} />
                  <span className="font-medium">{STEP_LABELS[stepName]}</span>
                  <span className="text-muted-foreground text-xs flex-1">{step.summary}</span>
                  {step.duration_ms > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {step.duration_ms}ms
                    </span>
                  )}
                </div>
                <StepDetails step={step} />
              </div>
            );
          })}

          {thinking?.selected_mode && (
            <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {MODE_LABELS[thinking.selected_mode]}
              </Badge>
              <span>{thinking.mode_reason}</span>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
