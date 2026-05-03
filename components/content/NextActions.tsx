"use client";

import { ArrowRight, ExternalLink, Luggage, Map, Plane, Shield, Train, Wifi } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { TripPick } from "@/lib/trip-picks";
import { getProviderFromHref, trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";

const iconByCategory: Record<string, typeof Train> = {
  train: Train,
  connectivity: Wifi,
  transfer: Plane,
  stay: Luggage,
  experience: Luggage,
  itinerary: Map,
  insurance: Shield,
};

function affiliateCategory(category: TripPick["category"]) {
  if (category === "connectivity") return "esim";
  if (category === "experience") return "activity";
  if (category === "itinerary") return "tour";
  if (category === "stay") return "hotel";
  return category;
}

export function NextActions({
  picks,
  title = "Next steps",
  locale = "en",
  pagePath,
}: {
  picks: TripPick[];
  title?: string;
  locale?: string;
  pagePath?: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase text-[#106b43]">
        {title}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-950">
        Keep planning — don&apos;t lose momentum.
      </p>
      <div className="mt-4 space-y-2">
        {picks.map((pick) => {
          const Icon = iconByCategory[pick.category];
          const isExternal = pick.href.startsWith("http");
          const actionTone = isExternal
            ? {
                hover: "hover:border-[#ff7a00] hover:bg-[#fff8f0]",
                icon: "border-orange-100 bg-[#fff3e7] text-[#b44b00]",
                mobile: "text-[#b44b00]",
                pill: "border-[#ff7a00] bg-[#ff7a00] text-white group-hover:bg-[#e66700]",
              }
            : {
                hover: "hover:border-[#168a56] hover:bg-[#f0fbf6]",
                icon: "border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43]",
                mobile: "text-[#106b43]",
                pill: "border-[#168a56] bg-[#168a56] text-white group-hover:bg-[#0f6f45]",
              };
          const inner = (
            <div className={`group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-all hover:shadow-sm ${actionTone.hover}`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${actionTone.icon}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{pick.title}</p>
                <p className="text-xs leading-5 text-slate-500">{pick.description}</p>
                <span className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold sm:hidden ${actionTone.mobile}`}>
                  {pick.cta}
                  {isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                </span>
              </div>
              <span className={`hidden min-w-[104px] shrink-0 items-center justify-center gap-1 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors sm:inline-flex ${actionTone.pill}`}>
                {pick.cta}
                {isExternal ? (
                  <ExternalLink className="h-3 w-3" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
              </span>
            </div>
          );

          if (isExternal) {
            return (
              <a
                key={pick.id}
                href={pick.href}
                target="_blank"
                rel={AFFILIATE_REL}
                className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                onClick={() =>
                  trackAffiliateClick({
                    category: affiliateCategory(pick.category),
                    provider: getProviderFromHref(pick.href),
                    placement: "next_steps",
                    page_path: pagePath,
                    locale,
                    href: pick.href,
                    label: pick.title,
                  })
                }
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={pick.id} href={pick.href} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
              {inner}
            </Link>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        Partner links shown where they match the planning step.
      </p>
    </div>
  );
}
