"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { type ProviderId } from "@/components/ui/ProviderButton";
import { HotelAreaProviderRow } from "@/components/affiliate/HotelAreaProviderRow";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import {
  trackCtaClick,
  trackFinderResultsView,
  trackFinderShowMoreClick,
  trackFinderStart,
  trackFinderStepAnswered,
} from "@/lib/analytics";
import type { AffiliatePlacement } from "@/lib/affiliate/links";

type FinderProviderLink = {
  provider: ProviderId;
  href: string;
  trackingHref: string;
  linkId: string;
  subId?: string;
  priority: number;
  placement: AffiliatePlacement;
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
  detailHotel?: {
    areaName: string;
    city: string;
    providers: FinderProviderLink[];
  } | null;
  /** §4-2 upper layer: data-driven one-liners for the instant answer. */
  instant: {
    shinkansen: string;
    luggage: string;
    narita: string;
    haneda: string;
  };
  /** §4-2 lower layer (accordion): per-area practical notes where authored. */
  practical: {
    exitNote: string | null;
    elevatorNote: string | null;
  };
  /** §4-2 revenue block: named hotels with movement-logic reasons. */
  namedHotels: Array<{
    name: string;
    href: string;
    linkId: string;
    reason: string;
  }>;
};

type FinderOption = {
  id: string;
  label: string;
  description?: string;
};

type FinderStep = {
  id: "shinkansen" | "luggage" | "airport" | "evenings";
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
  viewHotelPageLabel: string;
  showMore: string;
  compareAll: string;
  moreTitle: string;
  allTitle: string;
  allBody: string;
  matchLabel: string;
  noAnswers: string;
  hotelAreaMatches: string;
  hideRanks: string;
  showRanks: string;
  hideFullComparison: string;
  compareAllAreas: string;
  rankPrefix: string;
  hotelBaseFit: string;
  selectedArea: string;
  scoreSuffix: string;
  watchOut: string;
  stationRouteNoteTitle: string;
  /**
   * Title for the per-result hotel-provider block. Uses {area} placeholder,
   * substituted with the area's display name (e.g. "Compare hotels around Ueno").
   * Sourced from the existing translated `tokyoStayAreaIndex.hotelSearch.headingAround`.
   */
  compareHotelsTitle: string;
  /**
   * Note shown under the hotel-provider block. Sourced from the existing
   * translated `tokyoStayAreaIndex.hotelSearch.note`.
   */
  compareHotelsNote: string;
  scoreLabels: {
    stationSimplicity: string;
    luggageFriendly: string;
    airportAccess: string;
    shinkansenAccess: string;
    hotelChoice: string;
  };
  rankLabels: {
    topPick: string;
    strongMatch: string;
    goodMatch: string;
    areaOption: string;
  };
  badges: string[];
  steps: FinderStep[];
  /** "Open {area} hotel page" — legacy label, kept for compatibility. */
  openHotelPageLabel: string;
  /** §4-2 result card: instant-answer headline "Stay near {area}". */
  stayNear: string;
  practicalTitle: string;
  practicalExit: string;
  practicalElevator: string;
  practicalRush: string;
  practicalPhrase: string;
  phraseText: string;
  rushText: string;
  namedHotelsTitle: string;
  namedHotelsNote: string;
  klookLabel: string;
  seeDetailsLabel: string;
  helperTapHint: string;
};

type TokyoHotelAreaFinderProps = {
  areas: FinderArea[];
  locale: string;
  pagePath: string;
  copy: FinderCopy;
};

type Answers = Record<FinderStep["id"], string[]>;

const emptyAnswers: Answers = {
  shinkansen: [],
  luggage: [],
  airport: [],
  evenings: [],
};

// v2: the 4-question quiz (spec §4-1) replaced the old 5-step wizard, so
// persisted v1 answers are intentionally invalidated by the new key.
const FINDER_STORAGE_KEY = "fujiseat:tokyoHotelAreaFinder:v2";
const finderStepIds: FinderStep["id"][] = ["shinkansen", "luggage", "airport", "evenings"];

type PersistedFinderState = {
  started: boolean;
  stepIndex: number;
  answers: Answers;
  showResults: boolean;
  showMore: boolean;
  showAll: boolean;
};

function sanitizeAnswers(value: unknown): Answers | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<Record<FinderStep["id"], unknown>>;
  const next = { ...emptyAnswers };

  for (const stepId of finderStepIds) {
    const answer = source[stepId];
    if (!Array.isArray(answer) || !answer.every((item) => typeof item === "string")) {
      return null;
    }
    next[stepId] = answer;
  }

  return next;
}

function readPersistedFinderState(): PersistedFinderState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(FINDER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedFinderState>;
    const answers = sanitizeAnswers(parsed.answers);
    if (!answers) return null;

    return {
      started: parsed.started === true,
      stepIndex: typeof parsed.stepIndex === "number" ? Math.max(0, Math.min(finderStepIds.length - 1, parsed.stepIndex)) : 0,
      answers,
      showResults: parsed.showResults === true,
      showMore: parsed.showMore === true,
      showAll: parsed.showAll === true,
    };
  } catch {
    return null;
  }
}

function writePersistedFinderState(state: PersistedFinderState) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(FINDER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Session storage is best-effort; the finder still works with in-memory state.
  }
}

function clearPersistedFinderState() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(FINDER_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function isEmptyAnswerSet(answers: Answers) {
  return finderStepIds.every((stepId) => answers[stepId].length === 0);
}

function matchLabelForRank(rank: number, copy: FinderCopy) {
  if (rank === 1) return copy.rankLabels.topPick;
  if (rank === 2) return copy.rankLabels.strongMatch;
  if (rank === 3) return copy.rankLabels.goodMatch;
  return copy.rankLabels.areaOption;
}

function addBoost(boosts: Map<string, number>, areaId: string, delta: number) {
  boosts.set(areaId, (boosts.get(areaId) ?? 0) + delta);
}

/**
 * §4-1 scoring: the 4 quiz answers re-rank the existing 36-area scores.
 * The boost lists reuse the same editorial area logic the old wizard used
 * (airport + luggage lists unchanged; evenings maps to the old
 * nightlife/quiet lists; shinkansen maps to the old kyoto-osaka list with
 * an extra weight for pre-8am departures).
 */
function boostFromAnswers(answers: Answers) {
  const boosts = new Map<string, number>();

  const shinkansen = answers.shinkansen[0];
  if (shinkansen === "before8am") {
    // A pre-8am departure is the hardest constraint in the quiz — zero-transfer
    // shinkansen access has to outweigh softer preferences like "quiet".
    ["tokyo-station", "ginza-yurakucho", "shinagawa", "nihombashi", "shimbashi", "hatchobori"].forEach((id, index) => addBoost(boosts, id, 44 - index * 3));
  }
  if (shinkansen === "daytime") {
    ["tokyo-station", "shinagawa", "ginza-yurakucho", "nihombashi", "shimbashi"].forEach((id, index) => addBoost(boosts, id, 10 - index));
  }

  const luggage = answers.luggage[0];
  if (luggage === "large") {
    ["oshiage", "kuramae", "ningyocho", "hatchobori", "shinagawa", "hamamatsucho-daimon", "tokyo-station"].forEach((id, index) => addBoost(boosts, id, 12 - index));
  }

  const airport = answers.airport[0];
  if (airport === "narita") {
    ["oshiage", "ueno", "asakusa", "kuramae", "nippori", "asakusabashi"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }
  if (airport === "haneda") {
    ["shinagawa", "hamamatsucho-daimon", "shimbashi", "tokyo-station", "ginza-yurakucho", "oshiage"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }

  const evenings = answers.evenings[0];
  if (evenings === "nightlife") {
    ["shinjuku", "shibuya", "ginza-yurakucho", "ueno", "roppongi", "ebisu"].forEach((id, index) => addBoost(boosts, id, 16 - index * 2));
  }
  if (evenings === "quiet") {
    ["kuramae", "kiyosumi-shirakawa", "monzen-nakacho", "ryogoku", "oshiage", "ningyocho", "yoyogi"].forEach((id, index) => addBoost(boosts, id, 16 - index));
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const restoredStorageRef = useRef(false);
  const currentStep = copy.steps[stepIndex];
  const ranked = useMemo(() => rankAreas(areas, answers), [areas, answers]);
  const topThree = ranked.slice(0, 3);
  const moreMatches = ranked.slice(3, 10);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      // §4-3: the compact 2-question embeds hand Q1/Q2 over via query params
      // (q_shinkansen / q_luggage) — prefill them and resume at Q3. The
      // handoff wins over any persisted session state.
      const params = new URLSearchParams(window.location.search);
      const qShinkansen = params.get("q_shinkansen");
      const qLuggage = params.get("q_luggage");
      const shinkansenStep = copy.steps.find((step) => step.id === "shinkansen");
      const luggageStep = copy.steps.find((step) => step.id === "luggage");
      const validShinkansen = shinkansenStep?.options.some((option) => option.id === qShinkansen);
      const validLuggage = luggageStep?.options.some((option) => option.id === qLuggage);
      if (qShinkansen && qLuggage && validShinkansen && validLuggage) {
        setStarted(true);
        setAnswers({ ...emptyAnswers, shinkansen: [qShinkansen], luggage: [qLuggage] });
        setStepIndex(Math.min(2, copy.steps.length - 1));
        restoredStorageRef.current = true;
        trackFinderStart({ page_path: pagePath, locale });
        return;
      }
      const persisted = readPersistedFinderState();
      if (persisted) {
        setStarted(persisted.started);
        setStepIndex(persisted.stepIndex);
        setAnswers(persisted.answers);
        setShowResults(persisted.showResults);
        setShowMore(persisted.showMore);
        setShowAll(persisted.showAll);
      }
      restoredStorageRef.current = true;
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!restoredStorageRef.current) return;

    if (!started && stepIndex === 0 && !showResults && !showMore && !showAll && isEmptyAnswerSet(answers)) {
      clearPersistedFinderState();
      return;
    }

    writePersistedFinderState({
      started,
      stepIndex,
      answers,
      showResults,
      showMore,
      showAll,
    });
  }, [answers, showAll, showMore, showResults, started, stepIndex]);

  const start = () => {
    setStarted(true);
    trackCtaClick({
      placement: "finder_start_click",
      href: "#finder",
      label: copy.startLabel,
      category: "stay",
      page_path: pagePath,
      locale,
      cta_type: "stay",
    });
    trackFinderStart({ page_path: pagePath, locale });
  };

  // §4-1: tap-only quiz — selecting an option answers the question and
  // auto-advances (or finishes on the last question). Ranking for the
  // results-view event is computed from the tapped answers, not stale state.
  const answerAndAdvance = (option: FinderOption) => {
    const step = currentStep;
    const nextAnswers = toggleAnswer(answers, step, option.id);
    setAnswers(nextAnswers);
    trackFinderStepAnswered({
      step_id: step.id,
      step_label: step.title,
      answer_ids: option.id,
      answer_count: 1,
      page_path: pagePath,
      locale,
    });
    window.setTimeout(() => {
      if (stepIndex < copy.steps.length - 1) {
        setStepIndex(stepIndex + 1);
        return;
      }
      setShowResults(true);
      const top = rankAreas(areas, nextAnswers)[0];
      if (top) {
        trackFinderResultsView({
          page_path: pagePath,
          locale,
          result_count: Math.min(3, areas.length),
          top_area_id: top.id,
          top_area_score: top.matchScore,
        });
      }
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }, 160);
  };

  const reset = () => {
    clearPersistedFinderState();
    setStarted(false);
    setStepIndex(0);
    setAnswers(emptyAnswers);
    setShowResults(false);
    setShowMore(false);
    setShowAll(false);
  };

  return (
    <section id="finder" className="mt-6 rounded-[28px] border border-emerald-100 bg-[#fffdf8] p-5 shadow-sm md:p-7">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                  onClick={() => answerAndAdvance(option)}
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
            {showResults ? null : (
              <p className="inline-flex min-h-11 w-full items-center justify-center text-xs font-semibold text-slate-500">
                {copy.helperTapHint}
              </p>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{copy.hotelAreaMatches}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{copy.topTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy.topBody}</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {topThree.map((area, index) => (
              <ResultCard
                key={area.id}
                area={area}
                rank={index + 1}
                copy={copy}
                locale={locale}
                pagePath={pagePath}
                answers={answers}
              />
            ))}
          </div>

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
              {showMore ? copy.hideRanks : copy.showRanks}
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
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#2E7D5B] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#246449]"
            >
              {showAll ? copy.hideFullComparison : copy.compareAllAreas}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {showMore ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-950">{copy.moreTitle}</h3>
              <div className="mt-3 grid gap-3">
                {moreMatches.map((area, index) => (
                  <CompactAreaRow key={area.id} area={area} rank={index + 4} copy={copy} locale={locale} />
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
                  <CompactAreaRow key={area.id} area={area} rank={index + 1} copy={copy} locale={locale} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

// Klook shinkansen-ticket sub-CTA (§4-2 revenue block item 3). Resolved once
// from the existing admin-managed affiliate registry — no new URLs.
const klookTicketUrl = getAffUrl("shinkansenTicket");

function ResultCard({
  area,
  rank,
  copy,
  locale,
  pagePath,
  answers,
}: {
  area: FinderArea & { matchScore: number };
  rank: number;
  copy: FinderCopy;
  locale: string;
  pagePath: string;
  answers: Answers;
}) {
  const matchLabel = matchLabelForRank(rank, copy);
  const hotel = area.hotel;
  const compareTitle = copy.compareHotelsTitle.replace("{area}", area.displayName);
  const seeDetailsLabel = copy.seeDetailsLabel.replace("{area}", area.displayName);
  // §4-2 upper layer: pick up to 3 answer-relevant one-liners.
  const airportAnswer = answers.airport[0];
  const instantBullets = [
    answers.shinkansen[0] !== "none" ? area.instant.shinkansen : null,
    answers.luggage[0] === "large" ? area.instant.luggage : null,
    airportAnswer === "narita" ? area.instant.narita : airportAnswer === "haneda" ? area.instant.haneda : null,
  ].filter((line): line is string => Boolean(line && line.trim()));
  if (instantBullets.length === 0) instantBullets.push(...area.bestFor.slice(0, 2));
  // Surface Booking.com + Trip.com only — Agoda is intentionally not restored.
  // The providers list is already filtered upstream in page.tsx, but we double-
  // gate here so any future provider can't leak into this slot without review.
  const compareProviders = hotel
    ? hotel.providers.filter(
        (provider) =>
          provider.provider === "booking_travelpayouts" || provider.provider === "trip",
      )
    : [];
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className="min-h-[118px] border-b border-sky-100 bg-[#eaf6ff] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#106b43]">{copy.rankPrefix} #{rank}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">{area.displayName}</h3>
            <p className="mt-1 text-xs font-medium text-slate-600">{area.japaneseName} · {area.areaGroup}</p>
          </div>
          <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
            {matchLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {/* §4-2 upper layer: 3-second instant answer. */}
        <div>
          <p className="text-base font-bold text-slate-950">✅ {copy.stayNear.replace("{area}", area.displayName)}</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-700">
            {instantBullets.map((line) => (
              <li key={line} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3">
          <p className="text-xs font-semibold text-slate-950">{copy.watchOut}</p>
          <p className="mt-1 text-xs leading-5 text-slate-700">{area.watchOut.slice(0, 2).join(" · ")}</p>
        </div>

        {/* §4-2 revenue block — always visible without scrolling inside the
            card: 1) area deep links (main CTA, Booking + Trip measured
            separately via provider dimension), 2) named hotels with
            movement-logic reasons, 3) Klook ticket sub-CTA. */}
        <div className="mt-4 space-y-3">
          {compareProviders.length > 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-sm font-bold text-slate-950">{compareTitle}</p>
              <HotelAreaProviderRow
                providers={compareProviders.map((provider) => ({
                  provider: provider.provider,
                  href: provider.href,
                  trackingHref: provider.trackingHref,
                  label: provider.provider === "trip" ? "Trip.com" : "Booking.com",
                  linkId: provider.linkId,
                  subId: provider.subId,
                  placement: provider.placement,
                }))}
                placement={compareProviders[0].placement}
                pagePath={pagePath}
                locale={locale}
                area={{ displayName: hotel?.areaName ?? area.displayName, areaId: area.id }}
                city={hotel?.city ?? "Tokyo"}
                keyPrefix={`finder-${rank}`}
                rank={rank}
                className="mt-2.5"
              />
              <p className="mt-2 text-[11px] leading-4 text-slate-500">{copy.compareHotelsNote}</p>
            </div>
          ) : null}

          {area.namedHotels.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-950">{copy.namedHotelsTitle}</p>
              <ul className="mt-2 space-y-2">
                {area.namedHotels.slice(0, 3).map((hotelPick) => (
                  <li key={hotelPick.linkId}>
                    <TrackedAffiliateLink
                      href={hotelPick.href}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      category="hotel"
                      provider="trip"
                      placement="finder_result_named_hotel"
                      label={hotelPick.name}
                      linkId={hotelPick.linkId}
                      product="hotel_named"
                      pagePath={pagePath}
                      locale={locale}
                      area={area.displayName}
                      city="Tokyo"
                      hotelName={hotelPick.name}
                      className="group block rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:border-sky-200 hover:bg-sky-50"
                    >
                      <span className="block text-xs font-bold text-[#082653] group-hover:text-sky-800">{hotelPick.name} →</span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-600">{hotelPick.reason}</span>
                    </TrackedAffiliateLink>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">{copy.namedHotelsNote}</p>
            </div>
          ) : null}

          {klookTicketUrl ? (
            <TrackedAffiliateLink
              href={klookTicketUrl}
              target="_blank"
              rel={AFFILIATE_REL}
              category="train"
              provider="klook"
              placement="finder_result_klook"
              label={copy.klookLabel}
              linkId="shinkansenTicket"
              product="shinkansen_ticket"
              pagePath={pagePath}
              locale={locale}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#246449] transition-colors hover:bg-emerald-50"
            >
              {copy.klookLabel} →
            </TrackedAffiliateLink>
          ) : null}
        </div>

        {/* §4-2 lower layer: accordion with the practical, walkable detail. */}
        <details className="group mt-3 rounded-2xl border border-slate-200 bg-slate-50/70">
          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
            {copy.practicalTitle}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-2.5 px-3 pb-3 text-[11px] leading-5 text-slate-700">
            {area.practical.exitNote ? (
              <div>
                <p className="font-bold text-slate-900">🚪 {copy.practicalExit}</p>
                <p className="mt-0.5">{area.practical.exitNote}</p>
              </div>
            ) : null}
            {area.practical.elevatorNote ? (
              <div>
                <p className="font-bold text-slate-900">🛗 {copy.practicalElevator}</p>
                <p className="mt-0.5">{area.practical.elevatorNote}</p>
              </div>
            ) : null}
            <div>
              <p className="font-bold text-slate-900">⏰ {copy.practicalRush}</p>
              <p className="mt-0.5">{copy.rushText}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">💬 {copy.practicalPhrase}</p>
              <p className="mt-0.5">{copy.phraseText}</p>
            </div>
          </div>
        </details>

        <div className="mt-auto pt-3">
          <TrackedInternalLink
            href={`?area=${area.id}#selected-area`}
            sourcePage="tokyo_stay_area_index"
            placement="finder_result_hotel_page"
            label={seeDetailsLabel}
            locale={locale}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {seeDetailsLabel}
          </TrackedInternalLink>
        </div>
      </div>
    </article>
  );
}

function CompactAreaRow({
  area,
  rank,
  copy,
  locale,
}: {
  area: FinderArea & { matchScore: number };
  rank: number;
  copy: FinderCopy;
  locale: string;
}) {
  const seeDetailsLabel = copy.seeDetailsLabel.replace("{area}", area.displayName);
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#106b43]">#{rank}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{area.displayName}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{area.stationNames.slice(0, 3).join(" / ")}</p>
        </div>
        <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
          {matchLabelForRank(rank, copy)}
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
        <span>{copy.hotelBaseFit}</span>
        <span>{area.displayScore}{copy.scoreSuffix}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.summary}</p>
      <div className="mt-3">
        <TrackedInternalLink
          href={`?area=${area.id}#selected-area`}
          sourcePage="tokyo_stay_area_index"
          placement="finder_result_hotel_page"
          label={seeDetailsLabel}
          locale={locale}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#0b214a] bg-[#0b214a] px-4 py-2 text-sm font-bold text-[#facc15] shadow-sm transition-colors hover:border-[#071733] hover:bg-[#071733] hover:text-[#fde047] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] focus-visible:ring-offset-2"
        >
          {seeDetailsLabel}
        </TrackedInternalLink>
      </div>
    </div>
  );
}
