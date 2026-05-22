import type { Metadata } from "next";
import { Luggage, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";

type Props = {
  params: Promise<{ locale: string }>;
};

const pagePath = "/areas-to-stay/where-to-stay-in-tokyo-with-luggage";

const factors = [
  ["Airport arrival", "Narita and Haneda can point you toward different parts of Tokyo. Your first hotel area should match your arrival route, especially if you land late."],
  ["Station complexity", "Large stations can be convenient but tiring with suitcases. Check exits, elevators, and walking distance before booking."],
  ["Shinkansen plans", "If you take an early Shinkansen to Kyoto or Osaka, your Tokyo base can affect your morning stress as much as your train seat."],
  ["Room size", "A room that works for one small bag may feel tight with two large suitcases. Check square meters and bed setup before booking."],
  ["Quiet nights", "Nightlife areas can be fun to visit but not always ideal as a sleep base."],
];

const areas = [
  {
    title: "Shinjuku",
    bestFor: "Transport choice and nightlife.",
    watchOut: "Huge station scale and lively nightlife blocks can feel tiring with luggage.",
    goodIf: "You want maximum route choice and do not mind a busier base.",
    notIdealIf: "You want the calmest first night or dislike large station navigation.",
  },
  {
    title: "Ueno / Asakusa side",
    bestFor: "Narita access and calmer arrival nights.",
    watchOut: "Some routes rely more on subway transfers.",
    goodIf: "You want practical Narita access, old-town atmosphere, or a less intense base.",
    notIdealIf: "You need the easiest possible Shinkansen morning.",
  },
  {
    title: "Tokyo Station side",
    bestFor: "Early Shinkansen and clean logistics.",
    watchOut: "Can feel businesslike and often less local at night.",
    goodIf: "You want to reduce luggage stress before Kyoto or Osaka.",
    notIdealIf: "You want nightlife or a neighborhood feel outside the hotel.",
  },
  {
    title: "East Tokyo",
    bestFor: "Calmer neighborhoods and repeat visitors.",
    watchOut: "Not always the default first-time base.",
    goodIf: "You value quieter streets, coffee, riverside walks, and a local feel.",
    notIdealIf: "You need the simplest first-night arrival route.",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Where to Stay in Tokyo With Luggage: Airport, Stations and Hotel Area Tips",
    description:
      "Traveling in Tokyo with large suitcases? Learn how airport access, station size, elevators, Shinkansen plans, and hotel room size should affect where you stay.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
  };
}

export default async function WhereToStayInTokyoWithLuggagePage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#f7f4ec]">
      <SiteHeader />
      <Container className="py-10 md:py-14">
        <Breadcrumb
          items={[
            { href: "/", label: "Home" },
            { href: "/areas-to-stay", label: "Where to stay" },
            { href: "/areas-to-stay/tokyo-first-time", label: "Tokyo" },
            { label: "Tokyo with luggage" },
          ]}
        />

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#106b43]">Tokyo luggage planning</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
            Where to Stay in Tokyo With Luggage
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Tokyo is easy to travel around, but large suitcases can make the wrong hotel area feel stressful. The best
            base is not always the biggest or most famous station.
          </p>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <h2 className="text-xl font-semibold text-slate-950">Quick answer</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              If you have large luggage, choose your Tokyo hotel area by airport access, elevator access, station
              complexity, walking distance, and Shinkansen plans. A famous station can be convenient, but a calmer
              nearby area or simpler route may be easier for your first night.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">What matters most with luggage</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {factors.map(([title, body]) => (
              <article key={title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <Luggage className="h-5 w-5 text-[#106b43]" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-sky-100 bg-sky-50/70 p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">Luggage option</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Option: send your luggage from the airport to your hotel</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Yamato and airport luggage delivery counters may let travelers send luggage from the airport to a hotel.
              JAL ABC and airport baggage delivery counters may also support hotel luggage delivery on some routes.
              Same-day delivery can be available, but counters, destinations, cut-off times, and delivery windows vary.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-950">Before you use delivery</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Confirm the hotel name, address, and reservation name.</li>
                <li>Check whether your hotel accepts luggage delivery before check-in.</li>
                <li>Confirm the airport counter, cut-off time, and expected delivery time.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-950">Keep a small day bag</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Carry passports, medicine, chargers, valuables, and overnight essentials with you. Luggage delivery can be
                especially useful if you arrive before hotel check-in or travel with family or multiple suitcases.
              </p>
            </article>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <TrackedInternalLink
              href="/airport-transfers"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Airport transfer guide"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
            >
              Airport transfer guide →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="luggage_pack_cta"
              label="Tokyo hotel base guide"
              locale={locale}
              className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-[#106b43] transition-colors hover:bg-emerald-50"
            >
              Tokyo hotel base guide →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">Major area logic with luggage</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {areas.map((area) => (
              <article key={area.title} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{area.title}</h3>
                <dl className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                  <div>
                    <dt className="font-semibold text-slate-900">Best for</dt>
                    <dd>{area.bestFor}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Watch out</dt>
                    <dd>{area.watchOut}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Good if</dt>
                    <dd>{area.goodIf}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Not ideal if</dt>
                    <dd>{area.notIdealIf}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#106b43]" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Do not choose only by famous station names</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A famous station is not always the easiest place to sleep. With luggage, the easier choice may be the
                area with the simpler walking route, clearer exits, better elevator access, and a room size that works
                for your group.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Next step: compare Tokyo hotel areas</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Use this luggage logic with the Tokyo stay area guide before comparing hotels. The right hotel base depends
            on airport access, walking distance, station complexity, room size, and your Shinkansen plans.
          </p>
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-first-time"
            sourcePage={pagePath}
            placement="luggage_pack_cta"
            label="Tokyo stay area guide"
            locale={locale}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#106b43] underline underline-offset-4"
          >
            Open Tokyo stay area guide →
          </TrackedInternalLink>
        </section>

        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Continue planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[
              ["/areas-to-stay/tokyo-first-time", "Tokyo stay area guide"],
              ["/areas-to-stay/tokyo-hotel-room-size-guide", "Room size guide"],
              ["/airport-transfers", "Airport transfers"],
              ["/local-hotel-picks", "Local hotel examples"],
              ["/guide", "Shinkansen Seat E guide"],
            ].map(([href, label]) => (
              <TrackedInternalLink
                key={href}
                href={href}
                sourcePage={pagePath}
                placement="luggage_pack_cta"
                label={label}
                locale={locale}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 transition-colors hover:bg-white"
              >
                {label} →
              </TrackedInternalLink>
            ))}
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}
