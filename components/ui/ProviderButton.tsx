"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import {
  trackAffiliateClick,
  type AffiliateClickParams,
} from "@/lib/analytics";

/**
 * Provider Button — Phase 2 design system.
 *
 * Booking.com / Trip.com are NOT the headline CTA. They live one tier
 * below the "Compare hotels in <area>" hotel-action button. So the
 * provider button is:
 *
 *   - white background
 *   - slate-300 border (strong enough to read on the cream site bg)
 *   - dark slate text
 *   - small colored brand mark on the left (the brand color survives
 *     here as a wordmark accent instead of dominating the surface)
 *   - external-link icon on the right
 *   - subtle shadow so the white surface doesn't get lost on
 *     low-contrast page backgrounds
 *
 * Analytics dimensions and event names are unchanged — this is a
 * visual update only. Existing callers do not need to migrate props.
 */
export type ProviderId = "trip" | "booking_travelpayouts";

type ProviderButtonProps = {
  provider: ProviderId;
  href: string;
  /** Visible label. Caller supplies text translated via next-intl. */
  children: ReactNode;
  placement: AffiliateClickParams["placement"];
  pagePath: string;
  locale: string;
  linkId?: string;
  product?: string;
  adid?: string;
  category?: AffiliateClickParams["category"];
  area?: string;
  areaId?: string;
  city?: string;
  hotelName?: string;
  hotelId?: string;
  subId?: string;
  rank?: number;
  /** URL used for tracking only (when the href is a server-side redirect). */
  trackingHref?: string;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Compact brand wordmark — keeps Booking.com / Trip.com recognizable
 * without dominating the surface. The badge is intentionally a bit
 * larger than the average leading-icon (22×22 px) so the row reads
 * as a real, pressable Provider Button rather than a faint chip.
 * Colors are taken from each brand's public site guidance.
 */
function ProviderMark({ provider }: { provider: ProviderId }) {
  if (provider === "booking_travelpayouts") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#003b95] text-[11px] font-black leading-none text-white shadow-sm shadow-blue-900/20"
      >
        B
      </span>
    );
  }
  // Trip.com — cyan brand color.
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#0875c9] text-[11px] font-black leading-none text-white shadow-sm shadow-cyan-900/20"
    >
      T
    </span>
  );
}

export function ProviderButton({
  provider,
  href,
  children,
  placement,
  pagePath,
  locale,
  linkId,
  product,
  adid,
  category = "hotel",
  area,
  areaId,
  city,
  hotelName,
  hotelId,
  subId,
  rank,
  trackingHref,
  fullWidth = true,
  className = "",
}: ProviderButtonProps) {
  const analyticsHref = trackingHref ?? href;
  const analyticsLabel = typeof children === "string" ? children : provider;

  return (
    <a
      href={href}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() =>
        trackAffiliateClick({
          category,
          provider,
          placement,
          page_path: pagePath,
          locale,
          href: analyticsHref,
          label: analyticsLabel,
          link_id: linkId,
          product,
          adid,
          area: area ? (city ? `${city}: ${area}` : area) : undefined,
          area_id: areaId,
          city,
          rank,
          hotel_name: hotelName,
          hotel_id: hotelId,
          sub_id: subId,
        })
      }
      className={[
        // Phase 2 provider chrome — visibility-strengthened (round 2).
        // White surface stays, but the border, shadow, text weight and
        // padding all step up one notch so the row reads as a real,
        // pressable Provider Button without crossing into Hotel-Action
        // territory.
        //   border  : slate-300  → slate-400
        //   shadow  : shadow-sm  → shadow-sm + soft slate halo
        //   text    : font-semibold + tracking tighter for confidence
        //   padding : px-3.5     → px-4
        //   min-h   : 11 (44px)  → [46px] (a hair taller for tap area)
        "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[12px] border border-slate-400 bg-white px-4 py-2 text-sm font-semibold tracking-tight text-slate-900 no-underline shadow-sm shadow-slate-200/80 transition-all",
        "hover:border-slate-500 hover:bg-[#F8FAFC] hover:shadow-[0_3px_10px_-2px_rgba(15,23,42,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-slate-400",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      <ProviderMark provider={provider} />
      <span className="flex-1 truncate text-center">{children}</span>
      <ExternalLink className="h-4 w-4 text-slate-600" aria-hidden="true" />
    </a>
  );
}
