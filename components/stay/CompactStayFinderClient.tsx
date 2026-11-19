"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trackCtaClick } from "@/lib/analytics";
import type { FinderOption } from "@/lib/stay-finder";

type CompactOption = { id: string; label: string };
type CompactQuestion = { id: "shinkansen" | "luggage"; title: string; options: CompactOption[] };

export type CompactStayFinderCopy = {
  title: string;
  body: string;
  cta: string;
  questions: CompactQuestion[];
};

/**
 * Reuse the translated trip questions and open the current finder with
 * the matching trip priorities already selected.
 */
export function CompactStayFinderClient({
  copy,
  locale,
  pagePath,
  placement,
}: {
  copy: CompactStayFinderCopy;
  locale: string;
  pagePath: string;
  placement: string;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const options: FinderOption[] = [];
  if (picked.shinkansen === "before8am" || picked.shinkansen === "daytime") options.push("shinkansen");
  if (picked.luggage === "large") options.push("luggage");
  const query = options.length ? `?opt=${options.join(",")}` : "";
  const href = `/areas-to-stay${query}#stay-finder`;

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5">
      <p className="text-base font-bold text-slate-950">{copy.title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{copy.body}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {copy.questions.map((question) => (
          <fieldset key={question.id} className="min-w-0">
            <legend className="text-sm font-semibold text-ink">{question.title}</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {question.options.map((option) => {
                const selected = picked[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPicked((current) => ({ ...current, [question.id]: option.id }))}
                    className={[
                      "min-h-11 rounded-full border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                      selected
                        ? "border-ink bg-ink text-white"
                        : "border-slate-300 bg-white text-ink hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href={href}
          onClick={() =>
            trackCtaClick({
              placement,
              href,
              label: copy.cta,
              category: "stay",
              page_path: pagePath,
              locale,
              cta_type: "stay",
            })
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {copy.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
