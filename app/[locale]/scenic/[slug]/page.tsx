import type { Metadata } from "next";
import Image from "next/image";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { RouteTimeline } from "@/components/scenic/RouteTimeline";
import { ScenicPassCard } from "@/components/scenic/ScenicPassCard";
import { LIVE_ROUTES, isModelOnlyBasis, reversalsBefore, seatedSide, sideFor, type ScenicRoute } from "@/lib/scenic";
import { AFFILIATE_LINKS, JR_PASS_URL, getAffUrl } from "@/src/affiliateLinks";
import { TicketGuide, type ResolvedTicketLink } from "@/components/scenic/TicketGuide";
import { ScenicStayBlock } from "@/components/scenic/ScenicStayBlock";
import { ScenicRouteViewTracker } from "@/components/scenic/ScenicTracking";
import { PlanThisRide, getTripEssentials } from "@/components/scenic/PlanThisRide";
import { FujiAreaSearchLink, FujiViewStayCards } from "@/components/stays/FujiViewStayCards";
import fujiViewStays from "@/data/fuji-view-stays.json";
import type { AffiliateProvider } from "@/lib/affiliate/links";
import { getScenicStay } from "@/lib/scenic-stays";
import discovery from "@/data/scenic-discovery.json";
import seating from "@/data/scenic-seating.json";
import overview from "@/data/scenic-overview.json";

const SEAT_LINE: Record<string, string> = {
  reserved: "Reserve a window seat on the side for your view.",
  unreserved: "No seat reservations on regular trains: board early for a window on that side.",
  bench: "Long bench seats: sit facing across the car, or stand by the windows on that side.",
  car: "You book a car, not a seat; seats in it are first come, first served.",
};

type SeatingEntry = { kind: string; q?: string; a?: string; summary?: string; reversalAnswer?: string; sources?: { label: string; url: string }[] };
const seatingFor = (id: string) => (seating.routes as Record<string, SeatingEntry | undefined>)[id];

/**
 * The seat question that fits the train (data/scenic-seating.json): book a
 * window on a Shinkansen or reserved train; no reservations on regular local
 * trains; train-specific layouts on the Enoden and Yurikamome; car booking on
 * the Kurobe trolley. Skipped where the route already answers it (verified seats,
 * or its own seat question).
 */
function seatingFaq(route: ScenicRoute): { q: string; a: string }[] {
  const entry = seatingFor(route.id);
  const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
  const out: { q: string; a: string }[] = [];
  const verifiedSeats = route.views?.some((v) => v.seat || v.seatByDirection);
  const ownSeatQuestion = (route.faq ?? []).some((item) => /seat letter|which seat|choose my seat|where should i sit/i.test(item.q));
  if (entry && !verifiedSeats && !ownSeatQuestion) {
    const template = (seating.templates as Record<string, { q: string; a: string } | undefined>)[entry.kind];
    const q = entry.q ?? (template ? fill(template.q, { line: route.line }) : null);
    const a = entry.a ?? template?.a;
    if (q && a) out.push({ q, a });
  }
  if (route.reversals?.length) {
    const stations = route.reversals.map((name) => name.replace(/ Switchback$/, "")).join(", ");
    out.push({ q: fill(seating.templates.reversal.q, { line: route.line }), a: entry?.reversalAnswer ?? fill(seating.templates.reversal.a, { stations }) });
  }
  return out;
}


/*
 * One template for every mapped route (since 2026-11-15): the page reads only
 * the shared schema in data/scenic-routes.json (lib/scenic.ts) — sides,
 * sections, sizes, seasons, verified seats, timing and sources — so a new
 * route is a data change, not a new page. The map and the minute-by-minute
 * list come from RouteTimeline, the same component the homepage search uses.
 */

type Props = { params: Promise<{ locale: string; slug: string }> };

const pageRoute = (slug: string): ScenicRoute | undefined => LIVE_ROUTES.find((r) => r.slug === slug && r.page);

export function generateStaticParams() {
  return LIVE_ROUTES.filter((r) => r.slug && r.page).map((r) => ({ slug: r.slug! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const route = pageRoute(slug);
  if (!route?.page) return {};
  return {
    title: `${route.page.title} | fujiseat`,
    description: route.page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(`/scenic/${slug}`, locale),
    openGraph: { title: route.page.title, description: route.page.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

function howBig(angle: number | null): string {
  if (angle === null) return "—";
  if (angle >= 8) return "Big: a fist high at arm's length";
  if (angle >= 4) return "Clear: three fingers high";
  return "Small: a thumb high";
}

export default async function ScenicRoutePage({ params }: Props) {
  const { locale, slug } = await params;
  const route = pageRoute(slug);
  if (!route?.page || !route.views || !route.directions) notFound();
  const stay = getScenicStay(route.id);

  const [from, to] = route.directions.forward;
  const views = route.views;
  const seatInfo = seatingFor(route.id);
  const reverses = Boolean(route.reversals?.length);

  // Every view gets its side question; where the side rests on the terrain
  // model alone, the answer says so.
  const faq = [
    ...views
      .filter((v) => !/glimpse/i.test(v.name))
      .map((v) => {
        const seatText = v.seatByDirection
          ? ` — ${v.seatByDirection.forward} going to ${to}, ${v.seatByDirection.backward} going to ${from}`
          : v.seat
            ? ` — Seat ${v.seat.split(" ")[0]} in standard cars`
            : "";
        const basis = isModelOnlyBasis(v.basis) ? " This comes from our terrain model; we found no published source for the side." : "";
        const name = v.name.replace(/^The /, "the ");
        if (reverses) {
          const forward = sideFor(v, "forward");
          const backward = sideFor(v, "backward");
          const forwardWindow = seatedSide(forward, reversalsBefore(route, v, "forward", from));
          const backwardWindow = seatedSide(backward, reversalsBefore(route, v, "backward", to));
          const section = v.from === v.to ? `Near ${v.from}` : `Between ${v.from} and ${v.to}`;
          return {
            q: `Which side of the ${route.line} is ${name} on?`,
            a: `${section}, the view is on the ${forward} facing the direction of travel toward ${to}, or the ${backward} toward ${from}. If you board at ${from}, use the window on your ${forwardWindow} as the train first sets off. If you board at ${to}, use the window on your ${backwardWindow} as it first sets off.${basis}`,
          };
        }
        return {
          q: `Which side of the ${route.line} is ${name} on?`,
          a: `Going from ${from} to ${to}, ${name} is on the ${v.side.forward} side, between ${v.from} and ${v.to}${seatText}. Going from ${to} to ${from}, it is on the ${sideFor(v, "backward")}.${basis}`,
        };
      }),
    ...seatingFaq(route),
    ...(route.faq ?? []),
  ];

  const essentials = getTripEssentials(route.id);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());
  const ticketLinks: ResolvedTicketLink[] = (route.ticketGuide?.links ?? []).flatMap((l): ResolvedTicketLink[] => {
    if (l.kind === "official") return [{ kind: "official", href: l.url, label: l.label }];
    const href = getAffUrl(l.linkId);
    const config = AFFILIATE_LINKS[l.linkId];
    if (!href || !config) return [];
    return [{ kind: "affiliate", href, label: l.label, product: l.product, linkId: l.linkId, provider: config.provider as AffiliateProvider, adid: config.adid || undefined }];
  });
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <ScenicRouteViewTracker routeId={route.id} locale={locale} />
      <article className="mx-auto max-w-[1000px] px-5 pb-16 pt-8 md:pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">
          <Link href="/scenic" className="underline-offset-4 hover:underline">Scenic routes</Link> · {route.line}
        </p>
        <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{route.page.h1}</h1>
        <nav aria-label="On this route" className="mt-2 flex flex-wrap gap-x-4 sm:gap-x-6">
          <a href="#ride-timing" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink">Map &amp; timing</a>
          {essentials ? <a href="#plan-ride-heading" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink">Plan this ride</a> : null}
          {route.ticketGuide ? <a href="#tickets" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink">Tickets</a> : null}
        </nav>

        <section className="mt-3 grid gap-4 md:grid-cols-2" aria-label="Which side to sit on">
          {(["forward", "backward"] as const).map((dir) => {
            const [a, b] = route.directions![dir];
            return (
              <div key={dir} className="rounded-[22px] bg-ink p-5 text-white md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
                  {a} → {b}
                </p>
                {reverses ? <p className="mt-1 text-xs text-white/80">{seating.reversalLabels.direction}</p> : null}
                <ul className="mt-3 grid gap-3">
                  {(dir === "forward" ? views : [...views].reverse()).map((v) => {
                    const side = sideFor(v, dir);
                    return (
                      <li key={v.id} className="flex gap-3 text-[15px] leading-6">
                        <span className={["mt-0.5 shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase text-white", side === "right" ? "bg-fuji-hover" : "bg-[#2f6fd6]"].join(" ")}>
                          {side}
                        </span>
                        <span>
                          <b>{v.name}</b>
                          {v.seatByDirection ? (
                            <span className="ml-1.5 inline-block whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[11px] leading-4 font-bold">{v.seatByDirection[dir]}</span>
                          ) : v.seat ? (
                            <span className="ml-1.5 inline-block whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[11px] leading-4 font-bold">Seat {v.seat.split(" ")[0]}</span>
                          ) : null}
                          <span className="block text-sm text-white/70">
                            {v.from === v.to ? `near ${v.from}` : dir === "forward" ? `${v.from} → ${v.to}` : `${v.to} → ${v.from}`}
                          </span>
                          {reverses ? (
                            <span className="mt-1 block text-[13px] font-semibold text-amber-200">
                              {seating.reversalLabels.departure} {a}: {seatedSide(side, reversalsBefore(route, v, dir, a))}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        {route.image ? (
          <div className="mt-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-ink">
              <Image src={route.image.src} alt={route.image.alt} fill sizes="(min-width: 1000px) 960px, calc(100vw - 40px)" className="object-cover" style={{ objectPosition: route.image.position }} />
              {route.image.illustrative ? <span className="absolute bottom-2 right-3 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">Illustrative image, not a photo from this train</span> : null}
            </div>
            <PhotoCredit src={route.image.src} className="mt-2" detailed />
          </div>
        ) : null}

        {(() => {
          const highlights = (discovery.routes as Record<string, { highlights?: { label: string }[] }>)[route.id]?.highlights ?? [];
          const seatKind = seatInfo?.kind;
          const seatLine = seatInfo?.summary ?? (views.some((v) => v.seat || v.seatByDirection)
            ? "Seat letters are verified for this train — see the cards above."
            : seatKind ? SEAT_LINE[seatKind] : null);
          const notice = overview.routes.find((r) => r.id === route.id)?.notice;
          const rows = [
            highlights.length ? ["Best time", highlights.map((h) => h.label).join(" · ")] : ["When", overview.routes.find((r) => r.id === route.id)?.season ?? ""],
            seatLine ? ["Seats", seatLine] : null,
            notice ? ["Service", notice] : null,
          ].filter((row): row is string[] => Boolean(row && row[1]));
          return (
            <dl className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-[14.5px] leading-6">
              {rows.map(([label, value]) => (
                <div key={label} className="grid gap-1 sm:grid-cols-[110px_1fr]">
                  <dt className="font-bold text-ink">{label}</dt>
                  <dd className={label === "Service" ? "text-amber-900" : "text-slate-700"}>{value}</dd>
                </div>
              ))}
            </dl>
          );
        })()}

        {seatInfo?.sources?.length ? (
          <ul aria-label="Official seating and direction sources" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {seatInfo.sources.map(({ label, url }) => <li key={url}><a href={url} className="underline underline-offset-2">{label}</a></li>)}
          </ul>
        ) : null}

        <Link href={`/?${new URLSearchParams({ from, to })}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-fuji underline underline-offset-2">
          {discovery.routeSearchLink} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <section id="ride-timing" tabIndex={-1} className="mt-8 scroll-mt-20">
          <RouteTimeline routeId={route.id} direction="forward" from={from} to={to} showRouteLink={false} showSummary={false} />
        </section>

        <section className="mt-10" aria-labelledby="good-to-know">
          <h2 id="good-to-know" className="text-2xl font-extrabold tracking-[-0.02em]">Good to know</h2>
          <ul className="mt-4 grid gap-2.5">
            {[
              ...(route.notes ?? []),
              "Trains pass every one of these stretches whether or not they stop; the views are between stations, not at them.",
              views.some((v) => v.seat || v.seatByDirection)
                ? "Seat letters are shown only where they have been verified."
                : "Seat letters: we give sides, not letters, unless they have been verified.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[16px] leading-7 text-slate-700">
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <details className="group mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-bold">
              Each view, and how big it looks
              <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-base transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-[14.5px]">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.06em] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">View</th>
                    <th className="px-4 py-2.5 font-semibold">Where</th>
                    <th className="px-4 py-2.5 font-semibold">
                      {reverses ? seating.reversalLabels.tableSide : "Side"} ({from} → {to})
                    </th>
                    <th className="px-4 py-2.5 font-semibold">Size</th>
                    <th className="px-4 py-2.5 font-semibold">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {views.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 font-semibold">
                        {v.name}
                        {v.seatByDirection ? (
                          <span className="block text-xs font-normal text-slate-500">{v.seatByDirection.forward}</span>
                        ) : v.seat ? (
                          <span className="block text-xs font-normal text-slate-500">Seat {v.seat}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {v.from === v.to ? `near ${v.from}` : `${v.from} – ${v.to}`}
                        <span className="block text-xs text-slate-500">
                          {v.sectionKm} km of line{v.nearestKm ? ` · summit about ${Math.round(v.nearestKm)} km away at its closest` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">{v.side.forward}</td>
                      <td className="px-4 py-3 text-slate-700">{howBig(v.maxAngle)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {v.season}
                        <span className="block text-xs text-slate-500">{v.basis}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {essentials ? <PlanThisRide essentials={essentials} today={today} /> : null}

        {route.ticketGuide ? (
          <section id="tickets" tabIndex={-1} className="mt-10 scroll-mt-20">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Which ticket?</h2>
            <div className="mt-4">
              <TicketGuide routeId={route.id} line={route.line} guide={route.ticketGuide} links={ticketLinks} />
            </div>
          </section>
        ) : null}

        {route.ticket?.linkId === "jrPass" ? (
          <section className="mt-10">
            <ScenicPassCard href={JR_PASS_URL} routeId={route.id} line={route.line} />
          </section>
        ) : route.id === "tokaido-fuji" ? (
          <section className="mt-10">
            <Link href="/#seat-checker" className="inline-flex h-12 items-center gap-2 rounded-full bg-fuji px-6 text-[15px] font-bold text-white">
              Check your seat and book <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {/* A quiet pointer, not hotel cards: seeing Fuji from the train needs no stay. */}
            <p className="mt-6 text-[15px] leading-6 text-slate-600">
              Planning to spend more time near Mt. Fuji?{" "}
              <Link href="/stays/mt-fuji-view" className="font-bold text-ink underline underline-offset-4 hover:text-fuji">Explore hotels with Mt. Fuji views</Link>
            </p>
          </section>
        ) : null}

        {route.id === "fujikyu-fuji" ? (
          // Fuji-view stays at Lake Kawaguchiko: after the seat answer and the tickets, before the FAQ.
          <section className="mt-12" aria-labelledby="fuji-stays-heading">
            <h2 id="fuji-stays-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{fujiViewStays.sectionOnRoute.title}</h2>
            <p className="mt-1 text-[15px] text-slate-600">{fujiViewStays.sectionOnRoute.sub}</p>
            <div className="mt-5">
              <FujiViewStayCards variant="compact" placement="scenic_fujikyu_fuji_stays" pagePath={`/scenic/${slug}`} locale={locale} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
              <Link href="/stays/mt-fuji-view" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji">
                {fujiViewStays.sectionOnRoute.more} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <FujiAreaSearchLink placement="fuji_view_area_search" pagePath={`/scenic/${slug}`} locale={locale} />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">PR: {fujiViewStays.page.disclosure}</p>
          </section>
        ) : stay ? (
          <ScenicStayBlock stay={stay} routeId={route.id} locale={locale} pagePath={`/scenic/${slug}`} />
        ) : null}

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Questions</h2>
          <div className="mt-4 grid gap-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer list-none text-[16px] font-bold">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          <p className="font-bold text-ink">How we worked this out</p>
          <p className="mt-1">{route.verification}</p>
          {route.timing ? <p className="mt-2">Timing: {route.timing.source}</p> : null}
          <p className="mt-2">Elevation: Geospatial Information Authority of Japan (国土地理院). Track: © OpenStreetMap contributors (ODbL).</p>
        </section>

        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-fuji">
          Search another route <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
      <SiteFooter />
    </main>
  );
}
