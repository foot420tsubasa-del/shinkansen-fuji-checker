"use client";

import Image from "next/image";
import { ArrowUpRight, Mountain } from "lucide-react";
import stays from "@/data/fuji-view-stays.json";
import bookingDestinations from "@/data/booking-hotel-destinations.json";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import { trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";
import { ProviderButton } from "@/components/ui/ProviderButton";
import { AFFILIATE_REL } from "@/lib/link-rel";

type Hotel = (typeof stays.hotels)[number];
type HotelPhoto = { src: string; alt: string; credit?: string };

/**
 * Mt. Fuji-view stay cards. Typographic by design (2026-11-20): we have no
 * hotel photos we may use, and a placeholder picture read as unfinished. When
 * a hotel's photo is cleared for use, set hotel.photo in
 * data/fuji-view-stays.json and the card shows it on top; nothing else changes.
 * Generated images are never used as hotel or room photos.
 */
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
    <ul className={["grid gap-5", full ? "lg:grid-cols-3" : "lg:grid-cols-3"].join(" ")}>
      {stays.hotels.map((hotel: Hotel, index) => {
        const booking = getBookingHotelLink(hotel.bookingKey);
        const photo = (hotel as { photo?: HotelPhoto | null }).photo;
        const everyRoom = hotel.viewRooms === "all";
        const notice = (stays.bookingNotices as Record<string, { text: string; label: string; url: string } | undefined>)[hotel.id];
        return (
          <li key={hotel.id} className="flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(11,18,32,0.04)]">
            {photo ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
                {photo.credit ? <span className="absolute bottom-2 right-3 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">{photo.credit}</span> : null}
              </div>
            ) : null}
            <div className={["flex flex-1 flex-col", full ? "p-6" : "p-5"].join(" ")}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{hotel.tag}</p>
                {!photo && full ? <span aria-hidden="true" className="font-display text-2xl leading-none text-slate-300">{String(index + 1).padStart(2, "0")}</span> : null}
              </div>
              <h3 className={["mt-2 font-extrabold leading-snug tracking-[-0.015em] text-ink", full ? "text-[22px]" : "text-lg"].join(" ")}>{hotel.name}</h3>
              <p className={["mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", everyRoom ? "bg-sky-50 text-sky-900" : "bg-amber-50 text-amber-900"].join(" ")}>
                <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
                {hotel.viewSummary}
              </p>
              {full ? <p className="mt-3 text-[15px] leading-6 text-slate-700">{hotel.line}</p> : null}
              <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm leading-6">
                <div>
                  <dt className="font-bold text-ink">The view</dt>
                  <dd className="text-slate-600">{hotel.view}</dd>
                </div>
                {full ? (
                  <div>
                    <dt className="font-bold text-ink">Getting there</dt>
                    <dd className="text-slate-600">{hotel.access}</dd>
                  </div>
                ) : null}
              </dl>
              {full ? (
                <a href={hotel.source.url} target="_blank" rel="noopener noreferrer" className="mt-3 w-fit text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-ink">
                  {hotel.source.label}
                </a>
              ) : null}
              {notice ? (
                <p className="mt-4 border-l-2 border-amber-400 pl-3 text-sm leading-5 text-slate-700">
                  {notice.text}{" "}
                  <a href={notice.url} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-2">{notice.label}</a>
                </p>
              ) : null}
              {booking ? (
                <div className="mt-auto pt-5">
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

/** Booking.com area search for Lake Kawaguchiko. */
export function FujiAreaSearchLink({ placement, pagePath, locale, className = "" }: { placement: AffiliateClickParams["placement"]; pagePath: string; locale: string; className?: string }) {
  const href = (bookingDestinations as Record<string, { affiliate_url?: string }>)[stays.areaSearch.destination]?.affiliate_url;
  if (!href) return null;
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
          label: stays.areaSearch.trackingLabel,
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
