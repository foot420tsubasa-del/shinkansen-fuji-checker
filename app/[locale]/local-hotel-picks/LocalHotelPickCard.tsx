"use client";

import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
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
  const agodaUrl = pick.agodaUrl.trim();
  const tripUrl = pick.tripFallbackUrl.trim();
  const providerLinks: Array<{ provider: ProviderId; href: string; label: string; linkId: string }> = [
    tripUrl ? { provider: "trip", href: tripUrl, label: "Trip.com", linkId: `localHotelPick.${pick.id}.trip` } : null,
    agodaUrl ? { provider: "agoda", href: agodaUrl, label: "Agoda", linkId: `localHotelPick.${pick.id}.agoda` } : null,
  ].filter(Boolean) as Array<{ provider: ProviderId; href: string; label: string; linkId: string }>;

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
          <div className={`mt-4 grid gap-2 ${providerLinks.length > 1 ? "grid-cols-2" : ""}`}>
            {providerLinks.map((link) => (
              <ProviderButton
                key={link.provider}
                provider={link.provider}
                href={link.href}
                placement="local_hotel_pick"
                pagePath={pagePath}
                locale={locale}
                linkId={link.linkId}
                product="local_hotel_pick"
                category="hotel"
                area={pick.area}
                city={pick.city}
                hotelName={pick.hotelName}
                fullWidth
                className="min-h-10 px-3 py-2 text-xs"
              >
                {link.label}
              </ProviderButton>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
