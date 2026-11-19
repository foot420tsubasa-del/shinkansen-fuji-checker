import type { Metadata } from "next";
import Image from "next/image";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiAreaSearchLink, FujiViewStayCards } from "@/components/stays/FujiViewStayCards";
import stays from "@/data/fuji-view-stays.json";

type Props = { params: Promise<{ locale: string }> };

const PATH = "/stays/mt-fuji-view";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${stays.page.title} | fujiseat`,
    description: stays.page.description,
    // English only for now: other locales render the English page and stay out of the index.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { title: stays.page.title, description: stays.page.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

export default async function MtFujiViewStaysPage({ params }: Props) {
  const { locale } = await params;
  const pagePath = locale === "en" ? PATH : `/${locale}${PATH}`;
  const p = stays.page;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: p.title,
    numberOfItems: stays.hotels.length,
    itemListElement: stays.hotels.map((hotel, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Hotel", name: hotel.name, address: { "@type": "PostalAddress", addressLocality: "Fujikawaguchiko", addressRegion: "Yamanashi", addressCountry: "JP" } },
    })),
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[1120px] px-5 pb-16 pt-8 md:pt-12">
        <header className="max-w-[720px]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{p.eyebrow}</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[60px]">{p.h1}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-700 md:text-xl">{p.sub}</p>
        </header>

        <div className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-slate-100">
            <Image src={p.heroImage.src} alt={p.heroImage.alt} fill preload sizes="(min-width: 1120px) 1080px, calc(100vw - 40px)" className="object-cover" style={{ objectPosition: p.heroImage.position }} />
            {p.heroImage.illustrative ? (
              <span className="absolute bottom-2 right-3 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">Illustrative image</span>
            ) : null}
          </div>
          <PhotoCredit src={p.heroImage.src} className="mt-2" detailed />
        </div>

        <section className="mt-12" aria-labelledby="stays-heading">
          <h2 id="stays-heading" className="text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">{p.hotelsTitle}</h2>
          <div className="mt-6">
            <FujiViewStayCards variant="full" placement="fuji_view_stays" pagePath={pagePath} locale={locale} />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">PR: {p.disclosure}</p>
        </section>

        <section className="mt-12 max-w-[720px]" aria-labelledby="view-heading">
          <h2 id="view-heading" className="text-xl font-extrabold tracking-[-0.02em]">{p.viewTitle}</h2>
          <ul className="mt-3 grid gap-2 text-[15px] leading-7 text-slate-700">
            {p.viewNotes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold">{p.areaTitle}</h2>
            <p className="mt-1 text-[15px] leading-6 text-slate-600">{p.areaBody}</p>
            <FujiAreaSearchLink placement="fuji_view_area_search" pagePath={pagePath} locale={locale} className="mt-3" />
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-extrabold">{p.routeTitle}</h2>
            <p className="mt-1 text-[15px] leading-6 text-slate-600">{p.routeBody}</p>
            <Link href="/scenic/fujikyu" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji">
              {p.routeCta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
