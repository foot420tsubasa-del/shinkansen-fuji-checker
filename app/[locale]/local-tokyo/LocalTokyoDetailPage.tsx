import type { Metadata } from "next";
import Image from "next/image";
import { Building2, Coffee, Landmark, MapPinned, Palette, ShoppingBag, Swords } from "lucide-react";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import {
  AvoidIfList,
  BestForList,
  HalfDayRoute,
  HotelAreaCTA,
} from "@/components/content/LocalTokyoCards";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";

const pageConfig = {
  "kiyosumi-shirakawa": {
    image: "/design-home-assets/quiet-kiyosumi.jpg",
    path: "/local-tokyo/kiyosumi-shirakawa",
    Icon: Coffee,
    extraIcon: null,
  },
  kuramae: {
    image: "/design-home-assets/quiet-kuramae.jpg",
    path: "/local-tokyo/kuramae",
    Icon: Palette,
    extraIcon: null,
  },
  "monzen-nakacho": {
    image: "/design-home-assets/quiet-monzen-nakacho.jpg",
    path: "/local-tokyo/monzen-nakacho",
    Icon: Landmark,
    extraIcon: null,
  },
  oshiage: {
    image: "/design-home-assets/quiet-oshiage.jpg",
    path: "/local-tokyo/oshiage",
    Icon: Building2,
    extraIcon: ShoppingBag,
  },
  "suitengumae-ningyocho": {
    image: "/design-home-assets/quiet-suitengumae.png",
    path: "/local-tokyo/suitengumae-ningyocho",
    Icon: MapPinned,
    extraIcon: null,
  },
  ryogoku: {
    image: "/design-home-assets/quiet-ryogoku.jpg",
    path: "/local-tokyo/ryogoku",
    Icon: Swords,
    extraIcon: null,
  },
} as const;

const SITE_URL = "https://fujiseat.com";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export type LocalTokyoPageKey = keyof typeof pageConfig;

type LocalTokyoCta = {
  title: string;
  description: string;
  href: string;
};

type DeveloperPick = {
  name: string;
  description: string;
  href: string;
  linkLabel: string;
};

type LocalTokyoOptionalFields = {
  localNote?: string;
  bestTimeToVisit?: string;
  avoidIf?: string[];
  walkingRoute?: string[];
  photoSpots?: string[];
  nearbyStations?: string[];
  combineWithAreas?: string[];
};

type LocalTokyoConfig = (typeof pageConfig)[LocalTokyoPageKey] & LocalTokyoOptionalFields;

type LocalTokyoDetailProps = {
  locale: string;
  pageKey: LocalTokyoPageKey;
};

export async function getLocalTokyoMetadata(
  locale: string,
  pageKey: LocalTokyoPageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `localTokyoPages.${pageKey}` });
  const config: LocalTokyoConfig = pageConfig[pageKey];
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: "fujiseat.com",
    },
    alternates: getAlternates(config.path, locale),
  };
}

export async function LocalTokyoDetailPage({ locale, pageKey }: LocalTokyoDetailProps) {
  const t = await getTranslations({ locale, namespace: `localTokyoPages.${pageKey}` });
  const common = await getTranslations({ locale, namespace: "localTokyoPages.common" });
  const config: LocalTokyoConfig = pageConfig[pageKey];
  const Icon = config.Icon;
  const ExtraIcon = config.extraIcon;
  const nearby = t.raw("nearby") as LocalTokyoCta[];
  const sidebar = t.raw("sidebar") as LocalTokyoCta[];
  const developerPicks = pageKey === "kiyosumi-shirakawa"
    ? t.raw("developerPicks.items") as DeveloperPick[]
    : [];
  const pageUrl = localizedUrl(locale, config.path);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localizedUrl(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Local Tokyo",
        item: localizedUrl(locale, "/local-tokyo"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t("title"),
        item: pageUrl,
      },
    ],
  };
  const touristDestinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: t("title"),
    description: t("description"),
    url: pageUrl,
    image: `${SITE_URL}${config.image}`,
    inLanguage: locale,
    containedInPlace: {
      "@type": "City",
      name: "Tokyo",
      addressCountry: "JP",
    },
    touristType: ["Independent travelers", "Japan first-time visitors", "Repeat Tokyo visitors"],
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id={`breadcrumb-local-tokyo-${pageKey}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id={`tourist-destination-${pageKey}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_48%,#edf7ff)] shadow-[0_18px_45px_rgba(9,35,70,0.08)]">
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="p-6 md:p-9">
              <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
                {common("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-[#082653] md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{t("description")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/areas-to-stay/tokyo-first-time" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#0f6f45]">
                  {common("compareBases")}
                  <MapPinned className="h-4 w-4" />
                </Link>
                <Link href="/itineraries/7-day-first-time-japan" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#9fd7bd] bg-white px-5 text-sm font-extrabold text-[#106b43] transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]">
                  {common("placeItinerary")}
                  <MapPinned className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative hidden min-h-[280px] lg:block">
              <Image src={config.image} alt={t("imageAlt")} fill sizes="320px" className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">{common("quickAnswer")}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <h2 className="text-sm font-bold text-[#082653]">{common("bestFor")}</h2>
              <div className="mt-2">
                <BestForList items={t.raw("bestFor") as string[]} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#082653]">{common("notBestFor")}</h2>
              <div className="mt-2">
                <AvoidIfList items={t.raw("notBestFor") as string[]} />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#082653]">{common("bestTiming")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("bestTiming")}</p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#082653]">{common("combineWith")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("combineWith")}</p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[#145aa0]" />
                <h2 className="text-xl font-bold text-[#082653]">{common("whyVisit")}</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t("whyVisit")}</p>
            </section>

            {ExtraIcon ? (
              <section>
                <div className="flex items-center gap-2">
                  <ExtraIcon className="h-5 w-5 text-[#145aa0]" />
                  <h2 className="text-xl font-bold text-[#082653]">{t("extra.title")}</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t("extra.body")}</p>
              </section>
            ) : null}

            <section>
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-[#145aa0]" />
                <h2 className="text-xl font-bold text-[#082653]">{common("halfDayRoute")}</h2>
              </div>
              <div className="mt-5">
                <HalfDayRoute stops={t.raw("route") as string[]} />
              </div>
            </section>

            {developerPicks.length ? (
              <section className="rounded-[22px] border border-[#d9e5f2] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-[#145aa0]" />
                  <h2 className="text-xl font-bold text-[#082653]">{t("developerPicks.title")}</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t("developerPicks.description")}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {developerPicks.map((pick) => (
                    <article key={pick.name} className="flex h-full flex-col rounded-[16px] border border-slate-200 bg-[#f8fbff] p-4">
                      <h3 className="text-sm font-bold text-[#082653]">{pick.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{pick.description}</p>
                      <div className="mt-auto pt-4">
                        <a
                          href={pick.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${pick.name} Instagram`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]"
                        >
                          <span className="flex h-[32px] w-[32px] items-center justify-center">
                            <Image src="/instagram-glyph-gradient.svg" alt="" width={29} height={29} aria-hidden="true" />
                          </span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-[#082653]">{common("shouldStay")}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t("shouldStay")}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#082653]">{common("nearbyHotels")}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {nearby.map((item) => (
                  <HotelAreaCTA key={`${item.href}-${item.title}`} title={item.title} description={item.description} href={item.href} />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            {sidebar.map((item) => (
              <HotelAreaCTA key={`${item.href}-${item.title}`} title={item.title} description={item.description} href={item.href} />
            ))}
          </aside>
        </div>
      </Container>
    </main>
  );
}
