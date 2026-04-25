"use client";

import { ArrowRight, ExternalLink, Luggage, Map, Plane, Shield, Train, Wifi } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { TripPick } from "@/lib/trip-picks";
import { trackAffiliateClick } from "@/lib/analytics";
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

export function NextActions({ picks, title = "Next steps" }: { picks: TripPick[]; title?: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase text-sky-700">
        {title}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-950">
        Keep planning — don&apos;t lose momentum.
      </p>
      <div className="mt-4 space-y-2">
        {picks.map((pick) => {
          const Icon = iconByCategory[pick.category];
          const isExternal = pick.href.startsWith("http");
          const inner = (
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-all hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{pick.title}</p>
                <p className="text-xs leading-5 text-slate-500">{pick.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 sm:hidden">
                  {pick.cta}
                  {isExternal ? <ExternalLink className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                </span>
              </div>
              <span className="hidden min-w-[104px] shrink-0 items-center justify-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors group-hover:bg-sky-100 sm:inline-flex">
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
              <a key={pick.id} href={pick.href} target="_blank" rel={AFFILIATE_REL} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-300" onClick={() => trackAffiliateClick("next-actions", pick.title)}>
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
