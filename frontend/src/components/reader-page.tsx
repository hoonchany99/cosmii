// The pages the app sends a reader to: support, terms, privacy. They are read
// on a phone, right after leaving the app, so they wear the Cosmii design
// system and nothing else: the night ground, the interface face for the
// app's own words, the wordmark masthead, hairlines between parts. The app
// itself has no cards and no chrome; neither do these.
import type { ReactNode } from "react";
import { Footer, Hairline, Masthead, textLink } from "@/components/editorial";

/** A part's head: the design system's Label, in the brightest text. */
export const h2 = "type-label text-ink mb-4";
export const strong = "text-ink font-semibold";
export const link = textLink;

export function ReaderPage({
  title,
  note,
  current,
  children,
}: {
  title: string;
  note?: string;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-night font-ui text-ink">
      <div className="mx-auto max-w-column px-gutter">
        <Masthead />

        <h1 className="type-screen-title mt-12 text-ink break-keep">{title}</h1>
        {note ? <p className="type-meta mt-3 text-ink-muted break-keep">{note}</p> : null}

        <Hairline className="mt-10" />

        <div className="type-body mt-10 space-y-12 pb-20 text-ink-muted break-keep">{children}</div>

        <Footer current={current} />
      </div>
    </div>
  );
}
