"use client";

import { useTranslations } from "next-intl";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import type { LocalHotelPick } from "@/lib/content/local-hotel-picks";

type LocalHotelPickCardProps = {
  pick: LocalHotelPick;
  locale: string;
  pagePath: string;
};

export function LocalHotelPickCard({ pick, locale, pagePath }: LocalHotelPickCardProps) {
  const t = useTranslations("localHotelPicks");
  const agodaUrl = pick.agodaUrl.trim();
  const tripUrl = pick.tripFallbackUrl.trim();
  const providerLinks: Array<{ provider: ProviderId; href: string; label: string }> = [
    tripUrl ? { provider: "trip", href: tripUrl, label: t("checkOnTrip") } : null,
    agodaUrl ? { provider: "agoda", href: agodaUrl, label: t("checkOnAgoda") } : null,
  ].filter(Boolean) as Array<{ provider: ProviderId; href: string; label: string }>;

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

      {providerLinks.length > 0 ? (
        <div className={`mt-4 grid gap-2 ${providerLinks.length > 1 ? "sm:grid-cols-2" : "sm:max-w-xs"}`}>
          {providerLinks.map((link) => (
            <ProviderButton
              key={link.provider}
              provider={link.provider}
              href={link.href}
              placement="local_hotel_pick"
              pagePath={pagePath}
              locale={locale}
              category="hotel"
              area={pick.area}
              city={pick.city}
              hotelName={pick.hotelName}
            >
              {link.label}
            </ProviderButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}
