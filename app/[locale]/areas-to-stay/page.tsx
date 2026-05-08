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

const quickPickerItems = [
  {
    href: "/areas-to-stay/tokyo-first-time",
    title: "First time in Tokyo?",
    text: "Start with the Tokyo first-time area guide.",
  },
  {
    href: "/areas-to-stay/where-to-stay-before-shinkansen",
    title: "Taking the Shinkansen early?",
    text: "Choose a hotel base that works for luggage and early trains.",
  },
  {
    href: "/areas-to-stay/kyoto-first-time",
    title: "First time in Kyoto?",
    text: "Compare Kyoto Station, Gion and Kawaramachi.",
  },
  {
    href: "/areas-to-stay/osaka-first-time",
    title: "First time in Osaka?",
    text: "Compare Namba, Umeda and Shin-Osaka.",
  },
  {
    href: "/local-hotel-picks",
    title: "Want actual hotel examples?",
    text: "See curated Japanese local hotel picks.",
  },
] as const;

const cardCopy: Record<string, { label: string; description: string; tags: string[] }> = {
  "tokyo-first-time": {
    label: "Start here",
    description: "Start here if this is your first Tokyo trip.",
    tags: ["Shinjuku", "Ueno", "Asakusa"],
  },
  "where-to-stay-before-shinkansen": {
    label: "Shinkansen",
    description: "Choose the easier Tokyo base before an early train.",
    tags: ["Tokyo Station", "Luggage", "Early train"],
  },
  "tokyo-station-vs-shinjuku": {
    label: "Compare",
    description: "Compare rail convenience with nightlife and food.",
    tags: ["Tokyo Station", "Shinjuku"],
  },
  "tokyo-station-hotels-before-shinkansen": {
    label: "Shinkansen",
    description: "Pick a hotel area before boarding from Tokyo Station.",
    tags: ["Tokyo Station", "Ginza", "Nihonbashi"],
  },
  "ueno-vs-shinjuku": {
    label: "Compare",
    description: "Choose between Narita access and nightlife.",
    tags: ["Ueno", "Shinjuku"],
  },
  "asakusa-vs-ueno": {
    label: "Compare",
    description: "Compare old-town atmosphere with rail convenience.",
    tags: ["Asakusa", "Ueno"],
  },
  "kyoto-first-time": {
    label: "Start here",
    description: "Start here if this is your first Kyoto trip.",
    tags: ["Kyoto Station", "Gion", "Kawaramachi"],
  },
  "kyoto-station-vs-gion": {
    label: "Compare",
    description: "Choose between easy logistics and classic atmosphere.",
    tags: ["Kyoto Station", "Gion"],
  },
  "osaka-first-time": {
    label: "Start here",
    description: "Start here if this is your first Osaka trip.",
    tags: ["Namba", "Umeda", "Shin-Osaka"],
  },
  "namba-vs-umeda": {
    label: "Compare",
    description: "Choose between food/nightlife and transport.",
    tags: ["Namba", "Umeda"],
  },
  "shin-osaka-vs-namba": {
    label: "Shinkansen",
    description: "Compare early-train logistics with Osaka nightlife.",
    tags: ["Shin-Osaka", "Namba"],
  },
  kawaguchiko: {
    label: "Mt. Fuji",
    description: "Use this if you want to stay overnight near Mt. Fuji.",
    tags: ["Kawaguchiko", "Ryokan", "Fuji view"],
  },
};

function orderedPages(slugs: readonly string[]): StayPage[] {
  return slugs
    .map((slug) => stayPages.find((page) => page.slug === slug))
    .filter((page): page is StayPage => Boolean(page));
}

function StayCard({ page }: { page: StayPage }) {
  const copy = cardCopy[page.slug] ?? {
    label: "Guide",
    description: page.description,
    tags: page.areas.slice(0, 3).map((area) => area.name),
  };

  return (
    <Link
      key={page.slug}
      href={`/areas-to-stay/${page.slug}`}
      className="group rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#9fd7bd] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex rounded-full border border-[#9fd7bd] bg-[#f0fbf6] px-2.5 py-1 text-[10px] font-semibold text-[#106b43]">
            {copy.label}
          </p>
          <h2 className="mt-3 text-base font-semibold leading-snug text-slate-950 group-hover:text-[#106b43]">
            {page.title}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-slate-600">
            {copy.description}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#106b43]" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {copy.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600"
          >
            {tag}
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
          <Bed className="h-5 w-5 text-[#106b43]" />
          <p className="text-[11px] font-semibold uppercase text-[#106b43]">
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

      <section className="mt-8 rounded-[22px] border border-[#d5e5ef] bg-white p-4 shadow-sm md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">
              Quick picker
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Choose your next guide</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {quickPickerItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-[#9fd7bd] hover:bg-[#f0fbf6]"
            >
              <span>
                <span className="block text-sm font-semibold text-slate-950 group-hover:text-[#106b43]">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                  {item.text}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#106b43]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Tokyo */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Tokyo</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          Start with the first-time Tokyo guide. Use the Shinkansen guide if you are leaving for Kyoto or Osaka early.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(tokyoSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Kyoto */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Kyoto</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          Start with the first-time Kyoto guide, then compare Kyoto Station and Gion if you are deciding between logistics and atmosphere.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(kyotoSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Osaka */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Osaka</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          Start with the first-time Osaka guide, then compare Namba, Umeda and Shin-Osaka based on food, transport and Shinkansen access.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(osakaSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      {/* Mt. Fuji / Kawaguchiko */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-950">Mt. Fuji / Kawaguchiko</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
          Use this if you want to stay overnight near Mt. Fuji instead of only seeing it from the train.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {orderedPages(fujiSlugs).map((p) => <StayCard key={p.slug} page={p} />)}
        </div>
      </section>

      <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-950">Looking for specific hotel examples?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          See curated local hotel picks for Tokyo, Kyoto and Osaka — selected by area logic, not as a generic ranking.
        </p>
        <Link
          href="/local-hotel-picks"
          className="mt-3 inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Japanese Local Hotel Picks
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
        <LastCheckedNote />
        <SiteLegalLinks className="mt-3 text-slate-400" />
      </footer>
    </Container>
    </main>
  );
}
