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
 * without dominating the surface. Each mark stays at ~20px square.
 * Colors are taken from each brand's public site guidance.
 */
function ProviderMark({ provider }: { provider: ProviderId }) {
  if (provider === "booking_travelpayouts") {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003b95] text-[10px] font-black leading-none text-white"
      >
        B
      </span>
    );
  }
  // Trip.com — cyan brand color.
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0875c9] text-[10px] font-black leading-none text-white"
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
        // Phase 2 provider chrome: white surface, slate-300 border,
        // dark text, subtle shadow so it survives the cream backdrop.
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 no-underline shadow-sm transition-colors",
        "hover:border-slate-400 hover:bg-slate-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:ring-slate-300",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      <ProviderMark provider={provider} />
      <span className="flex-1 truncate text-center">{children}</span>
      <ExternalLink className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
    </a>
  );
}
