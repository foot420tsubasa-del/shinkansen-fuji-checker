import type { Metadata } from "next";
import { Clock3, Mountain, Train } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { GuideSeatCheck } from "@/components/travel/GuideSeatCheck";
import { MonthlyOdds } from "@/components/content/MonthlyOdds";
import { seatCheckCopy } from "@/lib/copy/seat-check";
import { JR_PASS_URL, KLOOK_URL } from "@/src/affiliateLinks";
import { addMinutes, ORIGINS, type OriginId } from "@/lib/fuji-window";
import { ODDS_PERIOD } from "@/lib/fuji-odds";

/*
 * The page for "when", as distinct from "which side".
 *
 * Over the three months to 2026-11-10 the guide drew 1,084 impressions for
 * queries of the form "when do you see Mt. Fuji on the shinkansen" and won 6
 * clicks from them at position 8.5. It answers a side question well and a time
 * question in passing, and a reader asking for minutes was getting a page about
 * seats. This one leads with the minutes, and every figure on it is computed
 * from lib/fuji-window.ts so the tables cannot drift from the tool.
 */

type Props = { params: Promise<{ locale: string }> };

const PATH = "/when-to-see-mt-fuji-shinkansen";
const title = "When Do You See Mt. Fuji on the Shinkansen? 40–48 Minutes After Tokyo";
const description =
  "On a Nozomi out of Tokyo, Mt. Fuji comes into view about 40 minutes after departure and is largest at about 45, passing Shin-Fuji. From Kyoto it is about 88 minutes, from Shin-Osaka about 103. Enter your departure time for the exact minutes.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${title} | fujiseat`,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: { title, description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
    alternates: getAlternates(PATH, locale),
  };
}

const STATION: Record<OriginId, string> = {
  tokyo: "Tokyo",
  shinagawa: "Shinagawa",
  "shin-yokohama": "Shin-Yokohama",
  nagoya: "Nagoya",
  kyoto: "Kyoto",
  "shin-osaka": "Shin-Osaka",
};

const ORDER: OriginId[] = ["tokyo", "shinagawa", "shin-yokohama", "nagoya", "kyoto", "shin-osaka"];

const t = ORIGINS.tokyo;
const k = ORIGINS.kyoto;
const o = ORIGINS["shin-osaka"];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many minutes after leaving Tokyo do you see Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `On a Nozomi, Mt. Fuji comes into view about ${t.first} minutes after leaving Tokyo Station, is largest at about ${t.peak} minutes as the train passes Shin-Fuji, and is gone by about ${t.last} minutes. From Shinagawa subtract 7 minutes; from Shin-Yokohama subtract 18.`,
      },
    },
    {
      "@type": "Question",
      name: "When do you see Mt. Fuji going from Kyoto or Osaka to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `About ${k.first} to ${k.last} minutes after leaving Kyoto on a Nozomi, and about ${o.first} to ${o.last} minutes after leaving Shin-Osaka. That is roughly 45 minutes before the train arrives at Tokyo Station. Mt. Fuji is on the left in this direction.`,
      },
    },
    {
      "@type": "Question",
      name: "How long is Mt. Fuji visible from the Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `About ${t.last - t.first} minutes from the first glimpse to the last on a Nozomi, with the clearest, most open view lasting only a few of those minutes around Shin-Fuji Station and the Fuji River bridge.`,
      },
    },
    {
      "@type": "Question",
      name: "Is the timing different on a Hikari or Kodama?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A Hikari makes extra stops and passes a few minutes later than a Nozomi that left at the same time. A Kodama stops at every station, including Shin-Fuji itself, and takes roughly 65 to 75 minutes to get there from Tokyo — its Shin-Fuji arrival is printed in the timetable, which is the time to watch for.",
      },
    },
  ],
};

function hourly(origin: OriginId, from: number, to: number) {
  const spec = ORIGINS[origin];
  const rows = [];
  for (let h = from; h <= to; h++) {
    const dep = `${String(h).padStart(2, "0")}:00`;
    rows.push({
      dep,
      first: addMinutes(dep, spec.first),
      peak: addMinutes(dep, spec.peak),
      last: addMinutes(dep, spec.last),
    });
  }
  return rows;
}

const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const td = "px-3 py-2 tabular-nums text-slate-700";

function DepartureTable({ origin, caption }: { origin: OriginId; caption: string }) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[20rem] text-sm">
        <caption className="border-b border-slate-100 px-3 py-2.5 text-left text-[13px] font-bold text-slate-950">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-slate-100">
            <th scope="col" className={th}>Departs</th>
            <th scope="col" className={th}>First view</th>
            <th scope="col" className={th}>Largest</th>
            <th scope="col" className={th}>Gone by</th>
          </tr>
        </thead>
        <tbody>
          {hourly(origin, 6, 16).map((row) => (
            <tr key={row.dep} className="border-b border-slate-50 last:border-0">
              <th scope="row" className={`${td} text-left font-semibold text-slate-950`}>{row.dep}</th>
              <td className={td}>{row.first}</td>
              <td className={`${td} font-semibold text-slate-950`}>{row.peak}</td>
              <td className={td}>{row.last}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function WhenToSeeFujiPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
          Tokaido Shinkansen · timing
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          When do you see Mt. Fuji from the Shinkansen?
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
          About {t.first} to {t.last} minutes after a Nozomi leaves Tokyo, and about 45 minutes before one
          arrives there. The mountain is in view for only a few minutes, so the time matters as much as the
          seat. Enter your own departure below for the minutes on your train.
        </p>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Quick answer</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>From Tokyo:</strong> first view about {t.first} minutes after departure, largest at
                about {t.peak}, gone by about {t.last}. Right side, seat E.
              </span>
            </li>
            <li className="flex gap-2">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>From Kyoto:</strong> about {k.first} to {k.last} minutes after departure.{" "}
                <strong>From Shin-Osaka:</strong> about {o.first} to {o.last}. Left side, seat E.
              </span>
            </li>
            <li className="flex gap-2">
              <Train className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>These are Nozomi times.</strong> A Hikari runs a few minutes later; a Kodama takes
                roughly 65 to 75 minutes from Tokyo and stops at Shin-Fuji itself.
              </span>
            </li>
            <li className="flex gap-2">
              <Mountain className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>The landmark:</strong> Shin-Fuji Station. The view is at its best as the train passes
                it and crosses the Fuji River just to the west.
              </span>
            </li>
          </ul>
        </section>

        <div className="mt-6">
          <GuideSeatCheck
            href={KLOOK_URL}
            jrPassHref={JR_PASS_URL}
            locale={locale}
            pagePath={PATH}
            copy={seatCheckCopy(locale)}
          />
        </div>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-950">Minutes after departure, by station</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Find the station you board at. The three figures are minutes after your train leaves it.
            </p>
            <div className="mt-4 overflow-x-auto rounded-[18px] border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[30rem] text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th scope="col" className={th}>Boarding at</th>
                    <th scope="col" className={th}>Fuji is on the</th>
                    <th scope="col" className={th}>First view</th>
                    <th scope="col" className={th}>Largest</th>
                    <th scope="col" className={th}>Gone by</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDER.map((id) => {
                    const spec = ORIGINS[id];
                    return (
                      <tr key={id} className="border-b border-slate-50 last:border-0">
                        <th scope="row" className={`${td} text-left font-semibold text-slate-950`}>{STATION[id]}</th>
                        <td className={td}>{spec.westbound ? "Right" : "Left"} · seat E</td>
                        <td className={td}>{spec.first} min</td>
                        <td className={`${td} font-semibold text-slate-950`}>{spec.peak} min</td>
                        <td className={td}>{spec.last} min</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Nozomi estimates, good to within two or three minutes. In Green Cars the Fuji-side window is
              seat D.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Clock times for common departures</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              The same estimate turned into clock times, for a Nozomi leaving on the hour. For a train at
              :12 or :30 past, add those minutes — or use the checker above, which does it for you.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <DepartureTable origin="tokyo" caption="Leaving Tokyo → Fuji on the right" />
              <DepartureTable origin="kyoto" caption="Leaving Kyoto → Fuji on the left" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">What you pass, in order</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                <strong className="text-slate-900">Leaving Tokyo.</strong> Nothing for the first half hour:
                Shinagawa, Shin-Yokohama, then Odawara and a run of tunnels through the hills behind Atami.
                The long one before Mishima is your cue. When the train comes out of it and passes Mishima
                Station, Mt. Fuji is ahead of you on the right — about {t.first} minutes in.
              </p>
              <p>
                It grows for the next few minutes as the line swings toward it, and is at its largest and
                least obstructed passing Shin-Fuji Station, about {t.peak} minutes in. Just beyond, the train
                crosses the Fuji River on a long bridge with nothing between you and the mountain — the view
                on most postcards. After the bridge the line turns away and the hills close in, and by about{" "}
                {t.last} minutes it is behind you.
              </p>
              <p>
                <strong className="text-slate-900">Heading to Tokyo.</strong> The same stretch in reverse.
                After Shizuoka Station, watch the left side: the Fuji River bridge comes first, then
                Shin-Fuji, then a slower fade as the train runs on toward Mishima. From Kyoto that is about{" "}
                {k.first} to {k.last} minutes after departure.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Nozomi, Hikari and Kodama</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              <p>
                Every figure on this page is for a Nozomi, because that is what most visitors ride and
                because it is the hardest to look up: a Nozomi does not stop at Shin-Fuji, so no timetable
                prints a time for it there. The estimate comes from its published times at the stations
                either side.
              </p>
              <p>
                A <strong className="text-slate-900">Hikari</strong> stops at a few more stations on the way
                and passes Shin-Fuji later than a Nozomi that left at the same minute — allow five to ten
                minutes more, depending on how many stops it makes.
              </p>
              <p>
                A <strong className="text-slate-900">Kodama</strong> stops everywhere, Shin-Fuji included, and
                takes roughly 65 to 75 minutes to reach it from Tokyo. That makes it the easy case: the
                Shin-Fuji time is in the timetable. Be at the window a few minutes before it.
              </p>
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Which months give you the best odds</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Knowing the minute only helps if the sky cooperates, and that depends far more on the season
              than on the day. Winter mornings over this stretch are clear about half the time; in June and
              July it is closer to one morning in six. Whatever the month, go early — cloud builds on the
              mountain through the day, and after dark there is nothing to see at all. In December the sun
              sets around 16:30, so a train leaving Tokyo after about 16:00 reaches Fuji after sunset.
            </p>
            <MonthlyOdds locale={locale} className="mt-4 max-w-xl" />
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
            <h2 className="text-lg font-bold text-slate-950">How these times are worked out</h2>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
              <p>
                <strong className="text-slate-900">Train times.</strong> Estimated from Nozomi running times
                between the stations where the timetable does give a time. They assume an on-time train and
                will be out by a few minutes on any given day, and they are not taken from any single
                train&apos;s timetable.
              </p>
              <p>
                <strong className="text-slate-900">Forecast.</strong> Hourly cloud cover and rain for a point
                beside Shin-Fuji Station, from Open-Meteo, for the next ten days.
              </p>
              <p>
                <strong className="text-slate-900">Monthly odds.</strong> The share of 07:00–10:00 hours from{" "}
                {ODDS_PERIOD.start} to {ODDS_PERIOD.end} in which cloud cover over that same point was 30% or
                less, from ERA5 reanalysis data. It describes the sky, not the mountain: a thin cap of cloud
                on the summit will not show up in it, and it is not a record of anyone&apos;s sightings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950">Related pages</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Link href="/guide" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Which side for Mt. Fuji?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The full guide: side, seat, booking.</span>
              </Link>
              <Link href="/shinkansen-seat-letters" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Seat letters A–E and the seat map</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Where seat E sits in each car type.</span>
              </Link>
              <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Tokyo → Kyoto: which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The outbound leg.</span>
              </Link>
              <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Kyoto → Tokyo: which seat?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">The return leg.</span>
              </Link>
              <Link href="/shinkansen-green-car-worth-it" className="rounded-[18px] border border-[#d9e5f2] bg-white p-4 text-sm shadow-sm transition-colors hover:bg-[#f8fbff]">
                <span className="font-bold text-[#082653]">Is the Green Car worth it?</span>
                <span className="mt-1 block text-xs text-[#5f7190]">Seat D in the Green Car is the Fuji-side window — and when the extra cost pays.</span>
              </Link>
            </div>
          </section>
        </div>
      </Container>
      <SiteFooter />
    </main>
  );
}
