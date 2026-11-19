import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { stayPages, type StayPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getTranslations } from "next-intl/server";
import { StayFinder } from "@/components/stay/StayFinder";
import { rankAreas, type LegResult } from "@/lib/stay-finder";
import { getFinderAreas, getFinderDestinations, getFinderLineNotes, POPULAR_COMBOS } from "@/lib/stay-finder-data";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import { Link } from "@/i18n/navigation";
import { StayCityGuides } from "@/components/stay/StayCityGuides";
import design from "@/data/stay-hub-design.json";

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

/* The "choose your city" section was removed on 2026-09-29. All four of its
   cards led to pages folded the same day: Kyoto, Osaka and Kawaguchiko have no
   surviving stay content, and the Tokyo card opened the retired tokyo-hotels
   parent. What remains under /areas-to-stay is four Tokyo station-area
   comparisons, so the hub lists those instead of offering doors that redirect
   straight back to it. */

const guideGroups = [
  {
    cityKey: "tokyo",
    // The five comparison pages still in the index; everything else under
    // /areas-to-stay was folded on 2026-09-29.
    slugs: [
      "asakusa-vs-ueno",
      "ueno-vs-shinjuku",
      "tokyo-station-vs-shinjuku",
      "shinjuku-vs-ueno-vs-asakusa",
    ],
  },
] as const;

const quickAnswerKeys = ["firstTime", "narita", "shinkansen", "quiet"] as const;


function pageBySlug(slug: string) {
  return stayPages.find((page) => page.slug === slug);
}

function GuideCard({
  page,
  title,
  description,
  tags,
  locale,
  pagePath,
}: {
  page: StayPage;
  title: string;
  description: string;
  tags: string[];
  locale: string;
  pagePath: string;
}) {
  return (
    <TrackedInternalLink
      href={`/areas-to-stay/${page.slug}`}
      sourcePage={pagePath}
      placement="stay_hub_featured_guide"
      label={title}
      locale={locale}
      className="group block min-h-11 rounded px-1 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold leading-5 text-ink group-hover:underline">{title}</h3>
          <p className="mt-1.5 text-sm leading-5 text-slate-600">
            {description}
          </p>
          <p className="mt-1 text-xs text-slate-600">{tags.slice(0, 3).join(" · ")}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#106b43]" aria-hidden="true" />
      </div>
    </TrackedInternalLink>
  );
}

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
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.current") },
          ]}
        />

        {locale === "en" ? (
          <nav aria-label={design.cityLabel} className="mt-5 flex flex-wrap gap-x-4 border-b border-slate-200 text-sm font-bold text-ink [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:underline [&_a]:underline-offset-4">
            <a href="#stay-finder">{t("featuredGuides.groups.tokyo")}</a>
            {design.cities.map(({ id }) => <a key={id} href={`#${id}`}>{t(`featuredGuides.groups.${id}`)}</a>)}
            <Link href="/stays/mt-fuji-view">{design.photoLink}</Link>
          </nav>
        ) : null}
        <section id="stay-finder" className="mt-6 scroll-mt-20">
          <StayFinder areas={finderAreas} destinations={finderDestinations} lineNotes={lineNotes} hotelPicks={hotelPicks} />
        </section>

        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{t("finder.popularTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("finder.popularIntro")}</p>
          <ul className="mt-4 grid gap-x-8 md:grid-cols-2">
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
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t("quickAnswerTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("quickAnswerIntro")}</p>
          </div>
          <ul className="mt-4 grid gap-x-8 md:grid-cols-2">
            {quickAnswerKeys.map((key) => (
              <li key={key} className="border-b border-slate-200 py-3 text-[15px] leading-6 text-slate-700">
                {t(`quickAnswersNew.${key}`)}
              </li>
            ))}
          </ul>
        </section>


        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("detailedGuides.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("detailedGuides.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("detailedGuides.body")}</p>
          <div className="mt-5">
            {guideGroups.map((group) => {
              const pages = group.slugs.map(pageBySlug).filter((page): page is StayPage => Boolean(page));
              return (
                <section key={group.cityKey} aria-label={t(`featuredGuides.groups.${group.cityKey}`)}>
                  <div className="grid gap-x-8 md:grid-cols-2 [&>a]:border-b [&>a]:border-slate-200">
                    {pages.map((page) => (
                      <GuideCard
                        key={page.slug}
                        page={page}
                        title={t(`featuredGuides.guides.${page.slug}.title`)}
                        description={t(`featuredGuides.guides.${page.slug}.description`)}
                        tags={t.raw(`featuredGuides.guides.${page.slug}.tags`) as string[]}
                        locale={locale}
                        pagePath={pagePath}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* The room-size guide is in the sitemap but is not a stayPages slug,
              so the grid above never listed it — leaving an indexed page with
              no way in. */}
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-hotel-room-size-guide"
            sourcePage={pagePath}
            placement="stay_hub_room_size_guide"
            label={t("roomSizeGuide.title")}
            locale={locale}
            className="group mt-4 block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <h3 className="text-sm font-semibold leading-5 text-slate-950 group-hover:text-[#106b43]">
              {t("roomSizeGuide.title")}
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">{t("roomSizeGuide.description")}</p>
          </TrackedInternalLink>
        </section>

        {locale === "en" ? <StayCityGuides disclosure={t("finder.disclosure")} /> : null}
      </Container>
      <SiteFooter />
    </main>
  );
}
