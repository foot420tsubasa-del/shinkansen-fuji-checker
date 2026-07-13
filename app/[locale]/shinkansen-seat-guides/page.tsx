import type { Metadata } from "next";
import { ArrowRight, Mountain, Train, LayoutList, ArrowLeftRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { ShareThisPage } from "@/components/share/ShareThisPage";

type Props = { params: Promise<{ locale: string }> };

const title = "Shinkansen Seat Guides: Mt. Fuji Side, Seat Letters & Directions";
const description =
  "Find the right Shinkansen seat for Mt. Fuji views. Guides for Seat E, seat letters A–E, Tokyo to Kyoto, and Kyoto to Tokyo directions.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates("/shinkansen-seat-guides", locale),
  };
}

const guides = [
  {
    href: "/guide#seat-e",
    icon: Mountain,
    title: "Is Seat E the Mt. Fuji Side?",
    summary: "When Seat E is the Fuji-side window in Ordinary and Green Cars.",
  },
  {
    href: "/tokyo-to-kyoto-mt-fuji-seat",
    icon: Train,
    title: "Tokyo to Kyoto: Which Seat for Mt. Fuji?",
    summary: "Direction-specific seat, timing, and viewing tips heading west.",
  },
  {
    href: "/kyoto-to-tokyo-mt-fuji-seat",
    icon: ArrowLeftRight,
    title: "Kyoto to Tokyo: Which Seat for Mt. Fuji?",
    summary: "Why the same seat works on the return and when to watch.",
  },
  {
    href: "/tokyo-to-osaka-mt-fuji-seat",
    icon: Train,
    title: "Tokyo to Osaka: Which Seat for Mt. Fuji?",
    summary: "Right side, Seat E — the view comes early in the 2.5-hour ride.",
  },
  {
    href: "/osaka-to-tokyo-mt-fuji-seat",
    icon: ArrowLeftRight,
    title: "Osaka to Tokyo: Which Seat for Mt. Fuji?",
    summary: "Left side, Seat E — timing from Shin-Osaka and when to watch.",
  },
  {
    href: "/shinkansen-seat-letters",
    icon: LayoutList,
    title: "Seat Letters A–E Explained",
    summary: "Window, aisle, and middle seats in Ordinary and Green Cars.",
  },
  {
    href: "/shinkansen-oversized-baggage-seat",
    icon: Train,
    title: "Oversized Baggage: Which Seat to Reserve?",
    summary: "Bags over 160cm need a free last-row seat reservation.",
  },
  {
    href: "/nozomi-vs-hikari-vs-kodama",
    icon: ArrowLeftRight,
    title: "Nozomi vs Hikari vs Kodama",
    summary: "Same seats, different stops — and the JR Pass catch.",
  },
  {
    href: "/shinkansen-reserved-vs-non-reserved",
    icon: LayoutList,
    title: "Reserved vs Non-Reserved Seats",
    summary: "When the small reserved fee is clearly worth it.",
  },
  {
    href: "/shinkansen-green-car-worth-it",
    icon: Mountain,
    title: "Is the Green Car Worth It?",
    summary: "2+2 comfort, ~¥5,000 extra — and Seat D for Fuji.",
  },
];

export default async function SeatGuidesHubPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Seat guide hub
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          Shinkansen Seat Guides
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          {description}
        </p>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
            Quick answer
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            On the Tokaido Shinkansen, <strong>Seat E</strong> is usually the Mt. Fuji-side window in Ordinary Cars. In Green Cars, it is usually <strong>Seat D</strong>. This applies in both directions.
          </p>
          <div className="mt-4">
            <Link
              href="/#seat-checker"
              className="inline-flex items-center gap-2 rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#246449]"
            >
              Open Seat Checker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex gap-4 rounded-[18px] border border-[#d9e5f2] bg-white p-5 shadow-sm transition-colors hover:bg-[#f8fbff]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#082653] group-hover:text-sky-800">
                    {guide.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#5f7190]">
                    {guide.summary}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">Looking for something else?</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <Link
              href="/guide"
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50"
            >
              Full Shinkansen guide
              <ArrowRight className="h-4 w-4 text-sky-600" />
            </Link>
            <Link
              href="/plan-your-trip"
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50"
            >
              Plan your trip essentials
              <ArrowRight className="h-4 w-4 text-sky-600" />
            </Link>
            <Link
              href="/itineraries"
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50"
            >
              Browse itineraries
              <ArrowRight className="h-4 w-4 text-sky-600" />
            </Link>
            <Link
              href="/areas-to-stay"
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50"
            >
              Compare stay areas
              <ArrowRight className="h-4 w-4 text-sky-600" />
            </Link>
            {/* Plain <a>: static single-file tool outside the locale prefix. */}
            <a
              href="/tokyo-rail-3d.html"
              className="flex items-center justify-between rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-sky-50"
            >
              Tokyo Rail 3D — interactive network model
              <ArrowRight className="h-4 w-4 text-sky-600" />
            </a>
          </div>
        </section>

        <SuggestedNextSteps currentPageType="seat" locale={locale} />

        <ShareThisPage
          title="Mt. Fuji Shinkansen Seat Guides"
          placement="seat_guides_footer"
          description="Share these Mt. Fuji Shinkansen seat guides with someone booking Tokyo, Kyoto or Osaka trains."
          locale={locale}
          className="mt-8"
        />

      </Container>
      <SiteFooter />
    </main>
  );
}
