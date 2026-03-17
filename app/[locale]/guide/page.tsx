import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Train, Info, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { KlookCTA } from "../components/KlookCTA";
import { LanguageSelector } from "../components/LanguageSelector";
import { getAlternates } from "@/i18n/hreflang";

const KLOOK_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165791&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F1420-7-day-whole-japan-rail-pass-jr-pass%2F";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("guideTitle"),
    description: t("guideDesc"),
    alternates: getAlternates("/guide", locale),
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });

  const tldrItems = t.raw("tldr") as Array<{ bold: string; text: string }>;
  const seasons = t.raw("seasons") as Array<{
    season: string;
    stars: string;
    rating: string;
    note: string;
  }>;
  const timeItems = t.raw("timeItems") as Array<{
    bold: string;
    text: string;
  }>;
  const carStandard = t.raw("carStandard") as string[];
  const carGreen = t.raw("carGreen") as string[];
  const carRequest = t.raw("carRequest") as Array<{
    bold: string;
    text: string;
  }>;
  const jrSingle = t.raw("jrSingle") as string[];
  const jrPassItems = t.raw("jrPassItems") as string[];
  const faqItems = t.raw("faq") as Array<{ q: string; a: string }>;

  const seasonColors = [
    "text-emerald-700",
    "text-sky-700",
    "text-amber-700",
    "text-slate-500",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-sm">
              <Mountain className="h-6 w-6 text-white" />
              <div className="pointer-events-none absolute bottom-1.5 h-2 w-4 bg-white/95 rounded-t-[999px] rounded-b-[6px]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight leading-snug">
                Mt. Fuji Shinkansen Seat Guide
              </h1>
              <p className="text-xs text-slate-500">{t("subtitle")}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {t("writtenBy")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("backToChecker")}</span>
            </Link>
          </div>
        </header>

        {/* Intro */}
        <section className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("introH2")}
          </h2>
          <p>{t("introP1")}</p>
          <p className="mt-2 text-[12px] text-slate-600">{t("introP2")}</p>
        </section>

        {/* Quick navigation */}
        <section className="mb-5 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2.5">
            Quick navigation
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-sky-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:brightness-110 transition-all"
            >
              Check my seat now →
            </Link>
            <a
              href="#basics"
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Read full guide ↓
            </a>
            <a
              href={KLOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Book on Klook →
            </a>
          </div>
        </section>

        {/* TL;DR */}
        <section id="basics" className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("tldrH2")}
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            {tldrItems.map((item, i) => (
              <li key={i}>
                <span className="font-semibold">{item.bold}</span> {item.text}
              </li>
            ))}
          </ul>
        </section>

        {/* Jump to section */}
        <div className="mb-5 text-[12px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Jump to: </span>
          <a href="#which-seat" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Which seat?</a>
          {" · "}
          <a href="#best-time" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Best time?</a>
          {" · "}
          <a href="#jr-pass" className="underline underline-offset-2 hover:text-slate-800 transition-colors">JR Pass vs ticket?</a>
          {" · "}
          <a href="#faq" className="underline underline-offset-2 hover:text-slate-800 transition-colors">FAQ</a>
        </div>

        <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
          {/* Section 1: Which side? */}
          <section id="which-seat" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {t("s1H2")}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s1Bullet1Bold")}</span>{" "}
                {t("s1Bullet1")}
              </li>
              <li>
                <span className="font-semibold">{t("s1Bullet2Bold")}</span>{" "}
                {t("s1Bullet2")}
              </li>
            </ul>
            <p className="mt-2 text-[12px] text-slate-600">{t("s1Note")}</p>
          </section>

          {/* Section 2: Best section & timing */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {t("s2H2")}
            </h2>
            <p>{t("s2P1")}</p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s2Bullet1Bold")}</span>{" "}
                {t("s2Bullet1")}
              </li>
              <li>
                <span className="font-semibold">{t("s2Bullet2Bold")}</span>{" "}
                {t("s2Bullet2")}
              </li>
              <li>
                <span className="font-semibold">{t("s2Bullet3Bold")}</span>{" "}
                {t("s2Bullet3")}
              </li>
            </ul>
          </section>

          {/* Section 3: Practical tips */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {t("s3H2")}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s3Bullet1Bold")}</span>{" "}
                {t("s3Bullet1")}
              </li>
              <li>
                <span className="font-semibold">{t("s3Bullet2Bold")}</span>{" "}
                {t("s3Bullet2")}
              </li>
              <li>
                <span className="font-semibold">{t("s3Bullet3Bold")}</span>{" "}
                {t("s3Bullet3")}
              </li>
              <li>
                <span className="font-semibold">{t("s3Bullet4Bold")}</span>{" "}
                {t("s3Bullet4")}
              </li>
            </ul>
          </section>

          <KlookCTA />

          {/* Section 4: Common mistakes */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {t("s4H2")}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s4Bullet1Bold")}</span>{" "}
                {t("s4Bullet1")}
              </li>
              <li>
                <span className="font-semibold">{t("s4Bullet2Bold")}</span>{" "}
                {t("s4Bullet2")}
              </li>
              <li>
                <span className="font-semibold">{t("s4Bullet3Bold")}</span>{" "}
                {t("s4Bullet3")}
              </li>
            </ul>
          </section>

          {/* Section A: JR Pass vs Single Ticket */}
          <section id="jr-pass" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {t("jrH2")}
            </h2>
            <p className="mb-2">{t("jrSingleLabel")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {jrSingle.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-2.5 mb-2">{t("jrPassLabel")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {jrPassItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 text-[12px] text-slate-600">
              <p>{t("jrPassWorth")}</p>
              <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                {t("jrNozomiNote")}
              </p>
            </div>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          {/* Section B: Best Season & Time */}
          <section id="best-time" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {t("seasonH2")}
            </h2>
            <p className="mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">
              {t("seasonLabel")}
            </p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
              {seasons.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2 bg-white"
                >
                  <span
                    className={`shrink-0 font-semibold ${seasonColors[i] ?? "text-slate-500"}`}
                  >
                    {s.stars}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">
                      {s.season}:
                    </span>{" "}
                    <span
                      className={`font-semibold ${seasonColors[i] ?? "text-slate-500"}`}
                    >
                      {s.rating}
                    </span>{" "}
                    — {s.note}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">
              {t("timeLabel")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              {timeItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-slate-600 rounded-xl bg-sky-50 border border-sky-200 px-3 py-2">
              {t("proTip")}
            </p>
          </section>

          {/* Section C: Car Number & Seat Detail */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {t("carH2")}
            </h2>
            <p className="mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">
              {t("carStandardLabel")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              {carStandard.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">
              {t("carGreenLabel")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              {carGreen.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">
              {t("carRequestLabel")}
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              {carRequest.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          {/* Section D: FAQ */}
          <section id="faq" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Info className="h-4 w-4 text-sky-600" />
              {t("faqH2")}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-slate-800 mb-1">
                    Q: {item.q}
                  </p>
                  <p className="text-[12px] text-slate-600">A: {item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <KlookCTA />
            </div>
          </section>

          {/* Section 5: Make it easy */}
          <section className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-4 shadow-sm shadow-sky-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-700" />
              {t("makeEasyH2")}
            </h2>
            <p>{t("makeEasyP1")}</p>
            <p className="mt-2 text-[12px] text-slate-600">
              {t("makeEasyP2")}
            </p>
            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
              >
                {t("openChecker")}
              </Link>
            </div>
          </section>

          <KlookCTA />

        </div>
      </div>
    </main>
  );
}
