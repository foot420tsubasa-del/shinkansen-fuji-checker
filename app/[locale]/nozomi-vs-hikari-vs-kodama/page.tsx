import type { Metadata } from "next";
import { ArrowRight, Train, Clock3, Ticket, Mountain } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { SHINKANSEN_TICKET_URL, JR_PASS_URL } from "@/src/affiliateLinks";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const PAGE_PATH = "/nozomi-vs-hikari-vs-kodama";
const title = "Nozomi vs Hikari vs Kodama: Which Shinkansen Should You Take?";
const description =
  "Same trains, same tracks, same seats — different stops. Nozomi is fastest (Tokyo–Shin-Osaka ~2h30), Hikari ~3h, Kodama stops everywhere. The classic JR Pass does not cover Nozomi without a supplement.";

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
      name: "What is the difference between Nozomi, Hikari, and Kodama?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They are the same physical trains on the same Tokaido Shinkansen line — the only difference is how many stations they stop at. Nozomi stops the least (Tokyo–Shin-Osaka in about 2h30), Hikari stops at more stations (~3h), and Kodama stops at every station (~4h).",
      },
    },
    {
      "@type": "Question",
      name: "Does the JR Pass cover the Nozomi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The classic JR Pass does not include Nozomi or Mizuho services — pass holders ride Hikari or Kodama, or pay a separate Nozomi supplement where offered. If you buy single tickets instead, you can take any train including Nozomi.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Mt. Fuji seat different on Nozomi, Hikari, or Kodama?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All three run the same route past Mt. Fuji, so the advice is identical: Seat E in Ordinary Cars (Seat D in Green Car) is usually the Fuji-side window in both directions.",
      },
    },
    {
      "@type": "Question",
      name: "Which train is best for seeing Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The view is essentially the same from all three. Kodama stops at Shin-Fuji station in the heart of the viewing zone, which adds a slower, longer look; Nozomi and most Hikari pass through at full speed. For most travelers the time saved on a Nozomi outweighs the slightly longer glimpse.",
      },
    },
  ],
};

const rows = [
  { train: "Nozomi", stops: "Fewest (major cities only)", time: "~2h 30m", pass: "Not covered (supplement or single ticket)", best: "Most travelers on single tickets" },
  { train: "Hikari", stops: "Major + selected stations", time: "~3h 00m", pass: "Covered", best: "JR Pass holders" },
  { train: "Kodama", stops: "Every station (incl. Shin-Fuji)", time: "~3h 50m+", pass: "Covered", best: "Short hops, unhurried rides" },
];

export default async function TrainTypePage({ params }: Props) {
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
          Train type decision
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
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Single tickets:</strong> take the Nozomi — fastest, most frequent, same price class.</span>
            </li>
            <li className="flex gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>JR Pass:</strong> take the Hikari — Nozomi isn&rsquo;t covered by the classic pass.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Mt. Fuji:</strong> Seat E works on all three — the train type doesn&rsquo;t change the seat.</span>
            </li>
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Kodama:</strong> only worth it for short hops (e.g. to Shin-Fuji or Atami) or the slowest, calmest ride.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">Side-by-side: Tokyo → Shin-Osaka</h2>
            <p className="mt-2 text-sm text-slate-500">Approximate times — always confirm the timetable when you book.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4 font-semibold text-slate-900">Train</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Stops</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Time</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Classic JR Pass</th>
                    <th className="py-2 font-semibold text-slate-900">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.train} className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 font-semibold text-slate-900">{row.train}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{row.stops}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{row.time}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{row.pass}</td>
                      <td className="py-2.5 text-slate-600">{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Why Nozomi wins on single tickets</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Nozomi trains run several times an hour on the Tokyo–Osaka corridor and cost roughly the same as Hikari on a single ticket. Unless you hold a classic JR Pass, there is rarely a reason to take a slower service for a long leg. Book a reserved seat and you also lock in the Fuji-side window.
              </p>
              <p>
                The main exception is the JR Pass: the classic pass excludes Nozomi and Mizuho. Pass holders ride Hikari (about 30 minutes slower to Shin-Osaka) or pay the separate Nozomi supplement where it is offered.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">The Mt. Fuji angle</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                All three services pass the same viewing zone around Shin-Fuji station, and the seat advice never changes: <strong>Seat E</strong> in Ordinary Cars, Seat D in Green Car. Kodama actually stops at Shin-Fuji, which slows the passage and stretches the view; Nozomi and most Hikari sweep through at full speed for the classic 30–60 second window.
              </p>
            </div>
          </section>

          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Decide, then book</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Single ticket on the Nozomi for most trips; compare the JR Pass only if your route has multiple long-distance legs.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <TrackedAffiliateLink
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="train_type_booking"
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
              <TrackedAffiliateLink
                href={JR_PASS_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="train_type_booking"
                label="Check JR Pass options"
                linkId="jrPass"
                product="jr_pass"
                pagePath={PAGE_PATH}
                locale={locale}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Check JR Pass options
                <ArrowRight className="h-4 w-4" />
              </TrackedAffiliateLink>
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
              <Link href="/jr-pass-vs-single-ticket" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">JR Pass vs single tickets</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The cost comparison behind the train-type choice.</span>
              </Link>
              <Link href="/shinkansen-reserved-vs-non-reserved" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Reserved vs non-reserved</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Whether to pay the small reserved-seat fee.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Direction-specific seat and timing.</span>
              </Link>
              <Link href="/guide" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Full Mt. Fuji seat guide</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Side, seat letters, timing, and booking steps.</span>
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
