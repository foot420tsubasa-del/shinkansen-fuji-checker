"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bed,
  Car,
  CheckCircle2,
  ExternalLink,
  Leaf,
  MapPinned,
  ShieldCheck,
  Train,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import Image from "next/image";
import { SeatCheckerPanel } from "@/components/travel/SeatCheckerPanel";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
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
} from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

const image2Placeholder = (name: string) => `/design-home-assets/${name}`;

const buttonPageSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.14)] transition-colors hover:bg-[#0f6f45]";
const buttonPagePill =
  "inline-flex items-center gap-2 rounded-xl border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_6px_16px_rgba(22,138,86,0.10)] transition-colors hover:bg-[#0f6f45]";

type PopularLink = {
  label: string;
  href: string;
  icon: typeof Train;
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
    { title: "Hotel Base", description: "Choose a practical hotel base for luggage, rail days, and calmer nights.", href: "/areas-to-stay", icon: Bed },
    { title: "Rail Tickets", description: "Book a Shinkansen ticket or compare JR Pass before buying rail.", href: "/guide", icon: Train },
    { title: "Arrival Essentials", description: "Plan airport transfer and data before arrival day.", href: "/airport-transfers", icon: Car },
  ], [t]);

  const popularLinks: PopularLink[] = useMemo(() => [
    { label: "Seat E guide", href: "/shinkansen-seat-e", icon: Train },
    { label: "Seat letters A-E", href: "/shinkansen-seat-letters", icon: Train },
    { label: "All seat guides", href: "/shinkansen-seat-guides", icon: Train },
  ], []);

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
      } catch {
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
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        <section className="relative z-10 mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <section id="seat-checker" className="py-10">
          <SectionTitle
            eyebrow="Fuji-side seat checker"
            description="Choose your direction and check the Mt. Fuji-side seat."
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
                <p className="text-sm font-bold text-[#082653]">Choose your hotel base</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Taking an early Shinkansen? Choose a Tokyo base that makes luggage and station access easier.
                </p>
                <div className="mt-auto pt-3">
                  <TrackedCtaLink
                    href="/areas-to-stay"
                    placement="home_seat_result"
                    label="Choose your hotel base"
                    category="stay"
                    ctaType="stay"
                    pagePath="/"
                    locale={locale}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
                  >
                    Compare Tokyo stay areas
                  </TrackedCtaLink>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
        </section>

        <section className="py-7">
          <div className="overflow-hidden rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-[0_10px_25px_rgba(8,38,83,0.06)] md:grid md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">
                Tokyo hotel base
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#082653]">
                Choose a practical hotel base before comparing hotels
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f7190]">
                Start with Shinjuku, Ueno / Asakusa, or Tokyo Station based on airport access, luggage,
                Shinkansen days, and quieter nights.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#106b43]">
                {[
                  { href: "/areas-to-stay/asakusa-vs-ueno", label: "Ueno vs Asakusa" },
                  { href: "/areas-to-stay/tokyo-station-vs-shinjuku", label: "Tokyo Station vs Shinjuku" },
                  { href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Tokyo with luggage" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      trackCtaClick({
                        placement: "home_tokyo_base_more",
                        href: link.href,
                        label: link.label,
                        category: "stay",
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
            <div className="mt-5 md:mt-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
                <Image
                  src="/images/home/tokyo-hotel-base.png"
                  alt="Luggage near a Tokyo station hotel area"
                  fill
                  sizes="(min-width: 768px) 240px, 100vw"
                  className="object-cover"
                />
              </div>
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
                className={`${buttonPageSecondary} mt-3 h-11 w-full px-5 text-sm`}
              >
                {t("tokyoBases.fullGuide")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-7">
          <SectionTitle
            eyebrow="Support tools"
            description="Use these after the seat, rail ticket, hotel base, and arrival essentials are clear."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[18px] border border-[#d9e5f2] bg-white p-5 shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">Local Tokyo</p>
              <h2 className="mt-1 text-lg font-bold text-[#082653]">Local Tokyo ideas after choosing your hotel base</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f7190]">
                Use quieter local neighborhoods after the main hotel-base decision is clear.
              </p>
              <Link
                href="/local-tokyo"
                onClick={() =>
                  trackCtaClick({
                    placement: "home_support_tools",
                    href: "/local-tokyo",
                    label: "Open Local Tokyo",
                    category: "local_tokyo",
                    locale,
                  })
                }
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#106b43] underline underline-offset-4"
              >
                Open Local Tokyo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-[18px] border border-[#d9e5f2] bg-white p-5 shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">Route support</p>
              <h2 className="mt-1 text-lg font-bold text-[#082653]">Need a full route overview?</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f7190]">
                Keep itinerary tools secondary to seat, ticket, hotel, and arrival decisions.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href="/plan-your-trip"
                  onClick={() =>
                    trackCtaClick({
                      placement: "home_support_tools",
                      href: "/plan-your-trip",
                      label: "Open trip planner",
                      category: "itinerary",
                      locale,
                    })
                  }
                  className={`${buttonPageSecondary} h-10 px-4 text-xs`}
                >
                  Open Trip Planner
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {[
                  { href: "/itineraries/7-day-first-time-japan", label: "7-day itinerary", eventLabel: "See 7-day itinerary" },
                  { href: "/command-center", label: "Command Center", eventLabel: "Open Command Center" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      trackCtaClick({
                        placement: "home_support_tools",
                        href: link.href,
                        label: link.eventLabel,
                        category: "itinerary",
                        locale,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#106b43] underline underline-offset-4 transition-colors hover:text-[#0f6f45]"
                  >
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">Travel prep</p>
              <h2 className="mt-1 text-lg font-bold text-[#082653]">Practice Japanese station signs</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f7190]">
                Practice exits, transfer gates, and station signs after reading the train-sign guide.
              </p>
              <Link
                href="/station-practice"
                onClick={() =>
                  trackCtaClick({
                    placement: "home_support_tools",
                    href: "/station-practice",
                    label: "Start station practice",
                    category: "station_practice",
                    locale,
                  })
                }
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#106b43] underline underline-offset-4"
              >
                Open Station Practice
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-6">
          <SectionTitle eyebrow="More seat guides" />
          <div className="flex flex-wrap gap-3">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              const content = (
                <>
                  <Icon className="h-4 w-4" />
                  {link.label}
                </>
              );
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
