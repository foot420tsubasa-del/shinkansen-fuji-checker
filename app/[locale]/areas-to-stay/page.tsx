import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { ArrowRight, BarChart3, Bed, Building2, Landmark, Mountain, Plane, Train, Utensils, Wifi } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/Button";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { stayPages, type StayPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

type CityCard = {
  key: CityCardKey;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  placementLabel: string;
  icon: typeof Building2;
  imageCandidates: string[];
};

type ProblemCard = {
  key: ProblemCardKey;
  title: string;
  href: string;
  cta: string;
  icon: typeof Building2;
};

type CityCardKey = "tokyo" | "kyoto" | "osaka" | "kawaguchiko";
type ProblemCardKey =
  | "notBookedHotels"
  | "firstTime"
  | "earlyShinkansen"
  | "luggage"
  | "narita"
  | "airportAccess"
  | "temples"
  | "foodNightlife"
  | "fujiOvernight";

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
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-areas-to-stay.png", width: 1200, height: 630 }],
    },
  };
}

const cityCardConfigs = [
  {
    key: "tokyo",
    href: "/areas-to-stay/tokyo-first-time",
    icon: Building2,
    imageCandidates: ["/images/stay/tokyo/tokyo-stay-hero.png"],
  },
  {
    key: "kyoto",
    href: "/areas-to-stay/kyoto-first-time",
    icon: Landmark,
    imageCandidates: ["/images/stay/japan/stay-kyoto.jpg", "/images/Kyoto.png"],
  },
  {
    key: "osaka",
    href: "/areas-to-stay/osaka-first-time",
    icon: Utensils,
    imageCandidates: ["/images/stay/japan/stay-osaka.jpg", "/images/Osaka.png"],
  },
  {
    key: "kawaguchiko",
    href: "/areas-to-stay/kawaguchiko",
    icon: Mountain,
    imageCandidates: ["/images/stay/japan/stay-kawaguchiko.jpg", "/images/Kawaguchiko.png"],
  },
] as const satisfies ReadonlyArray<Omit<CityCard, "title" | "subtitle" | "cta" | "placementLabel">>;

const problemCardConfigs = [
  {
    key: "notBookedHotels",
    href: "/areas-to-stay#choose-your-city",
    icon: Bed,
  },
  {
    key: "firstTime",
    href: "/areas-to-stay/tokyo-first-time",
    icon: Bed,
  },
  {
    key: "earlyShinkansen",
    href: "/areas-to-stay/where-to-stay-before-shinkansen",
    icon: Train,
  },
  {
    key: "narita",
    href: "/airport-transfers",
    icon: Plane,
  },
  {
    key: "luggage",
    href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage",
    icon: Bed,
  },
  {
    key: "airportAccess",
    href: "/airport-transfers",
    icon: Plane,
  },
  {
    key: "temples",
    href: "/areas-to-stay/kyoto-first-time",
    icon: Landmark,
  },
  {
    key: "foodNightlife",
    href: "/areas-to-stay/osaka-first-time",
    icon: Utensils,
  },
  {
    key: "fujiOvernight",
    href: "/areas-to-stay/kawaguchiko",
    icon: Mountain,
  },
] as const satisfies ReadonlyArray<Omit<ProblemCard, "title" | "cta">>;

const guideGroups = [
  {
    cityKey: "tokyo",
    slugs: [
      "tokyo-first-time",
      "where-to-stay-before-shinkansen",
      "tokyo-station-vs-shinjuku",
      "ueno-vs-shinjuku",
      "asakusa-vs-ueno",
    ],
  },
  {
    cityKey: "kyoto",
    slugs: ["kyoto-first-time", "kyoto-station-vs-gion"],
  },
  {
    cityKey: "osaka",
    slugs: ["osaka-first-time", "namba-vs-umeda", "shin-osaka-vs-namba"],
  },
  {
    cityKey: "fuji",
    slugs: ["kawaguchiko"],
  },
] as const;

function pageBySlug(slug: string) {
  return stayPages.find((page) => page.slug === slug);
}

function trackedLinkClass(className = "") {
  return [
    "group rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#9fd7bd] hover:bg-[#f7fffb]",
    className,
  ].join(" ");
}

function publicImageIfExists(candidates: string[]) {
  return candidates.find((src) => fs.existsSync(path.join(process.cwd(), "public", src.replace(/^\//, ""))));
}

function CityDecisionCard({ card, locale, pagePath }: { card: CityCard; locale: string; pagePath: string }) {
  const Icon = card.icon;
  const image = publicImageIfExists(card.imageCandidates);

  return (
    <TrackedInternalLink
      href={card.href}
      sourcePage={pagePath}
      placement="stay_hub_city_card"
      label={card.placementLabel}
      locale={locale}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#9fd7bd] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
    >
      {image ? (
        <div className="relative h-52 bg-slate-100">
          <Image src={image} alt={`${card.title} stay area guide`} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center bg-[linear-gradient(135deg,#f8fafc,#ecfdf5)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#9fd7bd] bg-white text-[#106b43] shadow-sm">
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{card.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.subtitle}</p>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-[#106b43]">
          {card.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </TrackedInternalLink>
  );
}

function ProblemCardLink({ item, locale, pagePath }: { item: ProblemCard; locale: string; pagePath: string }) {
  const Icon = item.icon;

  return (
    <TrackedInternalLink
      href={item.href}
      sourcePage={pagePath}
      placement="stay_hub_problem_card"
      label={item.title}
      locale={locale}
      className="group flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-[#9fd7bd] hover:bg-[#f7fffb]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-slate-950">{item.title}</span>
        <span className="mt-1 block text-xs font-semibold text-[#106b43]">{item.cta}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#106b43]" aria-hidden="true" />
    </TrackedInternalLink>
  );
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
      className={trackedLinkClass()}
    >
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-slate-950 group-hover:text-[#106b43]">{title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {tag}
              </span>
            ))}
          </div>
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
  const esimHref = getAffUrl("esim");
  const cityCards: CityCard[] = cityCardConfigs.map((card) => ({
    ...card,
    title: t(`cityCards.${card.key}.title`),
    subtitle: t(`cityCards.${card.key}.subtitle`),
    cta: t(`cityCards.${card.key}.cta`),
    placementLabel: t(`cityCards.${card.key}.placementLabel`),
  }));
  const problemCards: ProblemCard[] = problemCardConfigs.map((item) => ({
    ...item,
    title: t(`problemCards.${item.key}.title`),
    cta: t(`problemCards.${item.key}.cta`),
  }));
  const quickAnswers = [0, 1, 2, 3, 4].map((index) => t(`quickAnswers.${index}`));

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

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            <Bed className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <TrackedInternalLink
                href="/areas-to-stay/tokyo-first-time"
                sourcePage={pagePath}
                placement="stay_hub_hero"
                label={t("hero.primaryCta")}
                locale={locale}
                className={buttonClassName({ variant: "internal", fullWidth: true, size: "lg" })}
              >
                {t("hero.primaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/local-hotel-picks"
                sourcePage={pagePath}
                placement="stay_hub_hero"
                label={t("hero.secondaryCta")}
                locale={locale}
                className={buttonClassName({ variant: "internal", fullWidth: true, size: "lg" })}
              >
                {t("hero.secondaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswerTitle")}</h2>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {quickAnswers.map((answer) => (
              <li key={answer} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {answer}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">{t("preBooking.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{t("preBooking.body")}</p>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="stay_hub_area_logic"
          locale={locale}
          className="mt-6"
        />

        <TrackedInternalLink
          href="/areas-to-stay/tokyo-stay-area-index"
          sourcePage={pagePath}
          placement="stay_hub_tokyo_area_index"
          label="Tokyo Stay Area Index"
          locale={locale}
          className="mt-5 flex items-start gap-4 rounded-[22px] border border-orange-100 bg-orange-50/70 p-5 text-left shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#ff7a00] shadow-sm">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold text-slate-950">Tokyo Stay Area Index</span>
            <span className="mt-1.5 block text-sm leading-6 text-slate-700">
              Compare station areas like Oshiage, Kuramae, Ueno, Asakusa, Shinjuku, and Tokyo Station before opening hotel booking sites.
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#c45500]">
              Find a Tokyo hotel base
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </span>
        </TrackedInternalLink>

        <section id="choose-your-city" className="mt-10 scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("citySection.eyebrow")}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("citySection.title")}</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cityCards.map((card) => (
              <CityDecisionCard key={card.title} card={card} locale={locale} pagePath={pagePath} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-[#d9eadd] bg-[#f7fffb] p-5 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("localPicks.eyebrow")}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{t("localPicks.title")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {t("localPicks.body")}
            </p>
          </div>
          <TrackedInternalLink
            href="/local-hotel-picks"
            sourcePage={pagePath}
            placement="stay_hub_local_picks"
            label={t("localPicks.cta")}
            locale={locale}
            className={buttonClassName({ variant: "internalOutline", className: "mt-4 shrink-0 md:mt-0" })}
          >
            {t("localPicks.cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedInternalLink>
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("problemSection.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("problemSection.title")}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {problemCards.map((item) => (
              <ProblemCardLink key={item.title} item={item} locale={locale} pagePath={pagePath} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("featuredGuides.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("featuredGuides.title")}</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {guideGroups.map((group) => {
              const pages = group.slugs.map(pageBySlug).filter((page): page is StayPage => Boolean(page));
              return (
                <section key={group.cityKey} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="text-base font-semibold text-slate-950">{t(`featuredGuides.groups.${group.cityKey}`)}</h3>
                  <div className="mt-3 grid gap-3">
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
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continuePlanning.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedInternalLink href="/plan-your-trip" sourcePage={pagePath} placement="stay_hub_continue_planning" label={t("continuePlanning.plan")} locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              {t("continuePlanning.plan")}
            </TrackedInternalLink>
            <TrackedInternalLink href="/guide" sourcePage={pagePath} placement="stay_hub_continue_planning" label={t("continuePlanning.seat")} locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              {t("continuePlanning.seat")}
            </TrackedInternalLink>
            <TrackedInternalLink href="/airport-transfers" sourcePage={pagePath} placement="stay_hub_continue_planning" label={t("continuePlanning.airport")} locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
              {t("continuePlanning.airport")}
            </TrackedInternalLink>
            {esimHref ? (
              <TrackedAffiliateLink
                href={esimHref}
                target="_blank"
                rel={AFFILIATE_REL}
                category="esim"
                provider="klook"
                placement="stay_hub_continue_planning"
                pagePath={pagePath}
                locale={locale}
                label={t("continuePlanning.esim")}
                linkId="esim"
                product="esim"
                adid="1166001"
                className={buttonClassName({ variant: "commercial", fullWidth: true, className: "text-center" })}
              >
                {t("continuePlanning.esim")}
                <Wifi className="h-4 w-4" aria-hidden="true" />
              </TrackedAffiliateLink>
            ) : (
              <TrackedInternalLink href="/plan-your-trip" sourcePage={pagePath} placement="stay_hub_continue_planning" label={t("continuePlanning.esim")} locale={locale} className={buttonClassName({ variant: "internal", fullWidth: true, className: "text-center" })}>
                {t("continuePlanning.esim")}
              </TrackedInternalLink>
            )}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
