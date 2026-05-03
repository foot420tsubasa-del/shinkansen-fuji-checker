"use client";

import { ArrowRight, Bed, CalendarDays, Leaf, Plane, Train, Wifi } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ESIM_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";

type SuggestedNextStepsProps = {
  currentPageType:
    | "guide"
    | "seat"
    | "stay"
    | "transfer"
    | "itinerary"
    | "local-tokyo"
    | "planner"
    | "train";
  locale?: string;
  excludeCurrentPage?: boolean;
};

const steps = [
  { type: "stay", title: "Choose where to stay", desc: "Compare Tokyo bases before booking hotels.", href: "/areas-to-stay/tokyo-first-time", icon: Bed },
  { type: "transfer", title: "Compare airport transfer", desc: "Pick the route that fits luggage and arrival time.", href: "/airport-transfers/narita-to-shinjuku", icon: Plane },
  { type: "esim", title: "Get Japan eSIM", desc: "Set up maps, translation, and transit before landing.", href: ESIM_URL, icon: Wifi, external: true },
  { type: "guide", title: "Check Shinkansen seat", desc: "Find the Fuji-side seat before booking.", href: "/guide", icon: Train },
  { type: "itinerary", title: "Open 7-day itinerary", desc: "Place Tokyo, Fuji, Kyoto, and Osaka in order.", href: "/itineraries/7-day-first-time-japan", icon: CalendarDays },
  { type: "local-tokyo", title: "Explore Local Tokyo", desc: "Add quieter local neighborhoods without changing your base.", href: "/local-tokyo", icon: Leaf },
];

export function SuggestedNextSteps({
  currentPageType,
  locale = "en",
  excludeCurrentPage = true,
}: SuggestedNextStepsProps) {
  const visible = steps.filter((step) => !excludeCurrentPage || step.type !== currentPageType);

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase text-[#106b43]">Suggested next steps</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {visible.slice(0, 5).map((step) => {
          const Icon = step.icon;
          const tone = step.external
            ? {
                card: "hover:border-[#ff7a00] hover:bg-[#fff8f0]",
                icon: "bg-[#fff3e7] text-[#b44b00]",
                arrow: "text-[#b44b00]",
              }
            : {
                card: "hover:border-[#168a56] hover:bg-[#f0fbf6]",
                icon: "bg-[#f0fbf6] text-[#106b43]",
                arrow: "text-[#106b43]",
              };
          const inner = (
            <div className={`flex h-full items-center gap-3 rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors ${tone.card}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-[#082653]">{step.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">{step.desc}</span>
              </span>
              <ArrowRight className={`h-4 w-4 shrink-0 ${tone.arrow}`} />
            </div>
          );
          if (step.external) {
            return (
              <a
                key={step.type}
                href={step.href}
                target="_blank"
                rel={AFFILIATE_REL}
                onClick={() =>
                  trackAffiliateClick({
                    category: "esim",
                    provider: "klook",
                    placement: "next_steps",
                    locale,
                    href: step.href,
                    label: step.title,
                  })
                }
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={step.type} href={step.href}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
