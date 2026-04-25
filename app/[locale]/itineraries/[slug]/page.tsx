import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Users, Zap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { DayCard } from "@/components/content/DayCard";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAllItinerarySlugs, getItineraryBySlug } from "@/lib/content/itineraries";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return getAllItinerarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getItineraryBySlug(slug);
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

const paceConfig = {
  relaxed: { label: "Relaxed", icon: Clock, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  moderate: { label: "Moderate", icon: Users, className: "border-sky-200 bg-sky-50 text-sky-700" },
  fast: { label: "Fast", icon: Zap, className: "border-amber-200 bg-amber-50 text-amber-700" },
};

export default async function ItineraryPage({ params }: Props) {
  const { slug } = await params;
  const page = getItineraryBySlug(slug);
  if (!page) notFound();

  const pace = paceConfig[page.pace];
  const PaceIcon = pace.icon;

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
          { label: "Itineraries", href: "/" },
          { label: page.duration },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {page.duration}
          </span>
          <span className={["inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", pace.className].join(" ")}>
            <PaceIcon className="h-3.5 w-3.5" />
            {pace.label} pace
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Best for: {page.bestFor}
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-6 text-lg font-semibold text-slate-950">Day-by-day plan</h2>
            <div>
              {page.days.map((day) => (
                <DayCard key={day.day} {...day} />
              ))}
            </div>
          </section>

          <ProTip>{page.proTip}</ProTip>

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
