"use client";

import type { ReactNode } from "react";
import { ProviderButton } from "@/components/ui/ProviderButton";
import type { AffiliateClickParams } from "@/lib/analytics";

// "Compare hotels in [Area]" block with balanced Trip.com / Agoda buttons.
//
// Graceful fallback: if only one provider URL is supplied, the block renders
// a single full-width provider button. We do NOT invent missing URLs.
//
// All user-facing strings are passed in as props so callers can localize
// them with next-intl. This component does not call useTranslations itself,
// so it stays usable from both client and server components (via a wrapping
// client boundary at the caller).

export type HotelCompareBlockProps = {
  /**
   * Translated section title used when both Trip.com and Agoda URLs are
   * present, e.g. "Compare hotels in Shinjuku".
   */
  title: ReactNode;
  /**
   * Translated title used when only one provider URL is supplied. Avoids the
   * "Compare" wording becoming aspirational in a single-provider render.
   * Example: "Check hotels in Shinjuku". Falls back to `title` when omitted.
   */
  singleProviderTitle?: ReactNode;
  /** Translated short note, e.g. "Prices and availability may differ by date." */
  note?: ReactNode;
  /** Translated Trip.com button label, e.g. "Compare on Trip.com". */
  tripLabel: ReactNode;
  /** Translated Agoda button label, e.g. "Compare on Agoda". */
  agodaLabel: ReactNode;

  /** Trip.com URL. Pass empty string / undefined if not mapped yet. */
  tripHref?: string;
  /** Agoda URL. Pass empty string / undefined if not mapped yet. */
  agodaHref?: string;

  /** Tracking URL overrides (for server-redirect routes). */
  tripTrackingHref?: string;
  agodaTrackingHref?: string;

  /** Analytics context. */
  placement: AffiliateClickParams["placement"];
  pagePath: string;
  locale: string;
  area?: string;
  city?: string;

  className?: string;
};

function hasHref(href: string | undefined | null) {
  return Boolean(href && href.trim().length > 0);
}

export function HotelCompareBlock({
  title,
  singleProviderTitle,
  note,
  tripLabel,
  agodaLabel,
  tripHref,
  agodaHref,
  tripTrackingHref,
  agodaTrackingHref,
  placement,
  pagePath,
  locale,
  area,
  city,
  className = "",
}: HotelCompareBlockProps) {
  const showTrip = hasHref(tripHref);
  const showAgoda = hasHref(agodaHref);

  if (!showTrip && !showAgoda) return null;

  // Two-up grid on desktop when both providers are present; stack on mobile.
  // When only one provider is present, the single button spans the row.
  const bothPresent = showTrip && showAgoda;
  const resolvedTitle = bothPresent ? title : singleProviderTitle ?? title;

  return (
    <section
      className={[
        "rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm md:p-5",
        className,
      ].join(" ")}
    >
      <h3 className="text-sm font-semibold text-slate-950 md:text-base">{resolvedTitle}</h3>
      <div
        className={[
          "mt-3 grid gap-2",
          bothPresent ? "sm:grid-cols-2" : "",
        ].join(" ")}
      >
        {showTrip ? (
          <ProviderButton
            provider="trip"
            href={tripHref as string}
            trackingHref={tripTrackingHref}
            placement={placement}
            pagePath={pagePath}
            locale={locale}
            area={area}
            city={city}
          >
            {tripLabel}
          </ProviderButton>
        ) : null}
        {showAgoda ? (
          <ProviderButton
            provider="agoda"
            href={agodaHref as string}
            trackingHref={agodaTrackingHref}
            placement={placement}
            pagePath={pagePath}
            locale={locale}
            area={area}
            city={city}
          >
            {agodaLabel}
          </ProviderButton>
        ) : null}
      </div>
      {note ? (
        <p className="mt-3 text-[11px] leading-5 text-slate-500">{note}</p>
      ) : null}
    </section>
  );
}
