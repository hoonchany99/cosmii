"use client";

import { useState } from "react";

// The code, large, and a way to copy it: Apple does not carry a link through
// an install, so the code is what the friend takes into the app.
export function CopyCode({ code, shown }: { code: string; shown: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button type="button" onClick={copy} className="mb-8 block w-full cursor-pointer text-center" aria-label={`초대 코드 ${shown} 복사`}>
      <span className="block font-ui text-[44px] font-bold tracking-[6px] text-white tabular-nums">{shown}</span>
      <span className="type-meta mt-1 block text-ink-70 underline decoration-[rgba(255,255,255,0.3)] underline-offset-4">
        {copied ? "복사했어요" : "코드 복사"}
      </span>
    </button>
  );
}
