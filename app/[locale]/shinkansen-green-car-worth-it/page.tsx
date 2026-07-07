import type { Metadata } from "next";
import { ArrowRight, Armchair, Mountain, Ticket, Laptop } from "lucide-react";
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

const PAGE_PATH = "/shinkansen-green-car-worth-it";
const title = "Is the Shinkansen Green Car Worth It? Seats, Price, and the Fuji Window";
const description =
  "The Green Car is the Shinkansen's first class: 2+2 seating, more recline and legroom, quieter cars. It costs roughly ¥4,000–6,000 extra Tokyo–Kyoto. The Mt. Fuji view is the same — the window just becomes Seat D.";

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
      name: "What is the difference between the Green Car and Ordinary Car?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Green Car uses a 2+2 layout instead of 3+2, with wider seats, more recline, more legroom, footrests, and a quieter atmosphere. Ordinary reserved cars are already comfortable — the Green Car is a comfort upgrade, not a necessity.",
      },
    },
    {
      "@type": "Question",
      name: "How much extra does the Green Car cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Roughly ¥4,000–6,000 more than an Ordinary reserved seat for Tokyo–Kyoto/Osaka, depending on the season and service. Confirm the exact fare when booking.",
      },
    },
    {
      "@type": "Question",
      name: "Which Green Car seat faces Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Seat D. Green Cars use a 2+2 layout, so the Fuji-side window that is Seat E in Ordinary Cars becomes Seat D in the Green Car. The view itself is identical.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Green Car worth it for the Mt. Fuji view?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not for the view alone — the mountain looks the same through an Ordinary Car window. Pay for the Green Car if you want space, quiet, or a comfortable place to work; choose it for comfort, not scenery.",
      },
    },
  ],
};

export default async function GreenCarWorthItPage({ params }: Props) {
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
          Comfort upgrade decision
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
              <Armchair className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Worth it for:</strong> space and quiet on a 2.5h+ ride, working on board, or a one-time treat.</span>
            </li>
            <li className="flex gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Skip it if:</strong> budget matters — Ordinary reserved is already spacious by global rail standards.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Fuji window:</strong> <strong>Seat D</strong> in the Green Car (2+2 layout) — not Seat E.</span>
            </li>
            <li className="flex gap-2">
              <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>The view:</strong> identical to Ordinary Car. Don&rsquo;t upgrade for scenery.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">What the upgrade actually buys</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Four seats per row instead of five means every seat is wider, with generous recline, legroom, and a footrest. Green Cars also tend to be <strong>noticeably quieter</strong> — fewer tour groups, more business travelers — which is the part frequent riders actually pay for.
              </p>
              <p>
                What it does not buy: speed (same train), a better Mt. Fuji view (same glass), or meals (there is no included service; bring what you want to eat or drink).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">The Seat D detail most people miss</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Because the Green Car drops to a 2+2 layout, the seat letters shift: the Fuji-side window is <strong>Seat D</strong>, not Seat E. Book Green Car Seat D heading Tokyo → Kyoto/Osaka (or returning) and you have the same right-side/left-side view logic as Ordinary Car Seat E.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">A simple rule of thumb</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                If the extra ~¥5,000 is meaningful to your trip budget, spend it on a better dinner or hotel night instead — Ordinary reserved with Seat E already gives you the comfortable ride and the view. If the cost is trivial to you, or you want two calm hours to work, the Green Car is a genuinely pleasant upgrade.
              </p>
            </div>
          </section>

          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Book your seat</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Ordinary Car: pick Seat E. Green Car: pick Seat D. Both from the seat map at booking.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedAffiliateLink
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="green_car_booking"
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
                <span className="font-bold text-[#082653]">Reserved vs non-reserved</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The cheaper decision to make first.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E explained</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Why E becomes D in the Green Car.</span>
              </Link>
              <Link href="/nozomi-vs-hikari-vs-kodama" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Nozomi vs Hikari vs Kodama</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Pick the train type before the car class.</span>
              </Link>
              <Link href="/guide" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Full Mt. Fuji seat guide</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Side, timing, and booking steps.</span>
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
