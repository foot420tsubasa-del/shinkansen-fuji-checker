"use client";

import { trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { LocalHotelPick } from "@/lib/content/local-hotel-picks";

type HotelPickMatrixProps = {
  picks: LocalHotelPick[];
  locale: string;
  pagePath: string;
};

type TripTextLink = {
  href: string;
  label: string;
  linkId: string;
};

function providerLinksForPick(pick: LocalHotelPick): TripTextLink[] {
  const tripUrl = pick.tripFallbackUrl.trim();

  return [
    tripUrl ? { href: tripUrl, label: "Search on Trip.com →", linkId: `localHotelPick.${pick.id}.trip` } : null,
  ].filter(Boolean) as TripTextLink[];
}

function TripTextAffiliateLink({
  link,
  pick,
  locale,
  pagePath,
  placement,
}: {
  link: TripTextLink;
  pick: LocalHotelPick;
  locale: string;
  pagePath: string;
  placement: "local_hotel_picks_matrix";
}) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel={AFFILIATE_REL}
      className="inline-flex text-xs font-semibold text-slate-600 underline underline-offset-4 transition-colors hover:text-[#0875c9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
      onClick={() =>
        trackAffiliateClick({
          category: "hotel",
          provider: "trip",
          placement,
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
  );
}

function roomGroupAngle(pick: LocalHotelPick) {
  const tags = pick.tags.map((tag) => tag.toLowerCase());

  if (tags.some((tag) => ["family", "group", "kitchen"].includes(tag))) {
    return "Family / group layout";
  }
  if (tags.some((tag) => tag.includes("hostel") || tag.includes("social"))) {
    return "Solo / friends / social stay";
  }
  if (tags.some((tag) => tag.includes("couples") || tag.includes("polished") || tag.includes("japanese-modern"))) {
    return "Couples / design stay";
  }
  if (tags.some((tag) => tag.includes("calm") || tag.includes("practical"))) {
    return "Calm practical base";
  }

  return pick.tags.slice(0, 2).join(" / ") || "Check room type";
}

export function HotelPickMatrix({ picks, locale, pagePath }: HotelPickMatrixProps) {
  return (
    <>
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <th className="px-3 py-3 font-semibold">Hotel example</th>
              <th className="px-3 py-3 font-semibold">Area logic</th>
              <th className="px-3 py-3 font-semibold">Best for</th>
              <th className="px-3 py-3 font-semibold">Not ideal for</th>
              <th className="px-3 py-3 font-semibold">Room / group angle</th>
              <th className="px-3 py-3 font-semibold">Booking links</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((pick) => {
              const providerLinks = providerLinksForPick(pick);

              return (
                <tr key={pick.id} className="border-b border-slate-100 last:border-0">
                  <td className="w-[210px] px-3 py-4 align-top">
                    <p className="font-semibold leading-5 text-slate-950">{pick.hotelName}</p>
                    <p className="mt-1 text-xs text-slate-500">{pick.city}</p>
                  </td>
                  <td className="w-[170px] px-3 py-4 align-top leading-6 text-slate-600">{pick.area}</td>
                  <td className="px-3 py-4 align-top leading-6 text-slate-600">{pick.bestFor}</td>
                  <td className="px-3 py-4 align-top leading-6 text-slate-600">{pick.notIdealFor}</td>
                  <td className="w-[150px] px-3 py-4 align-top leading-6 text-slate-600">{roomGroupAngle(pick)}</td>
                  <td className="w-[170px] px-3 py-4 align-top">
                    {providerLinks.length > 0 ? (
                      <div className="grid gap-1.5">
                        {providerLinks.map((link) => (
                          <TripTextAffiliateLink
                            key={link.linkId}
                            link={link}
                            pick={pick}
                            placement="local_hotel_picks_matrix"
                            pagePath={pagePath}
                            locale={locale}
                          />
                        ))}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 lg:hidden">
        {picks.map((pick) => {
          const providerLinks = providerLinksForPick(pick);

          return (
            <article key={pick.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{pick.city}</p>
                <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{pick.hotelName}</h3>
                <p className="mt-1 text-xs text-slate-500">{pick.area}</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                <p><span className="font-semibold text-slate-900">Best for:</span> {pick.bestFor}</p>
                <p><span className="font-semibold text-slate-900">Not ideal for:</span> {pick.notIdealFor}</p>
                <p><span className="font-semibold text-slate-900">Room / group angle:</span> {roomGroupAngle(pick)}</p>
              </div>
              {providerLinks.length > 0 ? (
                <div className="mt-4 grid gap-1.5">
                  {providerLinks.map((link) => (
                    <TripTextAffiliateLink
                      key={link.linkId}
                      link={link}
                      pick={pick}
                      placement="local_hotel_picks_matrix"
                      pagePath={pagePath}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}
