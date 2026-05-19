import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Luggage, MapPin, Plane, Train } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { transferPages, type TransferPage } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { ESIM_URL } from "@/src/affiliateLinks";
import { getAirportTransferHubImage, getAirportTransferRouteImage } from "@/lib/airport-transfer-images";
import { getAirportTransferHubCopy, localizedRouteTitle } from "@/lib/content/airport-transfer-i18n";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const image = getAirportTransferHubImage();
  const copy = getAirportTransferHubCopy(locale);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/airport-transfers", locale),
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      siteName: "fujiseat",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  };
}

const naritaSlugs = [
  "narita-to-shinjuku",
  "narita-to-tokyo-station",
  "narita-to-ueno",
  "narita-to-shibuya",
  "narita-to-asakusa",
  "narita-to-oshiage",
] as const;
const hanedaSlugs = [
  "haneda-to-shinjuku",
  "haneda-to-asakusa",
  "haneda-to-ueno",
  "haneda-to-tokyo-station",
  "haneda-to-shibuya",
] as const;
const kansaiSlugs = [
  "kansai-airport-to-kyoto",
  "kansai-airport-to-namba",
  "kansai-airport-to-umeda",
  "osaka-to-kansai-airport",
  "kyoto-to-kansai-airport",
] as const;
const lateArrivalSlugs = ["narita-late-arrival", "haneda-late-arrival"] as const;
const pagePath = "/airport-transfers";

function orderedPages(slugs: readonly string[]): TransferPage[] {
  return slugs
    .map((slug) => transferPages.find((page) => page.slug === slug))
    .filter((page): page is TransferPage => Boolean(page));
}

function RouteTextLink({
  page,
  locale,
  placement,
}: {
  page: TransferPage;
  locale: string;
  placement: string;
}) {
  return (
    <TrackedInternalLink
      href={`/airport-transfers/${page.slug}`}
      sourcePage={pagePath}
      placement={placement}
      label={localizedRouteTitle(page, locale)}
      locale={locale}
      className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
    >
      <span>{page.from} → {page.to}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </TrackedInternalLink>
  );
}

function AirportCard({
  title,
  body,
  image,
  imageAlt,
  pages,
  locale,
}: {
  title: string;
  body: string;
  image?: string;
  imageAlt: string;
  pages: TransferPage[];
  locale: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {image ? (
        <div className="relative aspect-[16/9] w-full">
          <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-sky-50">
          <Plane className="h-10 w-10 text-sky-300" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        <div className="mt-4 grid gap-2">
          {pages.map((page) => (
            <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickAnswerCard({
  title,
  copy,
  href,
  label,
  locale,
}: {
  title: string;
  copy: string;
  href: string;
  label: string;
  locale: string;
}) {
  return (
    <TrackedInternalLink
      href={href}
      sourcePage={pagePath}
      placement="airport_hub_quick_answer"
      label={label}
      locale={locale}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
    >
      <p className="text-sm font-bold text-slate-950">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{copy}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
        {label} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </TrackedInternalLink>
  );
}

function ProblemCard({
  icon,
  title,
  body,
  href,
  label,
  locale,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  label: string;
  locale: string;
}) {
  return (
    <TrackedInternalLink
      href={href}
      sourcePage={pagePath}
      placement="airport_hub_problem_card"
      label={label}
      locale={locale}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
          <span className="mt-2 inline-flex text-xs font-semibold text-slate-700">{label} →</span>
        </div>
      </div>
    </TrackedInternalLink>
  );
}

export default async function AirportTransfersIndex({ params }: Props) {
  const { locale } = await params;
  const copy = getAirportTransferHubCopy(locale);
  const heroImage = getAirportTransferHubImage();
  const naritaImage = getAirportTransferRouteImage("narita");
  const hanedaImage = getAirportTransferRouteImage("haneda");
  const kansaiImage = getAirportTransferRouteImage("kansai-airport");
  const naritaPages = orderedPages(naritaSlugs);
  const hanedaPages = orderedPages(hanedaSlugs);
  const kansaiPages = orderedPages(kansaiSlugs);
  const lateArrivalPages = orderedPages(lateArrivalSlugs);

  return (
    <main className="page-shell min-h-screen text-slate-950">
    <SiteHeader />
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: copy.breadcrumbHome, href: "/" },
          { label: copy.breadcrumbCurrent },
        ]}
      />

      <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {heroImage ? (
          <div className="relative aspect-[21/9] max-h-[360px] min-h-[180px] w-full">
            <Image src={heroImage} alt={copy.heroImageAlt} fill priority sizes="(min-width: 768px) 1180px, 100vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[21/9] max-h-[360px] min-h-[180px] items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50">
            <Plane className="h-12 w-12 text-sky-300" />
          </div>
        )}
        <div className="p-5 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
            {copy.heroLabel}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            {copy.heroBody}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <TrackedInternalLink
              href="#tokyo-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label={copy.heroPrimary}
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {copy.heroPrimary}
            </TrackedInternalLink>
            <TrackedInternalLink
              href="#kansai-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label={copy.heroSecondary}
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#082653] bg-[#082653] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#061d40]"
            >
              {copy.heroSecondary}
            </TrackedInternalLink>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.quickLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">{copy.quickTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAnswerCard
            title={copy.quickAnswers[0].title}
            copy={copy.quickAnswers[0].copy}
            href="/airport-transfers/narita-to-shinjuku"
            label={copy.quickAnswers[0].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[1].title}
            copy={copy.quickAnswers[1].copy}
            href="/airport-transfers/narita-to-ueno"
            label={copy.quickAnswers[1].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[2].title}
            copy={copy.quickAnswers[2].copy}
            href="/areas-to-stay/tokyo-station-hotels-before-shinkansen"
            label={copy.quickAnswers[2].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[3].title}
            copy={copy.quickAnswers[3].copy}
            href="/airport-transfers/narita-late-arrival"
            label={copy.quickAnswers[3].label}
            locale={locale}
          />
        </div>
      </section>

      <section id="tokyo-airport-routes" className="mt-12 scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">{copy.chooseLabel}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{copy.chooseTitle}</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <AirportCard
            title={copy.airportCards.narita.title}
            body={copy.airportCards.narita.body}
            image={naritaImage}
            imageAlt={copy.airportCards.narita.imageAlt}
            pages={naritaPages.filter((page) => ["narita-to-shinjuku", "narita-to-tokyo-station", "narita-to-ueno", "narita-to-asakusa"].includes(page.slug))}
            locale={locale}
          />
          <AirportCard
            title={copy.airportCards.haneda.title}
            body={copy.airportCards.haneda.body}
            image={hanedaImage}
            imageAlt={copy.airportCards.haneda.imageAlt}
            pages={hanedaPages.filter((page) => ["haneda-to-shinjuku", "haneda-to-tokyo-station", "haneda-to-asakusa", "haneda-to-ueno"].includes(page.slug))}
            locale={locale}
          />
          <div id="kansai-airport-routes" className="scroll-mt-24">
            <AirportCard
              title={copy.airportCards.kansai.title}
              body={copy.airportCards.kansai.body}
              image={kansaiImage}
              imageAlt={copy.airportCards.kansai.imageAlt}
              pages={kansaiPages.filter((page) => ["kansai-airport-to-kyoto", "kansai-airport-to-namba", "kansai-airport-to-umeda"].includes(page.slug))}
              locale={locale}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.problemLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">{copy.problemTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ProblemCard icon={<Luggage className="h-4 w-4" />} title={copy.problems[0].title} body={copy.problems[0].body} href="/airport-transfers/narita-to-shinjuku" label={copy.problems[0].label} locale={locale} />
          <ProblemCard icon={<Clock className="h-4 w-4" />} title={copy.problems[1].title} body={copy.problems[1].body} href="/airport-transfers/haneda-late-arrival" label={copy.problems[1].label} locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title={copy.problems[2].title} body={copy.problems[2].body} href="/areas-to-stay/tokyo-first-time" label={copy.problems[2].label} locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title={copy.problems[3].title} body={copy.problems[3].body} href="/airport-transfers/kansai-airport-to-kyoto" label={copy.problems[3].label} locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title={copy.problems[4].title} body={copy.problems[4].body} href="/airport-transfers/kansai-airport-to-namba" label={copy.problems[4].label} locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title={copy.problems[5].title} body={copy.problems[5].body} href="/areas-to-stay/tokyo-station-hotels-before-shinkansen" label={copy.problems[5].label} locale={locale} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.allRoutesLabel}</p>
        <h2 className="mt-2 text-lg font-bold text-slate-950">{copy.allRoutesTitle}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Narita</h3>
            <div className="mt-2 grid gap-2">
              {naritaPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Haneda</h3>
            <div className="mt-2 grid gap-2">
              {hanedaPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Kansai</h3>
            <div className="mt-2 grid gap-2">
              {kansaiPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{copy.lateArrival}</h3>
            <div className="mt-2 grid gap-2">
              {lateArrivalPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.continueLabel}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <TrackedInternalLink href="/areas-to-stay" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[0].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[0].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[0].body}</span>
          </TrackedInternalLink>
          <TrackedAffiliateLink href={ESIM_URL} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="airport_hub_continue_planning" pagePath={pagePath} locale={locale} label={copy.continueCards[1].title} linkId="esim" product="esim" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[1].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[1].body}</span>
          </TrackedAffiliateLink>
          <TrackedInternalLink href="/guide" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[2].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[2].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[2].body}</span>
          </TrackedInternalLink>
          <TrackedInternalLink href="/itineraries/7-day-first-time-japan" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[3].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[3].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[3].body}</span>
          </TrackedInternalLink>
        </div>
      </section>

    </Container>
    <SiteFooter />
    </main>
  );
}
