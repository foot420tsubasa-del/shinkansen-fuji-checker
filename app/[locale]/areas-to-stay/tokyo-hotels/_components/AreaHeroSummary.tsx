import { HotelAreaProviderRow } from "@/components/affiliate/HotelAreaProviderRow";
import type { AreaProviderLink, AreaScoreView } from "./types";
import { fitHeadlineLabel } from "./types";

/**
 * Hero block for an Area Hotel Page. Two-column on desktop (md+):
 *   left  → eyebrow / H1 / intro / Booking + Trip CTAs
 *   right → flat score summary card (Hotel-base fit number + qualitative badge)
 *
 * On mobile the score card stacks below the CTAs. No gradients. The score card
 * uses a white background + emerald accent border to match the rest of the
 * page surface palette.
 */
export function AreaHeroSummary({
  eyebrow,
  title,
  intro,
  trustNote,
  fitBadgeLabel,
  fitBadgeOutOf,
  fitHeadlineLabels,
  fitScoreNote,
  score,
  pagePath,
  locale,
  area,
  city,
  providers,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  trustNote: string;
  fitBadgeLabel: string;
  fitBadgeOutOf: string;
  fitHeadlineLabels: Record<
    "topPick" | "strongFit" | "goodFit" | "mixedFit" | "checkCarefully",
    string
  >;
  fitScoreNote: string;
  score: AreaScoreView;
  pagePath: string;
  locale: string;
  area: { displayName: string; areaId: string };
  city: string;
  providers: AreaProviderLink[];
}) {
  const headlineKey = fitHeadlineLabel(score.overallScore);
  const headlineLabel = fitHeadlineLabels[headlineKey];
  const headlineTone =
    headlineKey === "topPick" || headlineKey === "strongFit"
      ? "border-emerald-200 bg-emerald-50 text-[#106b43]"
      : headlineKey === "goodFit"
        ? "border-emerald-100 bg-emerald-50/60 text-[#106b43]"
        : headlineKey === "mixedFit"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <section className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-8">
        {/* Left column: identity + CTAs */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{intro}</p>

          <HotelAreaProviderRow
            providers={providers}
            placement="tokyo_hotels_hero"
            pagePath={pagePath}
            locale={locale}
            area={area}
            city={city}
            keyPrefix="hero"
            className="mt-6"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">{trustNote}</p>
        </div>

        {/* Right column: score summary card */}
        <aside className="self-start rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm md:max-w-[280px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#106b43]">
            {fitBadgeLabel}
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-5xl font-black leading-none tabular-nums text-slate-950">
              {score.overallScore}
            </span>
            <span className="text-base font-bold text-slate-500">{fitBadgeOutOf}</span>
          </div>
          <span
            className={[
              "mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.06em]",
              headlineTone,
            ].join(" ")}
          >
            {headlineLabel}
          </span>
          <p className="mt-3 text-xs leading-5 text-slate-600">{fitScoreNote}</p>
          <p className="mt-3 text-[11px] leading-4 text-slate-500">
            {score.confidenceLabel} · {score.sourceFreshnessLabel}
          </p>
        </aside>
      </div>
    </section>
  );
}
