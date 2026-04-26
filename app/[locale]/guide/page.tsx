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
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { AFFILIATE_REL } from "@/lib/link-rel";

const baseFaqSchemaItems = [
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
];

const extraFaqSchemaItems = [
  {
    "@type": "Question",
    name: "Which side of the bullet train for Mt. Fuji?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Bullet train is the English name for the Shinkansen. Tokyo to Kyoto or Osaka means Mt. Fuji on the right, Seat E. Kyoto or Osaka to Tokyo means Mt. Fuji on the left, also Seat E.",
    },
  },
  {
    "@type": "Question",
    name: "When can I see Mt. Fuji on the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "The Mt. Fuji viewing window is between Shin-Yokohama and Shizuoka stations, peaking around Shin-Fuji. Total time visible is about 30 to 60 seconds. Late morning to early afternoon, on a clear day, generally gives the best chance.",
    },
  },
  {
    "@type": "Question",
    name: "Can you see Mt. Fuji from the Nozomi Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes. Although the Nozomi does not stop at Shin-Fuji, you can still see Mt. Fuji clearly from the right-side window, Seat E, when traveling Tokyo to Kyoto or Osaka. The viewing time is just slightly shorter than on Hikari or Kodama.",
    },
  },
  {
    "@type": "Question",
    name: "What is the best time of day to see Mt. Fuji from the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Late morning to early afternoon usually offers the clearest view. Mornings before 10 AM can be even better in summer because heat haze has not built up yet. Late afternoon often has sun glare on the Mt. Fuji side.",
    },
  },
  {
    "@type": "Question",
    name: "Which seat letter is the Mt. Fuji window in a Green Car?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "In Green Cars, which use a 2+2 layout in cars 8 to 10 on most Tokaido Shinkansen trains, Seat D is the Mt. Fuji window seat. The same left/right rule applies: right side going to Kyoto, left side going to Tokyo.",
    },
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...baseFaqSchemaItems, ...extraFaqSchemaItems],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mt. Fuji Shinkansen Seat Guide",
  description: "Which side and seat letter to choose for seeing Mt. Fuji from the Tokaido Shinkansen, plus timing, route, JR Pass context, and booking steps.",
  author: {
    "@type": "Person",
    name: "fujiseat (Tokyo-based Japanese creator)",
  },
  datePublished: "2026-04-01",
  dateModified: "2026-04-27",
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to book Seat E for the Mt. Fuji view",
  step: [
    {
      "@type": "HowToStep",
      name: "Choose direction",
      text: "Choose whether you are traveling from Tokyo to Kyoto or Osaka, or from Kyoto or Osaka back to Tokyo.",
    },
    {
      "@type": "HowToStep",
      name: "Pick column E on the seat map",
      text: "In standard 3+2 Tokaido Shinkansen cars, pick Seat E for the Mt. Fuji window view.",
    },
    {
      "@type": "HowToStep",
      name: "Confirm before payment",
      text: "Before payment or ticket pickup, confirm that your reserved seat letter is E for standard cars, or D for Green Cars.",
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
    title: locale === "en" ? "Mt. Fuji Shinkansen Seat Guide — Side, Seat & Timing" : t("guideTitle"),
    description:
      locale === "en"
        ? "Which Shinkansen side for Mt. Fuji, why Seat E matters, when and where to look. Free guide from a Tokyo local, updated for 2026."
        : t("guideDesc"),
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
  const extraFaqItems = [
    {
      q: "Which side of the bullet train for Mt. Fuji?",
      a: "Bullet train is the English name for the Shinkansen. Tokyo → Kyoto/Osaka means Mt. Fuji on the right (Seat E). Kyoto/Osaka → Tokyo means Mt. Fuji on the left (also Seat E).",
    },
    {
      q: "When can I see Mt. Fuji on the Shinkansen?",
      a: "The Mt. Fuji viewing window is between Shin-Yokohama and Shizuoka stations, peaking around Shin-Fuji. Total time visible is about 30 to 60 seconds. Late morning to early afternoon, on a clear day, generally gives the best chance.",
    },
    {
      q: "Can you see Mt. Fuji from the Nozomi Shinkansen?",
      a: "Yes — although the Nozomi does not stop at Shin-Fuji, you can still see Mt. Fuji clearly from the right-side window (Seat E) when traveling Tokyo to Kyoto/Osaka. The viewing time is just slightly shorter than on Hikari or Kodama.",
    },
    {
      q: "What is the best time of day to see Mt. Fuji from the Shinkansen?",
      a: "Late morning to early afternoon usually offers the clearest view. Mornings before 10 AM can be even better in summer because heat haze has not built up yet. Late afternoon often has sun glare on the Mt. Fuji side.",
    },
    {
      q: "Which seat letter is the Mt. Fuji window in a Green Car?",
      a: "In Green Cars (2+2 layout, cars 8-10 on most Tokaido Shinkansen), Seat D is the Mt. Fuji window seat. The same left/right rule applies — right side going to Kyoto, left side going to Tokyo.",
    },
  ];

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
            rel={AFFILIATE_REL}
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
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="howto-seat-e-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
          <p className="mb-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
            <strong>Quick answer:</strong> For Tokyo to Kyoto or Osaka, sit on the right side of the Shinkansen in Seat E. For Kyoto or Osaka back to Tokyo, sit on the left side, also Seat E. Mt. Fuji appears around Shin-Fuji station for about 30 to 60 seconds.
          </p>
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
              href="#tldr"
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Read full guide ↓
            </a>
            <a
              href={KLOOK_URL}
              target="_blank"
              rel={AFFILIATE_REL}
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
        <section id="tldr" className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            TL;DR — which side and which seat for Mt. Fuji
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
          <a href="#tldr" className="underline underline-offset-2 hover:text-slate-800 transition-colors">TL;DR</a>
          {" · "}
          <a href="#which-side" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Which side?</a>
          {" · "}
          <a href="#seat-letters" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Seat letters</a>
          {" · "}
          <a href="#when-to-see" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Best time</a>
          {" · "}
          <a href="#route-zone" className="underline underline-offset-2 hover:text-slate-800 transition-colors">Viewing zone</a>
          {" · "}
          <a href="#jr-pass" className="underline underline-offset-2 hover:text-slate-800 transition-colors">JR Pass</a>
          {" · "}
          <a href="#faq" className="underline underline-offset-2 hover:text-slate-800 transition-colors">FAQ</a>
        </div>

        <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
          <section id="which-side" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Which side of the Shinkansen is Mt. Fuji on?
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> Going from Tokyo to Kyoto or Osaka, Mt. Fuji is on the <strong>right side</strong> of the Shinkansen — specifically Seat E in standard cars. Going from Kyoto or Osaka back to Tokyo, it is on the <strong>left side</strong> — also Seat E. The view appears around Shin-Fuji station and lasts about 30 to 60 seconds.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Tokyo → Kyoto / Osaka: right side</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s1Bullet1Bold")}</span>{" "}
                {t("s1Bullet1")}
              </li>
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Kyoto / Osaka → Tokyo: left side</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s1Bullet2Bold")}</span>{" "}
                {t("s1Bullet2")}
              </li>
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">What side for Tokyo to Osaka, Tokyo to Kyoto, and back</h3>
            <p className="mt-2 text-[12px] text-slate-600">{t("s1Note")}</p>
          </section>

          <section id="seat-letters" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Shinkansen seat letters explained (A, B, C, D, E)
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> Standard Tokaido Shinkansen cars have a 3+2 seat layout with letters A, B, C on one side and D, E on the other. <strong>Seat E is the Mt. Fuji window seat</strong> in standard cars. Green Cars use a 2+2 layout where Seat D is the Mt. Fuji window. Seat A is always the opposite sea side.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Seat E is the Mt. Fuji window seat in standard 3+2 cars</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carStandard.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Seat D is the Mt. Fuji window in Green Cars (2+2 layout)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carGreen.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Seat A is the opposite side (sea side)</h3>
            <p className="text-[12px] text-slate-600">Seat A is useful if you want the sea-side window, but it is not the Mt. Fuji-side window on the Tokaido Shinkansen.</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Why Seat E matters more than right side alone</h3>
            <p className="text-[12px] text-slate-600">When booking online, you usually choose a seat letter rather than only a side of the train. Seat E is the practical instruction most travelers need.</p>
          </section>

          <section id="when-to-see" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              When to see Mt. Fuji from the Shinkansen
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> Late morning to early afternoon usually gives the clearest view of Mt. Fuji on a typical day. <strong>Winter (December–February)</strong> is the best season for a snow-capped silhouette and clear skies. Mt. Fuji is generally not visible at night because the mountain is unlit.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Best time of day — late morning to early afternoon</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {timeItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Best season — winter for snow-cap, autumn for clear skies</h3>
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
              {seasons.map((s, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-white">
                  <span className={`shrink-0 font-semibold ${seasonColors[i] ?? "text-slate-500"}`}>{s.stars}</span>
                  <div>
                    <span className="font-semibold text-slate-800">{s.season}:</span>{" "}
                    <span className={`font-semibold ${seasonColors[i] ?? "text-slate-500"}`}>{s.rating}</span> — {s.note}
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Can you see Mt. Fuji at night from the Shinkansen?</h3>
            <p className="text-[12px] text-slate-600">Usually no. Mt. Fuji is not lit at night, so even from the correct side it is normally too dark to see.</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Live visibility check before you board</h3>
            <p className="text-[12px] text-slate-600">
              Before booking or boarding, <Link href="/#seat-checker" className="font-semibold text-sky-700 underline underline-offset-2">check today&apos;s live visibility</Link> with the free seat checker.
            </p>
          </section>

          <section id="route-zone" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-600" />
              Where on the route does Mt. Fuji appear?
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> Mt. Fuji becomes visible from the Tokaido Shinkansen between <strong>Shin-Yokohama and Shizuoka stations</strong>, with the clearest view around <strong>Shin-Fuji station</strong>. Total visibility window is about 30 to 60 seconds at full Shinkansen speed, so have your camera ready before reaching Shin-Fuji.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Around Shin-Fuji station — the prime viewing zone</h3>
            <p>{t("s2P1")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">How long is Mt. Fuji visible from the train? (about 30-60 seconds)</h3>
            <p className="text-[12px] text-slate-600">{t("s3Bullet3")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Tokaido Shinkansen route map — Shin-Yokohama to Shizuoka</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-semibold">{t("s2Bullet1Bold")}</span> {t("s2Bullet1")}</li>
              <li><span className="font-semibold">{t("s2Bullet3Bold")}</span> {t("s2Bullet3")}</li>
            </ul>
          </section>

          <section id="nozomi-hikari-kodama" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Nozomi vs Hikari vs Kodama — which Shinkansen for Mt. Fuji?
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> All three Tokaido Shinkansen services pass Mt. Fuji, and the seat to pick (Seat E) is the same regardless. <strong>Hikari and Kodama</strong> stop at Shin-Fuji station, which can give a slightly longer viewing window. <strong>Nozomi</strong> is fastest but does not stop at Shin-Fuji.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Nozomi: fastest, but no Shin-Fuji stop</h3>
            <p className="text-[12px] text-slate-600">Nozomi trains still pass the Fuji viewing zone, but they do not stop at Shin-Fuji.</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Hikari and Kodama: stop at Shin-Fuji, slightly better viewing</h3>
            <p className="text-[12px] text-slate-600">{t("jrNozomiNote")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Does the train type change which seat to pick? (no — Seat E either way)</h3>
            <p className="text-[12px] text-slate-600">The left/right rule and Seat E recommendation do not change between Nozomi, Hikari, and Kodama standard cars.</p>
          </section>

          <section id="jr-pass" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              JR Pass vs single ticket — which is cheaper for Tokyo-Kyoto?
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> For a simple Tokyo–Kyoto round trip, <strong>single tickets are cheaper</strong> (about ¥29,000 round trip vs ¥50,000 for a 7-day JR Pass). The Pass starts paying off only when you add Hiroshima, do 2+ long-distance rides, or take multiple Shinkansen segments in one week.
            </p>
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
            <p className="mt-3 text-[12px] text-slate-600">
              To see how this fits into a trip plan, <Link href="/itineraries/7-day-first-time-japan" className="font-semibold text-sky-700 underline underline-offset-2">see how this fits into a 7-day route</Link>.
            </p>
          </section>

          <section id="book-seat-e" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              How to book Seat E — step by step
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>Quick answer:</strong> At a JR ticket office, show 「<strong>E席をお願いします</strong>」 (Please give me Seat E). On Klook, choose your route then select column E from the seat map. With a JR Pass, walk into any JR Reservation Counter — seat reservations are free.
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">At a JR ticket office (Japanese phrase included)</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carRequest.slice(0, 1).map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Booking via Klook (English UI)</h3>
            <p className="text-[12px] text-slate-600">Choose the Tokaido Shinkansen route, then select column E on the seat map when the option is available.</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">Reserving with a JR Pass</h3>
            <p className="text-[12px] text-slate-600">With a JR Pass, reserve your seat at a JR Reservation Counter before boarding. For an early Shinkansen day, it can help to <Link href="/areas-to-stay/tokyo-first-time" className="font-semibold text-sky-700 underline underline-offset-2">stay near Tokyo Station for an early Shinkansen day</Link>.</p>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          <section id="common-mistakes" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {t("s4H2")}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-semibold">{t("s4Bullet1Bold")}</span> {t("s4Bullet1")}</li>
              <li><span className="font-semibold">{t("s4Bullet2Bold")}</span> {t("s4Bullet2")}</li>
              <li><span className="font-semibold">{t("s4Bullet3Bold")}</span> {t("s4Bullet3")}</li>
            </ul>
            <p className="mt-3 text-[12px] text-slate-600">
              The same planning logic applies when you land: <Link href="/airport-transfers/narita-to-shinjuku" className="font-semibold text-sky-700 underline underline-offset-2">do not make the same mistake on arrival day</Link> by choosing the wrong airport transfer for your luggage and arrival time.
            </p>
          </section>

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
              <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed">{t("priorityTip")}</p>
            </div>
          </section>

          {renderTravelEssentials()}

          {/* Section D: FAQ */}
          <section id="faq" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Info className="h-4 w-4 text-sky-600" />
              {t("faqH2")}
            </h2>
            <div className="space-y-3">
              {[...faqItems, ...extraFaqItems].map((item, i) => (
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

          <footer className="border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400">
            <p>fujiseat.com — Japan travel utility hub</p>
            <p className="mt-1">Partner links shown where they match the planning step.</p>
            <LastCheckedNote className="mt-3" />
            <SiteLegalLinks className="mt-3 text-slate-400" />
          </footer>

        </div>
      </div>
    </main>
  );
}
