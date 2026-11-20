import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { PhotoCredit } from "@/components/scenic/PhotoCredit";
import data from "@/data/golden-route.json";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string }> };

const f = data.ferry;
const PATH = f.path;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${f.title} | fujiseat`,
    description: f.description,
    // English only for now, like the other scenic pages.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, title: f.title, description: f.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

export default async function MiyajimaFerryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Scenic routes", item: "https://fujiseat.com/scenic" },
      { "@type": "ListItem", position: 2, name: data.hub.title, item: `https://fujiseat.com${data.hub.path}` },
      { "@type": "ListItem", position: 3, name: f.title, item: `https://fujiseat.com${PATH}` },
    ],
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[1000px] px-5 pb-16 pt-8 md:pt-12">
        <header className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{f.eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-[-0.03em] md:text-[48px]">{f.h1}</h1>
        </header>

        <section className="mt-6 max-w-[760px] rounded-[22px] bg-ink p-6 text-white md:p-7" aria-labelledby="answer-heading">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/70">Quick answer</p>
          <h2 id="answer-heading" className="mt-2 text-2xl font-extrabold tracking-[-0.02em] md:text-[28px]">{f.answerTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/85">{f.answer}</p>
          <a href={f.routeSource} rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-white underline underline-offset-4">
            JR Miyajima Ferry: Great Torii route <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </section>

        <nav aria-label="Sections" className="mt-3 flex flex-wrap gap-x-5">
          {f.jumps.map(([label, href]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink">{label}</a>
          ))}
        </nav>

        <div className="mt-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-slate-100">
            <Image src={f.image} alt={f.imageAlt} fill preload sizes="(min-width: 1000px) 960px, calc(100vw - 40px)" className="object-cover" />
          </div>
          <PhotoCredit src={f.image} className="mt-2" detailed />
        </div>

        <section id="sailings" tabIndex={-1} className="mt-10 max-w-[760px] scroll-mt-20" aria-labelledby="facts-heading">
          <h2 id="facts-heading" className="text-2xl font-extrabold tracking-[-0.02em]">Sailings, fares and passes</h2>
          <dl className="mt-4 divide-y divide-slate-200 rounded-[22px] border border-slate-200 bg-white">
            {f.facts.map(([label, value, source, linkLabel]) => (
              <div key={label} className="grid gap-1 px-5 py-4 md:grid-cols-[180px_1fr] md:gap-6">
                <dt className="text-sm font-bold text-ink">{label}</dt>
                <dd className="text-[15px] leading-6 text-slate-700">
                  {value}{" "}
                  <a href={source} rel="noopener noreferrer" className="text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">{linkLabel}</a>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="getting-there" tabIndex={-1} className="mt-10 max-w-[760px] scroll-mt-20" aria-labelledby="getting-heading">
          <h2 id="getting-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{f.gettingThereTitle}</h2>
          <ol className="mt-4 grid gap-3 text-[15px] leading-7 text-slate-700">
            {f.gettingThere.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-ink">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a href={f.gettingThereSource} rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">How to board (JR Miyajima Ferry)</a>
        </section>

        <section className="mt-10 max-w-[760px]" aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{f.tipsTitle}</h2>
          <ul className="mt-4 grid gap-2 text-[15px] leading-7 text-slate-700">
            {f.tips.map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10">
          <Link href={data.hub.path} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-bold text-ink underline underline-offset-4 hover:text-fuji">
            {f.back}: {data.hub.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{data.hub.verified}</p>
      </article>
      <SiteFooter />
    </main>
  );
}
