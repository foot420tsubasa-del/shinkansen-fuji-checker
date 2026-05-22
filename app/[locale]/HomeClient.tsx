"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bed,
  CalendarDays,
  Car,
  CheckCircle2,
  ExternalLink,
  Leaf,
  Luggage,
  MapPinned,
  ShieldCheck,
  Signpost,
  Train,
  Wifi,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClassName } from "@/components/ui/Button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import Image from "next/image";
import { SeatCheckerPanel } from "@/components/travel/SeatCheckerPanel";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import {
  AreaChoiceCard,
  type AreaChoice,
  LocalLensCard,
  type LocalLensPick,
} from "@/components/content/LocalTokyoCards";
import { getProviderFromHref, trackAffiliateClick, trackCtaClick, trackEvent, trackSeatCheckComplete } from "@/lib/analytics";
import {
  type DirectionId,
  type FujiVisibility,
  getSeatRecommendation,
} from "@/lib/seat-checker";
import {
  AIRPORT_TRANSFER_URL,
  ESIM_URL,
  INSURANCE_URL,
  JR_PASS_URL,
  OMIO_SHINKANSEN_URL,
  SHINKANSEN_TICKET_URL,
} from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

const asset = (name: string) => `/reference-ui-assets/${name}`;
const image2Placeholder = (name: string) => `/design-home-assets/${name}`;

const buttonPageSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.14)] transition-colors hover:bg-[#0f6f45]";
const buttonPagePill =
  "inline-flex items-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_6px_16px_rgba(22,138,86,0.10)] transition-colors hover:bg-[#0f6f45]";
const buttonAffiliatePill =
  "inline-flex items-center gap-2 rounded-xl border border-[#ff7a00] bg-[#ff7a00] font-extrabold text-white shadow-[0_6px_16px_rgba(255,122,0,0.16)] transition-colors hover:bg-[#e66700]";

type PopularLink = {
  label: string;
  href: string;
  icon: typeof Train;
  external?: boolean;
  tracking?: string;
};

function Header() {
  return <SiteHeader />;
}

function SmartLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel={AFFILIATE_REL} className={className}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function SectionTitle({
  eyebrow,
  description,
  centered = false,
}: {
  eyebrow: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={["mb-5", centered ? "text-center" : ""].join(" ")}>
      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#082653]">
        {eyebrow}
      </p>
      {description && (
        <p className={["mt-2 text-sm leading-6 text-[#5f7190]", centered ? "mx-auto max-w-2xl" : "max-w-2xl"].join(" ")}>
          {description}
        </p>
      )}
    </div>
  );
}

export default function HomeClient() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visSlowLoading, setVisSlowLoading] = useState(false);
  const [visError, setVisError] = useState(false);

  const featureCards = useMemo(() => [
    { title: t("featureCards.seatChecker.title"), description: t("featureCards.seatChecker.desc"), href: "/#seat-checker", icon: Train },
    { title: "Hotel Base", description: "Choose a Tokyo stay area for luggage, rail days, and airport access.", href: "/areas-to-stay", icon: Bed },
    { title: t("featureCards.essentials.title"), description: t("featureCards.essentials.desc"), href: "/plan-your-trip", icon: Luggage },
    { title: t("featureCards.tripPlanner.title"), description: t("featureCards.tripPlanner.desc"), href: "/planner", icon: CalendarDays },
    { title: t("featureCards.quietTokyo.title"), description: t("featureCards.quietTokyo.desc"), href: "/local-tokyo", icon: Leaf },
  ], [t]);

  const popularLinks: PopularLink[] = useMemo(() => [
    { label: t("footer.shinkansenGuide"), href: "/guide", icon: Train },
    { label: t("popularLinks.kyoto.title"), href: "/itineraries/7-day-first-time-japan", icon: CalendarDays },
    { label: t("featureCards.quietTokyo.title"), href: "/local-tokyo", icon: Leaf },
    { label: t("essentialsCta.esim.title"), href: ESIM_URL, icon: Wifi, external: true, tracking: "home_popular_esim" },
    { label: t("essentialsCta.airportTransfer.title"), href: "/airport-transfers", icon: Car },
  ], [t]);

  const tokyoBaseChoices: AreaChoice[] = useMemo(() => [
    { name: t("tokyoBases.shinjuku.name"), bestFor: t("tokyoBases.shinjuku.bestFor"), mood: t("tokyoBases.shinjuku.mood"), weakness: t("tokyoBases.shinjuku.weakness"), compareHref: "/areas-to-stay/tokyo-first-time", compareCta: "View Shinjuku", trackingPlacement: "home_tokyo_base_shinjuku", trackingLocale: locale, trackingPagePath: "/" },
    { name: t("tokyoBases.uenoAsakusa.name"), bestFor: t("tokyoBases.uenoAsakusa.bestFor"), mood: t("tokyoBases.uenoAsakusa.mood"), weakness: t("tokyoBases.uenoAsakusa.weakness"), compareHref: "/areas-to-stay/asakusa-vs-ueno", compareCta: t("tokyoBases.uenoAsakusa.compareCta"), trackingPlacement: "home_tokyo_base_ueno_asakusa", trackingLocale: locale, trackingPagePath: "/" },
    { name: t("tokyoBases.tokyoStation.name"), bestFor: t("tokyoBases.tokyoStation.bestFor"), mood: t("tokyoBases.tokyoStation.mood"), weakness: t("tokyoBases.tokyoStation.weakness"), compareHref: "/areas-to-stay/where-to-stay-before-shinkansen", compareCta: "View Tokyo Station", trackingPlacement: "home_tokyo_base_tokyo_station", trackingLocale: locale, trackingPagePath: "/" },
  ], [locale, t]);

  const localLensPicks: LocalLensPick[] = useMemo(() => [
    { name: t("localTokyo.kiyosumi.name"), summary: t("localTokyo.kiyosumi.summary"), bestFor: t("localTokyo.kiyosumi.bestFor"), avoidIf: t("localTokyo.kiyosumi.avoidIf"), timing: t("localTokyo.kiyosumi.timing"), href: "/local-tokyo/kiyosumi-shirakawa", image: image2Placeholder("quiet-kiyosumi.jpg") },
    { name: t("localTokyo.kuramae.name"), summary: t("localTokyo.kuramae.summary"), bestFor: t("localTokyo.kuramae.bestFor"), avoidIf: t("localTokyo.kuramae.avoidIf"), timing: t("localTokyo.kuramae.timing"), href: "/local-tokyo/kuramae", image: image2Placeholder("quiet-kuramae.jpg") },
    { name: t("localTokyo.oshiage.name"), summary: t("localTokyo.oshiage.summary"), bestFor: t("localTokyo.oshiage.bestFor"), avoidIf: t("localTokyo.oshiage.avoidIf"), timing: t("localTokyo.oshiage.timing"), href: "/local-tokyo/oshiage", image: image2Placeholder("quiet-oshiage.jpg") },
    { name: t("localTokyo.monzenNakacho.name"), summary: t("localTokyo.monzenNakacho.summary"), bestFor: t("localTokyo.monzenNakacho.bestFor"), avoidIf: t("localTokyo.monzenNakacho.avoidIf"), timing: t("localTokyo.monzenNakacho.timing"), href: "/local-tokyo/monzen-nakacho", image: image2Placeholder("quiet-monzen-nakacho.jpg") },
    { name: t("localTokyo.ryogoku.name"), summary: t("localTokyo.ryogoku.summary"), bestFor: t("localTokyo.ryogoku.bestFor"), avoidIf: t("localTokyo.ryogoku.avoidIf"), timing: t("localTokyo.ryogoku.timing"), href: "/local-tokyo/ryogoku", image: image2Placeholder("quiet-ryogoku.jpg") },
    { name: t("localTokyo.suitengumae.name"), summary: t("localTokyo.suitengumae.summary"), bestFor: t("localTokyo.suitengumae.bestFor"), avoidIf: t("localTokyo.suitengumae.avoidIf"), timing: t("localTokyo.suitengumae.timing"), href: "/local-tokyo/suitengumae-ningyocho", image: image2Placeholder("quiet-suitengumae.png") },
  ], [t]);

  const essentialCtas = useMemo(() => [
    { title: t("essentialsCta.shinkansen.title"), description: t("essentialsCta.shinkansen.desc"), href: SHINKANSEN_TICKET_URL, icon: Train, tracking: "home_essentials_shinkansen", category: "train" as const },
    { title: t("essentialsCta.esim.title"), description: t("essentialsCta.esim.desc"), href: ESIM_URL, icon: Wifi, tracking: "home_essentials_esim", category: "esim" as const },
    { title: t("essentialsCta.airportTransfer.title"), description: t("essentialsCta.airportTransfer.desc"), href: AIRPORT_TRANSFER_URL, icon: Car, tracking: "home_essentials_airport_transfer", category: "transfer" as const },
    { title: t("essentialsCta.jrPass.title"), description: t("essentialsCta.jrPass.desc"), href: JR_PASS_URL, icon: Train, tracking: "home_essentials_jrpass", category: "train" as const },
    { title: t("essentialsCta.insurance.title"), description: t("essentialsCta.insurance.desc"), href: INSURANCE_URL, icon: ShieldCheck, tracking: "home_essentials_insurance", category: "insurance" as const },
  ], [t]);

  const trustItems = useMemo(() => [
    { title: t("featureCards.seatChecker.title"), description: t("featureCards.seatChecker.desc"), icon: MapPinned },
    { title: t("featureCards.tripPlanner.title"), description: t("featureCards.tripPlanner.desc"), icon: Leaf },
    { title: t("featureCards.stayAreas.title"), description: t("featureCards.stayAreas.desc"), icon: CheckCircle2 },
    { title: t("featureCards.essentials.title"), description: t("featureCards.essentials.desc"), icon: ShieldCheck },
  ], [t]);
  const omioRouteCompareHref = OMIO_SHINKANSEN_URL;

  useEffect(() => {
    const fetchVisibility = async () => {
      const startedAt = performance.now();
      let slowTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        setVisLoading(true);
        setVisSlowLoading(false);
        setVisError(false);
        slowTimer = setTimeout(() => setVisSlowLoading(true), 3000);
        const res = await fetch("/api/fuji-visibility");
        if (!res.ok) throw new Error("Failed to fetch visibility");
        const json = await res.json();
        setVisData({
          visibility: json.visibility,
          cloudPercent: json.cloudPercent,
          message: json.message,
        });
      } catch (e) {
        setVisError(true);
      } finally {
        if (slowTimer) clearTimeout(slowTimer);
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

  const recommendation = useMemo(() => getSeatRecommendation(direction), [direction]);
  const currentDirectionLabel =
    direction === "tokyo-osaka" ? t("dirToOsaka") : t("dirToTokyo");

  const handleDirectionChange = (nextDirection: DirectionId) => {
    setDirection(nextDirection);
    setHasChecked(false);
  };

  return (
    <main className="page-shell min-h-screen text-[#102748]">
      <Header />

      <section className="relative min-h-[326px] overflow-hidden bg-[#e8f3fb] md:min-h-[430px]">
        <Image
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={image2Placeholder("home-hero-train-fuji.png")}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,#fff_43%,rgba(255,255,255,0.92)_55%,rgba(255,255,255,0.24)_65%,rgba(255,255,255,0.02)_78%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.23)_100%)]" />
        <div className="relative z-10 mx-auto max-w-[1180px] px-5 py-14 md:px-7 md:py-[72px] md:pb-[48px]">
          <div className="max-w-[700px]">
            <p className="mb-4 inline-flex rounded-full border border-[#d9e5f2] bg-[#f4f9ff] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#145aa0]">
              {t("nav.hub")}
            </p>
            <h1 className="font-serif text-[42px] font-bold leading-[0.98] tracking-[-0.035em] text-[#082653] md:text-[58px]">
              {t("brandTitle")}
            </h1>
            <p className="mt-5 max-w-[560px] text-lg leading-8 text-[#263a5d] md:text-xl">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/#seat-checker"
                className={buttonClassName({ variant: "internal", size: "lg" })}
              >
                <Train className="h-4 w-4" />
                {t("nav.seat")}
              </Link>
              <Link
                href="/areas-to-stay"
                className={buttonClassName({ variant: "internal", size: "lg" })}
              >
                <Bed className="h-4 w-4" />
                Choose your hotel base
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        <section className="relative z-10 mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <SmartLink
                key={card.title}
                href={card.href}
                className="group flex min-h-[170px] flex-col justify-center rounded-[9px] border border-[#d9e5f2] bg-white p-5 shadow-[0_14px_34px_rgba(9,35,70,0.09)] transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-[55px] w-[55px] items-center justify-center rounded-full bg-[#edf4fb] text-[#145aa0]">
                  <Icon className="h-8 w-8" strokeWidth={2.1} />
                </div>
                <h2 className="text-xl font-bold text-[#082653]">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5f7190]">{card.description}</p>
              </SmartLink>
            );
          })}
        </section>

        <section className="py-10">
          <SectionTitle eyebrow={t("popularLinks.eyebrow")} />
          <div className="flex flex-wrap gap-4">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {link.external && <ExternalLink className="h-3.5 w-3.5" />}
                </>
              );
              if (link.external) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    onClick={() => trackAffiliateClick({
                      category: "esim",
                      provider: getProviderFromHref(link.href),
                      placement: "home_popular",
                      href: link.href,
                      label: link.tracking ?? link.label,
                      locale,
                    })}
                    className={`${buttonAffiliatePill} h-[42px] px-5 text-sm`}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <SmartLink
                  key={link.label}
                  href={link.href}
                  className={`${buttonPagePill} h-[42px] px-5 text-sm`}
                >
                  {content}
                </SmartLink>
              );
            })}
          </div>
        </section>

        <section id="seat-checker" className="py-8">
          <SectionTitle
            eyebrow="Fuji-side seat checker"
            description="Check the route first, then confirm Seat E for the standard-car Mt. Fuji window. The existing seat logic is preserved here."
          />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
            <SeatCheckerPanel
              direction={direction}
              onDirectionChange={handleDirectionChange}
              onCheck={() => {
                setHasChecked(true);
                trackSeatCheckComplete({
                  direction,
                  route: direction,
                  result_seat: recommendation.standardWindowSeat,
                  result_side: recommendation.sideLabel,
                  locale,
                });
              }}
              visibility={visData}
              visibilityLoading={visLoading}
              visibilitySlowLoading={visSlowLoading}
              visibilityError={visError}
            />
            <SeatMapCard
              recommendation={recommendation}
              directionLabel={currentDirectionLabel}
              highlighted={hasChecked}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            {t("brandSource")}{" "}
            <a href={JR_CENTRAL_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 underline underline-offset-2">
              [view source]
            </a>
            {" · "}
            {t("brandDisclaimer")}
          </p>
          <div className="mt-5 rounded-2xl border border-[#d9e5f2] bg-white p-4 shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f7190]">After checking your seat</p>
            <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
                <p className="text-sm font-bold text-[#082653]">Book Shinkansen ticket</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Choose Seat E if available, then book the simple Tokyo to Kyoto / Osaka ticket.
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                  <a
                    href={SHINKANSEN_TICKET_URL}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    onClick={() => trackAffiliateClick({
                      category: "train",
                      provider: "klook",
                      placement: "home_seat_result",
                      href: SHINKANSEN_TICKET_URL,
                      label: "Book Shinkansen ticket",
                      link_id: "shinkansenTicket",
                      product: "shinkansen_ticket",
                      adid: "1265303",
                      locale,
                    })}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#e66700]"
                  >
                    <Train className="h-3.5 w-3.5" />
                    Klook
                  </a>
                  {omioRouteCompareHref ? (
                    <a
                      href={omioRouteCompareHref}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      onClick={() => trackAffiliateClick({
                        category: "train",
                        provider: "omio",
                        placement: "home_seat_result",
                        href: omioRouteCompareHref,
                        label: "Still planning? Compare routes on Omio",
                        link_id: "omioShinkansen",
                        product: "route_compare",
                        route_type: "route-comparison",
                        locale,
                      })}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-700 bg-indigo-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-800"
                    >
                      Omio
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
                <p className="text-sm font-bold text-[#082653]">Compare JR Pass</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Use this if your route includes Hiroshima, multiple long JR rides, or a return to Tokyo.
                </p>
                <div className="mt-auto pt-3">
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
                  className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#e66700]"
                >
                  <Train className="h-3.5 w-3.5" />
                  Klook
                </a>
                </div>
              </div>
              <TrackedCtaLink
                href="/areas-to-stay"
                placement="home_seat_result"
                label="Choose your hotel base"
                category="stay"
                ctaType="stay"
                pagePath="/"
                locale={locale}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 transition-colors hover:bg-emerald-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#082653]">
                  <Bed className="h-3.5 w-3.5 text-[#106b43]" />
                  Choose your hotel base
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Taking an early Shinkansen? Choose a Tokyo base that makes luggage and station access easier.
                </span>
                <span className="mt-2 inline-flex text-xs font-bold text-[#106b43]">Compare Tokyo stay areas →</span>
              </TrackedCtaLink>
              <TrackedCtaLink
                href="/airport-transfers"
                placement="home_seat_result"
                label="Get eSIM / airport transfer"
                category="transfer"
                ctaType="transfer"
                pagePath="/"
                locale={locale}
                className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 transition-colors hover:bg-sky-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#082653]">
                  <Car className="h-3.5 w-3.5 text-[#145aa0]" />
                  Get eSIM / airport transfer
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Sort your first arrival route, then prepare data for maps, translation, and transit apps.
                </span>
                <span className="mt-2 inline-flex text-xs font-bold text-[#145aa0]">Plan arrival essentials →</span>
              </TrackedCtaLink>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <Link href="/shinkansen-seat-e" className="underline underline-offset-2 transition-colors hover:text-slate-600">Seat E guide</Link>
            <Link href="/shinkansen-seat-letters" className="underline underline-offset-2 transition-colors hover:text-slate-600">Seat letters A–E</Link>
            <Link href="/shinkansen-seat-guides" className="underline underline-offset-2 transition-colors hover:text-slate-600">All seat guides</Link>
          </div>
        </section>

        <section className="py-9">
          <div className="rounded-[18px] border border-[#d9e5f2] bg-white p-5 shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">
                  {t("routePlan.eyebrow")}
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#082653]">
                  {t("routePlan.title")}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#5f7190]">
                  {t("routePlan.desc")}
                </p>
              </div>
              <Link
                href="/plan-your-trip"
                onClick={() =>
                  trackCtaClick({
                    placement: "home_route_plan",
                    href: "/plan-your-trip",
                    label: "Open trip planner",
                    category: "itinerary",
                    locale,
                  })
                }
                className={buttonClassName({ variant: "internal" })}
              >
                {t("routePlan.primaryCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#106b43]">
              {[
                { href: "/itineraries/7-day-first-time-japan", label: t("routePlan.sevenDay"), eventLabel: "See 7-day itinerary" },
                { href: "/itineraries/10-day-japan-with-fuji", label: t("routePlan.tenDay"), eventLabel: "See 10-day itinerary" },
                { href: "/command-center", label: t("routePlan.commandCenter"), eventLabel: "Open Command Center" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    trackCtaClick({
                      placement: "home_route_plan",
                      href: link.href,
                      label: link.eventLabel,
                      category: "itinerary",
                      locale,
                    })
                  }
                  className="inline-flex items-center gap-1 underline underline-offset-4 transition-colors hover:text-[#0f6f45]"
                >
                  {link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5 max-w-3xl rounded-[18px] border border-slate-700 bg-[#07142f] p-5 shadow-[0_14px_34px_rgba(7,20,47,0.22)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-300/40 bg-yellow-300/10 text-yellow-300">
                  <Signpost className="h-5 w-5" />
                </div>
                <div>
                  <p className="inline-flex rounded-full border border-yellow-300/35 bg-yellow-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-yellow-300">
                    {t("stationPractice.label")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {t("stationPractice.title")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {t("stationPractice.desc")}
                  </p>
                </div>
              </div>
              <Link
                href="/station-practice"
                onClick={() =>
                  trackCtaClick({
                    placement: "home_station_practice",
                    href: "/station-practice",
                    label: "Start station practice",
                    category: "station_practice",
                    locale,
                  })
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-[0_8px_18px_rgba(250,204,21,0.18)] transition-colors hover:bg-yellow-200"
              >
                {t("stationPractice.cta")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-9">
          <SectionTitle
            eyebrow="Tokyo hotel base decision"
            description="Use your airport, luggage, and Shinkansen day to choose a practical Tokyo base before comparing hotels."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tokyoBaseChoices.map((area) => (
              <AreaChoiceCard key={area.name} area={area} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href="/areas-to-stay/tokyo-first-time"
              onClick={() =>
                trackCtaClick({
                  placement: "home_tokyo_base_more",
                  href: "/areas-to-stay/tokyo-first-time",
                    label: "Open full Tokyo stay guide",
                  category: "stay",
                  locale,
                })
              }
              className={`${buttonPageSecondary} h-11 px-5 text-sm`}
            >
              {t("tokyoBases.fullGuide")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section id="quiet-tokyo" className="py-9">
          <SectionTitle
            eyebrow={t("localTokyo.eyebrow")}
            description={t("localTokyo.desc")}
            centered
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localLensPicks.slice(0, 3).map((pick) => (
              <LocalLensCard key={pick.name} pick={pick} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href="/local-tokyo"
              onClick={() =>
                trackCtaClick({
                  placement: "home_local_tokyo_more",
                  href: "/local-tokyo",
                  label: "Explore more local Tokyo areas",
                  category: "local_tokyo",
                  locale,
                })
              }
              className={`${buttonPageSecondary} h-11 px-5 text-sm`}
            >
              {t("localTokyo.seeAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-9">
          <SectionTitle eyebrow={t("essentialsCta.eyebrow")} />
          <div className="grid gap-4 md:grid-cols-3">
            {essentialCtas.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() => trackAffiliateClick({
                    category: item.category,
                    provider: getProviderFromHref(item.href),
                    placement: "home_essentials",
                    href: item.href,
                    label: item.tracking,
                    locale,
                  })}
                  className="flex min-h-[110px] items-center gap-4 rounded-[18px] border border-[#ffb56b] bg-[#fff8f0] p-5 shadow-[0_18px_45px_rgba(255,122,0,0.12)] transition-transform hover:-translate-y-1 hover:border-[#ff7a00]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff7a00] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-5 text-[#7a3300]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#5f7190]">{item.description}</p>
                  </div>
                  <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-[#b44b00]" />
                </a>
              );
            })}
          </div>
          <div className="mx-auto mt-4 grid max-w-3xl gap-4 md:grid-cols-2">
            {essentialCtas.slice(3).map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel={AFFILIATE_REL}
                  onClick={() => trackAffiliateClick({
                    category: item.category,
                    provider: getProviderFromHref(item.href),
                    placement: "home_essentials",
                    href: item.href,
                    label: item.tracking,
                    locale,
                  })}
                  className="flex min-h-[110px] items-center gap-4 rounded-[18px] border border-[#ffb56b] bg-[#fff8f0] p-5 shadow-[0_18px_45px_rgba(255,122,0,0.12)] transition-transform hover:-translate-y-1 hover:border-[#ff7a00]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff7a00] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-5 text-[#7a3300]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#5f7190]">{item.description}</p>
                  </div>
                  <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-[#b44b00]" />
                </a>
              );
            })}
          </div>
        </section>

        <section className="py-9">
          <div className="grid rounded-[18px] border border-[#d9e5f2] bg-white p-3 shadow-[0_18px_45px_rgba(9,35,70,0.10)] md:grid-cols-4">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={[
                    "p-5",
                    index < trustItems.length - 1 ? "border-b border-[#d9e5f2] md:border-b-0 md:border-r" : "",
                  ].join(" ")}
                >
                  <Icon className="mb-3 h-6 w-6 text-[#145aa0]" />
                  <h3 className="text-lg font-bold text-[#082653]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5f7190]">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
