"use client";

import Image from "next/image";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import type { LocalHotelPick } from "@/lib/content/local-hotel-picks";

type LocalHotelPickCardProps = {
  pick: LocalHotelPick;
  locale: string;
  pagePath: string;
  groupLabel?: string;
  imagePath?: string;
  imageAlt?: string;
};

export function LocalHotelPickCard({ pick, locale, pagePath, groupLabel, imagePath, imageAlt }: LocalHotelPickCardProps) {
  const agodaUrl = pick.agodaUrl.trim();
  const tripUrl = pick.tripFallbackUrl.trim();
  const providerLinks: Array<{ provider: ProviderId; href: string; label: string; linkId: string }> = [
    tripUrl ? { provider: "trip", href: tripUrl, label: "Trip.com", linkId: `localHotelPick.${pick.id}.trip` } : null,
    agodaUrl ? { provider: "agoda", href: agodaUrl, label: "Agoda", linkId: `localHotelPick.${pick.id}.agoda` } : null,
  ].filter(Boolean) as Array<{ provider: ProviderId; href: string; label: string; linkId: string }>;

  return (
    <article className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      {imagePath ? (
        <div className="relative h-36 bg-slate-100">
          <Image src={imagePath} alt={imageAlt ?? `${pick.city} hotel area atmosphere`} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="h-10 border-b border-slate-100 bg-[linear-gradient(135deg,#f8fafc,#ecfdf5)]" aria-hidden="true" />
      )}

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
          {pick.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Best for</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{pick.bestFor}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">Why this pick</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{pick.localReason}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Not ideal for</p>
            <p className="mt-1 text-xs leading-5 text-slate-700">{pick.notIdealFor}</p>
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
