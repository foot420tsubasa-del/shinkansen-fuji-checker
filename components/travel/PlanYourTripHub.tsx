"use client";

import { ArrowRight, Bed, CalendarDays, ExternalLink, Landmark, Luggage, MapPinned, Plane, ShieldCheck, Signpost, Train, Wifi } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getAffUrl } from "@/src/affiliateLinks";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { AffiliateClickParams } from "@/lib/analytics";

type AffiliateProduct = {
  label: string;
  description?: string;
  linkId: string;
  category: AffiliateClickParams["category"];
  provider?: AffiliateClickParams["provider"];
  product: string;
  adid?: string;
  routeType?: string;
};

type TokyoBaseCard = {
  title: string;
  bestFor: string;
  href: string;
  cta: string;
  hotelKey?: HotelAreaKey;
};

type CityCard = {
  title: string;
  description: string;
  linkId: string;
  cta: string;
  imageSrc?: string;
  imageAlt?: string;
};

const shinkansenTicket = getAffUrl("shinkansenTicket");
const jrPass = getAffUrl("jrPass");
const esim = getAffUrl("esim");
const airportTransfer = getAffUrl("airportTransfer");
const insurance = getAffUrl("insurance");
const omioRouteCompare = getAffUrl("omioJapanTrain") ?? getAffUrl("omioShinkansen");

const tokyoBaseCards: TokyoBaseCard[] = [
  {
    title: "Shinjuku",
    bestFor: "First-time energy, nightlife, and easy food options.",
    href: "/areas-to-stay/tokyo-first-time",
    cta: "Read Shinjuku stay guide",
    hotelKey: "shinjuku",
  },
  {
    title: "Ueno / Asakusa",
    bestFor: "Narita access, budget range, and east-side sightseeing.",
    href: "/areas-to-stay/asakusa-vs-ueno",
    cta: "Compare Ueno and Asakusa",
    hotelKey: "ueno",
  },
  {
    title: "Tokyo Station",
    bestFor: "Early Shinkansen departures and easier luggage movement.",
    href: "/areas-to-stay/where-to-stay-before-shinkansen",
    cta: "Choose before Shinkansen",
    hotelKey: "tokyoStation",
  },
  {
    title: "East Tokyo / quiet local",
    bestFor: "Calmer days, coffee walks, and a less tourist-heavy base.",
    href: "/local-tokyo",
    cta: "Explore Local Tokyo",
  },
];

const cityCards: CityCard[] = [
  {
    title: "Tokyo",
    description: "Tours, food walks, observation decks, and first-time activities.",
    linkId: "cityTokyo",
    cta: "Browse Tokyo activities",
  },
  {
    title: "Kyoto",
    description: "Kimono rental, temples, guided walks, and classic Kyoto experiences.",
    linkId: "cityKyoto",
    cta: "Browse Kyoto activities",
  },
  {
    title: "Osaka",
    description: "Food, passes, theme parks, and evening-friendly activities.",
    linkId: "cityOsaka",
    cta: "Browse Osaka activities",
  },
  {
    title: "Mt. Fuji / Hakone",
    description: "Add a mountain-side day or overnight stop after the main route is fixed.",
    linkId: "hakone",
    cta: "Browse Fuji area add-ons",
  },
];

function AffiliateButton({
  item,
  href,
  placement,
  locale,
  className,
  children,
}: {
  item: AffiliateProduct;
  href: string;
  placement: AffiliateClickParams["placement"];
  locale: string;
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <TrackedAffiliateLink
      href={href}
      target="_blank"
      rel={AFFILIATE_REL}
      category={item.category}
      provider={item.provider}
      placement={placement}
      pagePath="/plan-your-trip"
      locale={locale}
      label={item.label}
      linkId={item.linkId}
      product={item.product}
      adid={item.adid}
      routeType={item.routeType}
      className={className}
    >
      {children ?? item.label}
    </TrackedAffiliateLink>
  );
}

function HotelCompareLink({ hotelKey, locale }: { hotelKey: HotelAreaKey; locale: string }) {
  const hotel = getHotelLink(hotelKey);
  return (
    <TrackedAffiliateLink
      href={hotel.href}
      target="_blank"
      rel={AFFILIATE_REL}
      category="hotel"
      provider={hotel.provider}
      placement="plan_trip_hotel_cards"
      pagePath="/plan-your-trip"
      locale={locale}
      label={hotel.label}
      trackingHref={hotel.trackingHref}
      area={`${hotel.city}: ${hotel.areaName}`}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#0a4ca8] bg-[#0a4ca8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a3f8b]"
    >
      {hotel.label}
      <ExternalLink className="h-3.5 w-3.5" />
    </TrackedAffiliateLink>
  );
}

export function PlanYourTripHub() {
  const locale = typeof window === "undefined" ? "en" : (window.location.pathname.split("/").filter(Boolean)[0] || "en");

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-8 md:py-12">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
          <Card className="p-6 md:p-9" tone="navy">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-200">Fujiseat booking path</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              Japan Trip Booking Guide
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              You found the Fuji-side Shinkansen seat. Now prepare the rest of your Japan trip in the right order.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {shinkansenTicket ? (
                <AffiliateButton
                  href={shinkansenTicket}
                  placement="plan_trip_hero"
                  item={{
                    label: "Book Shinkansen ticket",
                    linkId: "shinkansenTicket",
                    category: "train",
                    provider: "klook",
                    product: "shinkansen_ticket",
                    adid: "1265303",
                    routeType: "simple-shinkansen",
                  }}
                  locale={locale}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#ff7a00] bg-[#ff7a00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e66700]"
                >
                  Book Shinkansen ticket
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              ) : null}
              <TrackedCtaLink
                href="/planner"
                placement="plan_trip_hero"
                label="Open Trip Planner"
                category="navigation"
                pagePath="/plan-your-trip"
      locale={locale}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-slate-500 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Open Trip Planner
                <ArrowRight className="h-4 w-4" />
              </TrackedCtaLink>
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-5" tone="accent">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Book in this order</p>
              <ol className="mt-4 space-y-3 text-sm text-slate-700">
                {[
                  "Confirm the Shinkansen direction and Fuji-side seat.",
                  "Choose rail: single ticket first, JR Pass only if the route fits.",
                  "Pick the hotel base before filling activities.",
                  "Prepare arrival essentials before landing.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#106b43]">{index + 1}</span>
                    <span className="leading-6">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Link href="/guide" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#106b43] underline underline-offset-4">
              Read Fuji-side seat guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Rail showdown</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Shinkansen Ticket vs JR Pass</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Choose the rail option that matches your route.</p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-[#fff3e7] text-[#b44b00]">
                  <Train className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Single Shinkansen Ticket</h3>
                  <p className="mt-1 text-sm text-slate-500">Best for simple city-to-city rail days.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                <li>Tokyo → Kyoto / Osaka</li>
                <li>One-way or simple route</li>
                <li>First-time 5–7 day trips</li>
              </ul>
              <div className="mt-5">
                {shinkansenTicket ? (
                  <AffiliateButton
                    href={shinkansenTicket}
                    placement="plan_trip_rail_showdown"
                    item={{ label: "Book Shinkansen ticket", linkId: "shinkansenTicket", category: "train", provider: "klook", product: "shinkansen_ticket", adid: "1265303", routeType: "simple-shinkansen" }}
                    locale={locale}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                  >
                    Book Shinkansen ticket
                    <ExternalLink className="h-4 w-4" />
                  </AffiliateButton>
                ) : null}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43]">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">JR Pass</h3>
                  <p className="mt-1 text-sm text-slate-500">Best only when your route has enough JR distance.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                <li>Hiroshima</li>
                <li>Return to Tokyo by Shinkansen</li>
                <li>Multiple long-distance JR rides</li>
              </ul>
              {jrPass ? (
                <AffiliateButton
                  href={jrPass}
                  placement="plan_trip_rail_showdown"
                  item={{ label: "Check JR Pass options", linkId: "jrPass", category: "train", provider: "klook", product: "jr_pass", adid: "1165791", routeType: "multi-city-jr" }}
                  locale={locale}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                >
                  Check JR Pass options
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              ) : null}
              <Link
                href="/jr-pass-vs-single-ticket"
                className="mt-6 flex justify-end text-xs font-semibold text-[#106b43] underline underline-offset-4 transition-colors hover:text-[#0f6f45]"
              >
                Read when it pays off
              </Link>
            </Card>
          </div>
          {omioRouteCompare ? (
            <AffiliateButton
              href={omioRouteCompare}
              placement="plan_trip_rail_showdown"
              item={{ label: "Not sure yet? Compare routes on Omio.", linkId: "omioJapanTrain", category: "train", provider: "omio", product: "route_compare", routeType: "route-comparison" }}
              locale={locale}
              className="mt-4 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-transparent px-0 py-1 text-xs font-semibold text-indigo-700 underline underline-offset-4 transition-colors hover:text-indigo-900"
            >
              Not sure yet? Compare routes on Omio.
              <ExternalLink className="h-3.5 w-3.5" />
            </AffiliateButton>
          ) : null}
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Hotels</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Choose your Tokyo base</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Pick the area logic first. Then compare hotels only where the area fits your route.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tokyoBaseCards.map((base) => (
              <Card key={base.title} className="flex flex-col p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d5e5ef] bg-[#eef6fb] text-[#082653]">
                  <Bed className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{base.title}</h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{base.bestFor}</p>
                <TrackedCtaLink
                  href={base.href}
                  placement="plan_trip_hotel_cards"
                  label={base.cta}
                  category="hotel"
                  pagePath="/plan-your-trip"
      locale={locale}
                  className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                >
                  {base.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </TrackedCtaLink>
                {base.hotelKey ? (
                  <div className="mt-2">
                    <HotelCompareLink hotelKey={base.hotelKey} locale={locale} />
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Arrival essentials</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Prepare the first hour in Japan</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep this practical: data, airport movement, and the station basics you need on arrival day.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {esim ? (
              <Card className="p-5">
                <Wifi className="h-6 w-6 text-[#106b43]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">Japan eSIM</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Get online for maps, translation, and transit apps before leaving the airport.</p>
                <AffiliateButton
                  href={esim}
                  placement="plan_trip_arrival_cards"
                  item={{ label: "Get Japan eSIM", linkId: "esim", category: "esim", provider: "klook", product: "esim", adid: "1166001" }}
                  locale={locale}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                >
                  Get Japan eSIM
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              </Card>
            ) : null}
            {airportTransfer ? (
              <Card className="p-5">
                <Plane className="h-6 w-6 text-[#106b43]" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">Airport transfer</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Book or compare the first ride from the airport when luggage and timing matter.</p>
                <AffiliateButton
                  href={airportTransfer}
                  placement="plan_trip_arrival_cards"
                  item={{ label: "Book airport transfer", linkId: "airportTransfer", category: "transfer", provider: "klook", product: "airport_transfer", adid: "1165996" }}
                  locale={locale}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                >
                  Book airport transfer
                  <ExternalLink className="h-4 w-4" />
                </AffiliateButton>
              </Card>
            ) : null}
            <Card className="p-5">
              <Luggage className="h-6 w-6 text-[#106b43]" />
              <h3 className="mt-4 text-lg font-semibold text-slate-950">Station prep</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Practice exits, transfer gates, and platform signs before your first train ride.</p>
              <TrackedCtaLink
                href="/station-practice"
                placement="plan_trip_arrival_cards"
                label="Start station practice"
                category="station_practice"
                pagePath="/plan-your-trip"
                locale={locale}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                Start station practice
                <ArrowRight className="h-4 w-4" />
              </TrackedCtaLink>
            </Card>
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">Activities</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Explore by city</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Add activities after the route, hotels, and arrival basics are stable.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cityCards.map((city) => {
              const url = getAffUrl(city.linkId);
              if (!url) return null;
              return (
                <Card key={city.title} className="overflow-hidden p-0">
                  {city.imageSrc ? (
                    // Future city images can be added through cityCards without changing the card layout.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={city.imageSrc} alt={city.imageAlt ?? city.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="aspect-[16/9] border-b border-slate-100 bg-[linear-gradient(135deg,#eef6fb,#f8fbff_48%,#f0fbf6)]" aria-hidden="true" />
                  )}
                  <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{city.title}</h3>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{city.description}</p>
                  <AffiliateButton
                    href={url}
                    placement="plan_trip_activity_cards"
                    item={{ label: city.cta, linkId: city.linkId, category: "activity", provider: "klook", product: "activity" }}
                  locale={locale}
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e66700]"
                  >
                    {city.cta}
                    <ExternalLink className="h-4 w-4" />
                  </AffiliateButton>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Optional add-ons</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Useful, but not first-step decisions</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {insurance ? (
              <AffiliateButton
                href={insurance}
                placement="plan_trip_activity_cards"
                item={{ label: "Check travel insurance", linkId: "insurance", category: "insurance", provider: "klook", product: "travel_insurance", adid: "1166002" }}
                locale={locale}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#475569] bg-[#475569] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#334155]"
              >
                <ShieldCheck className="h-4 w-4" />
                Check travel insurance
              </AffiliateButton>
            ) : null}
            <TrackedCtaLink href="/station-practice" placement="plan_trip_arrival_cards" label="Station practice" category="station_practice" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#111827] bg-[#111827] px-3 py-2 text-sm font-semibold text-[#f6c343] transition-colors hover:bg-[#020617]">
              <Signpost className="h-4 w-4" />
              Station practice
            </TrackedCtaLink>
            <TrackedCtaLink href="/command-center" placement="plan_trip_hero" label="Command Center" category="navigation" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#082653] bg-[#082653] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#061d40]">
              <MapPinned className="h-4 w-4" />
              Command Center
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-tokyo" placement="plan_trip_hotel_cards" label="Local Tokyo" category="navigation" pagePath="/plan-your-trip" locale={locale} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#106b43] bg-[#106b43] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]">
              <CalendarDays className="h-4 w-4" />
              Local Tokyo
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
    </main>
  );
}
