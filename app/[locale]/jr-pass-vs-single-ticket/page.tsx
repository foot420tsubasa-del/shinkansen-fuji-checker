import type { Metadata } from "next";
import { ArrowRight, Info, Train, Mountain, Calculator } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { JR_PASS_URL, OMIO_JAPAN_RAIL_PASS_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { ProviderChoiceCTA } from "@/components/affiliate/ProviderChoiceCTA";

type Props = { params: Promise<{ locale: string }> };

const title = "JR Pass vs Single Shinkansen Tickets: Which Is Better for Japan?";
const description =
  "Compare the JR Pass and single Shinkansen tickets for first-time Japan travelers. Learn when a JR Pass is worth it and when Tokyo, Kyoto and Osaka are easier with single tickets.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/jr-pass-vs-single-ticket", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the JR Pass worth it for Tokyo to Kyoto only?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually not. A one-way Shinkansen ticket from Tokyo to Kyoto costs about ¥13,320. A 7-day JR Pass costs about ¥50,000. For a simple one-way or round trip, single tickets are usually cheaper and simpler.",
      },
    },
    {
      "@type": "Question",
      name: "When is the JR Pass worth buying?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The JR Pass may be worth comparing when your route includes multiple long-distance JR rides — for example, Tokyo → Kyoto → Hiroshima → Osaka → Tokyo. Add up the individual ticket costs and compare with the current JR Pass price.",
      },
    },
    {
      "@type": "Question",
      name: "Can I ride the Shinkansen without a JR Pass?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can buy individual Shinkansen tickets at any JR station, through online booking systems, or via travel booking platforms. No pass is required.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a JR Pass for Tokyo, Kyoto and Osaka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually not. The classic Tokyo → Kyoto → Osaka route needs only one Shinkansen ride (Tokyo to Kyoto, about ¥13,320). Kyoto to Osaka is a short local train, so single tickets total far less than a 7-day JR Pass.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Kyoto to Osaka cost without a JR Pass?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "About ¥580 by JR Special Rapid train (roughly 30 minutes). You can pay with an IC card — no reservation or Shinkansen needed.",
      },
    },
    {
      "@type": "Question",
      name: "Which Shinkansen seat is best for Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the Tokaido Shinkansen, Seat E (window, two-seat side) is usually the Mt. Fuji-side window in Ordinary Cars. In Green Cars, it is usually Seat D. This applies in both directions.",
      },
    },
  ],
};

// Absorbed from /shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka (301'd here):
// per-leg costs for the classic golden-route one-way.
const costBreakdown = [
  { leg: "Tokyo → Kyoto (Shinkansen Nozomi)", cost: "~¥13,320", note: "Reserved Ordinary Car" },
  { leg: "Kyoto → Osaka (JR Special Rapid)", cost: "~¥580", note: "IC card, no reservation" },
  { leg: "Osaka → KIX (Nankai Rapi:t)", cost: "~¥1,450", note: "If flying from Kansai" },
  { leg: "Total (one-way, fly out KIX)", cost: "~¥15,350", note: "vs ~¥50,000 for 7-day JR Pass" },
];

const routes = [
  {
    name: "7-day: Tokyo → Kyoto → Osaka",
    singleCost: "~¥13,320 one-way",
    passCost: "~¥50,000 (7-day)",
    verdict: "Single tickets are usually cheaper",
    link: "/itineraries/7-day-first-time-japan",
    linkLabel: "See 7-day itinerary",
  },
  {
    name: "10-day: Tokyo → Kyoto → Osaka (fly out KIX)",
    singleCost: "~¥13,320 one-way",
    passCost: "~¥50,000 (7-day)",
    verdict: "Single ticket — one Shinkansen leg only",
    link: "/itineraries/10-day-japan-with-fuji",
    linkLabel: "See 10-day itinerary",
  },
  {
    name: "14-day: Tokyo → Kyoto → Hiroshima → Osaka → Tokyo",
    singleCost: "~¥40,000–50,000 total",
    passCost: "~¥80,000 (14-day)",
    verdict: "Compare carefully — may be close",
    link: "/itineraries/14-day-japan-golden-route",
    linkLabel: "See 14-day itinerary",
  },
];

export default async function JrPassVsSingleTicketPage({ params }: Props) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const bookShinkansenTicketLabel = tCommon("bookShinkansenTicket");
  const checkJrPassOptionsLabel = tCommon("checkJrPassOptions");

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Rail decision guide
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          JR Pass vs Single Shinkansen Tickets
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
              <span><strong>Tokyo → Kyoto → Osaka only:</strong> single tickets are usually simpler and cheaper.</span>
            </li>
            <li className="flex gap-2">
              <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Add Hiroshima or multiple long-distance trips:</strong> compare the JR Pass price.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>First-time short trip:</strong> don&apos;t assume you need a JR Pass.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Always compare current prices before buying — JR Pass pricing changes.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>If taking the Tokaido Shinkansen, <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="font-semibold text-emerald-800 underline underline-offset-2">check your Mt. Fuji-side seat</Link> before booking.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          {/* When single tickets are better */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">When single tickets are better</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                A one-way Shinkansen ticket from Tokyo to Kyoto costs about <strong>¥13,320</strong>. A 7-day JR Pass costs about <strong>¥50,000</strong>. For the math to work, you need several long-distance JR rides within the pass window.
              </p>
              <p>
                Most first-time visitors doing the classic Tokyo → Kyoto → Osaka route only take one or two Shinkansen rides. In that case, single tickets are cheaper, require no activation process, and let you use any Shinkansen departure without worrying about pass validity dates.
              </p>
              <ul className="mt-2 space-y-1.5 pl-1">
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />One-way Tokyo → Kyoto or Tokyo → Osaka</li>
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Round trip with no side trips covered by JR</li>
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Flying out of KIX (Osaka) — no return Shinkansen</li>
                <li className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Short trips (5–7 days) with limited intercity travel</li>
              </ul>
            </div>
          </section>

          {/* When JR Pass may be worth it */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">When the JR Pass may be worth it</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                The JR Pass starts to make sense when your route includes <strong>multiple long-distance JR rides</strong> within the pass period. Examples:
              </p>
              <ul className="mt-2 space-y-1.5 pl-1">
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Tokyo → Kyoto → Hiroshima → Osaka → Tokyo (several Shinkansen legs)</li>
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Day trips from Kyoto to Hiroshima or Kanazawa by JR</li>
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />Return Shinkansen from Osaka back to Tokyo for departure</li>
              </ul>
              <p>
                Even in these cases, <strong>add up the individual ticket costs</strong> and compare with the current JR Pass price. The JR Pass price was raised significantly in 2023, and it doesn&apos;t always pay off the way older guides suggest.
              </p>
            </div>
          </section>

          {/* Route comparison */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Example route comparison</h2>
            <p className="mt-2 text-sm text-slate-500">Approximate prices — always confirm current rates before booking.</p>
            <div className="mt-4 space-y-3">
              {routes.map((route) => (
                <div key={route.name} className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{route.name}</p>
                  <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-3">
                    <p><span className="font-semibold text-slate-900">Single tickets:</span> {route.singleCost}</p>
                    <p><span className="font-semibold text-slate-900">JR Pass:</span> {route.passCost}</p>
                    <p><span className="font-semibold text-slate-900">Verdict:</span> {route.verdict}</p>
                  </div>
                  <Link
                    href={route.link}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
                  >
                    {route.linkLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Cost breakdown (absorbed from the consolidated Tokyo/Kyoto/Osaka page) */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Cost breakdown: Tokyo → Kyoto → Osaka</h2>
            <p className="mt-2 text-sm text-slate-500">Approximate prices — always confirm current rates before booking.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4 font-semibold text-slate-900">Leg</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Cost</th>
                    <th className="py-2 font-semibold text-slate-900">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {costBreakdown.map((row) => (
                    <tr key={row.leg} className={["border-b border-slate-100", row.leg.startsWith("Total") ? "bg-emerald-50 font-semibold" : ""].join(" ")}>
                      <td className="py-2.5 pr-4 text-slate-900">{row.leg}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{row.cost}</td>
                      <td className="py-2.5 text-slate-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Seat planning note */}
          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Before you book: check your Fuji-side seat</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Whether you buy a single ticket or use a JR Pass, the seat reservation is separate. Choose the Mt. Fuji-side window for the Tokaido Shinkansen.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/#seat-checker"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#246449]"
              >
                Open Seat Checker
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tokyo-to-kyoto-mt-fuji-seat"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Which seat for Fuji?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Booking links */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Booking options</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProviderChoiceCTA
                actionLabel={bookShinkansenTicketLabel}
                description="Single ticket — simplest for most routes."
                pagePath="/jr-pass-vs-single-ticket"
                locale={locale}
                providers={[
                  { label: "Klook", href: SHINKANSEN_TICKET_URL, provider: "klook", product: "shinkansen_ticket", adid: "1265303", linkId: "shinkansenTicket", placement: "jrpass_booking_options", variant: "primary", category: "train" },
                  ...(OMIO_JAPAN_RAIL_PASS_URL ? [{ label: "Omio", href: OMIO_JAPAN_RAIL_PASS_URL, provider: "omio" as const, product: "route_compare", linkId: "omioJapanRailPass", placement: "jrpass_booking_options" as const, variant: "text" as const, category: "train" as const }] : []),
                ]}
              />
              <ProviderChoiceCTA
                actionLabel={checkJrPassOptionsLabel}
                description="Only if your route has enough long-distance legs."
                pagePath="/jr-pass-vs-single-ticket"
                locale={locale}
                providers={[
                  { label: "Klook", href: JR_PASS_URL, provider: "klook", product: "jr_pass", adid: "1165791", linkId: "jrPass", placement: "jrpass_booking_options", variant: "primary", category: "train" },
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
              <Link href="/tokyo-to-kyoto-shinkansen-ticket" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo to Kyoto ticket guide</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Station choice, seat, luggage, and booking tips.</span>
              </Link>
              <Link href="/nozomi-vs-hikari-vs-kodama" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Nozomi vs Hikari vs Kodama</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The train-type decision behind the pass question.</span>
              </Link>
              <Link href="/itineraries/tokyo-kyoto-osaka-without-jr-pass" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Itinerary without JR Pass</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Full day-by-day plan using single tickets.</span>
              </Link>
              <Link href="/areas-to-stay/where-to-stay-before-shinkansen" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Where to stay before the Shinkansen</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Pick a hotel base near your departure station.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="train" locale={locale} />

          <ShareThisPage
            title="JR Pass vs Single Shinkansen Tickets"
            placement="jr_pass_footer"
            description="Still deciding about the JR Pass? Share this comparison with your travel group."
            locale={locale}
            className="mt-8"
          />
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
