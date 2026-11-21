import type { Metadata } from "next";
import { ArrowRight, Check, CircleAlert, ExternalLink, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import data from "@/data/credit-card-tap.json";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string }> };

type Row = {
  name: string;
  card: "yes" | "partly" | "no";
  cardText: string;
  notes: string[];
  source: string[];
};

type Plan = { name: string; verdict: string; points: string[]; link?: string[]; source?: string[] };

const PATH = data.path;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    // The year belongs in the title (searchers filter for current rules), and
    // the suffix would push it past what results show.
    title: { absolute: data.title },
    description: data.description,
    // English first, like the other station guides; translations come later.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PATH, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, title: data.title, description: data.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

const BADGE: Record<Row["card"], string> = {
  yes: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  partly: "bg-amber-50 text-amber-900 ring-amber-200",
  no: "bg-rose-50 text-rose-800 ring-rose-200",
};

function CardBadge({ card }: { card: Row["card"] }) {
  const Icon = card === "yes" ? Check : card === "no" ? X : CircleAlert;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${BADGE[card]}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {data.where.legend[card]}
    </span>
  );
}

function Official({ source }: { source: string[] }) {
  return (
    <a href={source[1]} rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-700 underline underline-offset-2 hover:text-ink">
      {source[0]} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

export default async function CreditCardTapPage() {
  const rows = data.where.rows as Row[];
  const plans = data.compare.cards as Plan[];
  const checked = new Date(`${data.checked}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "How to buy a Suica", item: "https://fujiseat.com/how-to-buy-suica" },
        { "@type": "ListItem", position: 2, name: data.h1, item: `https://fujiseat.com${PATH}` },
      ],
    },
  ];

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[880px] px-5 pb-16 pt-8 md:pt-12">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Station help · checked {checked}</p>
          <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{data.h1}</h1>
          <p className="mt-3 text-[16px] leading-7 text-slate-600">{data.lead}</p>
        </header>

        <section className="mt-6 rounded-[22px] bg-ink p-6 text-white md:p-7" aria-labelledby="answer-heading">
          <h2 id="answer-heading" className="text-xs font-bold uppercase tracking-[0.1em] text-white/70">Quick answer</h2>
          <ul className="mt-3 grid gap-2.5 text-[15px] leading-6 text-white/90">
            {data.quick.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Sections" className="mt-3 flex flex-wrap gap-x-5">
          {[
            ["Stuck at the gate", "#stuck"],
            ["Where cards work", "#where"],
            ["Why a card fails", "#why"],
            ["Suica vs card vs JR Pass", "#compare"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 underline underline-offset-4 hover:text-ink">{label}</a>
          ))}
        </nav>

        <section id="stuck" tabIndex={-1} className="mt-8 scroll-mt-20 rounded-[22px] border-2 border-amber-300 bg-amber-50 p-5 md:p-7" aria-labelledby="stuck-heading">
          <h2 id="stuck-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{data.stuck.title}</h2>
          <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-800">{data.stuck.intro}</p>
          <ol className="mt-4 grid gap-3">
            {data.stuck.steps.map(([title, text], i) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block text-[15.5px] font-bold text-ink">{title}</span>
                  <span className="mt-0.5 block text-[15px] leading-6 text-slate-700">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-500">Show this to the staff</h3>
            <dl className="mt-3 grid gap-3">
              {data.stuck.phrases.map(([en, ja]) => (
                <div key={en}>
                  <dt className="text-sm text-slate-600">{en}</dt>
                  <dd lang="ja" className="mt-0.5 text-[19px] font-bold leading-7 text-ink">{ja}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-slate-500">{data.stuck.phrasesNote}</p>
          </div>
        </section>

        <section id="where" tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby="where-heading">
          <h2 id="where-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{data.where.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{data.where.intro}</p>
          <div className="mt-4 divide-y divide-slate-200 rounded-[22px] border border-slate-200 bg-white">
            {rows.map((row) => (
              <div key={row.name} className="grid gap-2 px-5 py-4 md:grid-cols-[200px_1fr] md:gap-6">
                <div>
                  <h3 className="text-[16px] font-extrabold text-ink">{row.name}</h3>
                  <div className="mt-1.5"><CardBadge card={row.card} /></div>
                </div>
                <div>
                  <p className="text-[15px] font-semibold leading-6 text-slate-800">{row.cardText}</p>
                  <ul className="mt-1.5 grid gap-1.5 text-[14.5px] leading-6 text-slate-600">
                    {row.notes.map((note) => (
                      <li key={note} className="flex gap-2">
                        <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                  <Official source={row.source} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[14.5px] leading-6 text-slate-600">{data.where.others}</p>
        </section>

        <section id="why" tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{data.why.title}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {data.why.items.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="text-[15.5px] font-bold text-ink">{title}</dt>
                <dd className="mt-1 text-[14.5px] leading-6 text-slate-600">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[15px] font-semibold leading-6 text-slate-800">{data.why.fallback}</p>
        </section>

        <section id="compare" tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="text-2xl font-extrabold tracking-[-0.02em]">{data.compare.title}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-600">{data.compare.intro}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="flex flex-col rounded-[22px] border border-slate-200 bg-white p-5">
                <h3 className="text-[16px] font-extrabold text-ink">{plan.name}</h3>
                <p className="mt-1 text-sm font-bold text-fuji">{plan.verdict}</p>
                <ul className="mt-3 grid gap-2 text-[14.5px] leading-6 text-slate-600">
                  {plan.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  {plan.link ? (
                    <Link href={plan.link[1]} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-ink underline underline-offset-4 hover:text-fuji">
                      {plan.link[0]} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                  {plan.source ? <div><Official source={plan.source} /></div> : null}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[22px] bg-slate-100 p-5">
            <h3 className="text-[16px] font-extrabold text-ink">{data.compare.subwayTicket.title}</h3>
            <p className="mt-1 text-[15px] leading-6 text-slate-700">{data.compare.subwayTicket.text}</p>
            <Official source={data.compare.subwayTicket.source} />
          </div>
        </section>

        <section id="faq" tabIndex={-1} className="mt-12 scroll-mt-20" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-extrabold tracking-[-0.02em]">Questions</h2>
          <div className="mt-4 grid gap-2.5">
            {data.faq.map(([q, a]) => (
              <details key={q} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer text-[15.5px] font-bold text-slate-900">{q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-extrabold">Related guides</h2>
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
          Checked against each operator&rsquo;s own page on {checked}. {data.disclaimer}
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
