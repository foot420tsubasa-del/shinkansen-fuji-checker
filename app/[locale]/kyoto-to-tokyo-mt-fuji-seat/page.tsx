import type { Metadata } from "next";
import { ArrowRight, Mountain, Train, Clock3, Cloud } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const title = "Kyoto to Tokyo Shinkansen: Which Seat to See Mt. Fuji?";
const description =
  "For Kyoto or Osaka to Tokyo, this guide explains which side and seat to choose for Mt. Fuji views on the Tokaido Shinkansen.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/kyoto-to-tokyo-mt-fuji-seat", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which side is Mt. Fuji on from Kyoto to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mt. Fuji is on the left side of the train when traveling from Kyoto/Osaka to Tokyo. In Ordinary Cars, Seat E is usually the Fuji-side window seat.",
      },
    },
    {
      "@type": "Question",
      name: "How long before arriving in Tokyo can I see Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "About 70–80 minutes after leaving Kyoto, near Shin-Fuji station. This is roughly 40–50 minutes before arriving at Tokyo Station.",
      },
    },
    {
      "@type": "Question",
      name: "Is the view different going back to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The mountain is on the same physical side of the track in both directions. In Ordinary Cars, Seat E is usually the Fuji-side window for both Tokyo→Kyoto and Kyoto→Tokyo.",
      },
    },
  ],
};

export default async function KyotoToTokyoSeatPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Kyoto / Osaka → Tokyo
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
              <span><strong>Direction:</strong> Kyoto/Osaka → Tokyo — choose the Fuji-side window seat.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ordinary Car:</strong> Seat E is usually the safest simple answer.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Green Car:</strong> Usually Seat D (2+2 layout).</span>
            </li>
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Watch for it:</strong> Around Shin-Fuji, ~70–80 min after Kyoto departure.</span>
            </li>
            <li className="flex gap-2">
              <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Visibility:</strong> Depends on weather. Clear mornings are best.</span>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Check your seat instantly</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Select Osaka/Kyoto → Tokyo and see the seat map with the Fuji side highlighted.
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
            <h2 className="text-xl font-bold text-slate-950">Why the same seat works both ways</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                A common confusion: visitors assume the Fuji side flips when the train reverses direction. It doesn&apos;t — the Tokaido Shinkansen runs along the same track, and Mt. Fuji stays on the same physical side. The train doesn&apos;t rotate; the seats just face the other way.
              </p>
              <p>
                In Ordinary Cars, Seat E is typically the Fuji-side window for both directions. The only difference is when the mountain appears during your journey — earlier from Tokyo, later from Kyoto.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Timing from Kyoto</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                From Kyoto Station, expect the Mt. Fuji viewing window around 70–80 minutes into your journey, near Shin-Fuji station. From Shin-Osaka, add about 15 minutes. This means the view comes roughly 40–50 minutes before Tokyo Station arrival.
              </p>
              <p>
                Set a timer or watch for Shizuoka station announcements — Shin-Fuji is the next major stretch after that.
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
              <Link href="/guide#seat-e" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Is Seat E the Mt. Fuji side?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Seat E explained for both directions.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Outbound direction guide.</span>
              </Link>
              <Link href="/osaka-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Osaka → Tokyo: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Same return direction from Shin-Osaka.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E explained</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Window, aisle, and layout breakdown.</span>
              </Link>
              <Link href="/itineraries/7-day-first-time-japan" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">7-day Japan itinerary</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Place the Shinkansen day in a full route.</span>
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
