"use client";

import { ArrowRight, Bed, Check, ExternalLink, MapPin, Train } from "lucide-react";
import type { ItineraryDay } from "@/lib/content/itineraries";
import { getProviderFromHref, trackAffiliateClick, trackCtaClick } from "@/lib/analytics";
import { getHotelLink } from "@/lib/hotel-links";
import { AFFILIATE_REL, relForExternalLink } from "@/lib/link-rel";

export function DayCard({
  day,
  location,
  title,
  highlights,
  stayArea,
  stayLink,
  stayHotelKey,
  transport,
  bookingCta,
  prepare,
  prepareCta,
  locale = "en",
  pagePath,
}: ItineraryDay & { locale?: string; pagePath?: string }) {
  const isBookingExternal = bookingCta?.href.startsWith("http");
  const isPrepareExternal = prepareCta?.href.startsWith("http");
  const hotel = stayHotelKey ? getHotelLink(stayHotelKey) : null;
  const resolvedStayLink = hotel?.href ?? stayLink;
  const analyticsStayLink = hotel?.trackingHref ?? resolvedStayLink ?? "";
  const stayLabel = hotel?.label ?? "See hotels";

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07142f] text-xs font-bold text-white">
          {day}
        </div>
        <div className="w-px flex-1 bg-slate-200" />
      </div>

      <div className="flex-1 pb-8">
        <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-sky-700">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-semibold text-slate-950">{title}</h3>

          <ul className="mt-3 space-y-1.5">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {transport && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                <Train className="h-3 w-3" />
                {transport}
              </span>
            )}
            {stayArea && (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                <Bed className="h-3 w-3" />
                Stay: {stayArea}
              </span>
            )}
          </div>

          {(stayArea || transport || bookingCta || prepare) && (
            <div className="mt-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs md:grid-cols-2">
              {stayArea ? (
                <p><span className="font-semibold text-slate-900">Stay:</span> {stayArea}</p>
              ) : null}
              {transport ? (
                <p><span className="font-semibold text-slate-900">Move:</span> {transport}</p>
              ) : null}
              {bookingCta ? (
                <p><span className="font-semibold text-slate-900">Book:</span> {bookingCta.label}</p>
              ) : null}
              {prepare ? (
                <p><span className="font-semibold text-slate-900">Prepare:</span> {prepare}</p>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {resolvedStayLink && (
              <a
                href={resolvedStayLink}
                target="_blank"
                rel={hotel?.provider === "trip" ? AFFILIATE_REL : relForExternalLink(resolvedStayLink)}
                onClick={() =>
                  trackAffiliateClick({
                    category: "hotel",
                    provider: hotel?.provider ?? getProviderFromHref(analyticsStayLink),
                    placement: "itinerary_day_card",
                    page_path: pagePath,
                    locale,
                    href: analyticsStayLink,
                    label: stayLabel,
                    area: hotel ? `${hotel.city}: ${hotel.areaName}` : stayArea,
                  })
                }
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#ff7a00] bg-[#fff3e7] px-3 py-2 text-xs font-semibold text-[#b44b00] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
              >
                {stayLabel}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {bookingCta && (
              <a
                href={bookingCta.href}
                target={isBookingExternal ? "_blank" : undefined}
                rel={relForExternalLink(bookingCta.href)}
                onClick={() => {
                  if (isBookingExternal) {
                    trackAffiliateClick({
                      category: bookingCta.category ?? "activity",
                      provider: getProviderFromHref(bookingCta.href),
                      placement: "itinerary_day_card",
                      page_path: pagePath,
                      locale,
                      href: bookingCta.href,
                      label: bookingCta.label,
                    });
                  } else {
                    trackCtaClick({
                      placement: "itinerary_day_card",
                      href: bookingCta.href,
                      label: bookingCta.label,
                      category: bookingCta.category,
                      page_path: pagePath,
                      locale,
                    });
                  }
                }}
                className={[
                  "inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2",
                  isBookingExternal
                    ? "border-[#ff7a00] bg-[#fff3e7] text-[#b44b00] hover:bg-white focus-visible:ring-orange-200"
                    : "border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43] hover:border-[#168a56] hover:bg-white focus-visible:ring-emerald-200",
                ].join(" ")}
              >
                {bookingCta.label}
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
            {prepareCta && (
              <a
                href={prepareCta.href}
                target={isPrepareExternal ? "_blank" : undefined}
                rel={relForExternalLink(prepareCta.href)}
                onClick={() => {
                  if (isPrepareExternal) {
                    trackAffiliateClick({
                      category: "esim",
                      provider: getProviderFromHref(prepareCta.href),
                      placement: "itinerary_day_card",
                      page_path: pagePath,
                      locale,
                      href: prepareCta.href,
                      label: prepareCta.label,
                    });
                  } else {
                    trackCtaClick({
                      placement: "itinerary_day_card",
                      href: prepareCta.href,
                      label: prepareCta.label,
                      page_path: pagePath,
                      locale,
                    });
                  }
                }}
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#9fd7bd] bg-[#f0fbf6] px-3 py-2 text-xs font-semibold text-[#106b43] hover:border-[#168a56] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                {prepareCta.label}
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
