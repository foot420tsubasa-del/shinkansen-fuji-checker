import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { ArrowRight, Bed, Building2, Landmark, MapPin, Mountain, Search, Utensils } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/Button";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { stayPages, type StayPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
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

type CityCardKey = "tokyo" | "kyoto" | "osaka" | "kawaguchiko";

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
    href: "/areas-to-stay/tokyo-stay-area-index",
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

const quickAnswerKeys = ["firstTime", "narita", "shinkansen", "quiet"] as const;

const finderFactorKeys = ["luggage", "airport", "shinkansen", "plans", "quiet"] as const;

const localExampleCards = [
  {
    key: "oshiage",
    href: "/areas-to-stay/tokyo-stay-area-index?area=oshiage#selected-area",
    imageCandidates: ["/images/stay/tokyo/stay-east-tokyo.png", "/images/home/local-tokyo-ideas.png"],
  },
  {
    key: "kiyosumi",
    href: "/areas-to-stay/tokyo-stay-area-index?area=kiyosumi-shirakawa#selected-area",
    imageCandidates: ["/images/stay/tokyo/stay-kiyosumi-shirakawa.png", "/images/home/local-tokyo-ideas.png"],
  },
  {
    key: "ryogoku",
    href: "/areas-to-stay/tokyo-stay-area-index?area=ryogoku#selected-area",
    imageCandidates: ["/design-home-assets/quiet-ryogoku.jpg", "/images/stay/tokyo/stay-asakusa.png"],
  },
] as const;

const guideGroupChrome = {
  tokyo: { icon: Building2, className: "border-sky-100 bg-sky-50/60 text-sky-800" },
  kyoto: { icon: Landmark, className: "border-emerald-100 bg-emerald-50/60 text-emerald-800" },
  osaka: { icon: Utensils, className: "border-orange-100 bg-orange-50/55 text-orange-800" },
  fuji: { icon: Mountain, className: "border-slate-200 bg-white text-slate-800" },
} as const;

function pageBySlug(slug: string) {
  return stayPages.find((page) => page.slug === slug);
}

function publicImageIfExists(candidates: readonly string[]) {
  return candidates.find((src) => fs.existsSync(path.join(process.cwd(), "public", src.replace(/^\//, ""))));
}

function CityDecisionCard({ card, locale, pagePath }: { card: CityCard; locale: string; pagePath: string }) {
  const Icon = card.icon;
  const image = publicImageIfExists(card.imageCandidates);
  const isTokyo = card.key === "tokyo";
  const placement = isTokyo ? "stay_hub_city_tokyo" : "stay_hub_city_card";

  return (
    <TrackedInternalLink
      href={card.href}
      sourcePage={pagePath}
      placement={placement}
      label={card.placementLabel}
      locale={locale}
      className={[
        "group flex h-full flex-col overflow-hidden rounded-[24px] bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
        isTokyo ? "border-2 border-[#0b1a33]" : "border border-slate-200 hover:border-[#9fd7bd]",
      ].join(" ")}
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
        <span
          className={[
            "mt-auto inline-flex w-fit items-center gap-1 rounded-[12px] px-3 py-2 text-sm font-semibold text-white transition-colors",
            isTokyo ? "bg-[#0b1a33] group-hover:bg-[#132744]" : "bg-[#168a56] group-hover:bg-[#0f6f45]",
          ].join(" ")}
        >
          {card.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
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
      className="group block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex h-full items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-5 text-slate-950 group-hover:text-[#106b43]">{title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">
            {description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
  const heroImage = publicImageIfExists([
    "/images/home/tokyo-hotel-base.png",
    "/images/stay/tokyo/tokyo-stay-hero.png",
  ]);
  const cityCards: CityCard[] = cityCardConfigs.map((card) => ({
    ...card,
    title: t(`cityCards.${card.key}.title`),
    subtitle: t(`cityCards.${card.key}.subtitle`),
    cta: t(`cityCards.${card.key}.cta`),
    placementLabel: t(`cityCards.${card.key}.placementLabel`),
  }));

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

        <section className="mt-6 overflow-hidden rounded-[32px] border border-[#d9e5f2] bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 md:p-9">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            <Bed className="h-4 w-4" aria-hidden="true" />
            {t("hero.eyebrow")}
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="mt-4 text-2xl font-semibold leading-tight text-[#0b1a33] md:text-3xl">
                {t("hero.tagline")}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {t("hero.body")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <TrackedInternalLink
                href="/areas-to-stay/tokyo-stay-area-index"
                sourcePage={pagePath}
                placement="stay_hub_hero_finder"
                label={t("hero.primaryCta")}
                locale={locale}
                className={buttonClassName({ variant: "navy", size: "lg", className: "text-white sm:min-w-64" })}
              >
                {t("hero.primaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
              <TrackedInternalLink
                href="/local-hotel-picks"
                sourcePage={pagePath}
                placement="stay_hub_hero_local_examples"
                label={t("hero.secondaryCta")}
                locale={locale}
                className={buttonClassName({ variant: "internal", size: "lg", className: "sm:min-w-56" })}
              >
                {t("hero.secondaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
              </div>
            </div>
            <div className="relative flex min-h-80 items-end overflow-hidden bg-[linear-gradient(135deg,#eff6ff,#f8fafc_52%,#ecfdf5)] p-6 md:p-8">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={t("hero.imageAlt")}
                  fill
                  priority
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(15,23,42,0.42))]" aria-hidden="true" />
              <div className="relative w-full rounded-[26px] border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t("heroRoute.title")}</p>
                <div className="mt-4 grid gap-3">
                  {(t.raw("heroRoute.steps") as string[]).map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b1a33] text-sm font-bold text-white">{index + 1}</span>
                      <span className="text-sm font-semibold text-slate-800">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{t("quickAnswerTitle")}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("quickAnswerIntro")}</p>
            </div>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-stay-area-index"
              sourcePage={pagePath}
              placement="stay_hub_quick_answer_finder"
              label={t("quickAnswerCta")}
              locale={locale}
              className={buttonClassName({ variant: "internal", size: "md", className: "shrink-0" })}
            >
              {t("quickAnswerCta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedInternalLink>
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {quickAnswerKeys.map((key) => (
              <li key={key} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                {t(`quickAnswersNew.${key}`)}
              </li>
            ))}
          </ul>
        </section>

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

        <section className="mt-10 rounded-[30px] border border-[#c9d8ee] bg-[linear-gradient(135deg,#f8fbff,#eef6ff)] p-6 shadow-sm md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0b1a33]">{t("finderPreview.eyebrow")}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{t("finderPreview.title")}</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">{t("finderPreview.body")}</p>
              <TrackedInternalLink
                href="/areas-to-stay/tokyo-stay-area-index"
                sourcePage={pagePath}
                placement="stay_hub_finder_preview"
                label={t("finderPreview.cta")}
                locale={locale}
                className={buttonClassName({ variant: "navy", size: "lg", className: "mt-5 text-white" })}
              >
                {t("finderPreview.cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedInternalLink>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {finderFactorKeys.map((factor) => (
                <div key={factor} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm">
                  <Search className="h-4 w-4 shrink-0 text-[#0b1a33]" aria-hidden="true" />
                  {t(`finderPreview.factors.${factor}`)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">{t("localPicks.eyebrow")}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("localPicks.previewTitle")}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {t("localPicks.previewBody")}
              </p>
            </div>
            <TrackedInternalLink
              href="/local-hotel-picks"
              sourcePage={pagePath}
              placement="stay_hub_local_picks"
              label={t("localPicks.cta")}
              locale={locale}
              className={buttonClassName({ variant: "internal", size: "md", className: "shrink-0" })}
            >
              {t("localPicks.cta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedInternalLink>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {localExampleCards.map((item) => {
              const title = t(`localPicks.examples.${item.key}.title`);
              const image = publicImageIfExists(item.imageCandidates);
              return (
              <TrackedInternalLink
                key={item.key}
                href={item.href}
                sourcePage={pagePath}
                placement="stay_hub_local_example_preview"
                label={title}
                locale={locale}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left transition-colors hover:border-[#9fd7bd] hover:bg-[#f7fffb]"
              >
                {image ? (
                  <div className="relative h-32 bg-slate-100">
                    <Image
                      src={image}
                      alt={t("localPicks.exampleImageAlt", { title })}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.18))]" aria-hidden="true" />
                  </div>
                ) : null}
                <div className="p-4">
                  <MapPin className="h-5 w-5 text-[#106b43]" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(`localPicks.examples.${item.key}.body`)}</p>
                </div>
              </TrackedInternalLink>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{t("detailedGuides.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{t("detailedGuides.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("detailedGuides.body")}</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {guideGroups.map((group) => {
              const pages = group.slugs.map(pageBySlug).filter((page): page is StayPage => Boolean(page));
              const chrome = guideGroupChrome[group.cityKey];
              const GroupIcon = chrome.icon;
              return (
                <section key={group.cityKey} className={["rounded-[22px] border p-4", chrome.className].join(" ")}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm">
                      <GroupIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold text-slate-950">{t(`featuredGuides.groups.${group.cityKey}`)}</h3>
                  </div>
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

        <section className="mt-10 rounded-[28px] border border-[#0b1a33]/10 bg-[#0b1a33] p-6 text-white shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold">{t("bottomCta.title")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
            {t("bottomCta.body")}
          </p>
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-stay-area-index"
            sourcePage={pagePath}
            placement="stay_hub_bottom_finder"
            label={t("bottomCta.cta")}
            locale={locale}
            className={buttonClassName({ variant: "internal", size: "lg", className: "mt-5" })}
          >
            {t("bottomCta.cta")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </TrackedInternalLink>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
