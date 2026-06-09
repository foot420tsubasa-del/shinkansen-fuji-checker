"use client";

import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";

type HotelBaseNextStepProps = {
  sourcePage: string;
  locale?: string;
  placement: string;
  title?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function HotelBaseNextStep({
  sourcePage,
  locale,
  placement,
  title = "Before booking hotels, choose your station area",
  body = "Choose the hotel base that fits your airport, luggage, rail days, and station-complexity tolerance before opening booking sites.",
  primaryHref = "/areas-to-stay/tokyo-stay-area-index",
  primaryLabel = "Open Tokyo Hotel Area Finder",
  secondaryHref = "/local-hotel-picks",
  secondaryLabel = "See local hotel examples",
  className = "",
}: HotelBaseNextStepProps) {
  return (
    <section className={["rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm", className].join(" ")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel base next step</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{body}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <TrackedInternalLink
          href={primaryHref}
          sourcePage={sourcePage}
          placement={placement}
          label={primaryLabel}
          locale={locale}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
        >
          {primaryLabel}
        </TrackedInternalLink>
        <TrackedInternalLink
          href={secondaryHref}
          sourcePage={sourcePage}
          placement={placement}
          label={secondaryLabel}
          locale={locale}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-[#106b43] transition-colors hover:bg-emerald-50"
        >
          {secondaryLabel}
        </TrackedInternalLink>
      </div>
    </section>
  );
}
