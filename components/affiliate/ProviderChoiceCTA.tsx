"use client";

import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";
import type { AffiliateProvider } from "@/lib/affiliate/links";
import { AFFILIATE_REL } from "@/lib/link-rel";

type ProviderChoiceVariant = "primary" | "secondary" | "text";

export type ProviderChoiceButton = {
  label: string;
  href?: string | null;
  internalLink?: string | null;
  provider: AffiliateProvider;
  product: string;
  adid?: string;
  linkId?: string;
  placement: AffiliateClickParams["placement"];
  variant: ProviderChoiceVariant;
  category?: AffiliateClickParams["category"];
  trackingHref?: string;
  route?: string;
  areaId?: string;
  rank?: number;
  subId?: string;
};

type ProviderChoiceCTAProps = {
  actionLabel: ReactNode;
  description?: ReactNode;
  providers: ProviderChoiceButton[];
  pagePath: string;
  locale?: string;
  area?: string;
  city?: string;
  routeType?: string;
  className?: string;
  maxProviders?: number;
};

function providerCategory(product: string): AffiliateClickParams["category"] {
  if (product.includes("hotel")) return "hotel";
  if (product.includes("esim")) return "esim";
  if (product.includes("airport")) return "transfer";
  if (product.includes("insurance")) return "insurance";
  return "train";
}

function providerClass(provider: AffiliateProvider, product: string, variant: ProviderChoiceVariant) {
  // Phase 2 design system mapping:
  //   Klook (default / other paid)  → purchase   (terracotta filled)
  //   Omio                          → compare    (white + blue border)
  //   Booking.com / Trip.com        → provider   (white + slate border + brand mark)
  //   Internal "other" actions      → hotel      (sage green filled)
  // The chrome below mirrors components/ui/Button.tsx + ProviderButton.tsx
  // so the row stays visually in lockstep with stand-alone buttons.
  const base =
    "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[12px] px-3 py-2 text-xs font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white sm:min-w-28 sm:flex-1";

  if (variant === "text") {
    return [
      base,
      "min-h-8 justify-start rounded-none px-0 py-1 underline underline-offset-4",
      provider === "omio" ? "text-[#0B3A75] hover:text-[#081D3A]" : "text-[#246449] hover:text-[#1d4f39]",
    ].join(" ");
  }

  // Omio = Compare CTA — white with strong blue border, regardless of variant.
  if (provider === "omio") {
    return [
      base,
      "border border-[#2563EB] bg-white text-[#0B3A75] shadow-sm shadow-blue-100/70 hover:bg-[#F0F6FF] hover:border-[#1D4ED8] focus-visible:ring-blue-200",
    ].join(" ");
  }

  // Booking.com = Provider Button with very light Booking-blue tint.
  // Matches the round-3 ProviderButton chrome. The inline row stays
  // brand-mark-less to keep the compact text-only layout that
  // ProviderChoiceCTA promises; the stand-alone ProviderButton
  // component still renders the colored brand badge when used 1:1
  // next to a Hotel Action CTA. Border / shadow / hover intentionally
  // one notch stronger than secondary so the row reads as pressable
  // without crossing into Hotel-Action territory.
  if (provider === "booking_travelpayouts") {
    return [
      base,
      "border border-[#2563EB] bg-[#F0F6FF] text-[#0B2345] shadow-sm shadow-blue-100/80",
      "hover:border-[#1D4ED8] hover:bg-[#EAF2FF] hover:shadow-[0_3px_10px_-2px_rgba(29,78,216,0.22)]",
      "focus-visible:ring-blue-300",
    ].join(" ");
  }
  // Trip.com = Provider Button with very light Trip-cyan tint.
  if (provider === "trip") {
    return [
      base,
      "border border-[#0891B2] bg-[#EFFAFE] text-[#0F172A] shadow-sm shadow-cyan-100/80",
      "hover:border-[#0284C7] hover:bg-[#E6F9FF] hover:shadow-[0_3px_10px_-2px_rgba(2,132,199,0.22)]",
      "focus-visible:ring-cyan-300",
    ].join(" ");
  }

  // Internal "other" decision actions = Hotel Action style.
  if (provider === "other") {
    return [
      base,
      "border border-[#2E7D5B] bg-[#2E7D5B] text-white shadow-sm shadow-emerald-100/60 hover:bg-[#246449] focus-visible:ring-emerald-200",
    ].join(" ");
  }

  // Klook + remaining paid providers = Purchase CTA — terracotta filled.
  return [
    base,
    "border border-[#D94A32] bg-[#D94A32] text-white shadow-sm hover:bg-[#bf3d28] focus-visible:ring-orange-200",
  ].join(" ");
}

export function ProviderChoiceCTA({
  actionLabel,
  description,
  providers,
  pagePath,
  locale,
  area,
  city,
  routeType,
  className = "",
  maxProviders = 2,
}: ProviderChoiceCTAProps) {
  const availableProviders = providers
    .filter((provider) => provider.provider !== "agoda")
    .filter((provider) => Boolean(provider.href?.trim() || provider.internalLink?.trim()))
    .slice(0, maxProviders);

  if (availableProviders.length === 0) return null;

  return (
    <div className={["rounded-2xl border border-slate-100 bg-slate-50/80 p-3", className].join(" ")}>
      <p className="text-sm font-semibold text-slate-950">{actionLabel}</p>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {availableProviders.map((provider) => {
          const className = providerClass(provider.provider, provider.product, provider.variant);
          const key = `${provider.placement}-${provider.label}-${provider.linkId ?? provider.href ?? provider.internalLink}`;

          if (provider.internalLink) {
            return (
              <Link key={key} href={provider.internalLink} className={className}>
                {provider.label}
                {provider.variant !== "text" ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </Link>
            );
          }

          const href = provider.href as string;
          const trackingHref = provider.trackingHref ?? href;

          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel={AFFILIATE_REL}
              onClick={() =>
                trackAffiliateClick({
                  category: provider.category ?? providerCategory(provider.product),
                  provider: provider.provider,
                  placement: provider.placement,
                  page_path: pagePath,
                  locale,
                  href: trackingHref,
                  label: provider.label,
                  link_id: provider.linkId,
                  product: provider.product,
                  adid: provider.adid,
                  area,
                  city,
                  area_id: provider.areaId,
                  rank: provider.rank,
                  sub_id: provider.subId,
                  route: provider.route,
                  route_type: routeType,
                })
              }
              className={className}
            >
              {provider.label}
              {provider.variant !== "text" ? <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}
