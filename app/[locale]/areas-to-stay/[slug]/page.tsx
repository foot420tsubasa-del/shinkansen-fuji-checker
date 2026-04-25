import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { QuickRec } from "@/components/content/QuickRec";
import { AreaCard } from "@/components/content/AreaCard";
import { ComparisonTable } from "@/components/content/ComparisonTable";
import { ProTip } from "@/components/content/ProTip";
import { HotelPicks } from "@/components/content/HotelPicks";
import { NextActions } from "@/components/content/NextActions";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAllStaySlugs, getStayBySlug } from "@/lib/content/stay";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return getAllStaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getStayBySlug(slug);
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
  };
}

export default async function StayPage({ params }: Props) {
  const { slug } = await params;
  const page = getStayBySlug(slug);
  if (!page) notFound();

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <div className="page-header border-b border-sky-100/80 backdrop-blur">
        <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950 md:text-base">fujiseat</p>
              <p className="hidden text-xs leading-5 text-slate-500 sm:block">Japan travel utility hub</p>
            </div>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="mr-1 inline h-4 w-4" />
            Home
          </Link>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: "Areas to stay", href: "/" },
          { label: page.title.split("—")[0].trim() },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-8 space-y-8">
          <QuickRec
            area={page.quickRec.area}
            why={page.quickRec.why}
            link={page.quickRec.link}
          />

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Area breakdown</h2>
            <p className="mt-1 text-sm text-slate-500">Tap an area to see hotels on Klook.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Side-by-side comparison</h2>
            <ComparisonTable
              columns={page.comparisonColumns}
              rows={page.comparison}
              highlight={page.quickRec.area}
            />
          </section>

          <ProTip>{page.proTip}</ProTip>

          <section>
            <HotelPicks picks={page.hotelPicks} />
          </section>

          <NextActions picks={page.nextActions} />
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
