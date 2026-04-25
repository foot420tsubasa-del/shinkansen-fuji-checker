"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DecisionCard } from "@/components/travel/DecisionCard";
import { PlannerPreview } from "@/components/travel/PlannerPreview";
import { SeatCheckerPanel } from "@/components/travel/SeatCheckerPanel";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import { TripPicks } from "@/components/travel/TripPicks";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { BrandMark } from "@/components/ui/BrandMark";
import { LanguageSelector } from "./components/LanguageSelector";
import {
  type DirectionId,
  type FujiVisibility,
  getSeatRecommendation,
} from "@/lib/seat-checker";
import { homeDecisionModules, starterTripPicks } from "@/lib/trip-picks";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

export default function HomeClient() {
  const t = useTranslations("home");
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visError, setVisError] = useState(false);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        setVisLoading(true);
        setVisError(false);
        const res = await fetch("/api/fuji-visibility");
        if (!res.ok) throw new Error("Failed to fetch visibility");
        const json = await res.json();
        setVisData({
          visibility: json.visibility,
          cloudPercent: json.cloudPercent,
          message: json.message,
        });
      } catch (e) {
        console.error("fuji-visibility fetch error:", e);
        setVisError(true);
      } finally {
        setVisLoading(false);
      }
    };
    fetchVisibility();
  }, []);

  const recommendation = useMemo(() => getSeatRecommendation(direction), [direction]);
  const currentDirectionLabel =
    direction === "tokyo-osaka" ? t("dirToOsaka") : t("dirToTokyo");

  const handleDirectionChange = (nextDirection: DirectionId) => {
    setDirection(nextDirection);
    setHasChecked(false);
  };

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <div className="border-b border-slate-700/60 bg-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.28)]">
        <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white md:text-base">
                fujiseat
              </p>
              <p className="hidden text-xs leading-5 text-slate-500 sm:block">
                {t("nav.hub")}
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-200 lg:flex">
            <a
              href="#seat-checker"
              className="rounded-full border border-sky-400/50 bg-sky-400/15 px-3.5 py-2 text-sky-100 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-400/25"
            >
              {t("nav.seat")}
            </a>
            <Link
              href="/planner"
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 shadow-sm transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {t("nav.planner")}
            </Link>
            <Link
              href="/guide"
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 shadow-sm transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {t("nav.guide")}
            </Link>
            <a
              href="#next-decisions"
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 shadow-sm transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {t("nav.decisions")}
            </a>
            <Link
              href="/questions"
              className="rounded-full border border-amber-300/50 bg-amber-300/15 px-3.5 py-2 text-amber-100 shadow-sm transition-colors hover:border-amber-200 hover:bg-amber-300/25"
            >
              {t("nav.questions")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/questions"
              className="hidden rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-100 transition-colors hover:border-amber-200 hover:bg-amber-300/25 sm:inline-flex lg:hidden"
            >
              {t("nav.questions")}
            </Link>
            <LanguageSelector />
          </div>
        </Container>
        <Container className="pb-3 lg:hidden">
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-xs font-semibold text-slate-200 [scrollbar-width:none]">
            <a href="#seat-checker" className="shrink-0 rounded-full border border-sky-400/50 bg-sky-400/15 px-3 py-2 text-sky-100">
              {t("nav.seat")}
            </a>
            <Link href="/planner" className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              {t("nav.planner")}
            </Link>
            <Link href="/guide" className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              {t("nav.guide")}
            </Link>
            <a href="#next-decisions" className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              {t("nav.decisions")}
            </a>
            <Link href="/questions" className="shrink-0 rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-2 text-amber-100">
              {t("nav.questions")}
            </Link>
          </nav>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)]">
              <div id="seat-checker" className="grid gap-3">
                <SeatCheckerPanel
                  direction={direction}
                  onDirectionChange={handleDirectionChange}
                  onCheck={() => setHasChecked(true)}
                  visibility={visData}
                  visibilityLoading={visLoading}
                  visibilityError={visError}
                />
                <SeatMapCard
                  recommendation={recommendation}
                  directionLabel={currentDirectionLabel}
                  highlighted={hasChecked}
                  sourceUrl={JR_CENTRAL_SOURCE_URL}
                  sourceLabel={t("brandSource")}
                  disclaimer={t("brandDisclaimer")}
                />
              </div>

            <div id="planner" className="grid gap-3">
                <PlannerPreview />
                <TripPicks picks={starterTripPicks.map(p => ({
                  ...p,
                  title: t(`tripPicks.${p.id}.title`),
                  description: t(`tripPicks.${p.id}.desc`),
                  cta: t(`tripPicks.${p.id}.cta`),
                }))} />
            </div>
          </div>
        </section>

        <section id="next-decisions" className="mt-12 space-y-5 md:mt-16">
              <SectionHeader
                eyebrow={t("decisions.eyebrow")}
                title={t("decisions.title")}
                description={t("decisions.desc")}
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {homeDecisionModules.map((module, index) => (
                  <DecisionCard
                    key={module.id}
                    label={t(`decisions.${module.id}.label`)}
                    title={t(`decisions.${module.id}.title`)}
                    description={t(`decisions.${module.id}.desc`)}
                    tradeoff={t(`decisions.${module.id}.tradeoff`)}
                    href={module.href}
                    cta={t(`decisions.${module.id}.cta`)}
                    external={module.external}
                    accent={index === 0 ? "sky" : index === 1 ? "amber" : index === 2 ? "indigo" : "emerald"}
                  />
                ))}
              </div>
        </section>

        <section className="mt-12 rounded-[32px] border border-slate-200 bg-[#07142f] px-5 py-5 text-white shadow-[0_24px_70px_rgba(7,20,47,0.22)] md:px-7">
          <div>
            <div>
              <p className="text-sm font-semibold">{t("brandBuiltBy")}</p>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-300">{t("footerDisclaimer")}</p>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center">
          <p className="text-center text-[9px] text-slate-400">{t("footerBuiltBy")}</p>
          <SiteLegalLinks className="mt-3 text-slate-400" />
        </footer>
      </Container>
    </main>
  );
}
