import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CircleDashed, Compass, Handshake, MapPinned, Route, Train } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { SiteHeader } from "../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "About fujiseat — Japan Travel Decisions from a Local Point of View";
  const description =
    "fujiseat is a Japan travel utility hub built in Tokyo to help visitors make practical decisions about Shinkansen seats, stay areas, airport transfers, train signs and local Tokyo.";
  return {
    title,
    description,
    alternates: getAlternates("/about", locale),
    openGraph: {
      title,
      description,
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-about.png", width: 1200, height: 630 }],
    },
  };
}

const hereToday = [
  "Fuji-side Shinkansen seat checker",
  "Shinkansen seat and train sign guides",
  "JR Pass vs single ticket guide",
  "Airport transfer comparisons for Narita, Haneda and Kansai Airport",
  "Tokyo / Kyoto / Osaka stay area guides",
  "Japan itineraries",
  "Local Tokyo picks",
  "Plan-your-trip utilities",
];

const notYet = [
  "Full coverage of every Japan region",
  "Live train inventory or official seat availability",
  "Guaranteed personal travel consultation",
  "Perfect translation coverage for every page",
  "Real-time fare or timetable guarantee",
];

const decisionLinks = [
  { href: "/guide", label: "Mt. Fuji seat guide" },
  { href: "/shinkansen-seat-guides", label: "Shinkansen seat guides" },
  { href: "/how-to-read-japanese-train-signs", label: "Train sign guide" },
  { href: "/jr-pass-vs-single-ticket", label: "JR Pass guide" },
  { href: "/areas-to-stay", label: "Stay area guides" },
  { href: "/airport-transfers", label: "Airport transfers" },
  { href: "/itineraries", label: "Itineraries" },
  { href: "/local-tokyo", label: "Local Tokyo" },
  { href: "/plan-your-trip", label: "Plan your trip" },
];

const visitorQuestions = [
  "Which Shinkansen seat shows Mt. Fuji?",
  "Is Tokyo Station or Shinjuku easier before the Shinkansen?",
  "Should I buy a JR Pass or single tickets?",
  "How do I get from Narita, Haneda, or Kansai Airport to my hotel?",
  "Why is the station telling me a different direction than the place I searched?",
  "How do I avoid choosing a hotel area that makes the next morning harder?",
];

export default function AboutPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Card className="p-6 md:p-8" tone="navy">
          <p className="text-[11px] font-semibold uppercase text-sky-200">About fujiseat</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Built in Tokyo to make Japan travel decisions simpler.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            fujiseat is not a generic travel inspiration site. It is a practical Japan travel utility hub for visitors who need to decide what to book, where to stay, which station to use, and what to check before moving through Japan.
          </p>
        </Card>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-5 md:p-6">
            <h2 className="text-xl font-semibold text-slate-950">Why I built this</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>I am a Tokyo-based Japanese creator who likes practical travel tools more than generic travel inspiration.</p>
              <p>
                fujiseat started with a simple question: which Shinkansen seat should I book to see Mt. Fuji? The answer exists in pieces, but English explanations online were often scattered, overcomplicated, or easy to misunderstand at the exact moment someone was trying to book a ticket.
              </p>
              <p>
                That question looked small, but it represented a bigger problem. Visitors do not only need temples, restaurants, hotels, and attractions. They need practical decisions: which side of the train, which station with luggage, which airport route, which hotel area before an early train, and whether a JR Pass actually makes sense.
              </p>
              <p>
                The site has grown from a tiny seat checker into a Shinkansen-first Japan travel utility hub. It now covers <Link href="/shinkansen-seat-guides" className="font-semibold text-[#106b43] underline underline-offset-2">Shinkansen seats</Link>, <Link href="/areas-to-stay" className="font-semibold text-[#106b43] underline underline-offset-2">stay areas</Link>, <Link href="/airport-transfers" className="font-semibold text-[#106b43] underline underline-offset-2">airport transfers</Link>, <Link href="/jr-pass-vs-single-ticket" className="font-semibold text-[#106b43] underline underline-offset-2">JR Pass decisions</Link>, <Link href="/how-to-read-japanese-train-signs" className="font-semibold text-[#106b43] underline underline-offset-2">train signs</Link>, <Link href="/itineraries" className="font-semibold text-[#106b43] underline underline-offset-2">itineraries</Link>, and <Link href="/local-tokyo" className="font-semibold text-[#106b43] underline underline-offset-2">Local Tokyo</Link>.
              </p>
            </div>
          </Card>

          <Card className="p-5 md:p-6" tone="accent">
            <h2 className="text-lg font-semibold text-slate-950">Feedback helps shape it</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Notes are anonymous. I use them to improve the tool and decide which Japan travel topics deserve better coverage next.
            </p>
            <Link
              href="/questions"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#168a56] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
            >
              Send anonymous feedback
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                <Compass className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-950">What makes fujiseat different</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>Most Japan travel content starts with places: temples, restaurants, hotels, attractions, and famous districts.</p>
              <p>
                fujiseat starts with practical decisions: which Shinkansen seat to book, which station is easier with luggage, which hotel area fits a rail day, how to read train signs, whether JR Pass or single tickets make sense, and how to get from Narita, Haneda, or Kansai Airport to your hotel.
              </p>
              <p>
                These are the details Japanese travellers often process without thinking. First-time visitors have to learn them all at once, usually while tired, carrying luggage, and trying not to miss the next train.
              </p>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef6ff] text-[#145aa0]">
                <Route className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-950">A local lens, not a generic ranking</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                I look at Japan travel the way a local actually navigates it: line, direction, platform, exits, luggage, station stress, first-night simplicity, and whether the next morning will be easy.
              </p>
              <p>
                fujiseat is not trying to rank every famous place. It tries to explain why one choice may make the trip easier than another.
              </p>
              <p>
                Tokyo Station vs Shinjuku is not only about which area is “better.” It is about luggage, early Shinkansen trains, airport access, food, and how tired you may be on your first or last day.
              </p>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-5 md:p-6" tone="soft">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#106b43]">
                <MapPinned className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-950">Why Local Tokyo is included</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>Local Tokyo is personal to me.</p>
              <p>
                I live in Tokyo and spend time around calmer east-side neighborhoods such as Kiyosumi-Shirakawa, Kuramae, Oshiage, Monzen-Nakacho, Ryogoku, Suitengumae and Ningyocho.
              </p>
              <p>
                They are not always the first areas visitors search for. But they can be good for slower walks, coffee, riverside streets, old-town atmosphere, and a quieter first or last day in Tokyo.
              </p>
              <p>
                I do not present them as “must-see” places for everyone. I include them because they show a side of Tokyo that is practical, local, and easy to miss if you only follow the biggest tourist routes.
              </p>
              <p>
                Local Tokyo should support, not replace, the main booking decisions: where to stay, how to transfer, and how to plan a realistic day.
              </p>
            </div>
            <Link
              href="/local-tokyo"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[#9fd7bd] bg-white px-4 py-3 text-sm font-semibold text-[#106b43] transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]"
            >
              Explore Local Tokyo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff8f0] text-[#b44b00]">
                <Train className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-950">Decision guides</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {decisionLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6] hover:text-[#106b43]"
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950">How I choose what to build</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              I usually build around repeated visitor questions. If a question affects booking, luggage, timing, or stress, it probably belongs on fujiseat.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {visitorQuestions.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 md:p-6" tone="accent">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#145aa0]">
                <Handshake className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-slate-950">Affiliate transparency</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                Some links on fujiseat are affiliate links. If you book through them, I may earn a small commission at no extra cost to you.
              </p>
              <p>
                I use affiliate links only where they fit the travel decision being explained — for example hotels, eSIM, airport transfers, rail tickets, or activities. The goal is not to push every possible booking link, but to make the next practical step easier.
              </p>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950">What is here today</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {hereToday.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950">What is not here yet</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {notYet.map((item) => (
                <li key={item} className="flex gap-2">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <footer className="py-8 text-center">
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
