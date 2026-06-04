import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bed, CalendarDays, Clock, MapPin, Plane, Train, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { TransferOption } from "@/components/content/TransferOption";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAllTransferSlugs, getTransferBySlug } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";
import { getAirportTransferRouteImage } from "@/lib/airport-transfer-images";
import { AirportHeroCard, AirportNextSteps, AirportRouteCompareCard, ArrivalSetupCard } from "@/components/airport/AirportTransferUi";
import { ESIM_URL, getAffiliateConfig, getReadyAffUrl } from "@/src/affiliateLinks";
import { getAirportRouteUiCopy, localizedLateArrivalNote, localizedProTip, localizedRouteDescription, localizedRouteTitle, localizeTripPick, routeSpecific } from "@/lib/content/airport-transfer-i18n";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { getHotelProviderLinks } from "@/lib/hotel-affiliate-links";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

type EnhancedRouteCopy = {
  routeLabel: string;
  quickTitle: string;
  quickBody: string;
  luggageNote: string;
  arrivalSetupBody: string;
  stayHref: string;
};

type RouteHotelBaseArea = {
  title: string;
  goodIf: string;
  avoidIf: string;
  logic: string;
  hotelKey: HotelAreaKey;
  city: string;
};

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

const bookingAreaIdByHotelAreaKey: Partial<Record<HotelAreaKey, string>> = {
  ueno: "ueno",
  asakusa: "asakusa",
  tokyoStation: "tokyo-station",
  shinjuku: "shinjuku",
  shibuya: "shibuya",
  oshiage: "oshiage",
};

function hotelProviderChoices(areaKey: HotelAreaKey, placement: ProviderChoiceButton["placement"], locale: string) {
  const hotel = getHotelLink(areaKey);
  const config = getTripHotelConfig(areaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl;
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl;
  const agodaLink = getAgodaHotelAreaUrl(areaKey);
  const bookingAreaId = bookingAreaIdByHotelAreaKey[areaKey];
  const bookingLinks = bookingAreaId
    ? getHotelProviderLinks({ areaId: bookingAreaId, locale, placement: "airport_page_first_night_cta" }).map((link) => ({
        label: link.label,
        href: link.href,
        trackingHref: link.trackingHref,
        provider: link.provider,
        product: "hotel",
        linkId: link.linkId,
        placement: link.placement,
        variant: "primary" as const,
        category: "hotel" as const,
        areaId: bookingAreaId,
        subId: link.subId,
      }))
    : [];

  return providerChoices(
    ...bookingLinks,
    tripHref
      ? {
          label: "Trip.com",
          href: tripHref,
          trackingHref: tripTrackingHref,
          provider: "trip",
          product: "hotel",
          linkId: `hotelArea.${areaKey}.trip`,
          placement,
          variant: "primary",
          category: "hotel",
        }
      : null,
    agodaLink
      ? {
          label: "Agoda",
          href: agodaLink.href,
          trackingHref: agodaLink.trackingHref,
          provider: "agoda",
          product: "hotel",
          linkId: agodaLink.linkId,
          placement,
          variant: "secondary",
          category: "hotel",
        }
      : null,
  );
}

const enhancedRouteCopy: Record<string, EnhancedRouteCopy> = {
  "narita-to-shinjuku": {
    routeLabel: "Narita Airport → Shinjuku",
    quickTitle: "Most travelers should start with Narita Express.",
    quickBody: "It is direct, reserved, luggage-friendly, and avoids transfers. If your hotel is near a limousine bus stop or you have heavy luggage, the bus may be easier.",
    luggageNote: "With two or more large suitcases, compare N'EX against Limousine Bus based on your exact Shinjuku hotel side.",
    arrivalSetupBody: "Before booking a Shinjuku hotel, check whether your hotel is closer to Shinjuku Station, Busta Shinjuku, Nishi-Shinjuku, or the East Exit nightlife area.",
    stayHref: "/areas-to-stay/tokyo-first-time",
  },
  "haneda-to-shinjuku": {
    routeLabel: "Haneda Airport → Shinjuku",
    quickTitle: "Most travelers can choose train or limousine bus.",
    quickBody: "Haneda is closer than Narita. Trains are fast and affordable, while the bus is easier if your hotel is near a stop or you have large luggage.",
    luggageNote: "Haneda is close enough that bus or taxi can be worth it when you arrive tired with large suitcases.",
    arrivalSetupBody: "Haneda is easy, but your Shinjuku hotel location still matters. Bus stops and station exits can change the easiest route.",
    stayHref: "/areas-to-stay/tokyo-first-time",
  },
  "kansai-airport-to-kyoto": {
    routeLabel: "Kansai Airport → Kyoto",
    quickTitle: "Most travelers should start with JR Haruka.",
    quickBody: "It is the simplest train route to Kyoto Station. Airport bus or private transfer may be easier with heavy luggage or late arrivals.",
    luggageNote: "If you arrive late or carry several large bags, compare Haruka against airport bus and private transfer before committing.",
    arrivalSetupBody: "If you arrive at Kansai Airport and go straight to Kyoto, staying near Kyoto Station can reduce first-night luggage stress.",
    stayHref: "/areas-to-stay/kyoto-first-time",
  },
};

function stayHrefForRoute(slug: string) {
  if (slug.includes("kansai-airport-to-kyoto") || slug.includes("kyoto-to-kansai-airport")) {
    return "/areas-to-stay/kyoto-first-time";
  }
  if (slug.includes("kansai-airport-to-namba") || slug.includes("kansai-airport-to-umeda") || slug.includes("osaka-to-kansai-airport")) {
    return "/areas-to-stay/osaka-first-time";
  }
  return "/areas-to-stay/tokyo-first-time";
}

function hotelAreasForTransferRoute(slug: string): RouteHotelBaseArea[] {
  if (slug.includes("kansai-airport-to-kyoto") || slug.includes("kyoto-to-kansai-airport")) {
    return [
      {
        title: "Kyoto Station",
        goodIf: "You want the simplest first or final night for Kansai Airport and JR Haruka.",
        avoidIf: "You want a traditional evening around Gion or a quieter old-town base.",
        logic: "Strong for luggage, rail access, and late or early airport movement.",
        hotelKey: "kyotoStation",
        city: "Kyoto",
      },
      {
        title: "Gion / Kawaramachi",
        goodIf: "You want Kyoto atmosphere after arrival and do not mind extra luggage planning.",
        avoidIf: "Your arrival is late or your luggage is heavy.",
        logic: "Better for evening atmosphere than airport rail simplicity. Check taxi, bus, or transfer route.",
        hotelKey: "gionKawaramachi",
        city: "Kyoto",
      },
    ];
  }

  if (slug.includes("kansai-airport-to-namba") || slug.includes("osaka-to-kansai-airport")) {
    return [
      {
        title: "Namba",
        goodIf: "You want food, nightlife, and direct Nankai access from Kansai Airport.",
        avoidIf: "You prefer a quieter business district or JR-centered movement.",
        logic: "Strong when your hotel is close to the Nankai / subway side you need.",
        hotelKey: "namba",
        city: "Osaka",
      },
      {
        title: "Umeda",
        goodIf: "You want JR connections, shopping, and a north Osaka base after arrival.",
        avoidIf: "You need the simplest direct Nankai airport route.",
        logic: "Works well if airport bus or JR-based access matches your hotel side.",
        hotelKey: "umeda",
        city: "Osaka",
      },
    ];
  }

  if (slug.includes("kansai-airport-to-umeda")) {
    return [
      {
        title: "Umeda",
        goodIf: "You want JR connections, shopping, and a practical north Osaka base.",
        avoidIf: "You prefer direct Nankai access or Dotonbori nightlife.",
        logic: "Check whether your hotel is closer to Osaka Station, Umeda subway lines, or airport bus stops.",
        hotelKey: "umeda",
        city: "Osaka",
      },
      {
        title: "Namba",
        goodIf: "You want food, nightlife, and easier Nankai airport access.",
        avoidIf: "Your plans are mostly around north Osaka or JR connections.",
        logic: "Useful if the airport route and evening plans point south.",
        hotelKey: "namba",
        city: "Osaka",
      },
    ];
  }

  if (slug.includes("narita-to-asakusa")) {
    return [
      {
        title: "Asakusa",
        goodIf: "You want old Tokyo atmosphere and a calmer first night.",
        avoidIf: "You need JR-centered movement or an early Shinkansen next morning.",
        logic: "Good for east Tokyo arrivals. Confirm subway line, exits, and walking route.",
        hotelKey: "asakusa",
        city: "Tokyo",
      },
      {
        title: "Ueno",
        goodIf: "You want Narita access with practical rail connections nearby.",
        avoidIf: "You want a quieter old-town stay directly by Senso-ji.",
        logic: "A practical alternative if your route or luggage makes Ueno simpler.",
        hotelKey: "ueno",
        city: "Tokyo",
      },
    ];
  }

  if (slug.includes("narita-to-ueno")) {
    return [
      {
        title: "Ueno",
        goodIf: "You want Narita access, museums, parks, and practical east Tokyo logistics.",
        avoidIf: "You want nightlife or a polished central hotel zone.",
        logic: "Strong Narita fit. Check station side and hotel walking route with luggage.",
        hotelKey: "ueno",
        city: "Tokyo",
      },
      {
        title: "Asakusa",
        goodIf: "You want a calmer old Tokyo base after arriving through the east side.",
        avoidIf: "You want the directest rail connection from the airport to the hotel door.",
        logic: "Can work well, but route details and subway exits matter more.",
        hotelKey: "asakusa",
        city: "Tokyo",
      },
    ];
  }

  if (slug.includes("haneda")) {
    return [
      {
        title: "Tokyo Station / Ginza",
        goodIf: "You want central logistics, first/last night convenience, or an early Shinkansen.",
        avoidIf: "You want a very local or nightlife-heavy first night.",
        logic: "Practical for rail days. Check whether train, airport bus, or taxi fits your hotel side.",
        hotelKey: "tokyoStation",
        city: "Tokyo",
      },
      {
        title: "Shinjuku",
        goodIf: "You want food, nightlife, and hotel choice after landing.",
        avoidIf: "You arrive late with kids, large luggage, or low station-complexity tolerance.",
        logic: "Haneda is close, but the Shinjuku station side still matters. Airport bus can be worth comparing.",
        hotelKey: "shinjuku",
        city: "Tokyo",
      },
      {
        title: "Asakusa",
        goodIf: "You want a calmer east Tokyo first night with old-town atmosphere.",
        avoidIf: "You need the simplest direct Haneda rail route.",
        logic: "Can work through subway/Asakusa Line logic, but confirm exits and walking distance.",
        hotelKey: "asakusa",
        city: "Tokyo",
      },
    ];
  }

  return [
    {
      title: "Ueno",
      goodIf: "You want Narita access, practical rail connections, and better-value hotel search.",
      avoidIf: "You want Shinjuku nightlife or a polished central hotel zone.",
      logic: "Strong Narita-side first-night base when luggage and rail access matter.",
      hotelKey: "ueno",
      city: "Tokyo",
    },
    {
      title: "Tokyo Station / Ginza",
      goodIf: "You want central logistics, early Shinkansen access, or a first/last Tokyo night.",
      avoidIf: "You want a softer local neighborhood feel.",
      logic: "Practical, but large-station complexity and hotel side still matter.",
      hotelKey: "tokyoStation",
      city: "Tokyo",
    },
    {
      title: "Shinjuku",
      goodIf: "You want food, nightlife, shopping, and many hotel choices.",
      avoidIf: "You arrive tired with heavy luggage or dislike huge stations.",
      logic: "Good after settling in; arrival can be tiring, so compare airport bus if your hotel is near a stop.",
      hotelKey: "shinjuku",
      city: "Tokyo",
    },
  ];
}

function arrivalSetupBodyForRoute(slug: string, page: NonNullable<ReturnType<typeof getTransferBySlug>>) {
  if (slug.includes("kyoto")) {
    return "If this transfer connects with your Kyoto first or final night, staying near Kyoto Station can reduce luggage stress and make airport rail simpler.";
  }
  if (slug.includes("namba")) {
    return "If you are using Namba as your Osaka base, check whether your hotel is close to Nankai Namba, Midosuji Line, or the Dotonbori side before choosing the transfer.";
  }
  if (slug.includes("umeda")) {
    return "If your first Osaka night is in Umeda, check the station side and hotel access before choosing between train, bus, and transfer.";
  }
  if (slug.includes("osaka-to-kansai-airport")) {
    return "For a final Osaka night before Kansai Airport, choose a base that keeps luggage movement simple on departure morning.";
  }
  if (slug.includes("late-arrival")) {
    return "For a late arrival, your first-night hotel area matters more than usual. Choose a base that does not depend on a risky final train connection.";
  }
  return `Before booking a hotel near ${page.to}, check the closest station exit, bus stop, and luggage route so your arrival transfer stays simple.`;
}

function getEnhancedRouteCopy(slug: string, page: NonNullable<ReturnType<typeof getTransferBySlug>>, bestOptionName: string): EnhancedRouteCopy {
  return enhancedRouteCopy[slug] ?? {
    routeLabel: `${page.from} → ${page.to}`,
    quickTitle: `Most travelers should start with ${bestOptionName}.`,
    quickBody: `It is the default starting point for ${page.from} to ${page.to}. Compare it with the other options below if you have heavy luggage, arrive late, or your hotel is closer to a different stop.`,
    luggageNote: "With large suitcases, prioritize fewer transfers, clear station exits, and direct hotel access over the cheapest route.",
    arrivalSetupBody: arrivalSetupBodyForRoute(slug, page),
    stayHref: stayHrefForRoute(slug),
  };
}

function transferOptionPlacement(optionName: string) {
  return optionName.toLowerCase().includes("private")
    ? "airport_route_transfer_booking"
    : "airport_route_option";
}

function routeCompareLink(slug: string) {
  const routeIds: Record<string, string> = {
    "narita-to-shinjuku": "omioNaritaAirportToShinjuku",
    "narita-to-tokyo-station": "omioNaritaAirportToTokyo",
    "narita-to-ueno": "omioNaritaAirportToUeno",
    "narita-to-asakusa": "omioNaritaAirportToAsakusa",
    "haneda-to-shinjuku": "omioHanedaAirportToShinjuku",
    "haneda-to-tokyo-station": "omioHanedaAirportToTokyo",
    "haneda-to-ueno": "omioHanedaAirportToUeno",
    "haneda-to-asakusa": "omioHanedaAirportToAsakusa",
    "kansai-airport-to-kyoto": "omioKansaiAirportToKyoto",
    "kyoto-to-kansai-airport": "omioKansaiAirportToKyoto",
    "kansai-airport-to-namba": "omioKansaiAirportToNamba",
    "kansai-airport-to-umeda": "omioKansaiAirportToOsaka",
    "osaka-to-kansai-airport": "omioKansaiAirportToOsaka",
  };
  const routeLinkId = routeIds[slug];
  const routeHref = routeLinkId ? getReadyAffUrl(routeLinkId) : null;
  if (routeLinkId && routeHref) {
    const specificity = getAffiliateConfig(routeLinkId)?.urlSpecificity;
    if (specificity === "route_search_prefilled" || specificity === "route_specific_page") {
      return null;
    }
    return { href: routeHref, linkId: routeLinkId };
  }

  const fallbackIds = ["omioJapanAirportTransfer", "omioJapanTrain", "omioJapanBus"];
  const fallbackLinkId = fallbackIds.find((id) => getReadyAffUrl(id, { allowFallback: true }));
  if (!fallbackLinkId) return null;
  const url = getReadyAffUrl(fallbackLinkId, { allowFallback: true });
  if (!url) return null;
  return {
    href: url,
    linkId: fallbackLinkId,
  };
}

function ContinuePlanningCards({ locale, pagePath }: { locale: string; pagePath: string }) {
  const ui = getAirportRouteUiCopy(locale);
  return (
    <AirportNextSteps
      sourcePage={pagePath}
      placement="airport_route_next_steps"
      locale={locale}
      cards={[
        {
          title: ui.nextCards[0].title,
          body: ui.nextCards[0].body,
          label: ui.nextCards[0].label,
          href: "/areas-to-stay",
          icon: <Bed className="h-4 w-4 text-[#106b43]" />,
        },
        {
          title: ui.nextCards[1].title,
          body: ui.nextCards[1].body,
          label: ui.nextCards[1].label,
          href: ESIM_URL,
          icon: <Wifi className="h-4 w-4 text-[#106b43]" />,
          external: true,
          category: "esim",
          provider: "klook",
          placement: "airport_route_esim",
          linkId: "esim",
          product: "esim",
        },
        {
          title: ui.nextCards[2].title,
          body: ui.nextCards[2].body,
          label: ui.nextCards[2].label,
          href: "/guide",
          icon: <Train className="h-4 w-4 text-[#106b43]" />,
        },
        {
          title: ui.nextCards[3].title,
          body: ui.nextCards[3].body,
          label: ui.nextCards[3].label,
          href: "/itineraries/7-day-first-time-japan",
          icon: <CalendarDays className="h-4 w-4 text-[#106b43]" />,
        },
      ]}
    />
  );
}

export async function generateStaticParams() {
  return getAllTransferSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getTransferBySlug(slug);
  if (!page) return {};
  const image = getAirportTransferRouteImage(slug);
  const title = localizedRouteTitle(page, locale);
  const description = localizedRouteDescription(page, locale);
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: "fujiseat",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    alternates: getAlternates(`/airport-transfers/${slug}`, locale),
  };
}

export default async function TransferPage({ params }: Props) {
  const { slug, locale } = await params;
  const page = getTransferBySlug(slug);
  if (!page) notFound();
  const ui = getAirportRouteUiCopy(locale);
  const pagePath = `/airport-transfers/${slug}`;
  const bestOption = page.options[0];
  const enhanced = getEnhancedRouteCopy(slug, page, bestOption.name);
  const specific = routeSpecific(locale, slug);
  const routeTitle = localizedRouteTitle(page, locale);
  const routeDescription = localizedRouteDescription(page, locale);
  const image = getAirportTransferRouteImage(slug);
  const compareLink = routeCompareLink(slug);
  const firstNightHotelAreas = hotelAreasForTransferRoute(slug);

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: ui.breadcrumb, href: "/" },
          { label: `${page.from} → ${page.to}` },
        ]} />

        {enhanced ? (
          <AirportHeroCard
            label={enhanced.routeLabel}
            title={routeTitle}
            summary={routeDescription}
            image={image}
            imageAlt={`${page.from} arrivals transfer area`}
            fallbackIcon={<Plane className="h-12 w-12" />}
            badges={[
              { label: ui.recommended, value: bestOption.name },
              { label: ui.luggageNote, value: specific?.luggageNote ?? enhanced.luggageNote },
              { label: ui.lateArrival, value: localizedLateArrivalNote(page, locale) },
            ]}
          />
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
              {routeTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {routeDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Plane className="h-4 w-4 text-sky-600" />
                {page.from}
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-500" />
                {page.to}
              </span>
            </div>
          </>
        )}

        <div className="mt-8 space-y-8">
          <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
              {ui.quickAnswer}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              {specific?.quickTitle ?? (locale === "en" ? enhanced.quickTitle : `${ui.recommended}: ${bestOption.name}`)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {specific?.quickBody ?? (locale === "en" ? enhanced.quickBody : routeDescription)}
            </p>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">First-night hotel base</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Best first-night hotel areas for this arrival route</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Choose the hotel base with the transfer. Train is enough for many travelers, while airport bus or private transfer may be better for late arrival, kids, or heavy luggage.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {firstNightHotelAreas.map((area) => {
                const choices = hotelProviderChoices(area.hotelKey, "airport_page_first_night_cta", locale);
                return (
                  <article key={area.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h3 className="text-lg font-semibold text-slate-950">{area.title}</h3>
                    <dl className="mt-3 grid gap-2 text-sm leading-6">
                      <div>
                        <dt className="font-semibold text-[#106b43]">Good if</dt>
                        <dd className="text-slate-700">{area.goodIf}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-amber-700">Who should avoid it</dt>
                        <dd className="text-slate-700">{area.avoidIf}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Airport / luggage logic</dt>
                        <dd className="text-slate-700">{area.logic}</dd>
                      </div>
                    </dl>
                    <ProviderChoiceCTA
                      actionLabel={`Compare hotels in ${area.title}`}
                      description="Broad area search only. Check exact station distance, room size, bed setup, and latest price on the provider site."
                      providers={choices}
                      maxProviders={3}
                      pagePath={pagePath}
                      locale={locale}
                      area={area.title}
                      city={area.city}
                      className="mt-4"
                    />
                  </article>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/areas-to-stay/tokyo-stay-area-index", label: "Open Tokyo Hotel Area Finder" },
                { href: stayHrefForRoute(slug), label: "First-time hotel base guide" },
                { href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Hotel base with luggage" },
                { href: "/local-hotel-picks#hotel-examples-matrix", label: "Local hotel examples" },
              ].map((link) => (
                <TrackedInternalLink
                  key={link.href}
                  href={link.href}
                  sourcePage={pagePath}
                  placement="airport_page_first_night_cta"
                  label={link.label}
                  locale={locale}
                  className="inline-flex min-h-9 items-center rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                >
                  {link.label} →
                </TrackedInternalLink>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">{ui.compareTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{ui.compareBody}</p>
            <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
              {ui.fareDisclaimer}
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-1">
              {page.options.map((opt) => (
                <TransferOption key={opt.name} {...opt} locale={locale} pagePath={pagePath} placement={transferOptionPlacement(opt.name)} />
              ))}
            </div>
          </section>

          {compareLink ? (
            <AirportRouteCompareCard
              href={compareLink.href}
              linkId={compareLink.linkId}
              pagePath={pagePath}
              locale={locale}
              title={ui.compareRouteTitle}
              body={ui.compareRouteBody}
            />
          ) : null}

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-700">
              {ui.luggageLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {ui.luggageBody}
            </p>
          </section>

          <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div>
              <p className="text-xs font-semibold text-sky-900">{ui.lateQuestion}</p>
              <p className="mt-0.5 text-xs leading-5 text-sky-800">{localizedLateArrivalNote(page, locale)}</p>
            </div>
          </div>

          <ProTip>{localizedProTip(page, locale)}</ProTip>

          {enhanced ? (
            <>
              <ArrivalSetupCard
                title={ui.arrivalTitle}
                body={specific?.arrivalSetupBody ?? enhanced.arrivalSetupBody}
                ctaLabel={ui.arrivalCta}
                href={enhanced.stayHref}
                placement="airport_route_arrival_setup"
                sourcePage={pagePath}
                locale={locale}
                city={enhanced.stayHref.includes("kyoto") ? "kyoto" : enhanced.stayHref.includes("osaka") ? "osaka" : "tokyo"}
              />
              <ContinuePlanningCards locale={locale} pagePath={pagePath} />
            </>
          ) : (
            <>
              <NextActions
                picks={page.nextActions.map((pick) => localizeTripPick(pick, locale))}
                title={ui.compareTitle}
                subtitle={ui.compareBody}
                maxItems={4}
                locale={locale}
                pagePath={pagePath}
              />
              <SuggestedNextSteps currentPageType="transfer" locale={locale} />
            </>
          )}
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
