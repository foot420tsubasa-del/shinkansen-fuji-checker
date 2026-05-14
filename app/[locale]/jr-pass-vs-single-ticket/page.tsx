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
import { JR_PASS_URL, OMIO_JAPAN_RAIL_PASS_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";

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
    openGraph: { title, description, siteName: "fujiseat" },
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
      name: "Which Shinkansen seat is best for Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the Tokaido Shinkansen, Seat E (window, two-seat side) is usually the Mt. Fuji-side window in Ordinary Cars. In Green Cars, it is usually Seat D. This applies in both directions.",
      },
    },
  ],
};

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
  const compareTrainTicketsLabel = tCommon("compareTrainTickets");

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-jr-pass"
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

          {/* Seat planning note */}
          <section className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Before you book: check your Fuji-side seat</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Whether you buy a single ticket or use a JR Pass, the seat reservation is separate. Choose the Mt. Fuji-side window for the Tokaido Shinkansen.
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
                pagePath="/jr-pass-vs-single-ticket"
                locale={locale}
                label="Compare train tickets"
                className="flex items-center justify-between rounded-[18px] border border-[#ff7a00] bg-[#fff3e7] p-4 text-sm shadow-sm transition-colors hover:bg-white"
              >
                <span>
                  <span className="block font-bold text-[#b44b00]">{compareTrainTicketsLabel}</span>
                  <span className="mt-0.5 block text-xs text-[#b44b00]/70">Single ticket — simplest for most routes.</span>
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
                pagePath="/jr-pass-vs-single-ticket"
                locale={locale}
                label="Compare JR Pass"
                className="flex items-center justify-between rounded-[18px] border border-[#ff7a00] bg-[#fff3e7] p-4 text-sm shadow-sm transition-colors hover:bg-white"
              >
                <span>
                  <span className="block font-bold text-[#b44b00]">Compare JR Pass</span>
                  <span className="mt-0.5 block text-xs text-[#b44b00]/70">Only if your route has enough long-distance legs.</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#b44b00]" />
              </TrackedAffiliateLink>
              {OMIO_JAPAN_RAIL_PASS_URL ? (
                <TrackedAffiliateLink
                  href={OMIO_JAPAN_RAIL_PASS_URL}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  category="train"
                  provider="omio"
                  placement="jr_pass_comparison"
                  pagePath="/jr-pass-vs-single-ticket"
                  locale={locale}
                  label="Compare train routes on Omio"
                  className="flex items-center justify-between rounded-[18px] border border-indigo-200 bg-white p-4 text-sm shadow-sm transition-colors hover:bg-indigo-50"
                >
                  <span>
                    <span className="block font-bold text-indigo-700">Compare train routes on Omio</span>
                    <span className="mt-0.5 block text-xs text-indigo-700/70">Route comparison for trains and buses.</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-indigo-700" />
                </TrackedAffiliateLink>
              ) : null}
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
              <Link href="/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo–Kyoto–Osaka: pass or ticket?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Route-specific comparison for the classic trip.</span>
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
