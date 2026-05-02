"use client";

import { ExternalLink } from "lucide-react";
import { getProviderFromHref, trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";

type HotelCTAProps = {
  areaName: string;
  city: string;
  provider?: "agoda" | "trip" | "klook";
  href: string;
  placement: AffiliateClickParams["placement"];
  locale: string;
  label?: string;
  pagePath: string;
  className?: string;
};

export function HotelCTA({
  areaName,
  city,
  provider,
  href,
  placement,
  locale,
  label,
  pagePath,
  className,
}: HotelCTAProps) {
  const ctaLabel = label ?? `Check latest ${areaName} hotels`;
  const hrefProvider = getProviderFromHref(href);
  const resolvedProvider = provider ?? (hrefProvider === "trip" || hrefProvider === "agoda" ? hrefProvider : "klook");

  return (
    <a
      href={href}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() =>
        trackAffiliateClick({
          category: "hotel",
          provider: resolvedProvider,
          placement,
          page_path: pagePath,
          locale,
          href,
          label: ctaLabel,
          area: `${city}: ${areaName}`,
        })
      }
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#ff7a00] bg-[#ff7a00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e66700] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200",
        className ?? "",
      ].join(" ")}
    >
      {ctaLabel}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
