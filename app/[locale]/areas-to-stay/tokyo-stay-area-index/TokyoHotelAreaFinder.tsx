"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import {
  trackFinderAreaDetailsClick,
  trackFinderResultsView,
  trackFinderShowMoreClick,
  trackFinderStart,
  trackFinderStepAnswered,
} from "@/lib/analytics";

type FinderProviderLink = {
  provider: ProviderId;
  href: string;
  trackingHref: string;
  linkId: string;
  subId?: string;
  priority: number;
};

export type FinderArea = {
  id: string;
  displayName: string;
  japaneseName: string;
  areaGroup: string;
  stationNames: string[];
  displayScore: number;
  rawScore: number;
  detailHref: string;
  summary: string;
  stationRouteNote?: string | null;
  bestFor: string[];
  watchOut: string[];
  tags: string[];
  scores: {
    stationSimplicity: number;
    luggageFriendly: number;
    airportAccess: number;
    shinkansenAccess: number;
    touristAccess: number;
    localFeel: number;
    crowdStress: number;
    lodgingChoice: number;
  };
  hotel?: {
    areaName: string;
    city: string;
    providers: FinderProviderLink[];
  } | null;
};

type FinderOption = {
  id: string;
  label: string;
  description?: string;
};

type FinderStep = {
  id: "destinations" | "airport" | "luggage" | "stay" | "shinkansen";
  title: string;
  helper: string;
  multi: boolean;
  options: FinderOption[];
};

type FinderCopy = {
  startLabel: string;
  restartLabel: string;
  nextLabel: string;
  backLabel: string;
  showResultsLabel: string;
  selectedLabel: string;
  stepLabel: string;
  topTitle: string;
  topBody: string;
  whyFits: string;
  bestFor: string;
  hotelsIntro: string;
  hotelsButton: string;
  detailsButton: string;
  noHotelLinks: string;
  showMore: string;
  compareAll: string;
  moreTitle: string;
  allTitle: string;
  allBody: string;
  matchLabel: string;
  noAnswers: string;
  badges: string[];
  steps: FinderStep[];
};

type TokyoHotelAreaFinderProps = {
  areas: FinderArea[];
  locale: string;
  pagePath: string;
  copy: FinderCopy;
};

type Answers = Record<FinderStep["id"], string[]>;

const emptyAnswers: Answers = {
  destinations: [],
  airport: [],
  luggage: [],
  stay: [],
  shinkansen: [],
};

function matchLabelForRank(rank: number) {
  if (rank === 1) return "Top pick";
  if (rank === 2) return "Strong match";
  if (rank === 3) return "Good match";
  return "Area option";
}

const destinationBoosts: Record<string, Record<string, number>> = {
  "shibuya-harajuku": { shibuya: 18, shinjuku: 8, yoyogi: 6, ebisu: 5, "aoyama-omotesando": 5 },
  shinjuku: { shinjuku: 18, yoyogi: 9, "aoyama-omotesando": 4 },
  asakusa: { asakusa: 18, kuramae: 14, oshiage: 10, asakusabashi: 8, ueno: 6 },
  ueno: { ueno: 18, akihabara: 9, asakusa: 6, nippori: 10 },
  "ginza-tsukiji": { "ginza-yurakucho": 18, "tokyo-station": 12, nihombashi: 10, hatchobori: 8, shimbashi: 8 },
  akihabara: { akihabara: 18, kanda: 10, ueno: 8, asakusabashi: 8, "ochanomizu": 7 },
  "tokyo-station-palace": { "tokyo-station": 18, nihombashi: 12, "ginza-yurakucho": 10, kanda: 8 },
  "toyosu-odaiba": { toyosu: 18, "ariake-odaiba": 15, shimbashi: 8, "ginza-yurakucho": 6 },
  disney: { "tokyo-station": 11, hatchobori: 10, kayabacho: 8, "ginza-yurakucho": 8 },
  fuji: { shinjuku: 12, "tokyo-station": 10, shibuya: 8, shinagawa: 8 },
  "kamakura-yokohama": { shinagawa: 15, shibuya: 9, "tokyo-station": 8, shimbashi: 7 },
  "kyoto-osaka": { "tokyo-station": 18, shinagawa: 16, "ginza-yurakucho": 11, nihombashi: 10 },
};

function addBoost(boosts: Map<string, number>, areaId: string, delta: number) {
  boosts.set(areaId, (boosts.get(areaId) ?? 0) + delta);
}

function boostFromAnswers(answers: Answers) {
  const boosts = new Map<string, number>();

  answers.destinations.forEach((id) => {
    Object.entries(destinationBoosts[id] ?? {}).forEach(([areaId, delta]) => addBoost(boosts, areaId, delta));
  });

  const airport = answers.airport[0];
  if (airport === "narita") {
    ["oshiage", "ueno", "asakusa", "kuramae", "nippori", "asakusabashi"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }
  if (airport === "haneda") {
    ["shinagawa", "hamamatsucho-daimon", "shimbashi", "tokyo-station", "ginza-yurakucho", "oshiage"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }

  const luggage = answers.luggage[0];
  if (luggage === "large") {
    ["oshiage", "kuramae", "ningyocho", "hatchobori", "shinagawa", "hamamatsucho-daimon"].forEach((id, index) => addBoost(boosts, id, 12 - index));
  }
  if (luggage === "family") {
    ["oshiage", "kuramae", "ryogoku", "ueno", "shinagawa", "tokyo-station"].forEach((id, index) => addBoost(boosts, id, 14 - index));
  }

  const stay = answers.stay[0];
  if (stay === "first-time") {
    ["ueno", "asakusa", "oshiage", "shinjuku", "tokyo-station", "ginza-yurakucho"].forEach((id, index) => addBoost(boosts, id, 12 - index));
  }
  if (stay === "quiet-local") {
    ["kuramae", "kiyosumi-shirakawa", "monzen-nakacho", "ryogoku", "oshiage", "ningyocho"].forEach((id, index) => addBoost(boosts, id, 16 - index));
  }
  if (stay === "nightlife-shopping") {
    ["shinjuku", "shibuya", "ginza-yurakucho", "ueno", "roppongi"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }
  if (stay === "easy-transfers") {
    ["tokyo-station", "shinagawa", "ueno", "nihombashi", "ginza-yurakucho"].forEach((id, index) => addBoost(boosts, id, 14 - index));
  }
  if (stay === "budget-friendly") {
    ["ueno", "asakusa", "ryogoku", "oshiage", "kuramae", "akihabara"].forEach((id, index) => addBoost(boosts, id, 14 - index));
  }

  const shinkansen = answers.shinkansen[0];
  if (shinkansen === "kyoto-osaka") {
    ["tokyo-station", "shinagawa", "ginza-yurakucho", "nihombashi", "shimbashi"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }
  if (shinkansen === "fuji-hakone") {
    ["shinjuku", "shinagawa", "tokyo-station", "shibuya"].forEach((id, index) => addBoost(boosts, id, 12 - index * 2));
  }

  return boosts;
}

function rankAreas(areas: FinderArea[], answers: Answers) {
  const boosts = boostFromAnswers(answers);
  return areas
    .map((area) => {
      const scoreBoost =
        area.scores.airportAccess * 0.03 +
        area.scores.luggageFriendly * 0.03 +
        area.scores.stationSimplicity * 0.02 +
        area.scores.shinkansenAccess * 0.015 +
        area.scores.localFeel * 0.015;
      const matchScore = Math.round(area.displayScore + (boosts.get(area.id) ?? 0) + scoreBoost);
      return { ...area, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.displayScore - a.displayScore || b.rawScore - a.rawScore);
}

function toggleAnswer(answers: Answers, step: FinderStep, optionId: string): Answers {
  const current = answers[step.id] ?? [];
  const next = step.multi
    ? current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
    : [optionId];
  return { ...answers, [step.id]: next };
}

function answerLabels(step: FinderStep, answerIds: string[]) {
  return answerIds
    .map((id) => step.options.find((option) => option.id === id)?.label ?? id)
    .join(", ");
}

export function TokyoHotelAreaFinder({ areas, locale, pagePath, copy }: TokyoHotelAreaFinderProps) {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [showResults, setShowResults] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const selectedDetailRef = useRef<HTMLDivElement>(null);
  const currentStep = copy.steps[stepIndex];
  const ranked = useMemo(() => rankAreas(areas, answers), [areas, answers]);
  const topThree = ranked.slice(0, 3);
  const moreMatches = ranked.slice(3, 10);
  const selectedRank = selectedAreaId ? ranked.findIndex((area) => area.id === selectedAreaId) + 1 : 0;
  const selectedArea = selectedAreaId ? ranked.find((area) => area.id === selectedAreaId) ?? null : null;

  const start = () => {
    setStarted(true);
    trackFinderStart({ page_path: pagePath, locale });
  };

  const trackCurrentStep = () => {
    const answerIds = answers[currentStep.id] ?? [];
    trackFinderStepAnswered({
      step_id: currentStep.id,
      step_label: currentStep.title,
      answer_ids: answerIds.join(","),
      answer_count: answerIds.length,
      page_path: pagePath,
      locale,
    });
  };

  const next = () => {
    trackCurrentStep();
    setStepIndex((index) => Math.min(copy.steps.length - 1, index + 1));
  };

  const showMyResults = () => {
    trackCurrentStep();
    setShowResults(true);
    setSelectedAreaId(null);
    const top = topThree[0];
    if (top) {
      trackFinderResultsView({
        page_path: pagePath,
        locale,
        result_count: topThree.length,
        top_area_id: top.id,
        top_area_score: top.matchScore,
      });
    }
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const reset = () => {
    setStarted(false);
    setStepIndex(0);
    setAnswers(emptyAnswers);
    setShowResults(false);
    setShowMore(false);
    setShowAll(false);
    setSelectedAreaId(null);
  };

  const openAreaDetails = (area: FinderArea & { matchScore: number }, rank: number) => {
    setSelectedAreaId(area.id);
    trackFinderAreaDetailsClick({
      area_id: area.id,
      area_name: area.displayName,
      rank,
      page_path: pagePath,
      locale,
    });
    window.history.pushState(null, "", area.detailHref);
    window.setTimeout(() => selectedDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <section id="finder" className="mt-6 rounded-[28px] border border-emerald-100 bg-[#fffdf8] p-5 shadow-sm md:p-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {copy.badges.map((badge) => (
          <div key={badge} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-sm font-semibold text-slate-800 shadow-sm">
            <Check className="h-4 w-4 text-[#106b43]" aria-hidden="true" />
            {badge}
          </div>
        ))}
      </div>

      {!started ? (
        <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,#eef6fb,#fff_55%,#f0fbf6)] p-5 md:p-7">
          <p className="text-sm leading-6 text-slate-700">{copy.noAnswers}</p>
          <button
            type="button"
            onClick={start}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#106b43] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b5736] sm:w-auto"
          >
            {copy.startLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#106b43]">
              {copy.stepLabel} {stepIndex + 1}/{copy.steps.length}
            </p>
            <button type="button" onClick={reset} className="text-xs font-semibold text-slate-500 underline underline-offset-4">
              {copy.restartLabel}
            </button>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{currentStep.title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{currentStep.helper}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {currentStep.options.map((option) => {
              const selected = answers[currentStep.id]?.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((current) => toggleAnswer(current, currentStep, option.id))}
                  className={[
                    "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                    selected
                      ? "border-[#106b43] bg-[#106b43] text-white shadow-sm"
                      : "border-emerald-100 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  <span className="block">{option.label}</span>
                  {option.description ? (
                    <span className={["mt-1 block text-xs leading-5", selected ? "text-white/80" : "text-slate-500"].join(" ")}>
                      {option.description}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {copy.backLabel}
              </button>
            ) : null}
            {stepIndex < copy.steps.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#106b43] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b5736]"
              >
                {copy.nextLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={showMyResults}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#106b43] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b5736]"
              >
                {copy.showResultsLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {started ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {copy.steps.map((step) => {
            const selected = answers[step.id] ?? [];
            if (selected.length === 0) return null;
            return (
              <span key={step.id} className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-[11px] font-semibold text-[#106b43] shadow-sm">
                {copy.selectedLabel}: {answerLabels(step, selected)}
              </span>
            );
          })}
        </div>
      ) : null}

      {showResults ? (
        <div ref={resultsRef} className="mt-8 scroll-mt-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Hotel area matches</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{copy.topTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy.topBody}</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {topThree.map((area, index) => (
              <ResultCard key={area.id} area={area} rank={index + 1} copy={copy} locale={locale} pagePath={pagePath} onOpenDetails={openAreaDetails} />
            ))}
          </div>

          {selectedArea ? (
            <FinderSelectedAreaPanel
              ref={selectedDetailRef}
              area={selectedArea}
              rank={selectedRank}
              copy={copy}
              locale={locale}
              pagePath={pagePath}
            />
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                const nextShowMore = !showMore;
                setShowMore(nextShowMore);
                if (nextShowMore) setShowAll(false);
                trackFinderShowMoreClick({
                  action_type: "show_more_matches",
                  visible_count: nextShowMore ? 10 : 3,
                  page_path: pagePath,
                  locale,
                });
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-white px-5 py-2.5 text-sm font-semibold text-[#106b43] transition-colors hover:bg-emerald-50"
            >
              {showMore ? "Hide ranks 4-10" : "Show ranks 4-10"}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                const nextShowAll = !showAll;
                setShowAll(nextShowAll);
                if (nextShowAll) setShowMore(false);
                trackFinderShowMoreClick({
                  action_type: "compare_all_areas",
                  visible_count: nextShowAll ? ranked.length : 3,
                  page_path: pagePath,
                  locale,
                });
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#168a56] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {showAll ? "Hide full comparison" : "Compare all 36 areas"}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {showMore ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-950">{copy.moreTitle}</h3>
              <div className="mt-3 grid gap-3">
                {moreMatches.map((area, index) => (
                  <CompactAreaRow key={area.id} area={area} rank={index + 4} copy={copy} onOpenDetails={openAreaDetails} />
                ))}
              </div>
            </div>
          ) : null}

          {showAll ? (
            <div id="all-area-comparison" className="mt-6 scroll-mt-24">
              <h3 className="text-lg font-semibold text-slate-950">{copy.allTitle}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{copy.allBody}</p>
              <div className="mt-3 grid gap-3">
                {ranked.map((area, index) => (
                  <CompactAreaRow key={area.id} area={area} rank={index + 1} copy={copy} onOpenDetails={openAreaDetails} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ResultCard({
  area,
  rank,
  copy,
  locale,
  pagePath,
  onOpenDetails,
}: {
  area: FinderArea & { matchScore: number };
  rank: number;
  copy: FinderCopy;
  locale: string;
  pagePath: string;
  onOpenDetails: (area: FinderArea & { matchScore: number }, rank: number) => void;
}) {
  const matchLabel = matchLabelForRank(rank);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className="min-h-[118px] border-b border-emerald-200 bg-[linear-gradient(135deg,#d9f3e6,#eef8ff_55%,#d8ecff)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#106b43]">Rank #{rank}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">{area.displayName}</h3>
            <p className="mt-1 text-xs font-medium text-slate-600">{area.japaneseName} · {area.areaGroup}</p>
          </div>
          <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
            {matchLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="lg:h-[214px] lg:overflow-hidden">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Hotel-base fit</span>
            <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-black text-white">{area.displayScore}/100</span>
          </div>
          <p className="overflow-hidden text-sm font-medium leading-6 text-slate-800 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{area.summary}</p>
          <div className="mt-3 flex max-h-[58px] flex-wrap gap-1.5 overflow-hidden">
            {area.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#106b43]">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
          <p className="text-xs font-semibold text-slate-950">{copy.whyFits}</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{area.bestFor.slice(0, 2).join(" · ") || area.summary}</p>
        </div>
        <HotelButtons area={area} rank={rank} copy={copy} locale={locale} pagePath={pagePath} />
        <a
          href={area.detailHref}
          onClick={(event) => {
            event.preventDefault();
            onOpenDetails(area, rank);
          }}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-slate-50 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          {copy.detailsButton}
        </a>
      </div>
    </article>
  );
}

function HotelButtons({
  area,
  rank,
  copy,
  locale,
  pagePath,
}: {
  area: FinderArea;
  rank: number;
  copy: FinderCopy;
  locale: string;
  pagePath: string;
}) {
  if (!area.hotel?.providers.length) {
    return <p className="mt-4 text-xs leading-5 text-slate-500">{copy.noHotelLinks}</p>;
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-950">{copy.hotelsIntro}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {area.hotel.providers.map((provider) => (
          <ProviderButton
            key={provider.linkId}
            provider={provider.provider}
            href={provider.href}
            trackingHref={provider.trackingHref}
            placement="stay_area_hotel_card"
            pagePath={pagePath}
            locale={locale}
            linkId={provider.linkId}
            product="hotel"
            area={area.hotel?.areaName}
            areaId={area.id}
            city={area.hotel?.city}
            subId={provider.subId}
            rank={rank}
            fullWidth
            className="min-h-10 rounded-xl text-xs"
          >
            {provider.provider === "booking_travelpayouts" ? "Booking.com" : provider.provider === "trip" ? "Trip.com" : "Agoda"}
          </ProviderButton>
        ))}
      </div>
    </div>
  );
}

const FinderSelectedAreaPanel = forwardRef<
  HTMLDivElement,
  {
    area: FinderArea & { matchScore: number };
    rank: number;
    copy: FinderCopy;
    locale: string;
    pagePath: string;
  }
>(function FinderSelectedAreaPanel({ area, rank, copy, locale, pagePath }, ref) {
  return (
    <div
      ref={ref}
      id="selected-area"
      className="mt-6 scroll-mt-24 rounded-[24px] border border-sky-100 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] md:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#106b43]">Selected area</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">{area.displayName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {area.japaneseName} · {area.areaGroup}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-white shadow-sm">
          <p className="text-2xl font-black leading-none">{area.displayScore}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em]">/100</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{area.summary}</p>

      <div className="mt-5 grid gap-2">
        <ClientScoreBar label="Station simplicity" value={area.scores.stationSimplicity} />
        <ClientScoreBar label="Luggage-friendly" value={area.scores.luggageFriendly} />
        <ClientScoreBar label="Airport access" value={area.scores.airportAccess} />
        <ClientScoreBar label="Shinkansen access" value={area.scores.shinkansenAccess} />
        <ClientScoreBar label="Hotel choice" value={area.scores.lodgingChoice} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-950">{copy.bestFor}</h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.bestFor.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-950">Watch out</h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.watchOut.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {area.stationRouteNote ? (
        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <h4 className="text-sm font-semibold text-slate-950">Station & hotel-route note</h4>
          <p className="mt-2 text-sm leading-6 text-slate-700">{area.stationRouteNote}</p>
        </div>
      ) : null}

      <HotelButtons area={area} rank={rank} copy={copy} locale={locale} pagePath={pagePath} />
    </div>
  );
});

function ClientScoreBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span>{normalized}/100</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-[#168a56]" style={{ width: `${normalized}%` }} />
      </div>
    </div>
  );
}

function CompactAreaRow({
  area,
  rank,
  copy,
  onOpenDetails,
}: {
  area: FinderArea & { matchScore: number };
  rank: number;
  copy: FinderCopy;
  onOpenDetails: (area: FinderArea & { matchScore: number }, rank: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#106b43]">#{rank}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{area.displayName}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{area.stationNames.slice(0, 3).join(" / ")}</p>
        </div>
        <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
          {matchLabelForRank(rank)}
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
        <span>Hotel-base fit</span>
        <span>{area.displayScore}/100</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.summary}</p>
      <div className="mt-3">
        <a
          href={area.detailHref}
          onClick={(event) => {
            event.preventDefault();
            onOpenDetails(area, rank);
          }}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          {copy.detailsButton}
        </a>
      </div>
    </div>
  );
}
