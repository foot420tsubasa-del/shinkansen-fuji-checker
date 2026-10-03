import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { ArrowRight, Bed, Building2, Landmark, Mountain, Utensils } from "lucide-react";
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
      images: [{ url: "https://fujiseat.com/og-areas-to-stay.png", width: 1200, height: 630 }],
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
                /* Was the folded tokyo-hotels parent; now the biggest
                   comparison page still in the index (103 clicks / 6 months). */
                href="/areas-to-stay/asakusa-vs-ueno"
                sourcePage={pagePath}
                placement="stay_hub_hero_finder"
                label={t("hero.primaryCta")}
                locale={locale}
                className={buttonClassName({ variant: "navy", size: "lg", className: "text-white sm:min-w-64" })}
              >
                {t("hero.primaryCta")}
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
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">{t("quickAnswerTitle")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("quickAnswerIntro")}</p>
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {quickAnswerKeys.map((key) => (
              <li key={key} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                {t(`quickAnswersNew.${key}`)}
              </li>
            ))}
          </ul>
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

      </Container>
      <SiteFooter />
    </main>
  );
}
