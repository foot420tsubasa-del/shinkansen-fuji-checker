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
};

function providerCategory(product: string): AffiliateClickParams["category"] {
  if (product.includes("hotel")) return "hotel";
  if (product.includes("esim")) return "esim";
  if (product.includes("airport")) return "transfer";
  if (product.includes("insurance")) return "insurance";
  return "train";
}

function providerClass(provider: AffiliateProvider, product: string, variant: ProviderChoiceVariant) {
  const base =
    "inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white sm:min-w-28 sm:flex-1";

  if (variant === "text") {
    return [
      base,
      "min-h-8 justify-start rounded-none px-0 py-1 underline underline-offset-4",
      provider === "omio" ? "text-indigo-700 hover:text-indigo-900" : "text-[#106b43] hover:text-[#0f6f45]",
    ].join(" ");
  }

  if (variant === "secondary") {
    if (provider === "omio") {
      return [base, "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200"].join(" ");
    }
    if (provider === "trip") {
      return [base, "border border-[#0a4ca8] bg-[#0a4ca8] text-white hover:bg-[#0a3f8b] focus-visible:ring-blue-200"].join(" ");
    }
    if (provider === "agoda") {
      return [base, "border border-[#9a3f9a] bg-[#9a3f9a] text-white hover:bg-[#7e3380] focus-visible:ring-fuchsia-200"].join(" ");
    }
    return [base, "border border-[#168a56] bg-[#168a56] text-white hover:bg-[#0f6f45] focus-visible:ring-emerald-200"].join(" ");
  }

  if (provider === "omio") {
    return [base, "border border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-800 focus-visible:ring-indigo-200"].join(" ");
  }
  if (provider === "trip") {
    return [base, "border border-[#0a4ca8] bg-[#0a4ca8] text-white hover:bg-[#0a3f8b] focus-visible:ring-blue-200"].join(" ");
  }
  if (provider === "agoda") {
    return [base, "border border-[#9a3f9a] bg-[#9a3f9a] text-white hover:bg-[#7e3380] focus-visible:ring-fuchsia-200"].join(" ");
  }
  if (provider === "other") {
    return [base, "border border-[#168a56] bg-[#168a56] text-white hover:bg-[#0f6f45] focus-visible:ring-emerald-200"].join(" ");
  }
  return [base, "border border-[#ff7a00] bg-[#ff7a00] text-white hover:bg-[#e66700] focus-visible:ring-orange-200"].join(" ");
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
}: ProviderChoiceCTAProps) {
  const availableProviders = providers
    .filter((provider) => Boolean(provider.href?.trim() || provider.internalLink?.trim()))
    .slice(0, 2);

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
