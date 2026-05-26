import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, Users, Zap } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { DayCard } from "@/components/content/DayCard";
import { HotelBaseNextStep } from "@/components/content/HotelBaseNextStep";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAllItinerarySlugs, getItineraryBySlug } from "@/lib/content/itineraries";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return getAllItinerarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getItineraryBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
    alternates: getAlternates(`/itineraries/${slug}`, locale),
  };
}

const paceConfig = {
  relaxed: { label: "Relaxed", icon: Clock, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  moderate: { label: "Moderate", icon: Users, className: "border-sky-200 bg-sky-50 text-sky-700" },
  fast: { label: "Fast", icon: Zap, className: "border-amber-200 bg-amber-50 text-amber-700" },
};

const SITE_URL = "https://fujiseat.com";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export default async function ItineraryPage({ params }: Props) {
  const { slug, locale } = await params;
  const page = getItineraryBySlug(slug);
  if (!page) notFound();

  const pace = paceConfig[page.pace];
  const PaceIcon = pace.icon;
  const pagePath = `/itineraries/${slug}`;
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
        name: "Itineraries",
        item: localizedUrl(locale, "/itineraries"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.title,
        item: localizedUrl(locale, pagePath),
      },
    ],
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id={`breadcrumb-itinerary-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Itineraries", href: "/" },
          { label: page.duration },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {page.duration}
          </span>
          <span className={["inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", pace.className].join(" ")}>
            <PaceIcon className="h-3.5 w-3.5" />
            {pace.label} pace
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Best for: {page.bestFor}
        </p>

        <div className="mt-8 space-y-8">
          <NextActions
            picks={page.nextActions}
            title="Book the essentials for this route"
            subtitle="Start with hotels, rail, arrival transfer, and eSIM before adding activities."
            maxItems={5}
            locale={locale}
            pagePath={pagePath}
          />

          <HotelBaseNextStep
            sourcePage={pagePath}
            locale={locale}
            placement="itinerary_hotel_base_next_step"
            title="Choose the hotel base before booking this route"
            body="For this itinerary, the hotel area affects airport arrival, luggage movement, Shinkansen days, and how hard the first night feels."
            primaryHref="/areas-to-stay"
            primaryLabel="Choose a Japan hotel area"
            secondaryHref="/local-hotel-picks"
            secondaryLabel="See local hotel examples"
          />

          <section>
            <h2 className="mb-6 text-lg font-semibold text-slate-950">Day-by-day plan</h2>
            <div>
              {page.days.map((day) => (
                <DayCard key={day.day} {...day} locale={locale} pagePath={pagePath} itinerarySlug={slug} />
              ))}
            </div>
          </section>

          <ProTip>{page.proTip}</ProTip>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#145aa0]">
              Plan the logistics
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Lock in arrival and hotel decisions before booking the route.
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                href="/airport-transfers/narita-to-shinjuku"
                className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]"
              >
                <span className="block font-bold text-[#082653]">Airport transfers</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">
                  Choose Narita/Haneda to city routes before arrival day.
                </span>
              </Link>
              <Link
                href="/areas-to-stay/tokyo-first-time"
                className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]"
              >
                <span className="block font-bold text-[#082653]">Areas to stay</span>
                <span className="mt-1 block text-xs leading-5 text-[#5f7190]">
                  Compare Shinjuku, Ueno, Asakusa, Tokyo Station, and calmer local bases.
                </span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="itinerary" locale={locale} />
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
