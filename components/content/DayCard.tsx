"use client";

import { ArrowRight, Bed, Check, ExternalLink, MapPin, Train } from "lucide-react";
import type { ItineraryDay } from "@/lib/content/itineraries";
import { trackAffiliateClick } from "@/lib/analytics";
import { relForExternalLink } from "@/lib/link-rel";

export function DayCard({ day, location, title, highlights, stayArea, stayLink, transport, bookingCta }: ItineraryDay) {
  const isBookingExternal = bookingCta?.href.startsWith("http");

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

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {stayLink && (
              <a
                href={stayLink}
                target="_blank"
                rel={relForExternalLink(stayLink)}
                onClick={() => trackAffiliateClick("itinerary-hotel", `Day ${day} ${location}`)}
                className="inline-flex items-center gap-1 rounded-xl border border-[#ff7a00] bg-[#fff3e7] px-3 py-1.5 text-xs font-semibold text-[#b44b00] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
              >
                See hotels
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {bookingCta && (
              <a
                href={bookingCta.href}
                target={isBookingExternal ? "_blank" : undefined}
                rel={relForExternalLink(bookingCta.href)}
                onClick={() => trackAffiliateClick("itinerary-cta", bookingCta.label)}
                className={[
                  "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2",
                  isBookingExternal
                    ? "border-[#ff7a00] bg-[#fff3e7] text-[#b44b00] hover:bg-white focus-visible:ring-orange-200"
                    : "border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43] hover:border-[#168a56] hover:bg-white focus-visible:ring-emerald-200",
                ].join(" ")}
              >
                {bookingCta.label}
                <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
