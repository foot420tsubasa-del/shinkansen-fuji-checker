"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Train } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import Image from "next/image";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import { FujiTiming } from "@/components/travel/FujiTiming";
import { HeroWindow } from "@/components/home/HeroWindow";
import { FujiViewMap } from "@/components/travel/FujiViewMap";
import { ScenicRoutesGallery } from "@/components/home/ScenicRoutesGallery";
import { RouteSearch } from "@/components/home/RouteSearch";
import { RouteTimeline } from "@/components/scenic/RouteTimeline";
import { ScenicPassCard } from "@/components/scenic/ScenicPassCard";
import { matchRoute, resolveStation, type RouteMatch, type ViewTag } from "@/lib/scenic";
import { ORIGINS_BY_DIRECTION, type OriginId } from "@/lib/fuji-window";
import { SearchTicketCard } from "@/components/scenic/SearchTicketCard";
import type { HeroSeason } from "@/lib/hero-images";
import { trackAffiliateClick, trackCtaClick, trackEvent, trackSeatCheckComplete } from "@/lib/analytics";
import {
  type DirectionId,
  type FujiVisibility,
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
    image: "/images/Kawaguchiko.webp",
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
    image: "/images/Kyoto.webp",
    alt: "Yasaka Pagoda on a Kyoto lane at sunset",
  },
  {
    href: "/blog/seat-e-sold-out-mt-fuji",
    title: "Seat E sold out?",
    body: "Five ways to still see Mt. Fuji, and how to photograph it through the glass.",
    image: "/images/hero/window-fuji-summer-wide.webp",
    alt: "Mt. Fuji above green fields through a Shinkansen window",
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

export default function HomeClient({ season }: { season: HeroSeason }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const homeHotelCopy = homeHotelCopyByLocale[locale] ?? homeHotelCopyByLocale.en;
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visError, setVisError] = useState(false);
  const answerRef = useRef<HTMLElement>(null);
  const [scrollToAnswer, setScrollToAnswer] = useState(0);
  // Route search (2026-11-15): the Tokaido answer is the checker below; any
  // other mapped route answers with a timeline, an unmapped one with what is next.
  const [routeMatch, setRouteMatch] = useState<RouteMatch | null>(null);
  const [tags, setTags] = useState<ViewTag[]>([]);
  const [tokaidoFrom, setTokaidoFrom] = useState("Tokyo");
  const [searchKey, setSearchKey] = useState(0);

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

  // The answer opens below the photograph, off screen on every device; bring
  // it up unless the reader has already scrolled down to it.
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

  const runSearch = (from: string, to: string) => {
    const match = matchRoute(from, to);
    trackCtaClick({
      placement: "route_search",
      href: `/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      label: `${from}→${to}|${match.kind === "live" ? match.route.id : "unsupported"}`,
      category: "seat_checker",
      locale,
    });
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("from", from);
      url.searchParams.set("to", to);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // URL sync is a convenience.
    }
    setSearchKey((n) => n + 1);
    if (match.kind === "live" && match.route.id === "tokaido-fuji") {
      const direction: DirectionId = match.direction === "forward" ? "tokyo-osaka" : "osaka-tokyo";
      const origin = from.toLowerCase().replace(/ /g, "-") as OriginId;
      // matchRoute only lets through trips the Fuji model times; this is the
      // second lock, so the answer can never fall back to another station.
      if (ORIGINS_BY_DIRECTION[direction].includes(origin)) {
        setRouteMatch(null);
        setTokaidoFrom(from);
        chooseDirection(direction);
        return;
      }
      setHasChecked(false);
      setRouteMatch({ kind: "unsupported", from, to, nearbyLive: [], comingSoon: [] });
      setScrollToAnswer((n) => n + 1);
      return;
    }
    setHasChecked(false);
    setRouteMatch(match);
    setScrollToAnswer((n) => n + 1);
  };

  // A shared /?from=…&to=… link answers on arrival.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      const to = params.get("to");
      // Same names the search box accepts: "Arashiyama", "Hakone" and the like.
      if (from && to) runSearch(resolveStation(from) ?? from, resolveStation(to) ?? to);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

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

      {/* Hero, reworked 2026-11-15 toward a scenic-route site: the window
          photograph fills the first screen and the checker sits on it in a
          white panel. The view picker starts with Mt. Fuji alone; other views
          join once their side and section have been verified. One tap on a
          direction still answers, and the answer opens directly below. */}
      <section id="seat-checker" className="relative isolate z-10 scroll-mt-14 bg-ink">
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <HeroWindow season={season} />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,18,32,0.72)_0%,rgba(11,18,32,0.42)_30%,rgba(11,18,32,0.08)_56%,rgba(11,18,32,0.5)_100%)]"
        />
        <span className="absolute bottom-1 right-3 text-[10px] font-medium text-white/60">Illustrative image</span>
        <div className="mx-auto flex min-h-[740px] max-w-[1180px] flex-col justify-between px-4 pb-6 pt-9 md:min-h-[720px] md:px-7 md:pb-10 md:pt-16">
          <div className="break-keep text-center text-white">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/90 md:text-xs">
              — {t("search.eyebrow")} —
            </p>
            <h1 className="mx-auto mt-4 max-w-[860px] font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.01em] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] sm:text-[44px] md:text-[60px] md:leading-[1.04]">
              {t("search.title")}
            </h1>
            <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-6 text-white/90 font-medium [text-shadow:0_1px_14px_rgba(0,0,0,0.6)] md:mt-4 md:text-lg md:leading-7">
              {t("search.sub")}
            </p>
          </div>

          <div className="mx-auto mt-10 w-full max-w-[1000px] rounded-[26px] bg-white/95 p-4 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
            <RouteSearch tags={tags} onTagsChange={setTags} onSubmit={runSearch} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] font-medium text-slate-600">
                <li className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {t("hero.trustLocal")}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {t("hero.trustSource")}
                </li>
              </ul>
              <div className="min-w-0 max-w-full">
                <VisibilityChip data={visData} loading={visLoading} error={visError} tone="light" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        {routeMatch?.kind === "live" ? (
          <section ref={answerRef} className="grid scroll-mt-16 grid-cols-1 gap-5 pb-4 pt-8">
            <RouteTimeline
              key={`${searchKey}-${routeMatch.route.id}`}
              routeId={routeMatch.route.id}
              direction={routeMatch.direction}
              from={routeMatch.from}
              to={routeMatch.to}
              tags={tags}
            />
            {/* Only where the JR Pass really covers the line: the Enoden and the
                Fujikyu Line are private railways it does not. */}
            {routeMatch.route.ticket?.linkId === "jrPass" ? (
              <div className="max-w-[560px]">
                <ScenicPassCard href={JR_PASS_URL} routeId={routeMatch.route.id} line={routeMatch.route.line} />
              </div>
            ) : (
              // The line's own tickets (existing affiliate links only); the
              // JR Pass lines keep the pass card above instead.
              <div className="max-w-[560px]">
                <SearchTicketCard route={routeMatch.route} locale={locale} />
              </div>
            )}
          </section>
        ) : routeMatch?.kind === "unsupported" ? (
          <section ref={answerRef} className="scroll-mt-16 pb-4 pt-8">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.06)] md:p-6">
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-ink md:text-2xl">
                {t("search.unsupportedTitle", { from: routeMatch.from, to: routeMatch.to })}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t("search.unsupportedBody")}</p>
              <Link href="/scenic" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-fuji underline underline-offset-2">
                {t("search.browseScenicMap")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {/* A line the trip leads to, by name only: no views, sides,
                    times or pictures from another route on an unmapped trip. */}
                {routeMatch.nearbyLive.map((r) => (
                  <Link
                    key={r.id}
                    href={r.href ?? "/"}
                    className="flex items-center justify-between gap-3 rounded-[18px] border-2 border-fuji/60 p-4 hover:shadow-md"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-fuji">Mapped separately</span>
                      <span className="mt-0.5 block text-sm font-bold leading-snug text-ink">{r.line}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-fuji" aria-hidden="true" />
                  </Link>
                ))}
                {routeMatch.comingSoon.map((r) => (
                  <div key={r.id} className="overflow-hidden rounded-[18px] border border-slate-200">
                    {r.image ? (
                      <div className="relative aspect-[16/10] bg-ink">
                        <Image src={r.image.src} alt={r.image.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-ink">{t("search.comingSoon")}</span>
                        <span className="absolute bottom-1.5 right-2 text-[9.5px] text-white/75">Illustrative</span>
                      </div>
                    ) : null}
                    <div className="p-3">
                      <p className="text-sm font-bold leading-snug text-ink">{r.title}</p>
                      {r.teaser ? <p className="mt-0.5 text-xs text-slate-500">{r.teaser}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <p className="min-w-0 flex-1 text-sm text-slate-700">{t("search.leaveNoteBody")}</p>
                <Link
                  href="/questions"
                  onClick={() =>
                    trackCtaClick({
                      placement: "route_search_unsupported_note",
                      href: "/questions",
                      label: `${routeMatch.from}→${routeMatch.to}`,
                      category: "support",
                      locale,
                    })
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-bold text-white"
                >
                  {t("search.leaveNote")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        ) : hasChecked ? (
          // Mobile reads answer, booking, timing, seat map; from lg the four
          // pair up as answer | booking over timing | seat map.
          <section ref={answerRef} className="grid scroll-mt-16 grid-cols-1 gap-5 pb-4 pt-8 lg:grid-cols-2">
            <div className="min-w-0 rounded-[24px] bg-ink p-6 text-left text-white shadow-[0_18px_44px_rgba(11,18,32,0.25)] md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">{currentDirectionLabel}</p>
              <p className="mt-2 text-[48px] font-extrabold leading-none tracking-[-0.03em] md:text-[60px]">
                Seat <span className="text-[#ff7a5c]">{recommendation.standardWindowSeat}</span>
              </p>
              <p className="mt-3 text-[15px] leading-6 text-white/85">{t("resultSeatEMain")}</p>
              <p className="mt-1 text-xs leading-5 text-white/60">{t("resultSeatDFallback")}</p>
              <div className="mt-4 min-w-0">
                <VisibilityChip data={visData} loading={visLoading} error={visError} tone="dark" />
              </div>
            </div>
            <div className="min-w-0">{bookingCard}</div>
            <div className="min-w-0 lg:col-span-2">
              <FujiViewMap direction={direction} />
              <Link href="/scenic" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-fuji underline underline-offset-2">
                {t("search.browseScenicMap")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.05)] md:p-6 [&>div:first-child]:mt-0 [&>div:first-child]:border-t-0 [&>div:first-child]:pt-0">
              <FujiTiming
                key={`${direction}-${tokaidoFrom}`}
                direction={direction}
                locale={locale}
                pagePath="/"
                reminder
                initialOrigin={tokaidoFrom.toLowerCase().replace(/ /g, "-")}
              />
            </div>
            <div className="min-w-0">
              <SeatMapCard
                recommendation={recommendation}
                directionLabel={currentDirectionLabel}
                highlighted
              />
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 pb-4 pt-8 lg:grid-cols-2">
            {bookingCard}
            <SeatMapCard
              recommendation={recommendation}
              directionLabel={currentDirectionLabel}
              highlighted={false}
            />
          </section>
        )}
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

        <ScenicRoutesGallery />

        <section className="pt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">More seat guides</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                src="/images/home/tokyo-hotel-base.webp"
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
