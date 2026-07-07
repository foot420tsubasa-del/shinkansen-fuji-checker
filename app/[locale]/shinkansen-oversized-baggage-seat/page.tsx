import type { Metadata } from "next";
import { ArrowRight, Luggage, Ruler, Ticket, AlertTriangle, Mountain } from "lucide-react";
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

const PAGE_PATH = "/shinkansen-oversized-baggage-seat";
const title = "Shinkansen Oversized Baggage: Which Seat to Reserve for Big Suitcases?";
const description =
  "Suitcases over 160cm (length + width + depth) need a free 'oversized baggage' seat reservation on the Tokaido Shinkansen. How to book it, the ¥1,000 penalty, and how to keep the Mt. Fuji window at the same time.";

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
      name: "Do I need a special Shinkansen seat for a large suitcase?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If your bag's total dimensions (length + width + depth) are over 160cm, you must reserve a 'seat with oversized baggage area' on the Tokaido, Sanyo, and Kyushu Shinkansen. The reservation itself is free — you just have to make it when booking.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if I bring an oversized bag without a reservation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Staff may charge a ¥1,000 fee on board and move your bag to a space the crew designates. Reserving the oversized baggage seat in advance is free, so there is no reason to risk it.",
      },
    },
    {
      "@type": "Question",
      name: "Can I still get the Mt. Fuji window with an oversized baggage seat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually yes. Oversized baggage seats are the last row of the car, and that row includes Seat E — the Mt. Fuji-side window on the Tokaido Shinkansen. Ask for the last-row Seat E with the oversized baggage area.",
      },
    },
    {
      "@type": "Question",
      name: "Does a normal carry-on suitcase need the oversized baggage seat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Bags up to 160cm total dimensions — which covers most check-in suitcases up to roughly the large-medium class — can use the overhead rack or the space in front of your knees without any special reservation.",
      },
    },
  ],
};

export default async function OversizedBaggageSeatPage({ params }: Props) {
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
          Shinkansen baggage rules
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
              <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Measure first:</strong> add length + width + depth. Up to 160cm — no special seat needed.</span>
            </li>
            <li className="flex gap-2">
              <Luggage className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>161–250cm:</strong> reserve a <strong>seat with oversized baggage area</strong> (last row). The reservation is free.</span>
            </li>
            <li className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>No reservation:</strong> ¥1,000 fee on board. Over 250cm can&rsquo;t be brought on at all.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Keep the view:</strong> ask for last-row <strong>Seat E</strong> — baggage space and the Mt. Fuji window together.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">How the rule works</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                On the Tokaido, Sanyo, and Kyushu Shinkansen, any bag whose three dimensions add up to <strong>more than 160cm</strong> counts as oversized baggage. It must travel in the dedicated space behind the last row of seats, and that space belongs to the passengers who reserved the <strong>seats with oversized baggage area</strong> — the last row of each reserved car.
              </p>
              <p>
                The reservation costs nothing extra: it is a normal reserved seat with a flag added. You select it when booking online (Smart EX and similar systems show a checkbox or seat type) or simply tell the counter staff you have a large suitcase.
              </p>
              <p>
                Non-reserved cars have no oversized baggage seats, so with a big suitcase you should book a reserved seat regardless of which train type you take.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Does your suitcase actually count?</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Most suitcases don&rsquo;t. A typical large check-in case is around 75 × 50 × 30cm ≈ 155cm total — just under the limit. The rule mainly catches <strong>XL cases, surfboards, bike bags, and musical instruments</strong>. Measure before you assume: if you are within 160cm, use the overhead rack and skip the special seat entirely.
              </p>
              <p>
                If you are borderline, reserving the oversized baggage seat anyway is free insurance — the worst case of guessing wrong is a ¥1,000 on-board fee and an awkward conversation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">How to book it (and keep Seat E)</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                At a JR ticket office, say or show: 「<strong>特大荷物スペースつき座席をお願いします。E席があれば嬉しいです</strong>」 (An oversized-baggage seat please — Seat E if available). Online, choose the oversized baggage seat option and pick the last-row E seat on the seat map when offered.
              </p>
              <p>
                Heading Tokyo → Kyoto/Osaka, that last-row Seat E is on the right side — the Mt. Fuji side. Coming back, the same Seat E logic applies on the left. The view near Shin-Fuji is identical to any other E seat.
              </p>
            </div>
          </section>

          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Book your Shinkansen ticket</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Reserve the seat type when you book — oversized baggage seats can sell out on busy days.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedAffiliateLink
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="baggage_seat_booking"
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
              <Link href="/shinkansen-reserved-vs-non-reserved" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Reserved vs non-reserved seats</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Why big luggage means booking reserved.</span>
              </Link>
              <Link href="/guide#seat-e" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat E and the Mt. Fuji side</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The full seat-letter and direction guide.</span>
              </Link>
              <Link href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo with luggage</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Hotel bases and stations that are easy with suitcases.</span>
              </Link>
              <Link href="/areas-to-stay/where-to-stay-before-shinkansen" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Where to stay before the Shinkansen</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Bases that make an early departure painless.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="seat" locale={locale} />
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
          <Ticket className="h-3.5 w-3.5" />
          <span>Rules and fees can change — confirm current JR baggage rules when you book.</span>
        </div>
      </Container>
      <SiteFooter />
    </main>
  );
}
