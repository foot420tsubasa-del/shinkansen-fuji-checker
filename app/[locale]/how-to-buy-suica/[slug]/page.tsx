import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAlternates } from "@/i18n/hreflang";
import { SuicaDiagram } from "@/components/suica/SuicaDiagram";
import { SuicaGuideGrid } from "@/components/suica/SuicaGuideGrid";
import { SUICA_GUIDES, getSuicaGuide } from "@/data/suica-guides";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ locale: string; slug: string }> };

const OFFICIAL_SUICA_URL = "https://www.jreast.co.jp/multi/en/pass/suica.html";

export function generateStaticParams() {
  return SUICA_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getSuicaGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | fujiseat`,
    description: guide.description,
    // English only, like the guide this came from.
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(`/how-to-buy-suica/${guide.slug}`, locale),
    openGraph: { images: DEFAULT_OG_IMAGES, type: "article", title: guide.title, description: guide.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

export default async function SuicaGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getSuicaGuide(slug);
  if (!guide) notFound();
  const index = SUICA_GUIDES.indexOf(guide);
  const next = SUICA_GUIDES[(index + 1) % SUICA_GUIDES.length];
  const others = SUICA_GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-6 md:py-10">
        <article className="mx-auto max-w-3xl">
          <Link href="/how-to-buy-suica" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#145aa0]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Suica guide
          </Link>
          <h1 className="mt-3 font-serif text-[28px] font-bold leading-tight text-[#082653] md:text-4xl">{guide.title}</h1>

          <figure className="mt-5 overflow-hidden rounded-[22px] border border-[#d9e5f2] bg-white shadow-[0_12px_32px_rgba(9,35,70,0.08)]">
            <SuicaDiagram id={guide.diagram} title={guide.title} className="block w-full" />
          </figure>

          <p className="mt-6 rounded-2xl bg-[#eef6ff] px-5 py-4 text-[18px] font-bold leading-7 text-[#082653]">{guide.answer}</p>

          <ul className="mt-5 grid gap-3">
            {guide.points.map((point) => (
              <li key={point} className="flex gap-3 text-[16px] leading-7 text-slate-700">
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {guide.note ? <p className="mt-4 text-[13px] leading-6 text-slate-500">{guide.note}</p> : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/how-to-buy-suica#simulator"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#145aa0] px-5 text-[15px] font-bold text-white hover:bg-[#0f4a86]"
            >
              Practice on the machine
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/how-to-buy-suica/${next.slug}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#145aa0] bg-white px-5 text-[15px] font-bold text-[#145aa0] hover:bg-[#eef6ff]"
            >
              Next: {next.card}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-8 text-[12px] leading-5 text-slate-400">
            General travel information, not an official source. Suica availability, deposits and conditions can change and may vary by station and date — check the{" "}
            <a href={OFFICIAL_SUICA_URL} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">
              official JR East Suica page
            </a>{" "}
            and ask at the station.
          </p>
        </article>

        <section className="mx-auto mt-12 max-w-5xl">
          <h2 className="text-xl font-extrabold text-[#082653]">More Suica guides</h2>
          <div className="mt-4">
            <SuicaGuideGrid guides={others} />
          </div>
        </section>

        <SiteLegalLinks className="mt-10 text-slate-500" />
      </Container>
    </main>
  );
}
