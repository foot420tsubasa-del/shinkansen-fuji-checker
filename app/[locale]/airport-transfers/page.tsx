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

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const image = getAirportTransferHubImage();
  return {
    title: "Airport Transfers in Japan — Narita, Haneda and Kansai Airport | fujiseat",
    description:
      "Compare airport transfer options for Tokyo and Kansai, including Narita, Haneda, and Kansai Airport routes to Shinjuku, Asakusa, Kyoto, Namba and Umeda.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/airport-transfers", locale),
    openGraph: {
      title: "Airport Transfers in Japan — Narita, Haneda & Kansai",
      description:
        "Compare airport transfer options for Tokyo and Kansai. Narita, Haneda, and KIX routes compared.",
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
      label={page.title}
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
          { label: "Home", href: "/" },
          { label: "Airport Transfers" },
        ]}
      />

      <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {heroImage ? (
          <div className="relative aspect-[21/9] max-h-[360px] min-h-[180px] w-full">
            <Image src={heroImage} alt="Airport arrivals and transfer planning in Japan" fill priority sizes="(min-width: 768px) 1180px, 100vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[21/9] max-h-[360px] min-h-[180px] items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50">
            <Plane className="h-12 w-12 text-sky-300" />
          </div>
        )}
        <div className="p-5 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
            Arrival transfer guide
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Airport Transfers in Japan
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Choose your first route from Narita, Haneda, or Kansai Airport before booking your hotel area. The best option depends on luggage, arrival time, and where you stay.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <TrackedInternalLink
              href="#tokyo-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label="Start with Tokyo airport routes"
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              Start with Tokyo airport routes
            </TrackedInternalLink>
            <TrackedInternalLink
              href="#kansai-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label="See Kansai Airport routes"
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#082653] bg-[#082653] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#061d40]"
            >
              See Kansai Airport routes
            </TrackedInternalLink>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Quick answer</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Start with where you sleep on night one</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAnswerCard
            title="Staying in Shinjuku"
            copy="Narita Express is simple from Narita. From Haneda, trains or limousine bus are usually easier."
            href="/airport-transfers/narita-to-shinjuku"
            label="Narita to Shinjuku"
            locale={locale}
          />
          <QuickAnswerCard
            title="Staying in Ueno / Asakusa"
            copy="Narita can be very practical. Skyliner or direct Keisei/Asakusa Line routes often work well."
            href="/airport-transfers/narita-to-ueno"
            label="Narita to Ueno / Asakusa"
            locale={locale}
          />
          <QuickAnswerCard
            title="Taking an early Shinkansen"
            copy="Tokyo Station can reduce luggage stress before Kyoto or Osaka train days."
            href="/areas-to-stay/tokyo-station-hotels-before-shinkansen"
            label="Tokyo stay area guide"
            locale={locale}
          />
          <QuickAnswerCard
            title="Landing late"
            copy="Check last trains and airport hotels before booking a hotel far from the airport."
            href="/airport-transfers/narita-late-arrival"
            label="Late arrival guides"
            locale={locale}
          />
        </div>
      </section>

      <section id="tokyo-airport-routes" className="mt-12 scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Choose your arrival airport</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Match the airport to your first hotel area</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <AirportCard
            title="Narita Airport"
            body="Further from central Tokyo, but strong for Ueno, Asakusa, Tokyo Station, and Shinjuku with the right route."
            image={naritaImage}
            imageAlt="Narita Airport arrivals transfer area"
            pages={naritaPages.filter((page) => ["narita-to-shinjuku", "narita-to-tokyo-station", "narita-to-ueno", "narita-to-asakusa"].includes(page.slug))}
            locale={locale}
          />
          <AirportCard
            title="Haneda Airport"
            body="Closer to central Tokyo. Good for Shinjuku, Tokyo Station, Asakusa, Ueno, and late arrivals."
            image={hanedaImage}
            imageAlt="Haneda Airport arrivals transfer area"
            pages={hanedaPages.filter((page) => ["haneda-to-shinjuku", "haneda-to-tokyo-station", "haneda-to-asakusa", "haneda-to-ueno"].includes(page.slug))}
            locale={locale}
          />
          <div id="kansai-airport-routes" className="scroll-mt-24">
            <AirportCard
              title="Kansai Airport"
              body="Gateway to Kyoto and Osaka. Choose Haruka, Nankai, bus, or transfer based on your first hotel area."
              image={kansaiImage}
              imageAlt="Kansai Airport arrivals transfer area"
              pages={kansaiPages.filter((page) => ["kansai-airport-to-kyoto", "kansai-airport-to-namba", "kansai-airport-to-umeda"].includes(page.slug))}
              locale={locale}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Choose by travel problem</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Route decisions that matter after landing</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ProblemCard icon={<Luggage className="h-4 w-4" />} title="Heavy luggage" body="Prioritize direct trains, airport buses, or private transfer over the cheapest stairs-and-transfer route." href="/airport-transfers/narita-to-shinjuku" label="Compare luggage-friendly routes" locale={locale} />
          <ProblemCard icon={<Clock className="h-4 w-4" />} title="Late arrival" body="Check the last-train risk before choosing a hotel far from the airport." href="/airport-transfers/haneda-late-arrival" label="Open late arrival guide" locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title="First-time Tokyo" body="Choose the airport route together with your first Tokyo base." href="/areas-to-stay/tokyo-first-time" label="Choose Tokyo stay area" locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title="Kyoto first night" body="If you land at KIX and sleep in Kyoto, compare Haruka, bus, and transfer options." href="/airport-transfers/kansai-airport-to-kyoto" label="KIX to Kyoto" locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title="Osaka food/nightlife base" body="Namba is often the practical first target for food and evening energy." href="/airport-transfers/kansai-airport-to-namba" label="KIX to Namba" locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title="Shinkansen next day" body="Tokyo Station can make luggage and early Kyoto or Osaka departures easier." href="/areas-to-stay/tokyo-station-hotels-before-shinkansen" label="Stay before Shinkansen" locale={locale} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">All transfer route guides</p>
        <h2 className="mt-2 text-lg font-bold text-slate-950">Keep every existing route easy to reach</h2>
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
            <h3 className="text-sm font-bold text-slate-900">Late arrival</h3>
            <div className="mt-2 grid gap-2">
              {lateArrivalPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Continue planning</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <TrackedInternalLink href="/areas-to-stay" sourcePage={pagePath} placement="airport_hub_continue_planning" label="Choose where to stay" locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            Choose where to stay <span className="mt-1 block text-xs font-normal text-slate-500">Pick the city and hotel area before booking.</span>
          </TrackedInternalLink>
          <TrackedAffiliateLink href={ESIM_URL} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="airport_hub_continue_planning" pagePath={pagePath} locale={locale} label="Get Japan eSIM" linkId="esim" product="esim" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            Get Japan eSIM <span className="mt-1 block text-xs font-normal text-slate-500">Set up maps and transit before landing.</span>
          </TrackedAffiliateLink>
          <TrackedInternalLink href="/guide" sourcePage={pagePath} placement="airport_hub_continue_planning" label="Check Shinkansen seat" locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            Check Shinkansen seat <span className="mt-1 block text-xs font-normal text-slate-500">Find the Fuji-side seat before booking rail.</span>
          </TrackedInternalLink>
          <TrackedInternalLink href="/itineraries/7-day-first-time-japan" sourcePage={pagePath} placement="airport_hub_continue_planning" label="Open 7-day itinerary" locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            Open 7-day itinerary <span className="mt-1 block text-xs font-normal text-slate-500">Connect arrival, Tokyo, Fuji, Kyoto, and Osaka.</span>
          </TrackedInternalLink>
        </div>
      </section>

    </Container>
    <SiteFooter />
    </main>
  );
}
