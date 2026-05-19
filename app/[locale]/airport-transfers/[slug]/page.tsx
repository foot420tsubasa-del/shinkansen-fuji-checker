import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bed, CalendarDays, Clock, MapPin, Plane, Train, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TransferOption } from "@/components/content/TransferOption";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAllTransferSlugs, getTransferBySlug } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";
import { getAirportTransferRouteImage } from "@/lib/airport-transfer-images";
import { AirportHeroCard, AirportNextSteps, AirportRouteCompareCard, ArrivalSetupCard } from "@/components/airport/AirportTransferUi";
import { ESIM_URL, getReadyAffUrl } from "@/src/affiliateLinks";
import { getAirportRouteUiCopy, localizedLateArrivalNote, localizedProTip, localizedRouteDescription, localizedRouteTitle, localizeTripPick, routeSpecific } from "@/lib/content/airport-transfer-i18n";

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
  if (routeLinkId && routeHref) return { href: routeHref, linkId: routeLinkId };

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
