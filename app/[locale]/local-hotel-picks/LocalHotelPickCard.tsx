"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { LocalHotelPick } from "@/lib/content/local-hotel-picks";

type LocalHotelPickCardProps = {
  pick: LocalHotelPick;
  locale: string;
  pagePath: string;
};

export function LocalHotelPickCard({ pick, locale, pagePath }: LocalHotelPickCardProps) {
  const t = useTranslations("localHotelPicks");
  const hasAgodaUrl = Boolean(pick.agodaUrl.trim());

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{pick.hotelName}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{pick.area}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pick.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">{t("bestFor")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{pick.bestFor}</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">{t("whyThisLocalPick")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{pick.localReason}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">{t("notIdealFor")}</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{pick.notIdealFor}</p>
        </div>
      </div>

      <div className="mt-4">
        {hasAgodaUrl ? (
          <a
            href={pick.agodaUrl}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() =>
              trackAffiliateClick({
                category: "hotel",
                provider: "agoda",
                placement: "local_hotel_pick",
                page_path: pagePath,
                locale,
                href: pick.agodaUrl,
                label: `${t("checkOnAgoda")} — ${pick.hotelName}`,
                city: pick.city,
                area: pick.area,
                hotel_name: pick.hotelName,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#ff7a00] bg-[#ff7a00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
          >
            {t("checkOnAgoda")}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400">
            {t("comingSoon")}
          </span>
        )}
      </div>
    </div>
  );
}
