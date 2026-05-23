import type { Metadata } from "next";
import { ArrowRight, Bed, Car, CheckCircle2, CircleDashed, MapPinned, Train } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SiteFooter } from "@/components/content/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = "About fujiseat — Practical Japan Travel Decisions from Tokyo";
  const description =
    "fujiseat is a Tokyo-based practical Japan travel guide for Shinkansen seats, hotel bases, airport transfers, station navigation and arrival logistics.";
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

const helpItems = [
  { title: "Fuji-side Shinkansen seat checker", body: "Check which side and seat letter to choose for Mt. Fuji views.", icon: Train },
  { title: "Shinkansen ticket and JR Pass decision support", body: "Compare simple ticket logic with JR Pass use cases before booking rail.", icon: CheckCircle2 },
  { title: "Tokyo hotel base guides", body: "Choose broad hotel areas by luggage, airport access, early rail days and quieter nights.", icon: Bed },
  { title: "Hotel matrix and local hotel examples", body: "Use practical examples by area logic, not hotel rankings.", icon: MapPinned },
  { title: "Airport transfer and luggage guidance", body: "Plan Narita, Haneda and Kansai Airport routes around your first hotel area.", icon: Car },
  { title: "Station signs and Station Practice", body: "Learn how Japanese stations show exits, transfers, platforms and directions.", icon: Train },
];

const notThisSite = [
  "Not an official railway, hotel, or tourism authority",
  "Not a travel agency",
  "Not personalized travel consultation",
  "Not live train inventory or live hotel availability",
  "Hotel prices and availability should always be checked on the booking site",
];

export default function AboutPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Card className="p-6 md:p-8" tone="navy">
          <p className="text-[11px] font-semibold uppercase text-sky-200">About fujiseat</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            About fujiseat
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
            A Tokyo-based practical Japan travel guide, starting from one simple question: which Shinkansen seat should I
            book to see Mt. Fuji?
          </p>
        </Card>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-5 md:p-6">
            <h2 className="text-xl font-semibold text-slate-950">Why I made this</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
              <p>fujiseat is made by a Japanese creator living in Tokyo.</p>
              <p>
                While walking around Tokyo, I often see foreign visitors struggling with station signs, exits, transfers,
                and hotel locations. I have also been asked for directions several times in person, including questions
                about trains, platforms, and how to get to the right place. My English is not perfect, but I have tried to
                help whenever I could.
              </p>
              <p>
                I also noticed that many visitors ask very specific questions before coming to Japan: which Shinkansen seat
                shows Mt. Fuji, where to stay if they have luggage, whether a famous station is actually easy to sleep near,
                or how to avoid getting lost in a large station.
              </p>
              <p>
                fujiseat was created to help with those practical decisions before the stressful moment happens.
              </p>
            </div>
          </Card>

          <Card className="p-5 md:p-6" tone="accent">
            <h2 className="text-lg font-semibold text-slate-950">Independent and unofficial</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              fujiseat is a small independent site. It is designed to support general travel decisions, not replace official
              railway, hotel, airline, airport, or tourism information.
            </p>
          </Card>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-slate-950">What fujiseat helps with</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0fbf6] text-[#106b43]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950">What this site is not</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {notThisSite.map((item) => (
                <li key={item} className="flex gap-2">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-slate-950">How to use this site</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Start with the Seat Checker if you are taking the Tokaido Shinkansen. Then use the hotel base guides,
              ticket guides, airport transfer pages, and station navigation tools depending on what you are planning next.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#seat-checker"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                Start with the Seat Checker
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/areas-to-stay/tokyo-first-time#hotel-base-matrix"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#082653] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123967]"
              >
                Choose a Tokyo hotel base
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </section>

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Affiliate transparency</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Some links on fujiseat are affiliate links. If you book through them, I may earn a small commission at no extra
            cost to you. These links should support the decision being explained, such as hotels, eSIM, airport transfers,
            rail tickets, or activities.
          </p>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
