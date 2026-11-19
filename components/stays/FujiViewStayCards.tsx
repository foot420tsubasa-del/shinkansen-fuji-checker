"use client";

import { ArrowUpRight } from "lucide-react";
import stays from "@/data/fuji-view-stays.json";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import { trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { AFFILIATE_REL } from "@/lib/link-rel";

type Hotel = (typeof stays.hotels)[number];

/**
 * Placeholder until the hotels' own photos (with permission) are in hand: a
 * quiet sky-and-lake gradient with the mountain's outline, never a photo we
 * have no rights to.
 */
function PhotoPlaceholder({ name }: { name: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#dce8f2] via-[#eef3f6] to-[#cfdfe6]" role="img" aria-label={`${name} — hotel photo coming soon`}>
      <svg viewBox="0 0 400 300" className="absolute inset-x-0 bottom-0 h-3/4 w-full" aria-hidden="true" preserveAspectRatio="xMidYMax slice">
        <path d="M0 230 L120 150 L170 110 L200 92 L230 110 L280 150 L400 230 Z" fill="#9fb3c4" />
        <path d="M170 110 L200 92 L230 110 L214 118 L200 112 L186 120 Z" fill="#ffffff" />
        <rect y="228" width="400" height="72" fill="#b9d0db" />
      </svg>
      <span className="absolute bottom-2 right-3 text-[11px] font-medium text-slate-600">Hotel photo coming soon</span>
    </div>
  );
}

export function FujiViewStayCards({
  variant = "full",
  placement,
  pagePath,
  locale,
}: {
  variant?: "full" | "compact";
  placement: AffiliateClickParams["placement"];
  pagePath: string;
  locale: string;
}) {
  const full = variant === "full";
  return (
    <ul className={["grid gap-5", full ? "md:grid-cols-3" : "sm:grid-cols-3"].join(" ")}>
      {stays.hotels.map((hotel: Hotel) => {
        const booking = getBookingHotelLink(hotel.bookingKey);
        return (
          <li key={hotel.id} className="flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white">
            <PhotoPlaceholder name={hotel.name} />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-fuji">{hotel.tag}</p>
              <h3 className="mt-1.5 text-lg font-extrabold leading-snug tracking-[-0.01em] text-ink">{hotel.name}</h3>
              {full ? <p className="mt-2 text-[15px] leading-6 text-slate-700">{hotel.line}</p> : null}
              <p className={["mt-2 text-sm leading-6", /not every room/i.test(hotel.view) ? "font-semibold text-amber-900" : "text-slate-600"].join(" ")}>{hotel.view}</p>
              {full ? <p className="mt-2 text-sm leading-6 text-slate-600"><b className="text-ink">Getting there:</b> {hotel.access}</p> : null}
              {full ? (
                <a href={hotel.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-ink">
                  {hotel.source.label}
                </a>
              ) : null}
              {booking ? (
                <div className="mt-auto pt-4">
                  <ProviderButton
                    provider="booking_travelpayouts"
                    href={booking.href}
                    trackingHref={booking.href}
                    placement={placement}
                    pagePath={pagePath}
                    locale={locale}
                    linkId={booking.linkId}
                    category="hotel"
                    product="hotel"
                    area="Lake Kawaguchiko"
                    hotelName={hotel.name}
                    fullWidth
                  >
                    View rooms on Booking.com
                  </ProviderButton>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** "See all hotels near Mt. Fuji": Booking.com's Fujikawaguchiko search (plain link until an area affiliate link exists). */
export function FujiAreaSearchLink({ placement, pagePath, locale, className = "" }: { placement: AffiliateClickParams["placement"]; pagePath: string; locale: string; className?: string }) {
  const href = stays.areaSearch.url;
  return (
    <a
      href={href}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() =>
        trackAffiliateClick({
          category: "hotel",
          provider: "booking_travelpayouts",
          placement,
          page_path: pagePath,
          locale,
          href,
          label: stays.page.areaCta,
          link_id: "bookingArea.fujikawaguchiko",
          product: "hotel_area",
          area: "Fujikawaguchiko",
        })
      }
      className={["inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji", className].join(" ")}
    >
      {stays.page.areaCta} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
