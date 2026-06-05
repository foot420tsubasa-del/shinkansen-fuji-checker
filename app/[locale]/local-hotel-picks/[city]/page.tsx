import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import {
  getHotelPicksByCity,
  LOCAL_HOTEL_PICK_CITIES,
  normalizeLocalHotelPickCity,
  type LocalHotelPick,
  type LocalHotelPickCity,
} from "@/lib/content/local-hotel-picks";
import { SiteHeader } from "../../components/SiteHeader";
import { HotelPickMatrix } from "../HotelPickMatrix";
import { LocalHotelPickCard } from "../LocalHotelPickCard";

type Props = {
  params: Promise<{ locale: string; city: string }>;
};

type CityHotelPickGroup = {
  key: string;
  title: string;
  body: string;
  pickIds: string[];
  fallbackHref: string;
  fallbackLabel: string;
};

type CityHotelPickPageConfig = {
  slug: string;
  city: LocalHotelPickCity;
  title: string;
  guideHref: string;
  guideLabel: string;
  comparisonLinks: Array<{ href: string; label: string }>;
  groups: CityHotelPickGroup[];
};

const cityPageConfigs: Record<LocalHotelPickCity, CityHotelPickPageConfig> = {
  Tokyo: {
    slug: "tokyo",
    city: "Tokyo",
    title: "Tokyo Local Hotel Picks",
    guideHref: "/areas-to-stay/tokyo-first-time",
    guideLabel: "Where to stay in Tokyo for first-time visitors",
    comparisonLinks: [
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Tokyo Hotel Area Finder" },
      { href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Compare Tokyo hotel bases" },
      { href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Tokyo with luggage" },
    ],
    groups: [
      {
        key: "calm-shinjuku",
        title: "Calm Shinjuku",
        body: "Shinjuku access without sleeping in the loudest nightlife blocks.",
        pickIds: ["yuenShinjuku", "daiwaRoynetNishiShinjuku", "theKnotShinjuku"],
        fallbackHref: "/areas-to-stay/tokyo/shinjuku",
        fallbackLabel: "See Shinjuku micro-area guide",
      },
      {
        key: "narita-east-tokyo",
        title: "Narita / East Tokyo",
        body: "East-side examples for travelers who want a more local-feeling base after choosing the broad area.",
        pickIds: ["citanHostel"],
        fallbackHref: "/local-tokyo",
        fallbackLabel: "See East Tokyo area logic",
      },
      {
        key: "tokyo-station-ginza-logistics",
        title: "Tokyo Station / Ginza logistics",
        body: "For early Shinkansen, first/last nights, and luggage-heavy rail days. No active hotel example is shown until an approved link exists.",
        pickIds: [],
        fallbackHref: "/areas-to-stay/tokyo-station-vs-shinjuku",
        fallbackLabel: "Compare Tokyo Station vs Shinjuku",
      },
      {
        key: "family-group-layout",
        title: "Family / group layout",
        body: "Apartment-style examples where room layout matters more than a famous station name.",
        pickIds: ["mimaruShinjukuWest"],
        fallbackHref: "/areas-to-stay/tokyo-hotel-room-size-guide",
        fallbackLabel: "Check Tokyo room-size guide",
      },
    ],
  },
  Kyoto: {
    slug: "kyoto",
    city: "Kyoto",
    title: "Kyoto Local Hotel Picks",
    guideHref: "/areas-to-stay/kyoto-first-time",
    guideLabel: "Kyoto first-time stay guide",
    comparisonLinks: [
      { href: "/areas-to-stay/kyoto-station-vs-gion", label: "Compare Kyoto Station vs Gion" },
      { href: "/airport-transfers/kansai-airport-to-kyoto", label: "Kansai Airport to Kyoto" },
      { href: "/areas-to-stay/where-to-stay-before-shinkansen", label: "Hotel base before Shinkansen" },
    ],
    groups: [
      {
        key: "kyoto-station-logistics",
        title: "Kyoto Station logistics",
        body: "Useful for Kansai Airport, JR Haruka, Shinkansen days, and luggage-heavy first nights.",
        pickIds: ["theThousandKyoto", "mimaruKyotoStation"],
        fallbackHref: "/areas-to-stay/kyoto-station-vs-gion",
        fallbackLabel: "Compare Kyoto Station vs Gion",
      },
      {
        key: "gion-classic-kyoto",
        title: "Gion / classic Kyoto",
        body: "Better when atmosphere matters more than the simplest rail logistics.",
        pickIds: ["nohgaKiyomizu"],
        fallbackHref: "/areas-to-stay/kyoto-station-vs-gion",
        fallbackLabel: "Compare Kyoto Station vs Gion",
      },
      {
        key: "gojo-quieter-practical-base",
        title: "Gojo / quieter practical base",
        body: "Practical examples for travelers who want calmer streets or a less obvious Kyoto base.",
        pickIds: ["sequenceKyotoGojo", "nokuKyoto"],
        fallbackHref: "/areas-to-stay/kyoto-station-vs-gion",
        fallbackLabel: "Compare Kyoto stay areas",
      },
    ],
  },
  Osaka: {
    slug: "osaka",
    city: "Osaka",
    title: "Osaka Local Hotel Picks",
    guideHref: "/areas-to-stay/osaka-first-time",
    guideLabel: "Osaka first-time stay guide",
    comparisonLinks: [
      { href: "/areas-to-stay/namba-vs-umeda", label: "Compare Namba vs Umeda" },
      { href: "/areas-to-stay/shin-osaka-vs-namba", label: "Compare Shin-Osaka vs Namba" },
      { href: "/airport-transfers/kansai-airport-to-namba", label: "Kansai Airport to Namba" },
    ],
    groups: [
      {
        key: "namba-food-nightlife",
        title: "Namba / food and nightlife",
        body: "Good when food, Dotonbori, and Kansai Airport Nankai access matter.",
        pickIds: ["hotelRoyalClassicOsaka", "swissotelNankaiOsaka"],
        fallbackHref: "/areas-to-stay/namba-vs-umeda",
        fallbackLabel: "Compare Namba vs Umeda",
      },
      {
        key: "umeda-transport",
        title: "Umeda / transport",
        body: "Useful for JR connections, shopping, and a north Osaka base.",
        pickIds: ["hotelHankyuRespire", "zentisOsaka"],
        fallbackHref: "/areas-to-stay/namba-vs-umeda",
        fallbackLabel: "Compare Namba vs Umeda",
      },
      {
        key: "shin-osaka-shinkansen",
        title: "Shin-Osaka / Shinkansen",
        body: "For Shinkansen-first logistics. No active hotel example is shown until an approved link exists.",
        pickIds: [],
        fallbackHref: "/areas-to-stay/shin-osaka-vs-namba",
        fallbackLabel: "Compare Shin-Osaka vs Namba",
      },
      {
        key: "family-group-layout",
        title: "Family / group layout",
        body: "Apartment-style examples where room layout and luggage space matter.",
        pickIds: ["mimaruOsakaNamba"],
        fallbackHref: "/areas-to-stay/namba-vs-umeda",
        fallbackLabel: "Compare Osaka hotel bases",
      },
    ],
  },
};

function configForCitySlug(slug: string) {
  const city = normalizeLocalHotelPickCity(slug);
  return city ? cityPageConfigs[city] : null;
}

function picksById(picks: LocalHotelPick[]) {
  return new Map(picks.map((pick) => [pick.id, pick]));
}

export function generateStaticParams() {
  return LOCAL_HOTEL_PICK_CITIES.map((city) => ({ city: city.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city } = await params;
  const config = configForCitySlug(city);
  if (!config) return {};

  const path = `/local-hotel-picks/${config.slug}`;

  return {
    title: `${config.title} | fujiseat`,
    description: `Not rankings. Practical ${config.city} hotel examples by area logic before checking live prices, room size, bed setup, and station distance.`,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(path, locale),
    openGraph: {
      title: config.title,
      description: `Practical ${config.city} hotel examples by area logic. Not rankings.`,
      siteName: "fujiseat",
    },
  };
}

export default async function CityLocalHotelPicksPage({ params }: Props) {
  const { locale, city } = await params;
  const config = configForCitySlug(city);
  if (!config) notFound();

  const pagePath = `/local-hotel-picks/${config.slug}`;
  const picks = getHotelPicksByCity(config.city);
  const allPicksById = picksById(picks);

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { href: "/", label: "Home" },
            { href: "/local-hotel-picks", label: "Local hotel examples" },
            { label: config.title },
          ]}
        />

        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">City hotel examples</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Not rankings. Practical hotel examples by area logic before checking live prices.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <TrackedInternalLink
              href={config.guideHref}
              sourcePage={pagePath}
              placement="city_hotel_picks_hero"
              label={config.guideLabel}
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl bg-[#168a56] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {config.guideLabel}
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/local-hotel-picks"
              sourcePage={pagePath}
              placement="city_hotel_picks_hero"
              label="All city examples"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              All city examples
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">How to use these examples</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Choose the area first, then use these hotel examples to understand the kind of stay that fits that area. Before booking, check room size, bed setup, exact station distance, current price, cancellation rules, and recent provider-site details.
          </p>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="city_hotel_picks_area_logic"
          locale={locale}
          className="mt-6"
          showFinderLink={config.city === "Tokyo"}
          note={
            config.city === "Tokyo"
              ? undefined
              : "These city examples use the same area-first logic: choose the station area before comparing provider listings. This is not an official ranking."
          }
        />

        <section id="hotel-examples-matrix" className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{config.city} matrix</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{config.city} hotel examples matrix</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compare active examples by area logic, room style, and travel situation. This does not rank individual hotels.
            </p>
          </div>
          <HotelPickMatrix picks={picks} locale={locale} pagePath={pagePath} />
        </section>

        <div className="mt-8 space-y-6">
          {config.groups.map((group) => {
            const groupPicks = group.pickIds
              .map((id) => allPicksById.get(id))
              .filter(Boolean) as LocalHotelPick[];

            return (
              <section key={group.key} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 shadow-sm md:p-5">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Area logic</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">{group.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{group.body}</p>
                  </div>
                  <TrackedInternalLink
                    href={group.fallbackHref}
                    sourcePage={pagePath}
                    placement="city_hotel_picks_area_logic"
                    label={group.fallbackLabel}
                    locale={locale}
                    className="text-sm font-semibold text-[#106b43] underline underline-offset-4"
                  >
                    {group.fallbackLabel}
                  </TrackedInternalLink>
                </div>

                {groupPicks.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groupPicks.map((pick) => (
                      <LocalHotelPickCard
                        key={pick.id}
                        pick={pick}
                        locale={locale}
                        pagePath={pagePath}
                        groupLabel={group.title}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[18px] border border-dashed border-slate-300 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">No active hotel example here yet.</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      This section stays area-first until an approved Trip.com hotel example URL exists.
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Continue planning</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[{ href: "/areas-to-stay", label: "Choose a Japan hotel area" }, ...config.comparisonLinks].map((link) => (
              <TrackedInternalLink
                key={link.href}
                href={link.href}
                sourcePage={pagePath}
                placement="city_hotel_picks_continue"
                label={link.label}
                locale={locale}
                className="flex flex-col rounded-2xl border border-[#168a56] bg-[#168a56] p-4 text-white transition-colors hover:bg-[#0f6f45]"
              >
                <span className="text-sm font-semibold text-white">{link.label}</span>
                <span className="mt-1 text-xs leading-5 text-white/80">Use the area logic before opening hotel booking sites.</span>
              </TrackedInternalLink>
            ))}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
