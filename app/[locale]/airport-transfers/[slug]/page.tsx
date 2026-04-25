import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Plane } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TransferOption } from "@/components/content/TransferOption";
import { ProTip } from "@/components/content/ProTip";
import { NextActions } from "@/components/content/NextActions";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { getAllTransferSlugs, getTransferBySlug } from "@/lib/content/transfers";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return getAllTransferSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getTransferBySlug(slug);
  if (!page) return {};
  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
  };
}

export default async function TransferPage({ params }: Props) {
  const { slug } = await params;
  const page = getTransferBySlug(slug);
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
          <section>
            <h2 className="text-lg font-semibold text-slate-950">Compare your options</h2>
            <p className="mt-1 text-sm text-slate-500">Sorted by what matters most — speed, ease, or cost.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-1">
              {page.options.map((opt) => (
                <TransferOption key={opt.name} {...opt} />
              ))}
            </div>
          </section>

          <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div>
              <p className="text-xs font-semibold text-sky-900">Late arrival?</p>
              <p className="mt-0.5 text-xs leading-5 text-sky-800">{page.lateArrivalNote}</p>
            </div>
          </div>

          <ProTip>{page.proTip}</ProTip>

          <NextActions picks={page.nextActions} />
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400">
          <p>fujiseat.com — Japan travel utility hub</p>
          <p className="mt-1">Partner links shown where they match the planning step.</p>
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
