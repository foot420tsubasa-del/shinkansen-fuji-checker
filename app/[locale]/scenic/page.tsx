import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { ScenicOverviewMap } from "@/components/scenic/ScenicOverviewMap";
import hub from "@/data/scenic-hub.json";
import overview from "@/data/scenic-overview.json";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string | string[]; season?: string | string[] }>;
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

function filterHref(view: string | undefined, season: string | undefined) {
  const query = new URLSearchParams();
  if (view) query.set("view", view);
  if (season) query.set("season", season);
  const suffix = query.toString();
  return suffix ? `/scenic?${suffix}` : "/scenic";
}

export default async function ScenicHubPage({ params, searchParams }: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const requestedView = first(query.view);
  const requestedSeason = first(query.season);
  const view = hub.viewFilters.some((item) => item.id === requestedView) ? requestedView : undefined;
  const season = hub.seasonFilters.some((item) => item.id === requestedSeason) ? requestedSeason : undefined;
  const visibleRoutes = overview.routes.filter((route) => (!view || route.categories.includes(view)) && (!season || route.seasons.includes(season)));
  const monthRows = hub.months.map((label, index) => ({ label, routes: overview.routes.filter((route) => route.months.includes(index + 1)) }));
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

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[1160px] px-5 pb-16 pt-8 md:pt-12">
        <header className="max-w-[780px]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{hub.eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] md:text-[52px]">{hub.title}</h1>
          <p className="mt-5 text-[17px] leading-8 text-slate-700 md:text-lg">{hub.intro}</p>
        </header>

        <section className="mt-9 rounded-[22px] border border-slate-200 bg-white p-5" aria-labelledby="filter-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="filter-heading" className="text-lg font-extrabold">{hub.filterTitle}</h2>
            <p className="text-sm font-semibold text-slate-500">{visibleRoutes.length} {hub.routeCountLabel}</p>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{hub.sceneryLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={filterHref(undefined, season)} aria-current={!view ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-sm font-bold ${!view ? "bg-ink text-white" : "bg-slate-100 text-ink hover:bg-slate-200"}`}>{hub.allViewsLabel}</Link>
              {hub.viewFilters.map((item) => (
                <Link key={item.id} href={filterHref(item.id, season)} aria-current={view === item.id ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-sm font-bold ${view === item.id ? "bg-ink text-white" : "bg-slate-100 text-ink hover:bg-slate-200"}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{hub.seasonLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={filterHref(view, undefined)} aria-current={!season ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-sm font-bold ${!season ? "bg-fuji text-white" : "bg-[#f8eee9] text-ink hover:bg-[#f1ded4]"}`}>{hub.anySeasonLabel}</Link>
              {hub.seasonFilters.map((item) => (
                <Link key={item.id} href={filterHref(view, item.id)} aria-current={season === item.id ? "page" : undefined} className={`rounded-full px-3.5 py-2 text-sm font-bold ${season === item.id ? "bg-fuji text-white" : "bg-[#f8eee9] text-ink hover:bg-[#f1ded4]"}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={hub.routesLabel}>
          {visibleRoutes.map((route) => (
            <article key={route.id} className="flex overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.06)]">
              <Link href={`/scenic/${route.slug}`} className="group flex min-w-0 flex-1 flex-col">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <Image src={route.image.src} alt={route.image.alt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
                  {route.image.illustrative ? <span className="absolute bottom-2 right-3 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white">{hub.illustrativeLabel}</span> : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-fuji">{route.line}</p>
                  <h2 className="mt-2 text-xl font-extrabold leading-tight tracking-[-0.02em] group-hover:text-fuji">{route.title}</h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{route.region}</p>
                  <p className="mt-4 text-[15px] font-semibold leading-6 text-ink">{route.teaser}</p>
                  <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
                    <p><span className="font-bold text-ink">{hub.whenLabel}</span> {route.season}</p>
                    {route.notice ? <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-5 text-amber-950">{route.notice}</p> : null}
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-fuji">{hub.cardLinkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        <section className="mt-14" aria-labelledby="map-heading">
          <h2 id="map-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{hub.map.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{hub.map.intro}</p>
          <div className="mt-5"><ScenicOverviewMap locale={locale} copy={hub.map} /></div>
        </section>

        <section className="mt-14" aria-labelledby="month-heading">
          <h2 id="month-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{hub.monthTable.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{hub.monthTable.intro}</p>
          <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {monthRows.map((month) => (
                  <tr key={month.label} className="border-t border-slate-100 first:border-t-0 align-top">
                    <th scope="row" className="w-16 bg-slate-50 px-4 py-4 font-extrabold text-ink sm:w-24">{month.label}</th>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {month.routes.map((route) => (
                          <Link key={route.id} href={`/scenic/${route.slug}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-ink hover:text-white">{route.line}</Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

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
