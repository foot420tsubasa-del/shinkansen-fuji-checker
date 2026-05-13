import type { Metadata } from "next";
import { ArrowRight, ExternalLink, Info, Train, Mountain, Calculator } from "lucide-react";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { JR_PASS_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";

type Props = { params: Promise<{ locale: string }> };

const title = "Tokyo, Kyoto and Osaka: JR Pass or Single Shinkansen Tickets?";
const description =
  "For Tokyo, Kyoto and Osaka trips, compare whether a JR Pass is worth it or if single Shinkansen tickets are simpler for first-time Japan travelers.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a JR Pass for Tokyo, Kyoto and Osaka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually not. The classic Tokyo → Kyoto → Osaka route typically involves one Shinkansen ride (Tokyo to Kyoto, about ¥13,320). A 7-day JR Pass costs about ¥50,000 — far more than a single ticket. Single tickets are usually simpler.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Kyoto to Osaka cost without a JR Pass?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You don't need the Shinkansen for Kyoto to Osaka. The JR Special Rapid train takes about 30 minutes and costs about ¥580 — just tap your IC card. No pass or reservation needed.",
      },
    },
    {
      "@type": "Question",
      name: "When should I consider a JR Pass for this route?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Consider comparing the JR Pass if you add Hiroshima (Shinkansen round trip from Osaka), return to Tokyo by Shinkansen, or plan multiple JR day trips from Kyoto. Add up individual ticket costs and compare.",
      },
    },
  ],
};

const costBreakdown = [
  { leg: "Tokyo → Kyoto (Shinkansen Nozomi)", cost: "~¥13,320", note: "Reserved Ordinary Car" },
  { leg: "Kyoto → Osaka (JR Special Rapid)", cost: "~¥580", note: "IC card, no reservation" },
  { leg: "Osaka → KIX (Nankai Rapi:t)", cost: "~¥1,450", note: "If flying from Kansai" },
  { leg: "Total (one-way, fly out KIX)", cost: "~¥15,350", note: "vs ~¥50,000 for 7-day JR Pass" },
];

export default async function PassVsTicketTKOPage({ params }: Props) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const compareTrainTicketsLabel = tCommon("compareTrainTickets");

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-tko-pass"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Route-specific rail guide
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Tokyo, Kyoto and Osaka: JR Pass or Single Tickets?
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
              <span><strong>Tokyo → Kyoto → Osaka only:</strong> single Shinkansen tickets are usually easier and cheaper.</span>
            </li>
            <li className="flex gap-2">
              <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Add Hiroshima or multiple long-distance day trips:</strong> compare JR Pass.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Kyoto → Osaka is cheap by local train (¥580) — no Shinkansen needed.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Check your <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="font-semibold text-emerald-800 underline underline-offset-2">Mt. Fuji-side seat</Link> before booking Tokyo → Kyoto.</span>
            </li>
          </ul>
        </section>

        <div className="mt-10 space-y-8">
          {/* Cost breakdown */}
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

          {/* Why single tickets work */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Why single tickets work for this route</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                The classic Tokyo → Kyoto → Osaka route only requires <strong>one Shinkansen ride</strong> (Tokyo to Kyoto). The Kyoto to Osaka leg is a short local train. If you fly out of Kansai Airport, your total intercity rail cost is about ¥15,000 — far below the ¥50,000 JR Pass.
              </p>
              <p>
                Single tickets also let you ride the <strong>Nozomi</strong> (fastest Shinkansen), which is not covered by the standard JR Pass. With a JR Pass, you&apos;d need to take the Hikari, adding about 20 minutes.
              </p>
            </div>
          </section>

          {/* When JR Pass tips */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">When the JR Pass may tip for this route</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />You return to Tokyo by Shinkansen (adds ~¥13,870)</li>
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />You add a Hiroshima day trip from Osaka (adds ~¥20,000 round trip)</li>
                <li className="flex items-start gap-2"><Train className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />You plan multiple JR day trips from Kyoto (Nara, Himeji by JR)</li>
              </ul>
              <p>
                In these cases, add up the individual costs and compare with the current JR Pass price. The break-even point depends on the exact JR Pass price, which changes.
              </p>
              <Link href="/jr-pass-vs-single-ticket" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900">
                Full JR Pass vs single ticket comparison
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Hotel bases */}
          <section>
            <h2 className="text-xl font-bold text-slate-950">Recommended hotel bases</h2>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              <p>
                Choose bases near major stations to keep logistics simple:
              </p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Link href="/areas-to-stay/where-to-stay-before-shinkansen" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo base</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Tokyo Station, Shinjuku, or Ueno — pick by departure plan.</span>
              </Link>
              <Link href="/areas-to-stay/kyoto-first-time" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Kyoto base</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Kyoto Station area for Shinkansen access.</span>
              </Link>
              <Link href="/areas-to-stay/osaka-first-time" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Osaka base</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Namba for food, Umeda for transit, Shin-Osaka for trains.</span>
              </Link>
            </div>
          </section>

          {/* Seat planning */}
          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Check your Mt. Fuji-side seat</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              The Tokyo → Kyoto Shinkansen passes Mt. Fuji about 40–50 minutes in. Whether you use a single ticket or JR Pass, the seat reservation determines your view.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/#seat-checker"
                className="inline-flex items-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f6f45]"
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
              <TrackedAffiliateLink
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="jr_pass_comparison"
                pagePath="/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka"
                locale={locale}
                label="Compare train tickets"
                className="flex items-center justify-between rounded-[18px] border border-[#ff7a00] bg-[#fff3e7] p-4 text-sm shadow-sm transition-colors hover:bg-white"
              >
                <span>
                  <span className="block font-bold text-[#b44b00]">{compareTrainTicketsLabel}</span>
                  <span className="mt-0.5 block text-xs text-[#b44b00]/70">Single ticket — simplest for this route.</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#b44b00]" />
              </TrackedAffiliateLink>
              <TrackedAffiliateLink
                href={JR_PASS_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="jr_pass_comparison"
                pagePath="/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka"
                locale={locale}
                label="Compare JR Pass"
                className="flex items-center justify-between rounded-[18px] border border-[#ff7a00] bg-[#fff3e7] p-4 text-sm shadow-sm transition-colors hover:bg-white"
              >
                <span>
                  <span className="block font-bold text-[#b44b00]">Compare JR Pass</span>
                  <span className="mt-0.5 block text-xs text-[#b44b00]/70">Only if adding Hiroshima or return leg.</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#b44b00]" />
              </TrackedAffiliateLink>
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
              <Link href="/jr-pass-vs-single-ticket" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">JR Pass vs single tickets</span>
                <span className="mt-1 block text-xs text-[#5f7190]">General comparison with multiple example routes.</span>
              </Link>
              <Link href="/itineraries/tokyo-kyoto-osaka-without-jr-pass" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Itinerary without JR Pass</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Full day-by-day plan using single tickets.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-shinkansen-ticket" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo to Kyoto ticket guide</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Station choice, seat, luggage, and booking.</span>
              </Link>
              <Link href="/guide" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Full Shinkansen guide</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Everything about Fuji-side seats, timing, and booking.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="train" locale={locale} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <p className="mt-1">Partner links shown where they match the planning step.</p>
          <LastCheckedNote className="mt-3" />
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
