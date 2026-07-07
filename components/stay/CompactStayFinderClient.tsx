"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trackCtaClick } from "@/lib/analytics";

type CompactOption = { id: string; label: string };
type CompactQuestion = { id: "shinkansen" | "luggage"; title: string; options: CompactOption[] };

export type CompactStayFinderCopy = {
  title: string;
  body: string;
  cta: string;
  questions: CompactQuestion[];
};

/**
 * §4-3 compact Stay Finder: the quiz's Q1 (shinkansen) + Q2 (luggage) inline,
 * with the CTA handing both answers to the full Finder via query params
 * (q_shinkansen / q_luggage), which prefills them and resumes at Q3.
 * Labels reuse the fully translated tokyoStayAreaIndex.finder steps.
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
  const ready = copy.questions.every((question) => picked[question.id]);
  const href = ready
    ? `/areas-to-stay/tokyo-stay-area-index?q_shinkansen=${encodeURIComponent(picked.shinkansen)}&q_luggage=${encodeURIComponent(picked.luggage)}#finder`
    : "/areas-to-stay/tokyo-stay-area-index#finder";

  return (
    <section className="rounded-[22px] border border-emerald-100 bg-[#fffdf8] p-5 shadow-sm">
      <p className="text-base font-bold text-slate-950">{copy.title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{copy.body}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {copy.questions.map((question) => (
          <div key={question.id}>
            <p className="text-xs font-semibold text-slate-800">{question.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {question.options.map((option) => {
                const selected = picked[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPicked((current) => ({ ...current, [question.id]: option.id }))}
                    className={[
                      "min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                      selected
                        ? "border-[#106b43] bg-[#106b43] text-white shadow-sm"
                        : "border-emerald-100 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
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
          className={[
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold shadow-sm transition-colors",
            ready
              ? "bg-[#106b43] text-white hover:bg-[#0b5736]"
              : "border border-emerald-200 bg-white text-[#106b43] hover:bg-emerald-50",
          ].join(" ")}
        >
          {copy.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
