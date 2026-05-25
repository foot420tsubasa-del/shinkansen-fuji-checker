import type { Metadata } from "next";
import { ArrowRight, BarChart3, Luggage, MapPin, Plane, ShieldCheck, Train } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import signals from "@/data/generated/tokyo-stay-area-signals.json";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import { tokyoStayAreaSourceRegistry } from "@/data/stay-area/source-registry";
import { buildTokyoStayAreaScores } from "@/lib/stay-area/scoring";
import type { ComputedStayAreaScore, StayAreaBase, StayAreaSignalsFile } from "@/lib/stay-area/types";

type Props = {
  params: Promise<{ locale: string }>;
};

const pagePath = "/areas-to-stay/tokyo-stay-area-index";

const scoreLabels: Array<{ key: keyof ComputedStayAreaScore["scores"]; label: string }> = [
  { key: "stationSimplicity", label: "Station simplicity" },
  { key: "luggageFriendly", label: "Luggage-friendly" },
  { key: "airportAccess", label: "Airport access" },
  { key: "shinkansenAccess", label: "Shinkansen access" },
  { key: "touristAccess", label: "Tourist access" },
  { key: "localFeel", label: "Local feel" },
  { key: "crowdStress", label: "Less crowd stress" },
];

const filterChips = [
  "First-time visitor",
  "Narita arrival",
  "Haneda arrival",
  "Shinkansen access",
  "Avoid giant stations",
  "Local Tokyo",
  "Budget-conscious",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Tokyo Stay Area Index: Compare Station Areas Before Booking Hotels",
    description:
      "Compare Tokyo station areas by luggage-friendliness, airport access, station simplicity, crowd stress, and local feel before choosing where to stay.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
    openGraph: {
      title: "Tokyo Stay Area Index",
      description:
        "Compare Tokyo station areas by luggage-friendliness, airport access, station simplicity, crowd stress, and local feel.",
      siteName: "fujiseat",
    },
  };
}

function areaById(id: string) {
  const area = tokyoStayAreasBase.find((item) => item.id === id);
  if (!area) throw new Error(`Missing Tokyo stay area base data for ${id}`);
  return area;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{Math.round(value)}/100</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#168a56]" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function ProviderNote({ area }: { area: StayAreaBase }) {
  const hasProviderLink = Object.values(area.affiliateSearchLinks).some(Boolean);
  if (hasProviderLink) return null;
  return (
    <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
      No station-area hotel provider buttons are shown here because no approved station-specific affiliate URLs are configured for this MVP.
    </p>
  );
}

function AreaDetailPanel({ area, score }: { area: StayAreaBase; score: ComputedStayAreaScore }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Selected area</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{area.displayName}</h2>
          <p className="mt-1 text-sm text-slate-500">{area.japaneseName} · {area.areaGroup}</p>
        </div>
        <div className="rounded-2xl bg-[#ff7a00] px-4 py-3 text-center text-white shadow-sm">
          <p className="text-2xl font-black leading-none">{score.overallScore}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em]">/100</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{area.editorial.overallLabel}</p>

      <div className="mt-5 grid gap-2">
        {scoreLabels.map(({ key, label }) => (
          <ScoreBar key={key} label={label} value={score.scores[key]} />
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Best for</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.editorial.bestFor.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Watch out</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.editorial.watchOut.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <h3 className="text-sm font-semibold text-slate-950">Why this area ranks high</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{area.editorial.editorialNote}</p>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Confidence: {score.confidence.label} ({score.confidence.score}/100) · Data freshness: {score.sourceFreshness.label}
      </p>
      <ProviderNote area={area} />
    </section>
  );
}

function AreaRankRow({
  rank,
  area,
  score,
}: {
  rank: number;
  area: StayAreaBase;
  score: ComputedStayAreaScore;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {rank}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950">{area.displayName}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {area.stationNames.join(" / ")} · {area.crowdLevel} crowd level
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5 md:text-center">
          <Metric label="Overall" value={score.overallScore} strong />
          <Metric label="Station" value={score.scores.stationSimplicity} />
          <Metric label="Luggage" value={score.scores.luggageFriendly} />
          <Metric label="Airport" value={score.scores.airportAccess} />
          <Metric label="Local" value={score.scores.localFeel} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.editorial.overallLabel}</p>
    </article>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={["rounded-2xl border px-3 py-2", strong ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-50 text-slate-600"].join(" ")}>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      <span className="mt-0.5 block text-sm font-black">{Math.round(value)}</span>
    </div>
  );
}

function FeaturedAreaCard({ area, score }: { area: StayAreaBase; score: ComputedStayAreaScore }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{area.displayName}</h3>
          <p className="mt-1 text-xs text-slate-500">{area.areaGroup}</p>
        </div>
        <span className="rounded-full bg-[#ff7a00] px-3 py-1 text-sm font-bold text-white">{score.overallScore}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.editorial.localFeelNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {area.editorial.bestFor.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#106b43]">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

export default async function TokyoStayAreaIndexPage({ params }: Props) {
  const { locale } = await params;
  const computedScores = buildTokyoStayAreaScores(tokyoStayAreasBase, signals as StayAreaSignalsFile);
  const scoreById = new Map(computedScores.map((score) => [score.id, score]));
  const rankedAreas = computedScores.map((score) => ({ area: areaById(score.id), score }));
  const selected = rankedAreas[0];
  const featuredIds = ["oshiage", "kuramae", "ueno"];
  const generatedScoreCount = scoresJson.areas.length;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Areas to stay", href: "/areas-to-stay" },
            { label: "Tokyo Stay Area Index" },
          ]}
        />

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">
            Station-area decision tool
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">Tokyo Stay Area Index</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Compare Tokyo station areas before choosing hotels, based on luggage-friendliness, airport access,
                station simplicity, crowd stress, and local feel.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#106b43]">
                Public-data-informed · Updated locally for now · Built for first-time Japan travelers
              </p>
            </div>
            <a
              href="#ranked-areas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff7a00] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e66700]"
            >
              Compare area fits
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <span key={chip} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                {chip}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            MVP note: filters are visual prompts for now. The ranked list uses the editorial travel-fit score below.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div id="ranked-areas" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Ranked list</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Station-area travel fit</h2>
              </div>
              <p className="hidden text-xs font-semibold text-slate-500 md:block">{generatedScoreCount} local seed scores</p>
            </div>
            <div className="mt-4 grid gap-3">
              {rankedAreas.map(({ area, score }, index) => (
                <AreaRankRow key={area.id} rank={index + 1} area={area} score={score} />
              ))}
            </div>
          </div>
          <AreaDetailPanel area={selected.area} score={selected.score} />
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Featured area cards</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Good starting points for many travelers</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {featuredIds.map((id) => (
              <FeaturedAreaCard key={id} area={areaById(id)} score={scoreById.get(id) ?? selected.score} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#106b43]">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">How scores work</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>This compares station areas, not individual hotels.</p>
              <p>Scores combine editorial travel logic with public-data-ready signals. The current local MVP uses seed data and is structured for future public-data refresh.</p>
              <p>Scores are not official ratings and do not rank hotel quality, price, or availability.</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InfoCard icon={Luggage} title="Luggage" body="Does the area feel manageable with suitcases?" />
              <InfoCard icon={Plane} title="Airport" body="Does arrival routing stay practical?" />
              <InfoCard icon={Train} title="Rail days" body="Does it help or hurt Shinkansen logistics?" />
              <InfoCard icon={ShieldCheck} title="Stress" body="Higher crowd-stress score means less stressful." />
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#106b43]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">Data freshness / source note</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              fujiseat.com scores are editorial travel-fit scores based on public data signals and traveler logic. They
              are not official ratings and do not guarantee safety, comfort, hotel quality, price, or availability.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Current mode: <span className="font-semibold">local-seed</span>. External public-data fetch is not enabled yet.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Future source registry</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
                {tokyoStayAreaSourceRegistry.slice(0, 5).map((source) => (
                  <li key={source.sourceId}>· {source.label}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Continue planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Where to stay in Tokyo for first-time visitors"
              locale={locale}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Where to stay in Tokyo →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Tokyo hotel area with luggage"
              locale={locale}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Luggage-friendly Tokyo base →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/local-hotel-picks#hotel-examples-matrix"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Local hotel examples"
              locale={locale}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              See local hotel examples →
            </TrackedInternalLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Luggage; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#106b43]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{body}</p>
    </div>
  );
}
