import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Coffee, MapPinned } from "lucide-react";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { getAlternates } from "@/i18n/hreflang";
import {
  HalfDayRoute,
  HotelAreaCTA,
  LocalLensCard,
  type LocalLensPick,
} from "@/components/content/LocalTokyoCards";

type Props = {
  params: Promise<{ locale: string }>;
};

const SITE_URL = "https://fujiseat.com";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "localTokyoIndex" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
      images: [{ url: "https://fujiseat.com/og-local-tokyo.png", width: 1200, height: 630 }],
    },
    alternates: getAlternates("/local-tokyo", locale),
  };
}

export default async function LocalTokyoPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "localTokyoIndex" });
  const h = await getTranslations({ locale, namespace: "home" });
  const localPicks: LocalLensPick[] = [
    { name: h("localTokyo.kiyosumi.name"), summary: h("localTokyo.kiyosumi.summary"), bestFor: h("localTokyo.kiyosumi.bestFor"), avoidIf: h("localTokyo.kiyosumi.avoidIf"), timing: h("localTokyo.kiyosumi.timing"), href: "/local-tokyo/kiyosumi-shirakawa", image: "/design-home-assets/quiet-kiyosumi.jpg" },
    { name: h("localTokyo.kuramae.name"), summary: h("localTokyo.kuramae.summary"), bestFor: h("localTokyo.kuramae.bestFor"), avoidIf: h("localTokyo.kuramae.avoidIf"), timing: h("localTokyo.kuramae.timing"), href: "/local-tokyo/kuramae", image: "/design-home-assets/quiet-kuramae.jpg" },
    { name: h("localTokyo.monzenNakacho.name"), summary: h("localTokyo.monzenNakacho.summary"), bestFor: h("localTokyo.monzenNakacho.bestFor"), avoidIf: h("localTokyo.monzenNakacho.avoidIf"), timing: h("localTokyo.monzenNakacho.timing"), href: "/local-tokyo/monzen-nakacho", image: "/design-home-assets/quiet-monzen-nakacho.jpg" },
    { name: h("localTokyo.ryogoku.name"), summary: h("localTokyo.ryogoku.summary"), bestFor: h("localTokyo.ryogoku.bestFor"), avoidIf: h("localTokyo.ryogoku.avoidIf"), timing: h("localTokyo.ryogoku.timing"), href: "/local-tokyo/ryogoku", image: "/design-home-assets/quiet-ryogoku.jpg" },
    { name: h("localTokyo.oshiage.name"), summary: h("localTokyo.oshiage.summary"), bestFor: h("localTokyo.oshiage.bestFor"), avoidIf: h("localTokyo.oshiage.avoidIf"), timing: h("localTokyo.oshiage.timing"), href: "/local-tokyo/oshiage", image: "/design-home-assets/quiet-oshiage.jpg" },
    { name: h("localTokyo.suitengumae.name"), summary: h("localTokyo.suitengumae.summary"), bestFor: h("localTokyo.suitengumae.bestFor"), avoidIf: h("localTokyo.suitengumae.avoidIf"), timing: h("localTokyo.suitengumae.timing"), href: "/local-tokyo/suitengumae-ningyocho", image: "/design-home-assets/quiet-suitengumae.png" },
  ];
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
    ],
  };
  const destinationListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    description: t("description"),
    itemListElement: localPicks.map((pick, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "TouristDestination",
        name: pick.name,
        description: pick.summary,
        url: localizedUrl(locale, pick.href),
        image: pick.image ? `${SITE_URL}${pick.image}` : undefined,
        containedInPlace: {
          "@type": "City",
          name: "Tokyo",
          addressCountry: "JP",
        },
      },
    })),
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="breadcrumb-local-tokyo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="tourist-destination-list-local-tokyo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationListSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff_45%,#edf7ff)] shadow-[0_18px_45px_rgba(9,35,70,0.08)]">
          <div className="grid lg:grid-cols-[1fr_320px]">
            <div className="p-6 md:p-9">
              <p className="inline-flex rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
                {t("eyebrow")}
              </p>
              <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-[#082653] md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {t("description")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/local-tokyo/kiyosumi-shirakawa" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#246449]">
                  {t("startCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/areas-to-stay/tokyo-first-time" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#9fd7bd] bg-white px-5 text-sm font-extrabold text-[#106b43] transition-colors hover:border-[#2E7D5B] hover:bg-[#f0fbf6]">
                  {t("compareCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative hidden min-h-[280px] lg:block">
              <Image
                src="/design-home-assets/quiet-kiyosumi.jpg"
                alt={t("imageAlt")}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">{t("quickLabel")}</p>
            <h2 className="mt-2 text-xl font-bold text-[#082653]">{t("quickTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("quickBody")}
            </p>
          </section>
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">{t("routeLabel")}</p>
            <div className="mt-3 flex items-start gap-3">
              <Coffee className="mt-1 h-5 w-5 shrink-0 text-[#145aa0]" />
              <p className="text-sm leading-6 text-slate-600">
                {t("routeBody")}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-[#145aa0]" />
            <h2 className="text-xl font-bold text-[#082653]">{t("areaCards")}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {localPicks.map((pick) => (
              <LocalLensCard key={pick.name} pick={pick} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-xl font-bold text-[#082653]">{t("halfDayTitle")}</h2>
            <div className="mt-5">
              <HalfDayRoute
                stops={t.raw("halfDayStops") as string[]}
              />
            </div>
          </div>
          <div className="space-y-3">
            {(t.raw("ctas") as { title: string; description: string; href: string }[]).map((cta) => (
              <HotelAreaCTA key={`${cta.href}-${cta.title}`} title={cta.title} description={cta.description} href={cta.href} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
