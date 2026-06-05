"use client";

import { trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { LocalHotelPick } from "@/lib/content/local-hotel-picks";
import { useTranslations } from "next-intl";

type LocalHotelPickCardProps = {
  pick: LocalHotelPick;
  locale: string;
  pagePath: string;
  groupLabel?: string;
  copy?: {
    bestFor: string;
    localReason: string;
    notIdealFor: string;
    tags: string[];
  };
};

export function LocalHotelPickCard({ pick, locale, pagePath, groupLabel, copy }: LocalHotelPickCardProps) {
  const t = useTranslations("localHotelPicks");
  const tripUrl = pick.tripFallbackUrl.trim();
  const providerLinks = [
    tripUrl ? { href: tripUrl, label: "Search on Trip.com →", linkId: `localHotelPick.${pick.id}.trip` } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; linkId: string }>;

  return (
    <article className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {groupLabel ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{groupLabel}</p>
            ) : null}
            <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{pick.hotelName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{pick.area}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(copy?.tags ?? pick.tags).slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">{t("bestFor")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{copy?.bestFor ?? pick.bestFor}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">{t("whyThisLocalPick")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{copy?.localReason ?? pick.localReason}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">{t("notIdealFor")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{copy?.notIdealFor ?? pick.notIdealFor}</p>
          </div>
        </div>

        {providerLinks.length > 0 ? (
          <div className="mt-4 grid gap-1.5">
            {providerLinks.map((link) => (
              <a
                key={link.linkId}
                href={link.href}
                target="_blank"
                rel={AFFILIATE_REL}
                className="inline-flex text-xs font-semibold text-slate-600 underline underline-offset-4 transition-colors hover:text-[#0875c9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                onClick={() =>
                  trackAffiliateClick({
                    category: "hotel",
                    provider: "trip",
                    placement: "local_hotel_pick",
                    page_path: pagePath,
                    locale,
                    href: link.href,
                    label: link.label,
                    link_id: link.linkId,
                    product: "local_hotel_pick",
                    area: pick.area,
                    city: pick.city,
                    hotel_name: pick.hotelName,
                  })
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
