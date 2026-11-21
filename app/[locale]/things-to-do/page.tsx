import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ExternalLink, MapPin, Ticket, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AFFILIATE_LINKS, getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import data from "@/data/things-to-do.json";
import photoCredits from "@/data/stay-destination-photo-credits.json";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string }> };

type Item = {
  id: string;
  city: string;
  name: string;
  tagline: string;
  goodFor: string;
  where: string;
  tickets: string;
  before: string[];
  hours?: string;
  klookLinkId?: string;
  cta?: string;
  official: string[];
  extraSource?: string[];
  accessSource?: string[];
  stay?: string[];
};

type Credit = { title: string; author: string; source: string; license: string; licenseUrl: string };

const PATH = data.path;
const credits = photoCredits as Record<string, Credit>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { absolute: data.title },
    description: data.description,
    // English first, like the other guides; other locales stay out of the index.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, title: data.title, description: data.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

function OfficialLink({ source }: { source: string[] }) {
  return (
    <a href={source[1]} rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">
      {source[0]} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

function CityPhoto({ src, alt }: { src: string; alt: string }) {
  const c = credits[src];
  return (
    <figure className="overflow-hidden rounded-[22px]">
      <div className="relative aspect-[21/9] bg-slate-100">
        <Image src={src} alt={alt} fill sizes="(min-width: 880px) 840px, calc(100vw - 40px)" className="object-cover" />
      </div>
      {c ? (
        <figcaption className="mt-1.5 text-xs leading-5 text-slate-500">
          Photo: <a href={c.source} className="underline underline-offset-2">{c.title}</a> by {c.author} ·{" "}
          <a href={c.licenseUrl} className="underline underline-offset-2">{c.license}</a>
        </figcaption>
      ) : null}
    </figure>
  );
}

export default async function ThingsToDoPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = locale === "en" ? PATH : `/${locale}${PATH}`;
  const items = data.items as Item[];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.h1,
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, url: `https://fujiseat.com${PATH}#${item.id}` })),
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[880px] px-5 pb-16 pt-8 md:pt-12">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Tokyo · Kyoto · Osaka</p>
          <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{data.h1}</h1>
          <p className="mt-3 text-[16px] leading-7 text-slate-600">{data.lead}</p>
        </header>

        {/* Simple city jump links: no filters, no state. */}
        <nav aria-label="Cities" className="sticky top-14 z-10 -mx-5 mt-5 flex gap-2 overflow-x-auto bg-[var(--page-bg,#f7f8fb)]/95 px-5 py-2 backdrop-blur md:static md:mx-0 md:px-0">
          {data.cities.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-ink hover:border-ink">{c.name}</a>
          ))}
          <a href="#which-teamlab" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-ink hover:border-ink">Which teamLab?</a>
        </nav>

        <section id="which-teamlab" tabIndex={-1} className="mt-8 scroll-mt-28" aria-labelledby="teamlab-heading">
          <h2 id="teamlab-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{data.teamlabCompare.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{data.teamlabCompare.intro}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {data.teamlabCompare.rows.map(([name, where, what, open]) => (
              <div key={name} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-[16px] font-extrabold text-ink">{name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{where}</p>
                <p className="mt-2 text-[14.5px] leading-6 text-slate-600">{what}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">{open}</p>
              </div>
            ))}
          </div>
        </section>

        {data.cities.map((city) => {
          const cityItems = items.filter((i) => i.city === city.id);
          return (
            <section key={city.id} id={city.id} tabIndex={-1} className="mt-14 scroll-mt-28" aria-labelledby={`${city.id}-heading`}>
              <h2 id={`${city.id}-heading`} className="text-[28px] font-extrabold tracking-[-0.02em]">{city.name}</h2>
              <div className="mt-3"><CityPhoto src={city.image} alt={city.imageAlt} /></div>
              <div className="mt-5 grid gap-5">
                {cityItems.map((item) => {
                  const href = item.klookLinkId ? getAffUrl(item.klookLinkId) : null;
                  const link = item.klookLinkId ? AFFILIATE_LINKS[item.klookLinkId] : undefined;
                  return (
                    <div key={item.id} id={item.id} className="scroll-mt-28 rounded-[22px] border border-slate-200 bg-white p-5 md:p-6">
                      <h3 className="text-xl font-extrabold tracking-[-0.01em] text-ink">{item.name}</h3>
                      <p className="mt-1 text-[15.5px] font-semibold leading-6 text-slate-800">{item.tagline}</p>
                      <dl className="mt-4 grid gap-3 text-[14.5px] leading-6">
                        <div className="flex gap-2.5">
                          <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                          <div><dt className="sr-only">Good for</dt><dd className="text-slate-700">{item.goodFor}</dd></div>
                        </div>
                        <div className="flex gap-2.5">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                          <div><dt className="sr-only">Where</dt><dd className="text-slate-700">{item.where}</dd></div>
                        </div>
                        <div className="flex gap-2.5">
                          <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                          <div><dt className="sr-only">Tickets</dt><dd className="text-slate-700">{item.tickets}</dd></div>
                        </div>
                      </dl>
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Before you book</p>
                        <ul className="mt-2 grid gap-1.5 text-[14.5px] leading-6 text-slate-700">
                          {item.before.map((b) => (
                            <li key={b} className="flex gap-2">
                              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                              <span>{b}</span>
                            </li>
                          ))}
                          {item.hours ? (
                            <li className="flex gap-2">
                              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                              <span>{item.hours}</span>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                      {href && link && item.cta ? (
                        <div className="mt-4">
                          <TrackedAffiliateLink
                            href={href}
                            rel={AFFILIATE_REL}
                            target="_blank"
                            category="activity"
                            provider="klook"
                            placement="things_to_do_ticket"
                            label={item.cta}
                            linkId={item.klookLinkId}
                            adid={link.adid}
                            product="attraction_ticket"
                            city={city.id}
                            pagePath={pagePath}
                            locale={locale}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-[15px] font-bold text-white hover:bg-slate-800 md:w-auto"
                          >
                            {item.cta} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </TrackedAffiliateLink>
                          <p className="mt-1.5 text-xs leading-5 text-slate-500">{data.disclosure}</p>
                        </div>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-x-4">
                        <OfficialLink source={item.official} />
                        {item.extraSource ? <OfficialLink source={item.extraSource} /> : null}
                        {item.accessSource ? <OfficialLink source={item.accessSource} /> : null}
                        {item.stay ? (
                          <Link href={item.stay[1]} className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-ink underline underline-offset-2 hover:text-fuji">
                            {item.stay[0]} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="mt-14 rounded-[22px] bg-ink p-6 text-white md:p-7" aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="text-xl font-extrabold">{data.tips.title}</h2>
          <ul className="mt-3 grid gap-2 text-[15px] leading-6 text-white/90">
            {data.tips.items.map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-extrabold">Plan the rest of the trip</h2>
          <ul className="mt-2 grid gap-1 md:grid-cols-2">
            {data.related.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-ink underline underline-offset-4 hover:text-fuji">
                  {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-xs leading-5 text-slate-500">
          Venue details checked on each venue&rsquo;s official site on {new Date(`${data.checked}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}. Hours, prices and rules change; the venue&rsquo;s own site has the final word.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
