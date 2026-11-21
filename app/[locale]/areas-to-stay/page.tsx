import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { stayPages } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getTranslations } from "next-intl/server";
import { StayFinder } from "@/components/stay/StayFinder";
import { rankAreas, type LegResult } from "@/lib/stay-finder";
import { getFinderAreas, getFinderDestinations, getFinderLineNotes, POPULAR_COMBOS } from "@/lib/stay-finder-data";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import { Link } from "@/i18n/navigation";
import { StayCityGuides } from "@/components/stay/StayCityGuides";
import design from "@/data/stay-hub-design.json";
import scenicCredits from "@/data/scenic-photo-credits.json";
import destinationCredits from "@/data/stay-destination-photo-credits.json";

type Props = {
  params: Promise<{ locale: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "areasToStayHub.meta" });

  return {
    title: t("title"),
    description: t("description"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/areas-to-stay", locale),
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
      images: [{ url: "https://fujiseat.com/og-default.jpg", width: 1200, height: 630 }],
    },
  };
}

const tokyoGuideSlugs = [
  "asakusa-vs-ueno",
  "ueno-vs-shinjuku",
  "tokyo-station-vs-shinjuku",
  "shinjuku-vs-ueno-vs-asakusa",
] as const;

const quickAnswerKeys = ["firstTime", "narita", "shinkansen", "quiet"] as const;
const photoCredits: Record<string, {
  title: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
}> = { ...scenicCredits, ...destinationCredits };

const guideLinkClass = "group flex min-h-11 items-start justify-between gap-3 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export default async function AreasToStayIndex({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "areasToStayHub" });
  const pagePath = "/areas-to-stay";
  const finderAreas = getFinderAreas();
  const finderDestinations = getFinderDestinations();
  const lineNotes = getFinderLineNotes();
  const hotelPicks = locale === "en" ? Object.fromEntries(
    Object.entries(design.tokyoHotels).map(([areaId, hotelId]) => [areaId, getBookingHotelLink(hotelId)]),
  ) : undefined;
  const popular = POPULAR_COMBOS.map((combo) => {
    const dests = combo
      .map((id) => finderDestinations.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d));
    return { combo, best: rankAreas(finderAreas, dests)[0] };
  }).filter((entry) => entry.best);
  const legLabel = (kind: LegResult["kind"]) =>
    kind === "walk" ? t("finder.walk") : kind === "direct" ? t("finder.direct") : kind === "partial" ? t("finder.partial") : t("finder.transfer");

  return (
    <main className="page-shell min-h-screen text-ink">
      <SiteHeader />
      <article className="mx-auto max-w-[1160px] px-5 pb-16 pt-7 md:pt-11">
        <header className="max-w-[720px]">
          <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[46px] lg:text-[56px]">
            {t("discovery.title")}
          </h1>
          <p className="mt-3 text-base leading-6 text-slate-700 md:text-lg">{t("discovery.sub")}</p>
        </header>

        <nav aria-label={t("discovery.destinationsLabel")} className="mt-6 md:mt-8">
          <ul className="grid grid-cols-2 gap-3 sm:gap-5">
            {design.destinations.map(({ id, href, image, position }, index) => {
              const DestinationLink = href.startsWith("#") ? "a" : Link;
              return (
                <li key={id} className="min-w-0">
                  <DestinationLink href={href} aria-labelledby={`stay-city-${id}`} aria-describedby={`stay-city-${id}-summary`} className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(30,41,59,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(30,41,59,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 sm:aspect-[2/1] lg:aspect-[9/4]">
                      <Image
                        src={image}
                        alt={t(`discovery.cities.${id}.alt`)}
                        fill
                        preload={index === 0}
                        sizes="(min-width: 1160px) 548px, (min-width: 640px) calc((100vw - 60px) / 2), calc((100vw - 52px) / 2)"
                        className="object-cover"
                        style={{ objectPosition: position }}
                      />
                    </div>
                    <div className="relative flex flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
                      <span id={`stay-city-${id}`} className="pr-4 text-[16px] font-extrabold leading-5 tracking-[-0.02em] text-ink group-hover:underline sm:pr-8 sm:text-2xl sm:leading-7">
                        {t(`discovery.cities.${id}.name`)}
                      </span>
                      <p id={`stay-city-${id}-summary`} className="mt-1 text-sm leading-[1.35] text-slate-600 sm:text-[15px]">{t(`discovery.cities.${id}.description`)}</p>
                      <ArrowRight className="absolute right-3 top-3.5 h-3.5 w-3.5 text-slate-600 group-hover:text-ink sm:right-5 sm:top-5 sm:h-5 sm:w-5" aria-hidden="true" />
                    </div>
                  </DestinationLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Plan A of docs/tokyo-special-stays: a second way in, by the room
            rather than the area. English only, like the page it opens. */}
        {locale === "en" ? (
          <Link href="/stays/tokyo-special" className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-[15px] font-bold text-ink shadow-[0_6px_24px_rgba(30,41,59,0.06)] hover:underline">
            <span>Or start with the room: Pokémon Rooms and Tokyo Tower views</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : null}

        <details className="text-xs text-slate-600">
          <summary className="w-fit min-h-11 cursor-pointer content-center underline decoration-slate-300 underline-offset-4 hover:text-ink">
            {t("discovery.credits")}
          </summary>
          <ul className="grid gap-2 pb-3 leading-5">
            {design.destinations.map(({ id, image }) => {
              const credit = photoCredits[image];
              return (
                <li key={id}>
                  {t(`discovery.cities.${id}.name`)} · {credit.author} ·{" "}
                  <a href={credit.source} className="underline underline-offset-2">{credit.title.replace(/\.jpg$/i, "")}</a> ·{" "}
                  <a href={credit.licenseUrl} className="underline underline-offset-2">{credit.license}</a>
                </li>
              );
            })}
          </ul>
          <p className="pb-2">{t("discovery.photoEdits")}</p>
        </details>

        <section id="stay-finder" aria-labelledby="stay-finder-title" tabIndex={-1} className="mt-6 scroll-mt-24 rounded-[22px] border border-slate-200 bg-white p-3.5 md:mt-8 md:p-7">
          <StayFinder areas={finderAreas} destinations={finderDestinations} lineNotes={lineNotes} hotelPicks={hotelPicks} />
          <a href="#kyoto" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
            {t("discovery.compareKyoto")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <details className="group mt-3 border-t border-slate-200">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 pt-2 text-sm font-bold marker:content-none">
              {t("discovery.examples")}
              <ChevronDown className="h-4 w-4 shrink-0 group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="mt-4">
              <h3 className="text-base font-bold">{t("finder.popularTitle")}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{t("finder.popularIntro")}</p>
              <ul className="grid gap-x-8 md:grid-cols-2">
                {popular.map(({ combo, best }) => (
                  <li key={combo.join("+")} className="border-b border-slate-200">
                    <Link href={`/areas-to-stay?go=${combo.join(",")}#stay-finder`} className="group block min-h-11 py-4">
                      <p className="text-base font-bold text-ink group-hover:underline">
                        {best.legs.map((leg) => leg.label).join(" + ")} → {best.area.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {best.legs
                          .map((leg) => `${leg.label}: ${legLabel(leg.kind)}${leg.line ? ` (${leg.line})` : ""}`)
                          .join(" · ")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 grid gap-x-8 gap-y-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
                {quickAnswerKeys.map((key) => <li key={key}>{t(`quickAnswersNew.${key}`)}</li>)}
              </ul>
            </div>
          </details>
        </section>

        <section className="mt-12 md:mt-16" aria-labelledby="stay-guides">
          <h2 id="stay-guides" className="text-2xl font-extrabold tracking-[-0.02em] md:text-[32px]">{t("discovery.guides")}</h2>
          <section id="tokyo" className="mt-6 scroll-mt-24">
            <h3 className="text-xl font-extrabold tracking-[-0.02em]">{t("discovery.tokyoGuides")}</h3>
            <ul className="mt-2 grid gap-x-8 md:grid-cols-2">
              {tokyoGuideSlugs.filter((slug) => stayPages.some((page) => page.slug === slug)).map((slug) => {
                const title = t(`featuredGuides.guides.${slug}.title`);
                return (
                  <li key={slug} className="border-b border-slate-200">
                    <TrackedInternalLink href={`/areas-to-stay/${slug}`} sourcePage={pagePath} placement="stay_hub_featured_guide" label={title} locale={locale} className={guideLinkClass}>
                      <span>
                        <span className="font-bold group-hover:underline">{title}</span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">{t(`featuredGuides.guides.${slug}.description`)}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    </TrackedInternalLink>
                  </li>
                );
              })}
              <li className="border-b border-slate-200">
                <TrackedInternalLink href="/areas-to-stay/tokyo-hotel-room-size-guide" sourcePage={pagePath} placement="stay_hub_room_size_guide" label={t("roomSizeGuide.title")} locale={locale} className={guideLinkClass}>
                  <span>
                    <span className="font-bold group-hover:underline">{t("roomSizeGuide.title")}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{t("roomSizeGuide.description")}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                </TrackedInternalLink>
              </li>
            </ul>
          </section>
          <div className="mt-9 grid gap-9 xl:grid-cols-2 xl:gap-8">
            <StayCityGuides locale={locale} />
          </div>
          <div className="mt-9 border-y border-slate-200">
            <Link href="/stays/mt-fuji-view" className={guideLinkClass}>
              <div>
                <h3 className="text-xl font-extrabold tracking-[-0.02em] group-hover:underline">{t("discovery.fujiGuides")}</h3>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{t("discovery.fujiGuideSub")}</span>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            </Link>
            {/* English only: the activity hub has no translations yet. */}
            {locale === "en" ? (
              <Link href="/things-to-do#tokyo" className={`${guideLinkClass} border-t border-slate-200`}>
                <div>
                  <h3 className="text-xl font-extrabold tracking-[-0.02em] group-hover:underline">Things to book in Tokyo, Kyoto and Osaka</h3>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">teamLab Planets vs Borderless, Tokyo Disney and USJ: where each one is and what to know before you book.</span>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
