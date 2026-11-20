import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AFFILIATE_LINKS, getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import data from "@/data/golden-route.json";
import destinations from "@/data/booking-hotel-destinations.json";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string }> };

type Item = {
  id: string;
  name: string;
  image?: string;
  imageAlt?: string;
  facts: string[][];
  links: string[][];
  official?: string[];
};

const PATH = data.hub.path;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${data.hub.title} | fujiseat`,
    description: data.hub.description,
    // English only for now, like the other scenic pages.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, title: data.hub.title, description: data.hub.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

const cardLayouts = {
  single: {
    columns: "",
    sizes: "(min-width: 1120px) 540px, (min-width: 1024px) calc((100vw - 40px) / 2), calc(100vw - 40px)",
  },
  pair: {
    columns: "md:grid-cols-2",
    sizes: "(min-width: 1120px) 530px, (min-width: 768px) calc((100vw - 60px) / 2), calc(100vw - 40px)",
  },
  group: {
    columns: "md:grid-cols-2 lg:grid-cols-3",
    sizes: "(min-width: 1120px) 347px, (min-width: 1024px) calc((100vw - 80px) / 3), (min-width: 768px) calc((100vw - 60px) / 2), calc(100vw - 40px)",
  },
};

function ItemCard({ item, wide, sizes }: { item: Item; wide: boolean; sizes: string }) {
  return (
    <article id={item.id} tabIndex={-1} className={`flex h-full scroll-mt-20 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(11,18,32,0.06)]${wide ? " lg:grid lg:grid-cols-2" : ""}`}>
      {item.image ? (
        <div>
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <Image src={item.image} alt={item.imageAlt ?? ""} fill sizes={sizes} className="object-cover" />
          </div>
          <PhotoCredit src={item.image} className="px-5 pt-2" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[19px] font-extrabold leading-snug tracking-[-0.01em]">{item.name}</h3>
        <dl className="mt-3 grid gap-2 text-[15px] leading-6">
          {item.facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
              <dd className="text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
        {item.links.length || item.official ? (
          <div className="mt-auto flex flex-col gap-1 pt-4">
            {item.links.map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji">
                {label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
            {item.official ? (
              <a href={item.official[1]} rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji">
                {item.official[0]} <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function GoldenRoutePage({ params }: Props) {
  const { locale } = await params;
  const pagePath = locale === "en" ? PATH : `/${locale}${PATH}`;
  const tickets = data.tickets.links
    .map(([linkId, label]) => ({ linkId, label, href: getAffUrl(linkId), adid: AFFILIATE_LINKS[linkId]?.adid || undefined }))
    .filter((t): t is { linkId: string; label: string; href: string; adid: string | undefined } => Boolean(t.href));

  const stayArea = (destinations as Record<string, { affiliate_url?: string; url_status?: string }>)[data.stay.destination];
  const stayHref = stayArea?.url_status === "active" ? stayArea.affiliate_url : undefined;

  const jumpClass = "inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-ink hover:border-ink";
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.hub.title,
    itemListElement: data.sections.flatMap((section): Item[] => section.items).map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name })),
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[1120px] px-5 pb-16 pt-8 md:pt-12">
        <header className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{data.hub.eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] md:text-[52px]">{data.hub.h1}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">{data.hub.sub}</p>
        </header>

        <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
          {data.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={jumpClass}>
              {s.jumpLabel}
            </a>
          ))}
          {tickets.length ? <a href="#train-tickets" className={jumpClass}>{data.tickets.jumpLabel}</a> : null}
        </nav>

        {data.sections.map((section, index) => {
          const nextId = data.sections[index + 1]?.id ?? (tickets.length ? "train-tickets" : undefined);
          const wide = section.items.length === 1;
          const layout = wide ? cardLayouts.single : section.items.length === 2 ? cardLayouts.pair : cardLayouts.group;
          return (
            <section key={section.id} id={section.id} tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`} className="text-2xl font-extrabold tracking-[-0.02em] md:text-[32px]">{section.title}</h2>
              <p className="mt-2 text-[15px] leading-6 text-slate-600">{section.sub}</p>
              <div className={`mt-6 grid gap-5 ${layout.columns}`}>
                {section.items.map((item) => (
                  <ItemCard key={item.id} item={item} wide={wide} sizes={layout.sizes} />
                ))}
              </div>
              {nextId ? (
                <a href={`#${nextId}`} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji focus-visible:outline-2 focus-visible:outline-offset-2">
                  {section.nextLabel} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              ) : null}
            </section>
          );
        })}

        {stayHref ? (
          <section className="mt-12 max-w-[760px]" aria-labelledby="stay-heading">
            <h2 id="stay-heading" className="text-xl font-extrabold tracking-[-0.02em]">{data.stay.title}</h2>
            <p className="mt-1 text-[15px] leading-6 text-slate-600">{data.stay.text}</p>
            <TrackedAffiliateLink
              href={stayHref}
              rel={AFFILIATE_REL}
              target="_blank"
              category="hotel"
              provider="booking_travelpayouts"
              placement="golden_route_stay"
              label={data.stay.label}
              linkId={data.stay.destination}
              pagePath={pagePath}
              locale={locale}
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji"
            >
              {data.stay.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedAffiliateLink>
            <p className="mt-1 text-xs leading-5 text-slate-500">PR: {data.tickets.disclosure}</p>
          </section>
        ) : null}

        {tickets.length ? (
          <section id="train-tickets" tabIndex={-1} className="mt-12 max-w-[760px] scroll-mt-20" aria-labelledby="tickets-heading">
            <h2 id="tickets-heading" className="text-xl font-extrabold tracking-[-0.02em]">{data.tickets.title}</h2>
            <p className="mt-1 text-[15px] leading-6 text-slate-600">{data.tickets.sub}</p>
            <ul className="mt-3 grid gap-1">
              {tickets.map((t) => (
                <li key={t.linkId}>
                  <TrackedAffiliateLink
                    href={t.href}
                    rel={AFFILIATE_REL}
                    target="_blank"
                    category="train"
                    provider="klook"
                    placement="golden_route_ticket"
                    label={t.label}
                    linkId={t.linkId}
                    adid={t.adid}
                    pagePath={pagePath}
                    locale={locale}
                    className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji"
                  >
                    {t.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </TrackedAffiliateLink>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-5 text-slate-500">PR: {data.tickets.disclosure}</p>
            <p className="mt-4 text-[15px] leading-6 text-slate-700">{data.tickets.boardingNote}</p>
          </section>
        ) : null}

        <p className="mt-10 max-w-[760px] text-sm leading-6 text-slate-600">{data.notCovered}</p>
        <p className="mt-2 max-w-[760px] text-xs leading-5 text-slate-500">{data.hub.verified}</p>
      </article>
      <SiteFooter />
    </main>
  );
}
