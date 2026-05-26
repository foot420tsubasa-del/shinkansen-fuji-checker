"use client";

import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";

type FujiseatAreaLogicProps = {
  sourcePage: string;
  locale?: string;
  placement: string;
  className?: string;
  showFinderLink?: boolean;
  note?: string;
};

export function FujiseatAreaLogic({
  sourcePage,
  locale,
  placement,
  className = "",
  showFinderLink = true,
  note = "The Tokyo Hotel Area Finder is an editorial travel-fit tool informed by station-usability signals where available. It is not an official ranking.",
}: FujiseatAreaLogicProps) {
  return (
    <section className={["rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm", className].join(" ")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">fujiseat area logic</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">Why fujiseat&apos;s area logic is different</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        fujiseat compares hotel bases by station complexity, luggage stress, airport arrival route,
        Shinkansen days, calmer nearby bases, and a local Tokyo perspective. It does not rank hotels,
        invent prices, or treat the most famous station as the automatic answer.
      </p>
      {showFinderLink ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-stay-area-index"
            sourcePage={sourcePage}
            placement={placement}
            label="Open Tokyo Hotel Area Finder"
            locale={locale}
            className="inline-flex min-h-10 items-center rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
          >
            Open Tokyo Hotel Area Finder
          </TrackedInternalLink>
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            {note}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {note}
        </p>
      )}
    </section>
  );
}
