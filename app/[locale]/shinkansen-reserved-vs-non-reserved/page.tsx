import type { Metadata } from "next";
import { ArrowRight, Ticket, Users, Mountain, Luggage } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/shinkansen-reserved-vs-non-reserved";
const title = "Shinkansen Reserved vs Non-Reserved Seats: Which Should You Book?";
const description =
  "Reserved seats cost only a few hundred yen more and guarantee your seat — and the Mt. Fuji window. Non-reserved cars are first-come, first-served. When each makes sense, and when non-reserved is a bad idea.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates(PAGE_PATH, locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much more does a reserved Shinkansen seat cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually a few hundred yen (roughly ¥500–¥900 depending on season) on top of the base fare — a small share of a ticket that costs over ¥13,000 Tokyo to Kyoto. Prices vary, so confirm when booking.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see Mt. Fuji from a non-reserved car?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only if you manage to grab an E-seat window, which is not guaranteed — at busy times you may stand or sit on the aisle. If the Mt. Fuji view matters to you, reserve Seat E in advance.",
      },
    },
    {
      "@type": "Question",
      name: "Which cars are non-reserved on the Tokaido Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Typically the first cars of the train (cars 1–3 on most Tokaido services). During the busiest holiday periods some trains run fully reserved, so check before relying on non-reserved cars.",
      },
    },
    {
      "@type": "Question",
      name: "When is non-reserved actually the better choice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Short hops (like Tokyo to Odawara or Atami), fully flexible departure times outside rush hours, and solo travel with light luggage. You can just walk up and take the next train.",
      },
    },
  ],
};

export default async function ReservedVsNonReservedPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {/* Plain <script> so the JSON-LD server-renders into the initial HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Seat class decision
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {description}
        </p>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
            Quick answer
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Default: reserve.</strong> A few hundred yen buys a guaranteed seat — and lets you pick Seat E.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Mt. Fuji view:</strong> only a reservation guarantees the E-seat window.</span>
            </li>
            <li className="flex gap-2">
              <Luggage className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Big suitcase:</strong> reserved is effectively required — oversized-baggage seats are reserved-only.</span>
            </li>
            <li className="flex gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Non-reserved works:</strong> short hops, flexible solo travel, off-peak hours.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">What you actually get for the extra fee</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                A reserved ticket names your car and seat, so you can board a minute before departure and walk straight to it. That certainty is what you are buying: <strong>a chosen seat (including the Fuji-side Seat E), guaranteed space for your group to sit together, and no queueing on the platform</strong>.
              </p>
              <p>
                Non-reserved cars are first-come, first-served. Outside rush hours from a starting station like Tokyo, you will usually find a seat — but not necessarily a window, and rarely three seats together. From mid-route stations at busy times, standing is a real possibility.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">The Mt. Fuji reason to reserve</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                The Fuji-side window is a specific seat — <strong>Seat E</strong> in Ordinary Cars. In a non-reserved car you compete for it with everyone who boarded before you. If the view is one of the reasons you booked a daytime train, spend the few hundred yen and lock the seat when you book.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">When non-reserved is the right call</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Non-reserved shines for <strong>flexibility on short segments</strong>: Tokyo to Odawara or Atami, a spontaneous Kodama hop, or when you don&rsquo;t want to commit to a departure time. Trains run so frequently that missing one costs minutes, not hours. Keep it for light-luggage, off-peak, solo situations — and note that during peak holiday weeks some trains run fully reserved.
              </p>
            </div>
          </section>

          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Book with a reserved Seat E</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Pick the seat from the seat map when booking — column E for the Mt. Fuji side.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedAffiliateLink
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="reserved_seat_booking"
                label="Book Shinkansen ticket"
                linkId="shinkansenTicket"
                product="shinkansen_ticket"
                pagePath={PAGE_PATH}
                locale={locale}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D94A32] bg-[#D94A32] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#bf3d28]"
              >
                Book Shinkansen ticket
                <ArrowRight className="h-4 w-4" />
              </TrackedAffiliateLink>
              <Link
                href="/#seat-checker"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#246449]"
              >
                Check the Fuji-side seat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

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

          <section>
            <h2 className="text-lg font-bold text-slate-950">Related pages</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Link href="/shinkansen-oversized-baggage-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Oversized baggage seats</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Bags over 160cm need a specific reserved seat.</span>
              </Link>
              <Link href="/nozomi-vs-hikari-vs-kodama" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Nozomi vs Hikari vs Kodama</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Which train type to pick before the seat.</span>
              </Link>
              <Link href="/shinkansen-green-car-worth-it" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Is the Green Car worth it?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The step above reserved Ordinary seats.</span>
              </Link>
              <Link href="/guide#seat-e" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat E and the Mt. Fuji side</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The seat to name when you reserve.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="seat" locale={locale} />
        </div>
      </Container>
      <SiteFooter />
    </main>
  );
}
