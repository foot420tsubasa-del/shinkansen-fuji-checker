import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { ScenicOverviewMap } from "@/components/scenic/ScenicOverviewMap";
import { ScenicFilterTracker } from "@/components/scenic/ScenicTracking";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import hub from "@/data/scenic-hub.json";
import discovery from "@/data/scenic-discovery.json";
import overview from "@/data/scenic-overview.json";
import { scenicDiscoveryRoutes, scenicMonthRows, viewFilters } from "@/lib/scenic-discovery";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${hub.title} | fujiseat`,
    description: hub.intro,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/scenic", locale),
    openGraph: { title: hub.title, description: hub.intro, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const filterClass = "mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-ink";

export default async function ScenicHubPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const requestedView = first(query.view);
  const requestedSeason = first(query.season);
  const requestedRegion = first(query.region);
  const view = viewFilters.some((item) => item.id === requestedView) ? requestedView : undefined;
  const season = hub.seasonFilters.some((item) => item.id === requestedSeason) ? requestedSeason : undefined;
  const region = requestedRegion && Object.hasOwn(discovery.regions, requestedRegion) ? requestedRegion : undefined;
  const visibleRoutes = scenicDiscoveryRoutes({ view, season, region });
  const filtered = Boolean(view || season || region);
  const bestRoutes = season ? visibleRoutes.filter((route) => route.fit === "best") : visibleRoutes;
  const goodRoutes = season ? visibleRoutes.filter((route) => route.fit === "good") : [];
  const seasonName = hub.seasonFilters.find((item) => item.id === season)?.label ?? "";
  const fill = (template: string, values: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
  // The map and the month table follow the filters: the map keeps every
  // route but greys out the ones that do not match; the month table lists
  // only matching routes, and only the months they are at their best.
  const { rows: monthRows, anyMonth } = scenicMonthRows(filtered ? visibleRoutes : scenicDiscoveryRoutes({}));
  const highlightIds = filtered ? (season ? bestRoutes : visibleRoutes).map((route) => route.id) : undefined;
  const path = locale === "en" ? "/scenic" : `/${locale}/scenic`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: hub.title,
      numberOfItems: overview.routes.length,
      itemListElement: overview.routes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: route.title,
        url: `https://fujiseat.com/scenic/${route.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: hub.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ];

  const routeCard = (route: (typeof visibleRoutes)[number]) => (
    <article key={route.id} className="flex flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.05)] transition-shadow hover:shadow-[0_14px_36px_rgba(30,41,59,0.1)]">
      <Link href={`/scenic/${route.slug}`} className="group flex min-w-0 flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image src={route.image.src} alt={route.image.alt} fill sizes="(min-width: 1160px) 360px, (min-width: 1024px) calc((100vw - 80px) / 3), (min-width: 640px) calc((100vw - 60px) / 2), calc(100vw - 40px)" className="object-cover" style={{ objectPosition: route.image.position }} />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="text-[19px] font-extrabold leading-snug tracking-[-0.02em] text-ink group-hover:text-fuji">{route.title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">{route.title.includes(route.line) ? route.region : `${route.line} · ${route.region}`}</p>
          <p className="mt-3 text-[15px] font-semibold leading-6 text-slate-800">{route.teaser}</p>
          <p className="mt-2 text-sm leading-5 text-slate-600"><span className="font-bold text-ink">{discovery.viewingLabel}</span> {route.seasonHighlight ?? route.scenery}</p>
          {route.notice ? <p className="mt-3 line-clamp-2 border-l-2 border-amber-400 pl-3 text-[13px] leading-5 text-slate-700"><b className="text-ink">{discovery.serviceLabel}</b> {route.notice}</p> : null}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px] font-bold text-ink group-hover:text-fuji">{hub.cardLinkLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
        </div>
      </Link>
      {route.image.illustrative ? (
        <p className="border-t border-slate-100 px-5 py-2 text-xs leading-5 text-slate-600">{hub.illustrativeLabel}</p>
      ) : <PhotoCredit src={route.image.src} className="border-t border-slate-100 px-5 py-2" />}
      {route.id === "fujikyu-fuji" ? (
        <Link href="/stays/mt-fuji-view" className="flex min-h-12 items-center border-t border-slate-100 px-5 text-sm font-semibold text-slate-700 underline-offset-4 hover:text-ink hover:underline">
          Stay with a Mt. Fuji view →
        </Link>
      ) : null}
    </article>
  );

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[1160px] px-5 pb-16 pt-8 md:pt-12">
        <header className="max-w-[780px]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{hub.eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] md:text-[52px]">{hub.title}</h1>
          <p className="mt-4 text-[17px] leading-7 text-slate-700 md:text-lg">{hub.browseIntro}</p>
        </header>

        <nav aria-label="Quick view filters" className="-mx-5 mt-4 overflow-x-auto px-5 pb-1">
          <ul className="flex w-max gap-2">
            <li>
              <Link href="/scenic#results" aria-current={!filtered ? "page" : undefined} className={["inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition-colors", !filtered ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:border-ink"].join(" ")}>{hub.allViewsLabel}</Link>
            </li>
            {viewFilters.map((item) => {
              const active = view === item.id && !season && !region;
              return (
                <li key={item.id}>
                  <Link href={`/scenic?view=${item.id}#results`} aria-current={active ? "page" : undefined} className={["inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors", active ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:border-ink"].join(" ")}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="mt-3 rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="filter-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="filter-heading" className="text-lg font-extrabold">{hub.filterTitle}</h2>
            <p className="text-sm font-semibold text-slate-600" aria-live="polite">
              {season && visibleRoutes.length
                ? fill(discovery.bestSummary, { best: bestRoutes.length, good: goodRoutes.length, season: seasonName.toLowerCase() })
                : `${visibleRoutes.length} ${visibleRoutes.length === 1 ? "route" : hub.routeCountLabel}`}
            </p>
          </div>
          <form method="get" action={`${path}#results`} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="col-span-2 min-w-0 text-sm font-bold sm:col-span-1">{hub.sceneryLabel}
              <select name="view" defaultValue={view ?? ""} className={filterClass}>
                <option value="">{hub.allViewsLabel}</option>
                {viewFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="min-w-0 text-sm font-bold">{discovery.regionLabel}
              <select name="region" defaultValue={region ?? ""} className={filterClass}>
                <option value="">{discovery.anyRegionLabel}</option>
                {Object.entries(discovery.regions).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
            <label className="min-w-0 text-sm font-bold">{hub.seasonLabel}
              <select name="season" defaultValue={season ?? ""} className={filterClass}>
                <option value="">{hub.anySeasonLabel}</option>
                {hub.seasonFilters.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-3">
              <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white">{discovery.apply}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              {view || region || season ? <Link href="/scenic" className="inline-flex min-h-11 items-center px-2 text-sm font-bold underline">{discovery.clear}</Link> : null}
            </div>
          </form>
          <p className="mt-2 text-xs leading-5 text-slate-600">{discovery.filterHelp}</p>
        </section>

        {/* After a search the page opens here, so on a phone the results are on screen, not the form. */}
        <div id="results" className="scroll-mt-20" />
        <ScenicFilterTracker view={view} region={region} season={season} results={visibleRoutes.length} best={season ? bestRoutes.length : undefined} />
        {visibleRoutes.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-extrabold">{discovery.emptyTitle}</h2>
            <p className="mt-2 text-sm text-slate-700">{discovery.emptyBody}</p>
            <Link href="/scenic" className="mt-3 inline-flex min-h-11 items-center font-bold text-fuji underline">{hub.allViewsLabel}</Link>
          </section>
        ) : null}

        {bestRoutes.length ? (
          <section className="mt-5" aria-labelledby={season ? "best-heading" : undefined} aria-label={season ? undefined : hub.routesLabel}>
            {season ? <h2 id="best-heading" className="text-xl font-extrabold tracking-[-0.02em]">{fill(discovery.bestInLabel, { season: seasonName.toLowerCase() })}</h2> : null}
            <div className={["grid gap-5 sm:grid-cols-2 lg:grid-cols-3", season ? "mt-4" : ""].join(" ")}>
              {bestRoutes.map((route) => routeCard(route))}
            </div>
          </section>
        ) : null}

        {goodRoutes.length ? (
          <details className="mt-10 rounded-[22px] border border-slate-200 bg-white p-4 sm:p-5">
            <summary className="cursor-pointer list-none">
              <span className="text-lg font-extrabold">{fill(discovery.alsoGoodLabel, { season: seasonName.toLowerCase() })} ({goodRoutes.length})</span>
              <span className="mt-1 block text-sm text-slate-600">{discovery.alsoGoodHelp}</span>
            </summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {goodRoutes.map((route) => routeCard(route))}
            </div>
          </details>
        ) : null}

        <section className="mt-14" aria-labelledby="map-heading">
          <h2 id="map-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{hub.map.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{hub.map.intro}</p>
          {highlightIds ? <p className="mt-2 text-sm font-semibold text-slate-700">{discovery.mapFilteredNote}</p> : null}
          <div className="mt-5"><ScenicOverviewMap locale={locale} copy={hub.map} highlight={highlightIds} /></div>
        </section>

        <details className="group mt-14 rounded-[22px] border border-slate-200 bg-white p-5 sm:p-6" open={filtered || undefined}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
            <span>
              <h2 id="month-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{hub.monthTable.title}</h2>
              <span className="mt-2 block text-[15px] leading-7 text-slate-600">{hub.monthTable.intro}</span>
            </span>
            <span aria-hidden="true" className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 text-lg font-bold text-ink transition-transform group-open:rotate-45">+</span>
          </summary>
          {filtered ? <p className="mt-1 text-sm font-semibold text-slate-700">{discovery.monthFilteredNote}</p> : null}
          <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {monthRows.map((month) => (
                  <tr key={month.label} className="border-t border-slate-100 first:border-t-0 align-top">
                    <th scope="row" className="w-16 bg-slate-50 px-4 py-4 font-extrabold text-ink sm:w-24">{month.label}</th>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {month.entries.length ? month.entries.map(({ route, label }) => (
                          <Link key={`${route.id}-${label}`} href={`/scenic/${route.slug}`} title={label} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-ink hover:text-white">
                            {route.line}<span className="font-medium text-slate-500"> · {label.replace(/ \(.*\)$/, "")}</span>
                          </Link>
                        )) : <span className="text-xs text-slate-400">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {anyMonth.length ? (
                  <tr className="border-t border-slate-100 align-top">
                    <th scope="row" className="w-16 bg-slate-50 px-4 py-4 font-extrabold text-ink sm:w-24">{discovery.anyMonthLabel}</th>
                    <td className="px-4 py-3">
                      <p className="mb-2 text-xs text-slate-500">{discovery.anyMonthHelp}</p>
                      <div className="flex flex-wrap gap-2">
                        {anyMonth.map((route) => (
                          <Link key={route.id} href={`/scenic/${route.slug}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-ink hover:text-white">{route.line}</Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </details>

        <section className="mt-14" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{hub.faqTitle}</h2>
          <div className="mt-5 grid gap-3">
            {hub.faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <summary className="cursor-pointer list-none text-[16px] font-bold">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
