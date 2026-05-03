import type { Metadata } from "next";
import { ArrowRight, Plane } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { transferPages, type TransferPage } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Airport Transfers in Japan — Narita, Haneda and Kansai Airport | fujiseat",
    description:
      "Compare airport transfer options for Tokyo and Kansai, including Narita, Haneda, and Kansai Airport routes to Shinjuku, Asakusa, Kyoto, Namba and Umeda.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/airport-transfers", locale),
    openGraph: {
      title: "Airport Transfers in Japan — Narita, Haneda & Kansai",
      description:
        "Compare airport transfer options for Tokyo and Kansai. Narita, Haneda, and KIX routes compared.",
      siteName: "fujiseat",
    },
  };
}

const naritaSlugs = [
  "narita-to-shinjuku",
  "narita-to-tokyo-station",
  "narita-to-ueno",
  "narita-to-shibuya",
  "narita-to-asakusa",
  "narita-to-oshiage",
] as const;
const hanedaSlugs = [
  "haneda-to-shinjuku",
  "haneda-to-asakusa",
  "haneda-to-ueno",
  "haneda-to-tokyo-station",
  "haneda-to-shibuya",
] as const;
const kansaiSlugs = [
  "kansai-airport-to-kyoto",
  "kansai-airport-to-namba",
  "kansai-airport-to-umeda",
  "osaka-to-kansai-airport",
  "kyoto-to-kansai-airport",
] as const;
const lateArrivalSlugs = ["narita-late-arrival", "haneda-late-arrival"] as const;

function orderedPages(slugs: readonly string[]): TransferPage[] {
  return slugs
    .map((slug) => transferPages.find((page) => page.slug === slug))
    .filter((page): page is TransferPage => Boolean(page));
}

function TransferCard({ page }: { page: TransferPage }) {
  return (
    <Link
      href={`/airport-transfers/${page.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-sky-700">
            {page.from} → {page.to}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-950 group-hover:text-sky-800">
            {page.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {page.description}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-sky-600" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {page.options.map((opt) => (
          <span
            key={opt.name}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600"
          >
            {opt.name} · {opt.duration} · {opt.cost}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function AirportTransfersIndex() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
    <SiteHeader />
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Airport Transfers" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-sky-600" />
          <p className="text-[11px] font-semibold uppercase text-sky-700">
            Airport Transfers
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
          Airport Transfers in Japan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Compare airport transfer options for Tokyo and Kansai, including Narita, Haneda, and Kansai Airport routes to Shinjuku, Asakusa, Kyoto, Namba and Umeda.
        </p>
      </div>

      {/* Narita */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Narita Airport (NRT)</h2>
        <p className="mt-1 text-xs text-slate-500">Tokyo&apos;s main international airport — further out, but well-connected by N&apos;EX, Skyliner, and bus.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(naritaSlugs).map((p) => <TransferCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Haneda */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Haneda Airport (HND)</h2>
        <p className="mt-1 text-xs text-slate-500">Closer to central Tokyo — monorail, Keikyu, and bus options are fast and affordable.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(hanedaSlugs).map((p) => <TransferCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Kansai */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Kansai Airport (KIX)</h2>
        <p className="mt-1 text-xs text-slate-500">Gateway to Kyoto and Osaka — Haruka, Nankai, and bus connections to the Kansai region.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(kansaiSlugs).map((p) => <TransferCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Late arrival */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Late Arrival Guides</h2>
        <p className="mt-1 text-xs text-slate-500">Landing at night? Compare your options when trains stop running.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(lateArrivalSlugs).map((p) => <TransferCard key={p.slug} page={p} />)}
        </div>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
        <LastCheckedNote />
        <SiteLegalLinks className="mt-3 text-slate-400" />
      </footer>
    </Container>
    </main>
  );
}
