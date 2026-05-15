import type { Metadata } from "next";
import { ArrowRight, Mountain, Info } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";

type Props = { params: Promise<{ locale: string }> };

const title = "Shinkansen Seat Letters Explained: A, B, C, D, E and Mt. Fuji Side";
const description =
  "Understand Shinkansen seat letters A, B, C, D and E, including which seats are windows, aisles, and usually best for Mt. Fuji views.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat" },
    alternates: getAlternates("/shinkansen-seat-letters", locale),
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What do the letters A, B, C, D, E mean on the Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In Ordinary Cars with 3+2 seating, seats A, B, C are on the three-seat side and D, E are on the two-seat side. A and E are window seats; C and D are aisle seats; B is a middle seat.",
      },
    },
    {
      "@type": "Question",
      name: "Which seat letter is best for Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On the Tokaido Shinkansen, Seat E is usually the Mt. Fuji-side window in Ordinary Cars. In Green Cars (2+2), the Fuji-side window is Seat D.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seat A a window seat?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. In most Ordinary Cars, Seat A is a window seat on the opposite side from E. On the Tokaido Shinkansen, Seat A faces the sea side, not Mt. Fuji.",
      },
    },
    {
      "@type": "Question",
      name: "Are Green Car seat letters different?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Green Cars typically use a 2+2 layout with seats A, B (one side) and C, D (other side). There is no Seat E. The Fuji-side window is usually D.",
      },
    },
  ],
};

const seatLayout = [
  { letter: "A", type: "Window", side: "Sea side (opposite Fuji)", note: "Window with ocean-side views" },
  { letter: "B", type: "Middle", side: "—", note: "Between A and C; no direct window" },
  { letter: "C", type: "Aisle", side: "—", note: "Aisle seat, three-seat side" },
  { letter: "D", type: "Aisle", side: "—", note: "Aisle seat, two-seat side. Green Car Fuji window." },
  { letter: "E", type: "Window", side: "Mt. Fuji side", note: "Best seat for Mt. Fuji in Ordinary Cars" },
];

export default async function SeatLettersPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Script
        id="faq-schema-seat-letters"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Seat layout guide
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Shinkansen Seat Letters Explained
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
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>A and E</strong> are window seats in most Ordinary Cars.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>C and D</strong> are aisle seats.</span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Seat E</strong> is usually the Mt. Fuji-side window on the Tokaido Shinkansen.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Green Car</strong> layouts differ — usually 2+2, no Seat E.</span>
            </li>
            <li className="flex gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Always check the seat map before booking.</span>
            </li>
          </ul>
        </section>

        <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Check your seat instantly</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Use the free checker to see which seat letter faces Mt. Fuji for your direction.
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
            <h2 className="text-xl font-bold text-slate-950">Ordinary Car: 3+2 layout (A B C | D E)</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Most Tokaido Shinkansen Ordinary Cars have five seats per row: three on one side (A, B, C) and two on the other (D, E), separated by an aisle.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-4 font-semibold text-slate-900">Seat</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Type</th>
                    <th className="py-2 pr-4 font-semibold text-slate-900">Tokaido side</th>
                    <th className="py-2 font-semibold text-slate-900">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {seatLayout.map((seat) => (
                    <tr key={seat.letter} className={["border-b border-slate-100", seat.letter === "E" ? "bg-emerald-50" : ""].join(" ")}>
                      <td className="py-2.5 pr-4 font-bold text-slate-900">{seat.letter}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{seat.type}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{seat.side}</td>
                      <td className="py-2.5 text-slate-600">{seat.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Green Car: 2+2 layout (A B | C D)</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Green Cars (first class) have wider seats in a 2+2 configuration. There is no Seat E. The layout is A–B on one side and C–D on the other, with A and D as window seats.
              </p>
              <p>
                On the Tokaido Shinkansen, the Mt. Fuji-side window in Green Cars is usually <strong>Seat D</strong>. Seat A is the sea-side window.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Other Shinkansen lines</h2>
            <div className="mt-3 text-sm leading-7 text-slate-600">
              <p>
                Seat letter layouts vary by train type and line. The Tokaido Shinkansen (Tokyo–Kyoto–Osaka) consistently uses the 3+2 Ordinary Car layout described above. Other lines (Tohoku, Hokuriku, Sanyo) may have different configurations — always check the seat map for your specific train.
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
              <Link href="/shinkansen-seat-e" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Is Seat E the Mt. Fuji side?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Seat E explained for Ordinary and Green Cars.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Direction-specific seat and timing guide.</span>
              </Link>
              <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Kyoto → Tokyo: Which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Return direction seat and viewing tips.</span>
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
