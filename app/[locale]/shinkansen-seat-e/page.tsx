import type { Metadata } from "next";
import { ArrowRight, Mountain, Train } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const title = "Shinkansen Seat E: Is It the Mt. Fuji Side?";
const description =
  "Learn when Seat E is the Mt. Fuji-side window seat on the Tokaido Shinkansen, including Tokyo to Kyoto/Osaka and Kyoto/Osaka to Tokyo directions.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/shinkansen-seat-e", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Seat E always the Mt. Fuji side on the Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In standard Ordinary Cars with 3+2 seating, Seat E is usually the Mt. Fuji-side window on the Tokaido Shinkansen. In Green Cars with 2+2 seating, the Fuji-side window is usually Seat D.",
      },
    },
    {
      "@type": "Question",
      name: "Does Seat E work for both Tokyo to Kyoto and Kyoto to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. For both directions on the Tokaido Shinkansen, Seat E in Ordinary Cars is typically the Mt. Fuji-side window seat. The mountain is on the same physical side of the track regardless of direction.",
      },
    },
    {
      "@type": "Question",
      name: "What about Green Car — is Seat E still the Fuji side?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Green Cars have a 2+2 layout (A–B aisle C–D), so the Fuji-side window is usually Seat D, not E.",
      },
    },
  ],
};

export default async function ShinkansenSeatEPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-seat-e"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Shinkansen seat guide
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
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ordinary Car (3+2 layout):</strong> Seat E is usually the Mt. Fuji-side window seat.</span>
            </li>
            <li className="flex gap-2">
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Tokyo → Kyoto/Osaka:</strong> Sit on the right side — Seat E.</span>
            </li>
            <li className="flex gap-2">
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Kyoto/Osaka → Tokyo:</strong> Seat E is still usually the Fuji-side window.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Green Car (2+2 layout):</strong> The Fuji-side window is usually Seat D.</span>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Check your seat instantly</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Choose your direction and confirm the best seat with our free checker.
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
            <h2 className="text-xl font-bold text-slate-950">Why Seat E?</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Most Tokaido Shinkansen Ordinary Cars use a 3+2 seat layout: seats A, B, C on one side of the aisle, and D, E on the other. On the Tokaido line (Tokyo–Nagoya–Kyoto–Osaka), the D–E side faces Mt. Fuji for a significant stretch near Shin-Fuji station.
              </p>
              <p>
                Since Seat E is the window seat on that side, it gives you the clearest view without leaning past another passenger. This applies in both directions — the mountain is on the same physical side of the track whether you&apos;re heading west or east.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Green Car: Seat D instead</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Green Cars (first class) use a 2+2 layout: A–B on one side, C–D on the other. The Fuji-facing window is Seat D in this configuration. If you booked a Green Car, check the seat map before assuming Seat E.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">When to expect the view</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                The best Mt. Fuji viewing window is around Shin-Fuji station — roughly 40–50 minutes from Tokyo or 70–80 minutes from Kyoto. The view lasts about 30–60 seconds at full speed. Clear mornings give the best chance; cloud cover is common in afternoon and summer months.
              </p>
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
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Direction-specific seat and timing guide.</span>
              </Link>
              <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Kyoto → Tokyo: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Return direction seat and viewing tips.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E explained</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Window, aisle, and layout guide.</span>
              </Link>
              <Link href="/areas-to-stay/where-to-stay-before-shinkansen" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Where to stay before Shinkansen</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Tokyo Station vs Shinjuku vs Ueno.</span>
              </Link>
            </div>
          </section>

          <SuggestedNextSteps currentPageType="seat" locale={locale} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
