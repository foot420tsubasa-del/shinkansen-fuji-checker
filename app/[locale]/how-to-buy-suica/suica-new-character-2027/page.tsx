import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowLeft, Check, ExternalLink, Rabbit } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { SUICA_CHARACTER_NEWS as article } from "@/data/suica-character-news";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${article.title} | fujiseat`,
    description: article.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(article.path, locale),
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
      publishedTime: article.published,
      modifiedTime: article.updated,
    },
  };
}

export default async function SuicaNewCharacterPage({ params }: Props) {
  const { locale } = await params;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title,
      description: article.description,
      datePublished: article.published,
      dateModified: article.updated,
      author: { "@type": "Organization", name: "fujiseat" },
      publisher: { "@type": "Organization", name: "fujiseat", url: "https://fujiseat.com" },
      mainEntityOfPage: `https://fujiseat.com${article.path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {locale === "en" ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}
      <SiteHeader />

      <article className="mx-auto max-w-[780px] px-5 pb-16 pt-8 md:pt-12">
        <Link href="/how-to-buy-suica" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145aa0]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Suica guide
        </Link>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.1em] text-[#2E7D5B]">Suica news</p>
        <h1 className="mt-2 font-serif text-[32px] font-bold leading-[1.12] text-[#082653] md:text-[44px]">
          {article.title}
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-slate-600">{article.description}</p>
        <p className="mt-3 text-sm text-slate-500">Published November 19, 2026 · Checked against JR East’s November 18 announcement</p>

        <section className="mt-8 rounded-[22px] bg-[#082653] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">The short answer</p>
          <ul className="mt-4 grid gap-3">
            <Fact>Candidate B—a purple rabbit motif by {article.facts.designer}—won {article.facts.winningVotes} of {article.facts.totalVotes} votes.</Fact>
            <Fact>The new mascot is scheduled to take over on {article.facts.handoverDate}, after the Suica Penguin’s final day on {article.facts.penguinFinalDate}.</Fact>
            <Fact>The character does not have an announced name yet. Name suggestions close {article.facts.namingDeadline}.</Fact>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">What JR East decided</h2>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            JR East announced the result on {article.facts.announcementDate}, the 25th anniversary of Suica’s launch. Of three public candidates, candidate B received about 51.7% of the vote. JR East describes it as the next image character for a Suica that is expanding from a transport-and-payment tool toward a broader “device for daily life.”
          </p>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            The winning design uses a purple rabbit motif. Its original designer, {article.facts.designer}, said the colors, shapes and gestures were designed to express Suica’s future possibilities and remain visually distinctive in many settings.
          </p>
        </section>

        <section className="mt-10 rounded-[22px] border border-[#cfe0f3] bg-[#eef6ff] p-5 md:p-6">
          <div className="flex gap-4">
            <Rabbit className="mt-0.5 h-7 w-7 shrink-0 text-[#145aa0]" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-extrabold text-[#082653]">See the actual character on JR East</h2>
              <p className="mt-2 text-[15px] leading-7 text-slate-700">
                JR East’s official page shows the selected artwork and the naming form. We link to it instead of copying the image because JR East’s website terms prohibit reproducing its images.
              </p>
              <a
                href={article.officialCharacterUrl}
                target="_blank"
                rel="noopener nofollow"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#145aa0] px-4 text-sm font-bold text-white hover:bg-[#0f4a86]"
              >
                View the official character
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">The handover from the Suica Penguin</h2>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            The Suica Penguin is scheduled to graduate as Suica’s image character on {article.facts.penguinFinalDate}. JR East plans a handover event that day, with the new character beginning its role on {article.facts.handoverDate}.
          </p>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            This announcement is about the brand’s image character. It did not announce a change to the way travelers buy, charge or tap Suica. For practical card information, use our current{" "}
            <Link href="/how-to-buy-suica" className="font-semibold text-[#145aa0] underline underline-offset-2">Suica guide and ticket-machine practice</Link>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">You can suggest the name</h2>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            JR East says anyone may enter, provided they accept the rules. The suggested name must be no more than 10 characters and use hiragana, katakana or the Latin alphabet. Entrants also provide a katakana reading, the idea behind the name and an optional character concept.
          </p>
          <p className="mt-4 text-[17px] leading-8 text-slate-700">
            Entries close on {article.facts.namingDeadline}. The most frequently submitted name does not automatically win: a committee will judge the name together with its meaning. JR East plans to announce the result on {article.facts.nameRevealDate}. Read the complete official rules before entering.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#082653]">Questions</h2>
          <div className="mt-4 grid gap-3">
            {article.faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer text-[16px] font-bold text-slate-900">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-extrabold text-[#082653]">Sources</h2>
          <ul className="mt-3 grid gap-2">
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener nofollow" className="inline-flex items-start gap-1.5 text-sm leading-6 text-[#145aa0] underline underline-offset-2">
                  {source.label}
                  <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] leading-5 text-slate-500">
            Information checked November 19, 2026. The naming schedule and campaign details may change; use JR East’s official page for the latest information.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}

function Fact({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[16px] leading-7 text-white/90">
      <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
