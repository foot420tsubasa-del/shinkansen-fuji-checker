import type { Metadata } from "next";
import { ArrowRight, Mountain, Train, Clock3, Cloud } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const title = "Osaka to Tokyo Shinkansen: Which Seat to See Mt. Fuji?";
const description =
  "For Osaka to Tokyo, sit on the left side of the Tokaido Shinkansen. In Ordinary Car, Seat E is usually the Mt. Fuji-side window seat — the view comes late in the ride.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/osaka-to-tokyo-mt-fuji-seat", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which side of the Shinkansen is Mt. Fuji on from Osaka to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mt. Fuji is on the left side of the train when traveling from Shin-Osaka to Tokyo. In Ordinary Cars, Seat E is usually the Fuji-side window seat.",
      },
    },
    {
      "@type": "Question",
      name: "How long after leaving Shin-Osaka can I see Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "About 85–95 minutes after leaving Shin-Osaka, near Shin-Fuji station. This is roughly 40–50 minutes before arriving at Tokyo Station.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seat E still correct going back to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Seats rotate to face forward, so Seat E is usually the Fuji-side window in both directions — right side going to Osaka, left side coming back to Tokyo.",
      },
    },
  ],
};

export default async function OsakaToTokyoSeatPage({ params }: Props) {
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
          Osaka → Tokyo
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
              <span><strong>Direction:</strong> Shin-Osaka → Tokyo — sit on the left side.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ordinary Car:</strong> Seat E (Fuji-side window in both directions).</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Green Car:</strong> Seat D (Fuji-side window in 2+2 layout).</span>
            </li>
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Watch for it:</strong> Around Shin-Fuji, ~85–95 min after Shin-Osaka departure.</span>
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
            Select Osaka → Tokyo and see the seat map with the Fuji side highlighted.
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
            <h2 className="text-xl font-bold text-slate-950">Why the side changes but Seat E doesn&rsquo;t</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Mt. Fuji sits on the same physical side of the track in both directions. Because Shinkansen seats rotate to face forward, Seat E in Ordinary Cars is usually the Fuji-side window whether you ride Tokyo→Osaka or Osaka→Tokyo. The only real difference is when the mountain appears — early from Tokyo, late from Osaka.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Timing from Shin-Osaka</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                From Shin-Osaka, expect the Mt. Fuji viewing window around 85–95 minutes into your journey, near Shin-Fuji station — about 15 minutes later than from Kyoto. This means the view comes roughly 40–50 minutes before Tokyo Station arrival.
              </p>
              <p>
                Set a timer or watch for Shizuoka station announcements — Shin-Fuji is the next major stretch after that. The view lasts about 30–60 seconds at speed.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Arriving in Tokyo</h2>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              <p>
                If Tokyo is your last stop before flying home, where you stay near the station affects your airport run. Compare bases around Tokyo Station, Ginza, and Ueno for easy Narita or Haneda access.
              </p>
            </div>
            <Link
              href="/areas-to-stay/tokyo-first-time"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D5B] transition-colors hover:text-[#246449]"
            >
              Where to stay in Tokyo
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
              <Link href="/tokyo-to-osaka-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Osaka: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Outbound direction seat and viewing tips.</span>
              </Link>
              <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Kyoto → Tokyo: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Same line — Kyoto-specific timing.</span>
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
