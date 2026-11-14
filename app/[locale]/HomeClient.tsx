"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Train } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import Image from "next/image";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import { trackAffiliateClick, trackCtaClick, trackEvent, trackSeatCheckComplete } from "@/lib/analytics";
import {
  type DirectionId,
  type FujiVisibility,
  directions,
  getSeatRecommendation,
} from "@/lib/seat-checker";
import {
  JR_PASS_URL,
  OMIO_SHINKANSEN_URL,
  SHINKANSEN_TICKET_URL,
  getDirectionTicketLink,
} from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

/** Existing photographs, reused as covers for the guide cards. */
const SEAT_GUIDES: Array<{ href: string; title: string; body: string; image?: string; alt?: string }> = [
  {
    href: "/guide#seat-e",
    title: "Seat E guide",
    body: "Why Seat E, when to look, and what to do if it's taken.",
    image: "/images/Kawaguchiko.png",
    alt: "Mt. Fuji above Lake Kawaguchi at dusk",
  },
  {
    href: "/shinkansen-seat-letters",
    title: "Seat letters A–E",
    body: "What every seat letter means on the Tokaido Shinkansen.",
  },
  {
    href: "/kyoto-to-tokyo-mt-fuji-seat",
    title: "Kyoto → Tokyo seat",
    body: "Heading back to Tokyo? Mt. Fuji is on the left.",
    image: "/images/Kyoto.png",
    alt: "Yasaka Pagoda on a Kyoto lane at sunset",
  },
];

const VIS_EMOJI = { high: "☀️", medium: "🌤️", low: "☁️" } as const;

const homeHotelCopyByLocale: Record<
  string,
  {
    title: string;
    body: string;
    links: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
    imageNote: string;
  }
> = {
  en: {
    title: "Tokyo hotel base",
    body:
      "Choose your Tokyo hotel base before booking hotels. Your hotel area affects airport arrival, luggage, Shinkansen days, and how busy your nights feel.",
    links: [
      { href: "/areas-to-stay", label: "Compare Tokyo station areas", variant: "primary" },
    ],
    imageNote: "Use fujiseat to choose the broad hotel area first, then check current prices, room size, bed setup, and station distance on booking sites.",
  },
  "pt-BR": {
    title: "Escolha onde ficar antes de comparar hotéis",
    body: "Comece pela sua base em Tóquio, não pelos nomes dos hotéis. A melhor área depende de aeroporto, bagagem, dias de Shinkansen, estações grandes e noites agitadas ou mais calmas.",
    links: [
      { href: "/areas-to-stay", label: "Comparar áreas de Tóquio", variant: "primary" },
    ],
    imageNote: "Compare estações famosas, bases próximas mais calmas e áreas práticas antes de buscar hotéis.",
  },
  es: {
    title: "Elige dónde alojarte antes de comparar hoteles",
    body: "Empieza por tu base en Tokio, no por nombres de hoteles. La mejor zona depende del aeropuerto, equipaje, días de Shinkansen, estaciones grandes y noches animadas o tranquilas.",
    links: [
      { href: "/areas-to-stay", label: "Comparar zonas de Tokio", variant: "primary" },
    ],
    imageNote: "Compara estaciones famosas, bases cercanas más tranquilas y zonas logísticas antes de buscar hoteles.",
  },
  ko: {
    title: "호텔을 비교하기 전에 묵을 지역부터 고르기",
    body: "호텔 이름보다 도쿄 거점부터 정하세요. 좋은 지역은 공항 접근, 짐, 신칸센 일정, 큰 역의 복잡도, 활기찬 밤 또는 조용한 밤에 따라 달라집니다.",
    links: [
      { href: "/areas-to-stay", label: "도쿄 숙소 지역 비교하기", variant: "primary" },
    ],
    imageNote: "호텔을 찾기 전에 유명 역, 더 차분한 인근 거점, 이동에 편한 지역을 비교하세요.",
  },
  "zh-TW": {
    title: "比較飯店前，先選住宿區域",
    body: "先從東京住宿基地開始，不要先看飯店名稱。適合的區域取決於機場交通、行李、新幹線日程、車站複雜度，以及你想要熱鬧或安靜的夜晚。",
    links: [
      { href: "/areas-to-stay", label: "比較東京住宿區域", variant: "primary" },
    ],
    imageNote: "搜尋飯店前，先比較知名車站、較安靜的附近基地與動線友善區域。",
  },
  "zh-CN": {
    title: "比较酒店前，先选择住宿区域",
    body: "先从东京住宿基地开始，不要先看酒店名称。适合的区域取决于机场交通、行李、新干线日程、车站复杂度，以及你想要热闹或安静的夜晚。",
    links: [
      { href: "/areas-to-stay", label: "比较东京住宿区域", variant: "primary" },
    ],
    imageNote: "搜索酒店前，先比较知名车站、较安静的附近基地和动线友好区域。",
  },
  fr: {
    title: "Choisissez où dormir avant de comparer les hôtels",
    body: "Commencez par votre base à Tokyo, pas par les noms d'hôtels. Le bon quartier dépend de l'aéroport, des bagages, du Shinkansen, des grandes gares et de nuits animées ou plus calmes.",
    links: [
      { href: "/areas-to-stay", label: "Comparer les quartiers de Tokyo", variant: "primary" },
    ],
    imageNote: "Comparez gares connues, bases plus calmes et quartiers pratiques avant de chercher des hôtels.",
  },
  de: {
    title: "Erst die Hotelgegend wählen, dann Hotels vergleichen",
    body: "Beginne mit deiner Tokio-Basis, nicht mit Hotelnamen. Die beste Gegend hängt von Flughafen, Gepäck, Shinkansen-Tagen, großen Bahnhöfen und lebhaften oder ruhigeren Nächten ab.",
    links: [
      { href: "/areas-to-stay", label: "Tokio-Hotelgegenden vergleichen", variant: "primary" },
    ],
    imageNote: "Vergleiche bekannte Bahnhöfe, ruhigere nahe Basen und logistische Gegenden, bevor du Hotels suchst.",
  },
  ru: {
    title: "Сначала выберите район, потом сравнивайте отели",
    body: "Начните с базы в Токио, а не с названий отелей. Подходящий район зависит от аэропорта, багажа, синкансэна, сложности станций и того, нужны ли вам оживленные или спокойные ночи.",
    links: [
      { href: "/areas-to-stay", label: "Сравнить районы Токио", variant: "primary" },
    ],
    imageNote: "Сравните известные станции, более спокойные соседние базы и удобные районы до поиска отелей.",
  },
};

function VisibilityChip({
  data,
  loading,
  error,
  tone,
}: {
  data: FujiVisibility | null;
  loading: boolean;
  error: boolean;
  tone: "light" | "dark";
}) {
  const t = useTranslations("home");
  if (error || (!loading && !data)) return null;
  const label = loading || !data
    ? t("visChecking")
    : `${t(`vis${data.visibility.charAt(0).toUpperCase() + data.visibility.slice(1)}`)} · ${data.cloudPercent}% clouds`;
  return (
    <p
      className={[
        "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        tone === "dark" ? "bg-white/10 text-white/90" : "border border-slate-200 bg-white text-slate-700",
      ].join(" ")}
    >
      <span aria-hidden="true">{data ? VIS_EMOJI[data.visibility] : "🌤️"}</span>
      <span className="min-w-0 truncate">
        <span className={tone === "dark" ? "text-white/60" : "text-slate-500"}>{t("hero.today")}:</span> {label}
      </span>
    </p>
  );
}

export default function HomeClient() {
  const t = useTranslations("home");
  const locale = useLocale();
  const homeHotelCopy = homeHotelCopyByLocale[locale] ?? homeHotelCopyByLocale.en;
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visError, setVisError] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const [scrollToAnswer, setScrollToAnswer] = useState(0);

  useEffect(() => {
    const fetchVisibility = async () => {
      const startedAt = performance.now();
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
      } catch {
        setVisError(true);
      } finally {
        setVisLoading(false);
        const elapsedMs = Math.round(performance.now() - startedAt);
        trackEvent({
          action: "fuji_visibility_load_time",
          category: "weather",
          value: elapsedMs,
        });
      }
    };
    fetchVisibility();
  }, []);

  // On a phone the answer opens below the buttons, mostly off screen; bring it
  // up. On a wide screen it opens beside them and is already in view.
  useEffect(() => {
    if (!scrollToAnswer) return;
    const el = answerRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.55) {
      el.scrollIntoView({ block: "start" });
    }
  }, [scrollToAnswer]);

  const recommendation = useMemo(() => getSeatRecommendation(direction), [direction]);
  // Route the ticket CTA only once the reader has actually answered — the
  // direction state defaults to tokyo-osaka, and routing on that default would
  // be a guess rather than a stated direction.
  const ticket = hasChecked ? getDirectionTicketLink(direction) : null;
  const ticketHref = ticket?.href ?? SHINKANSEN_TICKET_URL;
  const currentDirectionLabel =
    direction === "tokyo-osaka" ? t("dirToOsaka") : t("dirToTokyo");

  // One tap answers. The checker used to ask for a direction and then a second
  // press of "Check best seat"; US tools (Hopper, Google Flights) answer on the
  // first choice, and the answer is the same either way.
  const chooseDirection = (next: DirectionId) => {
    const nextRecommendation = getSeatRecommendation(next);
    setDirection(next);
    setHasChecked(true);
    setScrollToAnswer((n) => n + 1);
    // Persist the answered direction so the guide's Klook CTA and mobile
    // sticky can react to a completed seat check.
    try {
      window.localStorage.setItem(
        "fs-seat-direction",
        JSON.stringify({ direction: next, ts: Date.now() }),
      );
    } catch {
      // Storage is best-effort.
    }
    trackSeatCheckComplete({
      direction: next,
      route: next,
      result_seat: nextRecommendation.standardWindowSeat,
      result_side: nextRecommendation.sideLabel,
      locale,
    });
  };

  const omioHref = OMIO_SHINKANSEN_URL;

  const bookingCard = (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-[0_12px_32px_rgba(11,18,32,0.07)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-[-0.01em] text-ink">
            {hasChecked ? `Book Seat ${recommendation.standardWindowSeat}` : "Book your Shinkansen ticket"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {hasChecked
              ? `${currentDirectionLabel}. Choose Seat ${recommendation.standardWindowSeat} if available.`
              : "Reserved Tokaido Shinkansen seats. Choose Seat E if available."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Klook</span>
      </div>
      <a
        href={ticketHref}
        target="_blank"
        rel={AFFILIATE_REL}
        onClick={() => trackAffiliateClick({
          category: "train",
          provider: "klook",
          placement: "home_seat_result",
          href: ticketHref,
          label: "Book Shinkansen ticket",
          link_id: ticket?.linkId ?? "shinkansenTicket",
          product: "shinkansen_ticket",
          adid: ticket?.adid ?? "1265303",
          direction: hasChecked ? direction : undefined,
          locale,
        })}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-fuji px-5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(217,74,50,0.28)] transition-colors hover:bg-fuji-hover"
      >
        <Train className="h-4 w-4" />
        {hasChecked ? `Book Seat ${recommendation.standardWindowSeat} on Klook` : "Book on Klook"}
        <ArrowRight className="h-4 w-4" />
      </a>
      <a
        href={JR_PASS_URL}
        target="_blank"
        rel={AFFILIATE_REL}
        onClick={() => trackAffiliateClick({
          category: "train",
          provider: "klook",
          placement: "home_seat_result",
          href: JR_PASS_URL,
          label: "Check JR Pass options",
          link_id: "jrPass",
          product: "jr_pass",
          adid: "1165791",
          locale,
        })}
        className="mt-2.5 flex h-11 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
      >
        Compare JR Pass
      </a>
      <p className="mt-2 text-center text-xs leading-5 text-slate-500">
        Worth it with Hiroshima, several long JR rides, or a return to Tokyo.
      </p>
      {omioHref ? (
        <a
          href={omioHref}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() => trackAffiliateClick({
            category: "train",
            provider: "omio",
            placement: "home_seat_result",
            href: omioHref,
            label: "Still planning? Compare routes on Omio",
            link_id: "omioShinkansen",
            product: "route_compare",
            route_type: "route-comparison",
            locale,
          })}
          className="mt-3 block text-center text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-ink"
        >
          Still planning? Compare routes on Omio
        </a>
      ) : null}
      <p className="mt-4 border-t border-slate-100 pt-3 text-center text-[11px] leading-4 text-slate-500">
        {t("hero.affiliateNote")}
      </p>
    </div>
  );

  return (
    <main className="page-shell min-h-screen text-ink">
      <SiteHeader />

      {/* Hero, redesigned 2026-11-15 after US travel tools: the checker is the
          hero. The direction buttons used to sit about two phone screens down,
          below the headline and the photo; now they are the first thing to
          press, and the answer opens where the photo was. */}
      <section id="seat-checker" className="scroll-mt-16 bg-white">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-8 px-5 pb-10 pt-8 md:grid-cols-2 md:gap-12 md:px-7 md:pb-16 md:pt-14">
          <div className="min-w-0 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">{t("hero.eyebrow")}</p>
            <h1 className="mt-3 text-[34px] font-extrabold leading-[1.06] tracking-[-0.03em] text-ink sm:text-[42px] md:text-[52px] md:leading-[1.02]">
              {t("brandTitle").split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mx-auto mt-4 max-w-[460px] text-base leading-7 text-slate-600 md:mx-0 md:text-lg md:leading-8">
              {t("hero.sub")}
            </p>

            <div className="mx-auto mt-7 grid max-w-[440px] gap-3 md:mx-0" role="group" aria-label={t("seatCheckerHeading")}>
              {directions.map((opt, index) => {
                const chosen = hasChecked && opt.id === direction;
                const primary = hasChecked ? chosen : index === 0;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => chooseDirection(opt.id)}
                    className={[
                      "flex min-h-14 w-full items-center justify-between gap-3 rounded-full px-6 text-left text-base font-bold transition-all active:scale-[0.99]",
                      primary
                        ? "bg-fuji text-white shadow-[0_10px_24px_rgba(217,74,50,0.3)] hover:bg-fuji-hover"
                        : "border-2 border-ink/85 bg-white text-ink hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span>{t(opt.labelKey)}</span>
                    {chosen ? <Check className="h-5 w-5 shrink-0" /> : <ArrowRight className="h-5 w-5 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] font-medium text-slate-600 md:justify-start">
              <li className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {t("hero.trustLocal")}
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                {t("hero.trustSource")}
              </li>
            </ul>
          </div>

          <div ref={answerRef} className="min-w-0 scroll-mt-20">
            {hasChecked ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-[24px] bg-ink p-6 text-left text-white shadow-[0_18px_44px_rgba(11,18,32,0.25)] md:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">{currentDirectionLabel}</p>
                  <p className="mt-2 text-[48px] font-extrabold leading-none tracking-[-0.03em] md:text-[60px]">
                    Seat <span className="text-[#ff7a5c]">{recommendation.standardWindowSeat}</span>
                  </p>
                  <p className="mt-3 text-[15px] leading-6 text-white/85">{t("resultSeatEMain")}</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">{t("resultSeatDFallback")}</p>
                  <div className="mt-4">
                    <VisibilityChip data={visData} loading={visLoading} error={visError} tone="dark" />
                  </div>
                </div>
                {bookingCard}
              </div>
            ) : (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-[#07111f] shadow-[0_18px_50px_rgba(11,18,32,0.16)] md:aspect-[4/3]">
                <Image
                  src="/seat-checker-fuji-window-20260423.png"
                  alt="Mt. Fuji seen from a Shinkansen window seat"
                  fill
                  priority
                  sizes="(min-width: 1180px) 560px, (min-width: 768px) 50vw, calc(100vw - 40px)"
                  className="object-cover object-[72%_center]"
                />
                <div className="absolute bottom-3 left-3 right-3 flex">
                  <VisibilityChip data={visData} loading={visLoading} error={visError} tone="light" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        <section className="grid grid-cols-1 gap-5 pb-4 pt-8 lg:grid-cols-2">
          {hasChecked ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.05)] md:p-6">
              <p className="text-lg font-bold tracking-[-0.01em] text-ink">When to look</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("timingNote")}</p>
            </div>
          ) : (
            bookingCard
          )}
          <SeatMapCard
            recommendation={recommendation}
            directionLabel={currentDirectionLabel}
            highlighted={hasChecked}
          />
        </section>
        <p className="text-[11px] leading-5 text-slate-500">
          {t("brandSource")}{" "}
          <a href={JR_CENTRAL_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-600 underline underline-offset-2">
            [view source]
          </a>
          {" · "}
          {t("brandDisclaimer")}
        </p>

        {/* The five-step "decision flow" strip that stood here was cut on
            2026-11-14: four of its five steps led to pages retired from the
            index (plan-your-trip, airport-transfers, jr-pass-vs-single-ticket)
            or to the hotel funnel, and over ninety days the five together drew
            31 clicks, 26 of them on the step that scrolled back up to the
            checker above. */}

        <section className="pt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">More seat guides</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {SEAT_GUIDES.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(11,18,32,0.05)] transition-shadow hover:shadow-[0_14px_34px_rgba(11,18,32,0.1)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-ink">
                  {guide.image ? (
                    <Image
                      src={guide.image}
                      alt={guide.alt ?? ""}
                      fill
                      sizes="(min-width: 640px) 33vw, calc(100vw - 40px)"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center gap-1.5" aria-hidden="true">
                      {["A", "B", "C", "D", "E"].map((letter) => (
                        <span
                          key={letter}
                          className={[
                            "flex h-10 w-9 items-center justify-center rounded-lg text-base font-extrabold",
                            letter === "E" ? "bg-fuji text-white" : "bg-white/10 text-white/80",
                          ].join(" ")}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="flex items-center justify-between gap-2 text-base font-bold text-ink">
                    {guide.title}
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{guide.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-12">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,18,32,0.05)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <div className="p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Tokyo hotel base</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-ink">{homeHotelCopy.title}</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-slate-600">{homeHotelCopy.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {homeHotelCopy.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      trackCtaClick({
                        placement: "home_hotel_base_click",
                        href: link.href,
                        label: link.label,
                        category: "stay",
                        locale,
                      })
                    }
                    className={
                      link.variant === "secondary"
                        ? "inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
                        : "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-[#1c2740]"
                    }
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">{homeHotelCopy.imageNote}</p>
            </div>
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-full">
              <Image
                src="/images/home/tokyo-hotel-base.png"
                alt="Luggage near a Tokyo station hotel area"
                fill
                sizes="(min-width: 768px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="pb-14 pt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">{t("supportTools.eyebrow")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("supportTools.description")}</p>
          <Link
            href="/station-practice"
            onClick={() =>
              trackCtaClick({
                placement: "home_more_tools_featured",
                href: "/station-practice",
                label: t("supportTools.stationPracticeCta"),
                category: "station_practice",
                locale,
              })
            }
            className="mt-5 flex max-w-[520px] items-center justify-between gap-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(11,18,32,0.05)] transition-shadow hover:shadow-[0_14px_34px_rgba(11,18,32,0.1)]"
          >
            <span className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-blue-700">
                {t("supportTools.featuredLabel")}
              </span>
              <span className="mt-1 block text-base font-bold text-ink">
                {t("supportTools.stationPracticeTitle")}
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-600">
                {t("supportTools.stationPracticeDesc")}
              </span>
            </span>
            <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-bold text-white">
              {t("supportTools.stationPracticeCta")}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
