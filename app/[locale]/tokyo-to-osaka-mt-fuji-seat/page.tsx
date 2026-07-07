import type { Metadata } from "next";
import { ArrowRight, Mountain, Train, Clock3, Cloud } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const title = "Tokyo to Osaka Shinkansen: Which Seat to See Mt. Fuji?";
const description =
  "For Tokyo to Osaka, sit on the right side of the Tokaido Shinkansen. In Ordinary Car, Seat E is usually the Mt. Fuji-side window seat — the view comes early in the ride.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/tokyo-to-osaka-mt-fuji-seat", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which side of the Shinkansen is Mt. Fuji on from Tokyo to Osaka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mt. Fuji is on the right side of the train when traveling from Tokyo to Shin-Osaka. In Ordinary Cars, Seat E is usually the right-side window seat.",
      },
    },
    {
      "@type": "Question",
      name: "How long after leaving Tokyo can I see Mt. Fuji on the way to Osaka?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "About 40–50 minutes after departing Tokyo Station, near Shin-Fuji station — early in the roughly 2.5-hour ride to Shin-Osaka. The view lasts about 30–60 seconds at speed.",
      },
    },
    {
      "@type": "Question",
      name: "Is the seat advice different for Osaka vs Kyoto trips?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Tokyo→Kyoto and Tokyo→Osaka use the same Tokaido Shinkansen line past Mt. Fuji, so the answer is identical: right side, Seat E in Ordinary Cars (Seat D in Green Car).",
      },
    },
  ],
};

export default async function TokyoToOsakaSeatPage({ params }: Props) {
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
          Tokyo → Osaka
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
              <span><strong>Direction:</strong> Tokyo → Shin-Osaka — sit on the right side.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ordinary Car:</strong> Seat E (right-side window).</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Green Car:</strong> Seat D (right-side window in 2+2 layout).</span>
            </li>
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Best viewing area:</strong> Around Shin-Fuji station, ~40–50 min from Tokyo — early in the ride.</span>
            </li>
            <li className="flex gap-2">
              <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Visibility:</strong> Weather-dependent. Clear mornings are best.</span>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Check your seat instantly</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Select Tokyo → Osaka and see the seat map with the Fuji side highlighted.
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
              href="/guide"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Read full guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-950">Timing your view</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Tokyo to Shin-Osaka on the Nozomi takes about 2 hours 30 minutes, and the Mt. Fuji stretch comes early: the mountain appears on the right side approximately 40–50 minutes after leaving Tokyo Station, around Shin-Fuji station in Shizuoka Prefecture.
              </p>
              <p>
                The view lasts roughly 30–60 seconds at full speed. Have your camera ready a few minutes before — after the Fuji zone passes, the rest of the ride to Osaka has no comparable viewpoint, so don&rsquo;t wait.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">What affects visibility</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Weather is the biggest factor. Clear winter mornings (November–February) give the highest chance. Summer months often have clouds and haze. The fujiseat Seat Checker includes a real-time visibility estimate to help you set expectations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Arriving at Shin-Osaka, not Osaka Station</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                The Shinkansen arrives at Shin-Osaka, one JR stop (about 4 minutes) north of Osaka Station and directly on the Midosuji subway line for Namba. Where you stay in Osaka affects how easy that last hop is with luggage.
              </p>
            </div>
            <Link
              href="/areas-to-stay/shin-osaka-vs-namba"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D5B] transition-colors hover:text-[#246449]"
            >
              Shin-Osaka vs Namba — where to stay
              <ArrowRight className="h-4 w-4" />
            </Link>
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
              <Link href="/osaka-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Osaka → Tokyo: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Return direction seat and viewing tips.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Same line, same answer — Kyoto-specific timing.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E explained</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Window, aisle, and layout breakdown.</span>
              </Link>
              <Link href="/plan-your-trip" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Plan your trip essentials</span>
                <span className="mt-1 block text-xs text-[#5f7190]">eSIM, airport transfer, and rail booking links.</span>
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
