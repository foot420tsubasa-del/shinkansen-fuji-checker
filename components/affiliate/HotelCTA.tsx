"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { getProviderFromHref, trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";

type HotelCTAProps = {
  areaName: string;
  city: string;
  provider?: "trip" | "klook";
  href: string;
  placement: AffiliateClickParams["placement"];
  locale: string;
  label?: string;
  pagePath: string;
  className?: string;
  trackingHref?: string;
  hotelName?: string;
  linkId?: string;
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
  trackingHref,
  hotelName,
  linkId,
}: HotelCTAProps) {
  const t = useTranslations("hotelCta");
  const ctaLabel = label ?? t("checkLatestHotels", { areaName });
  const analyticsHref = trackingHref ?? href;
  const hrefProvider = getProviderFromHref(analyticsHref);
  // Default to whatever the href resolves to (klook / omio / other). Only
  // attribute clicks to "klook" when the URL actually points to Klook, so
  // we never report a non-Klook click as a Klook conversion in analytics.
  const resolvedProvider = provider ?? hrefProvider;

  // Provider-specific hotel CTAs use brand-inspired colors so the user can
  // tell at a glance which provider they are about to open. Any other hotel
  // CTA (klook-routed or an unrecognized href) keeps the commercial orange style.
  if (resolvedProvider === "agoda") return null;

  if (resolvedProvider === "trip") {
    return (
      <ProviderButton
        provider={resolvedProvider}
        href={href}
        trackingHref={trackingHref}
        placement={placement}
        pagePath={pagePath}
        locale={locale}
        linkId={linkId}
        category="hotel"
        product="hotel"
        area={areaName}
        city={city}
        hotelName={hotelName}
        fullWidth={false}
        className={className}
      >
        {ctaLabel}
      </ProviderButton>
    );
  }

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
          href: analyticsHref,
          label: ctaLabel,
          link_id: linkId,
          product: "hotel",
          area: `${city}: ${areaName}`,
          hotel_name: hotelName,
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
