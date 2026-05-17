import type { Metadata } from "next";
import { ArrowRight, Info, Train, Mountain, Luggage, MapPin } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { OMIO_TOKYO_KYOTO_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { ProviderChoiceCTA } from "@/components/affiliate/ProviderChoiceCTA";

type Props = { params: Promise<{ locale: string }> };

const title = "Tokyo to Kyoto Shinkansen Ticket Guide";
const description =
  "A practical guide to Tokyo to Kyoto Shinkansen tickets, seat choice, Mt. Fuji views, luggage, station choice and whether you need a JR Pass.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/tokyo-to-kyoto-shinkansen-ticket", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much is a Shinkansen ticket from Tokyo to Kyoto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A reserved seat on the Tokaido Shinkansen (Nozomi) from Tokyo to Kyoto costs about ¥13,320 one-way for an Ordinary Car. Green Car (first class) costs more. Always confirm current prices before booking.",
      },
    },
    {
      "@type": "Question",
      name: "Which station should I depart from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tokyo Station is the main Tokaido Shinkansen hub. Shinagawa is also an option and may be more convenient if you're staying in south Tokyo. Both stations have the same Shinkansen services.",
      },
    },
    {
      "@type": "Question",
      name: "Which seat is best for Mt. Fuji views?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In Ordinary Cars, Seat E (window on the two-seat side) is usually the Mt. Fuji-side window. In Green Cars, it is usually Seat D. The mountain appears about 40–50 minutes after leaving Tokyo.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a JR Pass for Tokyo to Kyoto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not usually. A single Shinkansen ticket is simpler and cheaper for a one-way trip. A JR Pass only makes sense if your wider route includes multiple long-distance JR rides.",
      },
    },
  ],
};

export default async function TokyoToKyotoTicketPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-tokyo-kyoto-ticket"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Shinkansen ticket guide
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {description}
        </p>

        {/* Quick answer */}
        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
            Quick answer
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2">
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>A single Shinkansen ticket from Tokyo to Kyoto is usually the simplest option.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>For Mt. Fuji views, choose <strong>Seat E</strong> (Ordinary Car) or <strong>Seat D</strong> (Green Car).</span>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Tokyo Station</strong> is easiest for early departures.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Compare JR Pass only if your route includes more long-distance trips.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          {/* Which station */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Which station to depart from</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                <strong>Tokyo Station</strong> is the main Tokaido Shinkansen hub. Most Nozomi, Hikari, and Kodama services depart from here. If you&apos;re staying near Tokyo Station, Nihonbashi, or Marunouchi, this is the obvious choice.
              </p>
              <p>
                <strong>Shinagawa Station</strong> is the second option. Tokaido Shinkansen trains stop here too. If your hotel is in Shinagawa, Shibuya, or south Tokyo, Shinagawa can save you a transfer.
              </p>
              <p>
                Either way, arrive 15–20 minutes before departure to find the platform and buy any last-minute items.
              </p>
            </div>
          </section>

          {/* Seat for Fuji */}
          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Which seat for Mt. Fuji views</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              On the Tokaido Shinkansen heading to Kyoto, Mt. Fuji appears on the right side about 40–50 minutes after Tokyo. In Ordinary Cars, <strong>Seat E</strong> is the Fuji-side window. In Green Cars (2+2 layout), it&apos;s <strong>Seat D</strong>.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/tokyo-to-kyoto-mt-fuji-seat"
                className="inline-flex items-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f6f45]"
              >
                Full seat guide
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#seat-checker"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Open Seat Checker
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Single ticket vs JR Pass */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Single ticket vs JR Pass</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                A reserved seat on the Nozomi from Tokyo to Kyoto costs about <strong>¥13,320</strong>. A 7-day JR Pass costs about <strong>¥50,000</strong> and does not cover the Nozomi — you&apos;d need to use the Hikari instead (adds ~20 min).
              </p>
              <p>
                For a simple one-way trip, a single ticket is cheaper and simpler. Only consider the JR Pass if your total route includes several additional long-distance JR rides.
              </p>
              <Link href="/jr-pass-vs-single-ticket" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900">
                Full JR Pass comparison
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Luggage note */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-700">
              Luggage note
            </p>
            <div className="mt-2 flex gap-2 text-sm leading-6 text-slate-600">
              <Luggage className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <p>
                Large suitcases (over 160cm total) need an <strong>oversized luggage reservation</strong> on the Shinkansen. Reserve the last row of your car when booking — those seats have luggage space behind them. This is free but must be reserved in advance.
              </p>
            </div>
          </section>

          {/* Where to stay */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Where to stay before the ride</h2>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              <p>
                If your Shinkansen departs early, staying near Tokyo Station saves you a morning transfer. Shinjuku and Ueno are also practical — both have direct JR access to Tokyo Station in under 20 minutes.
              </p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Link href="/areas-to-stay/where-to-stay-before-shinkansen" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Where to stay before the Shinkansen</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Compare Tokyo Station, Shinjuku, and Ueno for departure day.</span>
              </Link>
              <Link href="/areas-to-stay/tokyo-station-vs-shinjuku" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo Station vs Shinjuku</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Two popular bases — which fits your style?</span>
              </Link>
            </div>
          </section>

          {/* Booking */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Book your ticket</h2>
            <div className="mt-4">
              <ProviderChoiceCTA
                actionLabel="Book Shinkansen ticket"
                description={
                  OMIO_TOKYO_KYOTO_URL
                    ? "Use Klook when you already want the Shinkansen ticket; use Omio to compare train and bus route options before booking."
                    : "Use Klook when you already want the Shinkansen ticket."
                }
                pagePath="/tokyo-to-kyoto-shinkansen-ticket"
                locale={locale}
                providers={[
                  { label: "Klook", href: SHINKANSEN_TICKET_URL, provider: "klook", product: "shinkansen_ticket", placement: "shinkansen_ticket", variant: "primary", category: "train" },
                  ...(OMIO_TOKYO_KYOTO_URL ? [{ label: "Omio", href: OMIO_TOKYO_KYOTO_URL, provider: "omio" as const, product: "route_compare", placement: "train_route_comparison" as const, variant: "secondary" as const, category: "train" as const, route: "tokyo-kyoto" }] : []),
                ]}
              />
            </div>
          </section>

          {/* FAQ */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">FAQ</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name}>
                  <dt className="font-semibold text-slate-900">{item.name}</dt>
                  <dd className="mt-1 leading-6 text-slate-600">{item.acceptedAnswer.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Related pages */}
          <section>
            <h2 className="text-lg font-bold text-slate-950">Related pages</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat for Fuji?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Direction-specific seat and timing guide.</span>
              </Link>
              <Link href="/jr-pass-vs-single-ticket" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">JR Pass vs single tickets</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Full comparison with example routes.</span>
              </Link>
              <Link href="/itineraries/7-day-first-time-japan" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">7-day Japan itinerary</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Place the Shinkansen day in a full route.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E explained</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Window, aisle, and layout breakdown.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="train" locale={locale} />
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
