"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import {
  trackAffiliateClick,
  type AffiliateClickParams,
} from "@/lib/analytics";

// Brand-inspired colors for hotel/provider CTAs. Text-only labels — no logos.
//   trip  → deep blue   (#0a4ca8) with white text
//   agoda → magenta     (#9a3f9a) with white text
// Use only for provider-specific buttons. For generic "Compare hotels" CTAs
// use Button variant="commercial" instead.
export type ProviderId = "trip" | "agoda";

type ProviderButtonProps = {
  provider: ProviderId;
  href: string;
  /** Visible label. Caller supplies text translated via next-intl. */
  children: ReactNode;
  /** Analytics placement; same union as the rest of the app. */
  placement: AffiliateClickParams["placement"];
  /** Page path for analytics. */
  pagePath: string;
  locale: string;
  /** Optional category override. Defaults to "hotel". */
  category?: AffiliateClickParams["category"];
  area?: string;
  city?: string;
  hotelName?: string;
  /** URL used for tracking only (when the href is a server-side redirect). */
  trackingHref?: string;
  fullWidth?: boolean;
  className?: string;
};

const PROVIDER_STYLES: Record<ProviderId, string> = {
  // Trip.com — calm deep blue. Avoid using the official logo blue exactly.
  trip:
    "border border-[#0a4ca8] bg-[#0a4ca8] text-white hover:bg-[#0a3f8b] focus-visible:ring-blue-200",
  // Agoda — magenta/purple.
  agoda:
    "border border-[#9a3f9a] bg-[#9a3f9a] text-white hover:bg-[#7e3380] focus-visible:ring-fuchsia-200",
};

export function ProviderButton({
  provider,
  href,
  children,
  placement,
  pagePath,
  locale,
  category = "hotel",
  area,
  city,
  hotelName,
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
          area: area ? (city ? `${city}: ${area}` : area) : undefined,
          city,
          hotel_name: hotelName,
        })
      }
      className={[
        "inline-flex min-h-12 items-center justify-center gap-1.5 rounded-[12px] px-4 py-2.5 text-sm font-semibold no-underline transition-colors md:min-h-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
        PROVIDER_STYLES[provider],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}
