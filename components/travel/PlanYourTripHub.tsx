"use client";

import { ArrowRight, Bed, CalendarDays, ExternalLink, Plane, Signpost, Sparkles, Train, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getAffUrl } from "@/src/affiliateLinks";
import { getProviderFromHref, trackAffiliateClick } from "@/lib/analytics";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import { AFFILIATE_REL } from "@/lib/link-rel";

type ExternalItem = {
  label: string;
  labelKey?: "bookShinkansenTicket" | "prepareESim";
  description: string;
  linkId?: string;
  href?: string;
  hotelKey?: HotelAreaKey;
};

type Category = {
  title: string;
  description: string;
  icon: typeof Train;
  items: ExternalItem[];
};

type GuideSection = {
  title: string;
  description: string;
  icon: typeof Train;
  primary: {
    label: string;
    labelKey?: "chooseWhereToStay" | "prepareAirportTransfer";
    href: string;
  };
  links: Array<{
    label: string;
    href: string;
  }>;
};

type InternalLink = {
  label: string;
  labelKey?: "chooseWhereToStay" | "prepareAirportTransfer";
  href: string;
};

const guideSections: GuideSection[] = [
  {
    title: "Hotels",
    description: "Choose the area first, then look at specific local hotel examples.",
    icon: Bed,
    primary: { label: "Choose where to stay", labelKey: "chooseWhereToStay", href: "/areas-to-stay" },
    links: [
      { label: "Japanese local hotel picks", href: "/local-hotel-picks" },
      { label: "Stay before Shinkansen", href: "/areas-to-stay/where-to-stay-before-shinkansen" },
    ],
  },
  {
    title: "Train / Rail",
    description: "Sort the Shinkansen ticket, JR Pass, and seat decisions before booking.",
    icon: Train,
    primary: { label: "Read train ticket guide", href: "/tokyo-to-kyoto-shinkansen-ticket" },
    links: [
      { label: "Compare JR Pass vs single tickets", href: "/jr-pass-vs-single-ticket" },
      { label: "Shinkansen seat guides", href: "/shinkansen-seat-guides" },
    ],
  },
  {
    title: "Airport / Arrival",
    description: "Prepare the first hour in Japan: airport route, luggage, maps, and data.",
    icon: Plane,
    primary: { label: "Prepare airport transfer", labelKey: "prepareAirportTransfer", href: "/airport-transfers" },
    links: [
      { label: "Narita to Shinjuku", href: "/airport-transfers/narita-to-shinjuku" },
      { label: "Haneda to Shibuya", href: "/airport-transfers/haneda-to-shibuya" },
    ],
  },
  {
    title: "Itinerary",
    description: "Place hotels, trains, arrival day, and city time into a realistic route.",
    icon: CalendarDays,
    primary: { label: "Build an itinerary", href: "/itineraries" },
    links: [
      { label: "7-day first-time Japan", href: "/itineraries/7-day-first-time-japan" },
      { label: "10-day Japan with Fuji", href: "/itineraries/10-day-japan-with-fuji" },
    ],
  },
];

const bookingShortcuts: Category[] = [
  {
    title: "Book rail only after checking the route",
    description: "Use this when you already know your travel date and route.",
    icon: Train,
    items: [
      { label: "Book Shinkansen ticket", labelKey: "bookShinkansenTicket", description: "Klook ticket link for the Tokaido Shinkansen.", linkId: "shinkansenTicket" },
    ],
  },
  {
    title: "Prepare maps and translation",
    description: "Useful before landing, especially for stations and transfers.",
    icon: Wifi,
    items: [
      { label: "Prepare eSIM", labelKey: "prepareESim", description: "Get online for maps, translation, and transit apps.", linkId: "esim" },
    ],
  },
  {
    title: "Compare one practical hotel area",
    description: "Use this as a fallback after reading the stay-area guide.",
    icon: Bed,
    items: [
      { label: "Compare hotels near Tokyo Station", description: "Most efficient for early Shinkansen departures.", hotelKey: "tokyoStation" },
    ],
  },
  {
    title: "Activities",
    description: "Add tours and experiences only after the route is stable.",
    icon: Sparkles,
    items: [
      { label: "Explore Japan activities", description: "Klook activity search for tours and experiences.", linkId: "cityTokyo" },
    ],
  },
];

const internalLinks: InternalLink[] = [
  { label: "Choose where to stay", labelKey: "chooseWhereToStay", href: "/areas-to-stay" },
  { label: "Book train / rail basics", href: "/tokyo-to-kyoto-shinkansen-ticket" },
  { label: "Prepare airport transfer", labelKey: "prepareAirportTransfer", href: "/airport-transfers" },
  { label: "Build an itinerary", href: "/itineraries" },
  { label: "See local hotel picks", href: "/local-hotel-picks" },
] as const;

function resolveItem(item: ExternalItem) {
  if (item.hotelKey) {
    const hotel = getHotelLink(item.hotelKey);
    return {
      ...item,
      label: hotel.label,
      url: hotel.href,
      trackingUrl: hotel.trackingHref,
      external: true,
      category: "hotel" as const,
      provider: hotel.provider,
      area: `${hotel.city}: ${hotel.areaName}`,
    };
  }
  if (item.href) return { ...item, url: item.href, external: item.href.startsWith("http") };
  if (!item.linkId) return null;
  const url = getAffUrl(item.linkId);
  if (!url) return null;
  return { ...item, url, external: true };
}

export function PlanYourTripHub() {
  const commonT = useTranslations("common");
  const locale = typeof window === "undefined" ? undefined : window.location.pathname.split("/").filter(Boolean)[0];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-8 md:py-12">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-6 md:p-8" tone="navy">
            <p className="text-[11px] font-semibold uppercase text-sky-200">Japan trip essentials</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              Japan Trip Essentials After Choosing Your Shinkansen Seat
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              You checked your Fuji-side Shinkansen seat. Now prepare the rest of your Japan trip.
            </p>
          </Card>

          <Card className="p-5" tone="accent">
            <p className="text-[11px] font-semibold uppercase text-[#106b43]">Start with the decision</p>
            <div className="mt-3 grid gap-2">
              {internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#9fd7bd] bg-white px-3 py-2.5 text-sm font-semibold text-[#106b43] transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]"
                >
                  {link.labelKey ? commonT(link.labelKey) : link.label}
                  <ArrowRight className="h-4 w-4 text-[#106b43]" />
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {guideSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p>
                  </div>
                </div>
                <Link
                  href={section.primary.href}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                >
                  {section.primary.labelKey ? commonT(section.primary.labelKey) : section.primary.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#106b43]">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className="underline underline-offset-4 transition-colors hover:text-[#0f6f45]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </section>

        <section className="mt-8">
          <Card className="grid gap-4 border-[#d5e5ef] bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#d5e5ef] bg-[#eef6fb] text-[#082653]">
                <Signpost className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-500">
                  Free travel-prep tool
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-950">
                  Practice station navigation
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Try a free Tokyo-style station practice game before your
                  trip.
                </p>
              </div>
            </div>
            <Link
              href="/station-practice"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#168a56] bg-white px-4 text-sm font-semibold text-[#106b43] transition-colors hover:bg-[#f0fbf6]"
            >
              Start station practice
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase text-[#106b43]">Booking shortcuts</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Use these only after you know what you need.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These partner links are grouped as practical next steps, not a complete booking directory.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bookingShortcuts.map((category) => {
            const Icon = category.icon;
            const resolved = category.items.map(resolveItem).filter(Boolean) as Array<ExternalItem & { url: string; trackingUrl?: string; external: boolean; category?: "hotel"; provider?: "klook" | "agoda" | "trip"; area?: string }>;
            return (
              <Card key={category.title} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#9fd7bd] bg-[#f0fbf6] text-[#106b43]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{category.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {resolved.map((item) => {
                    const itemTone = item.external
                      ? {
                          card: "hover:border-[#ff7a00] hover:bg-[#fff8f0]",
                          icon: "text-[#b44b00]",
                        }
                      : {
                          card: "hover:border-[#168a56] hover:bg-[#f0fbf6]",
                          icon: "text-[#106b43]",
                        };
                    const content = (
                      <>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{item.labelKey ? commonT(item.labelKey) : item.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span>
                        </span>
                        {item.external ? (
                          <ExternalLink className={`h-4 w-4 shrink-0 ${itemTone.icon}`} />
                        ) : (
                          <ArrowRight className={`h-4 w-4 shrink-0 ${itemTone.icon}`} />
                        )}
                      </>
                    );
                    if (item.external) {
                      return (
                        <a
                          key={`${category.title}-${item.label}`}
                          href={item.url}
                          target="_blank"
                          rel={AFFILIATE_REL}
                          onClick={() =>
                            trackAffiliateClick({
                              category: item.category ?? (item.linkId === "esim" ? "esim" : item.linkId?.includes("Pass") || item.linkId?.includes("Ticket") ? "train" : "activity"),
                              provider: item.provider ?? getProviderFromHref(item.trackingUrl ?? item.url),
                              placement: "next_steps",
                              page_path: "/plan-your-trip",
                              locale,
                              href: item.trackingUrl ?? item.url,
                              label: item.label,
                              area: item.area,
                            })
                          }
                          className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors ${itemTone.card}`}
                        >
                          {content}
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={`${category.title}-${item.label}`}
                        href={item.url}
                        className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition-colors ${itemTone.card}`}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          </div>
        </section>

      </Container>
    </main>
  );
}
