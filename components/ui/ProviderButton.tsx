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
        // Phase 2 provider chrome — visibility-strengthened (round 3).
        // Still white-ish surface, but a very light brand TINT (Booking
        // blue / Trip cyan) replaces pure white so the row reads as a
        // real, pressable Provider Button on the cream backdrop without
        // crossing into Hotel-Action territory. Hotel Action (sage
        // filled) stays the strongest hotel CTA; this tier only steps
        // up from "secondary white card" to "clearly-pressable provider".
        "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[12px] border px-4 py-2 text-sm font-semibold tracking-tight no-underline shadow-sm transition-all",
        // Per-provider tint, border, hover, and focus ring. Keeping the
        // class lists separate (rather than a single object lookup) lets
        // Tailwind's JIT statically discover every utility.
        provider === "booking_travelpayouts"
          ? [
              "bg-[#F0F6FF] border-[#2563EB] text-[#0B2345] shadow-blue-100/80",
              "hover:bg-[#EAF2FF] hover:border-[#1D4ED8] hover:shadow-[0_3px_10px_-2px_rgba(29,78,216,0.22)]",
              "focus-visible:ring-blue-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:outline-none focus-visible:ring-2",
            ].join(" ")
          : [
              // Trip.com — cyan tint.
              "bg-[#EFFAFE] border-[#0891B2] text-[#0F172A] shadow-cyan-100/80",
              "hover:bg-[#E6F9FF] hover:border-[#0284C7] hover:shadow-[0_3px_10px_-2px_rgba(2,132,199,0.22)]",
              "focus-visible:ring-cyan-300 focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:outline-none focus-visible:ring-2",
            ].join(" "),
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      <ProviderMark provider={provider} />
      <span className="min-w-0 flex-1 truncate text-center">{children}</span>
      <ExternalLink
        className={`h-4 w-4 ${provider === "booking_travelpayouts" ? "text-blue-700" : "text-cyan-700"}`}
        aria-hidden="true"
      />
    </a>
  );
}
