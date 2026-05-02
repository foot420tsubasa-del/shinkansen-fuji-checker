import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, MapPin, Plane } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TransferOption } from "@/components/content/TransferOption";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAllTransferSlugs, getTransferBySlug } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return getAllTransferSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getTransferBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
    alternates: getAlternates(`/airport-transfers/${slug}`, locale),
  };
}

export default async function TransferPage({ params }: Props) {
  const { slug, locale } = await params;
  const page = getTransferBySlug(slug);
  if (!page) notFound();
  const pagePath = `/airport-transfers/${slug}`;
  const bestOption = page.options[0];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Airport transfers", href: "/" },
          { label: `${page.from} → ${page.to}` },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Plane className="h-4 w-4 text-sky-600" />
            {page.from}
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-red-500" />
            {page.to}
          </span>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
              Quick answer
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Most travelers should start with {bestOption.name}.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              It is the default recommendation for {page.from} to {page.to}: {bestOption.duration}, {bestOption.cost}, and {bestOption.luggageFriendly ? "luggage-friendly" : "best when traveling light"}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Compare your options</h2>
            <p className="mt-1 text-sm text-slate-500">Sorted by what matters most — speed, ease, or cost.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-1">
              {page.options.map((opt) => (
                <TransferOption key={opt.name} {...opt} locale={locale} pagePath={pagePath} />
              ))}
            </div>
          </section>

          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sky-700">
              Luggage note
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              With two or more large suitcases, prioritize direct trains or buses over the cheapest transfer. Station stairs and rush-hour platforms are the hidden cost.
            </p>
          </section>

          <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div>
              <p className="text-xs font-semibold text-sky-900">Late arrival?</p>
              <p className="mt-0.5 text-xs leading-5 text-sky-800">{page.lateArrivalNote}</p>
            </div>
          </div>

          <ProTip>{page.proTip}</ProTip>

          <NextActions picks={page.nextActions} locale={locale} pagePath={pagePath} />
          <SuggestedNextSteps currentPageType="transfer" locale={locale} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <p className="mt-1">Partner links shown where they match the planning step.</p>
          <LastCheckedNote className="mt-3" />
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
