import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About fujiseat — Built in Tokyo for Japan travellers",
    description: "Why fujiseat exists, what is available today, and what is still missing from this Japan travel utility hub.",
    alternates: getAlternates("/about", locale),
  };
}

const hereToday = [
  "Fuji-side Shinkansen seat checker",
  "Mt. Fuji view guide for the Tokaido Shinkansen",
  "Japan trip essentials hub",
  "Airport transfer comparisons",
  "Tokyo and Kyoto stay area guides",
  "First-time Japan itinerary ideas",
  "Anonymous feedback form",
];

const notYet = [
  "Full coverage of every Japan region",
  "Live train inventory or official seat availability",
  "Booking.com / Agoda hotel links while partner approvals are still pending",
  "Human travel consultation or guaranteed personal replies",
  "Perfect translation coverage for every page",
];

export default function AboutPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-8 md:py-12">
        <Card className="p-6 md:p-8" tone="navy">
          <p className="text-[11px] font-semibold uppercase text-sky-200">About fujiseat</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Built in Tokyo, for the people who keep asking us.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            A practical Japan travel utility hub, starting with the Shinkansen seat question travellers ask most.
          </p>
        </Card>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="p-5 md:p-6">
            <h2 className="text-xl font-semibold text-slate-950">Why I built this</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>I am a Tokyo-based Japanese creator who likes practical travel tools more than generic travel inspiration.</p>
              <p>
                I built fujiseat because visitors kept asking the same simple but surprisingly hard-to-answer question: which Shinkansen seat should I book to see Mt. Fuji?
                The answer exists in pieces, but English explanations online were scattered, overcomplicated, or sometimes wrong.
              </p>
              <p>
                The site started as a tiny seat checker. Over time, it became clear that the seat question is usually part of a bigger Japan planning moment:
                when to book the Shinkansen, where to stay in Tokyo, how to get from the airport, and what to prepare before landing.
              </p>
              <p>
                So fujiseat is becoming a Shinkansen-first Japan travel utility hub. It still keeps the seat checker as the main hook, but the goal is broader:
                give travellers a calm, useful place to make the next decision.
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
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#07142f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Send anonymous feedback
              <ArrowRight className="h-4 w-4" />
            </Link>
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
