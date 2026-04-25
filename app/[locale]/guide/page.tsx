import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Train, Info, ArrowLeft, Wifi, ShieldCheck, Car, ExternalLink, AlertTriangle } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { KlookCTA } from "../components/KlookCTA";
import { LanguageSelector } from "../components/LanguageSelector";
import { getAlternates } from "@/i18n/hreflang";
import { KLOOK_URL, ESIM_URL, AIRPORT_TRANSFER_URL, INSURANCE_URL, CAR_RENTAL_URL } from "@/src/affiliateLinks";
import { GuideNextSteps } from "@/components/travel/GuideNextSteps";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { BrandMark } from "@/components/ui/BrandMark";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I see Mt. Fuji from a non-reserved car?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, but risky — you may end up in an aisle seat with no view. Reserve Seat E in advance.",
      },
    },
    {
      "@type": "Question",
      name: "How long can I see Mt. Fuji from the train?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only about 30–60 seconds at Shinkansen speed. Have your camera ready before reaching Shin-Fuji station.",
      },
    },
    {
      "@type": "Question",
      name: "Is Seat E always the Mt. Fuji side?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In standard 3+2 cars, yes. In Green Cars (2+2 layout), the Mt. Fuji window seat is Seat D.",
      },
    },
    {
      "@type": "Question",
      name: "What if it's cloudy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mt. Fuji is often hidden, especially in summer. Check the live visibility indicator at the top of fujiseat.com.",
      },
    },
    {
      "@type": "Question",
      name: "Can I see Mt. Fuji on the return trip from Osaka/Kyoto to Tokyo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — Mt. Fuji is on the LEFT side, which is again Seat E. Use the checker and select the opposite direction.",
      },
    },
    {
      "@type": "Question",
      name: "Does the Nozomi stop near Mt. Fuji?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, but you can still see it through the window as the train passes. Hikari and Kodama stop at Shin-Fuji station.",
      },
    },
    {
      "@type": "Question",
      name: "Is the JR Pass worth it for Tokyo to Osaka only?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generally no. Round trip is approximately ¥29,000 vs 7-day Pass ¥50,000. The Pass makes sense if also visiting Hiroshima, Nara, etc.",
      },
    },
    {
      "@type": "Question",
      name: "Can I bring large luggage on the Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bags with total dimensions over 160cm and up to 250cm require a seat reservation with an oversized baggage area (予約が必要). Reserve this when booking your Shinkansen seat. Bags over 250cm are not permitted.",
      },
    },
    {
      "@type": "Question",
      name: "Is there WiFi on the Shinkansen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Onboard WiFi exists but can be unreliable. A Japan eSIM is recommended for consistent connectivity throughout your trip.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best way to book Shinkansen tickets as a foreigner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Klook — fully in English, instant mobile voucher, and you can select Seat E on the seat map.",
      },
    },
  ],
};

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
  const h = await getTranslations({ locale, namespace: "home" });

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

  const essentialLinks = [
    {
      url: KLOOK_URL,
      icon: <Train className="h-4 w-4 text-red-500" />,
      title: h("jrPassTitle"),
      desc: h("jrPassDesc"),
      accent: "from-red-50 to-red-100 border-red-100 group-hover:from-red-100 group-hover:to-red-200",
      featured: true,
    },
    {
      url: ESIM_URL,
      icon: <Wifi className="h-4 w-4 text-emerald-500" />,
      title: h("esimTitle"),
      desc: h("esimDesc"),
      accent: "from-emerald-50 to-emerald-100 border-emerald-100 group-hover:from-emerald-100 group-hover:to-emerald-200",
    },
    {
      url: AIRPORT_TRANSFER_URL,
      icon: <Train className="h-4 w-4 text-sky-500" />,
      title: h("nexTitle"),
      desc: h("nexDesc"),
      accent: "from-sky-50 to-sky-100 border-sky-100 group-hover:from-sky-100 group-hover:to-sky-200",
    },
    {
      url: INSURANCE_URL,
      icon: <ShieldCheck className="h-4 w-4 text-amber-500" />,
      title: h("insuranceTitle"),
      desc: h("insuranceDesc"),
      accent: "from-amber-50 to-amber-100 border-amber-100 group-hover:from-amber-100 group-hover:to-amber-200",
    },
    {
      url: CAR_RENTAL_URL,
      icon: <Car className="h-4 w-4 text-violet-500" />,
      title: h("carTitle"),
      desc: h("carDesc"),
      accent: "from-violet-50 to-violet-100 border-violet-100 group-hover:from-violet-100 group-hover:to-violet-200",
    },
  ];

  const renderTravelEssentials = () => (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm md:shadow">
      <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-[13px] md:text-[15px] font-semibold text-slate-900">
          {h("essentialsTitle")}
        </h2>
        <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
          {h("essentialsNote")}
        </p>
      </div>
      <div className="p-2.5 md:p-3.5 grid gap-2 md:grid-cols-2 md:gap-2.5">
        {essentialLinks.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "flex items-center gap-3 rounded-xl border px-3.5 py-3 md:px-4 md:py-3.5",
              "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-sm",
              "transition-all duration-150 group",
              link.featured ? "md:col-span-2" : "",
            ].join(" ")}
          >
            <div
              className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${link.accent} border flex items-center justify-center`}
            >
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] md:text-[13px] font-semibold text-slate-800">
                {link.title}
              </p>
              <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {link.desc}
              </p>
            </div>
            <ExternalLink className="shrink-0 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-300 group-hover:text-red-500 transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 flex flex-col">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
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
            <Link
              href="/planner"
              className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-[12px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
            >
              {t("commandCenterBtn")} →
            </Link>
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

        <div className="mb-6">
          <GuideNextSteps />
        </div>

        {/* Jump to section */}
        <div className="mb-5 text-[12px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">Jump to: </span>
          <a href="#which-seat" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Which seat?</a>
          {" · "}
          <a href="#best-time" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Best time?</a>
          {" · "}
          <a href="#jr-pass" className="underline underline-offset-2 hover:text-slate-800 transition-colors">JR Pass vs ticket?</a>
          {" · "}
          <a href="#etiquette" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Train etiquette</a>
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

          {renderTravelEssentials()}

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

          {/* Contextual planner callout after mistakes */}
          <Link
            href="/planner"
            className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2.5 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
          >
            <span className="shrink-0 text-base">✅</span>
            <span className="flex-1 text-[12px] text-indigo-800 leading-snug">
              {t("commandCenterBtn")} — {h("commandCenterDesc")}
            </span>
            <ExternalLink className="shrink-0 h-3 w-3 text-indigo-400 group-hover:text-indigo-600" />
          </Link>

          {/* Section: Priority Seats */}
          <section id="etiquette" className="rounded-2xl border border-amber-200/80 bg-amber-50/30 px-4 py-4 md:px-6 md:py-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm md:text-[15px] font-semibold text-slate-900 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("priorityH2")}
            </h2>
            <div className="space-y-3 text-[13px] md:text-sm leading-relaxed text-slate-700">
              <p>{t("priorityP1")}</p>
              <p>{t("priorityP2")}</p>
              <p>{t("priorityP3")}</p>
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/80 border border-amber-200/60 px-3.5 py-3 md:px-4">
              <Info className="shrink-0 h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed">
                {t("priorityTip")}
              </p>
            </div>
          </section>

          {/* Contextual: eSIM after etiquette (translation apps) */}
          <a
            href={ESIM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5 hover:bg-sky-50 hover:border-sky-200 transition-all group"
          >
            <span className="shrink-0 text-base">📶</span>
            <span className="flex-1 text-[12px] text-sky-800 leading-snug">
              {h("esimTitle")} — {h("esimDesc")}
            </span>
            <ExternalLink className="shrink-0 h-3 w-3 text-sky-400 group-hover:text-sky-600" />
          </a>

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

          <section className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-sky-50/40 px-4 py-4 md:px-6 md:py-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2">
              <Mountain className="h-4 w-4 text-indigo-600" />
              {t("commandCenterH2")}
            </h2>
            <p className="text-[13px] leading-relaxed text-slate-700">
              {t("commandCenterP")}
            </p>
            <div className="mt-3">
              <Link
                href="/planner"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:brightness-110 active:brightness-95 transition-all"
              >
                <Mountain className="h-3.5 w-3.5" />
                {t("commandCenterBtn")}
              </Link>
            </div>
          </section>

          {renderTravelEssentials()}

          <footer className="border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400">
            <p>fujiseat.com — Japan travel utility hub</p>
            <p className="mt-1">Partner links shown where they match the planning step.</p>
            <SiteLegalLinks className="mt-3 text-slate-400" />
          </footer>

        </div>
      </div>
    </main>
  );
}
