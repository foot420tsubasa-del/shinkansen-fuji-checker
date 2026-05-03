import type { Metadata } from "next";
import { ArrowRight, Bed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { stayPages, type StayPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Where to Stay in Japan — Area Guides for First-Timers | fujiseat",
    description:
      "Compare the best areas to stay in Tokyo, Kyoto, Osaka, and near Mt Fuji. Find neighborhoods that match your budget, pace, and travel style.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/areas-to-stay", locale),
    openGraph: {
      title: "Where to Stay in Japan — Area Guides",
      description:
        "Compare neighborhoods across Tokyo, Kyoto, Osaka, and Mt Fuji for your first Japan trip.",
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-areas-to-stay.png", width: 1200, height: 630 }],
    },
  };
}

const tokyoSlugs = [
  "tokyo-first-time",
  "where-to-stay-before-shinkansen",
  "tokyo-station-vs-shinjuku",
  "tokyo-station-hotels-before-shinkansen",
  "ueno-vs-shinjuku",
  "asakusa-vs-ueno",
] as const;
const kyotoSlugs = ["kyoto-first-time", "kyoto-station-vs-gion"] as const;
const osakaSlugs = ["osaka-first-time", "namba-vs-umeda", "shin-osaka-vs-namba"] as const;
const fujiSlugs = ["kawaguchiko"] as const;

function orderedPages(slugs: readonly string[]): StayPage[] {
  return slugs
    .map((slug) => stayPages.find((page) => page.slug === slug))
    .filter((page): page is StayPage => Boolean(page));
}

function StayCard({ page }: { page: StayPage }) {
  return (
    <Link
      key={page.slug}
      href={`/areas-to-stay/${page.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-indigo-700">
            {page.quickRec.area} recommended
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950 group-hover:text-indigo-800">
            {page.title}
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {page.description}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-600" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {page.areas.map((area) => (
          <span
            key={area.name}
            className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700"
          >
            {area.name}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function AreasToStayIndex() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
    <SiteHeader />
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Where to Stay" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-indigo-600" />
          <p className="text-[11px] font-semibold uppercase text-indigo-700">
            Where to Stay
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
          Best areas to stay in Japan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Picking the right neighborhood makes or breaks your trip. Each guide
          compares areas by transport access, vibe, and budget — so you can book
          with confidence.
        </p>
      </div>

      {/* Tokyo */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Tokyo</h2>
        <p className="mt-1 text-xs text-slate-500">Compare Shinjuku, Ueno, Asakusa, Tokyo Station and more for your Tokyo base.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(tokyoSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Kyoto */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Kyoto</h2>
        <p className="mt-1 text-xs text-slate-500">Kyoto Station for logistics, Gion for atmosphere, Kawaramachi for food and nightlife.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(kyotoSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Osaka */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Osaka</h2>
        <p className="mt-1 text-xs text-slate-500">Namba for food and nightlife, Umeda for transport, Shin-Osaka for the Shinkansen.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(osakaSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Mt. Fuji / Kawaguchiko */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Mt. Fuji / Kawaguchiko</h2>
        <p className="mt-1 text-xs text-slate-500">Extend the Shinkansen view into a lakeside overnight stay near Mt. Fuji.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(fujiSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
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
