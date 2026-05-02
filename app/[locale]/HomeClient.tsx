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
  Train,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { SiteHeader } from "./components/SiteHeader";
import Image from "next/image";
import { SeatCheckerPanel } from "@/components/travel/SeatCheckerPanel";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import {
  AreaChoiceCard,
  type AreaChoice,
  LocalLensCard,
  type LocalLensPick,
} from "@/components/content/LocalTokyoCards";
import { trackAffiliateClick, trackEvent } from "@/lib/analytics";
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
  SHINKANSEN_TICKET_URL,
} from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

const asset = (name: string) => `/reference-ui-assets/${name}`;
const image2Placeholder = (name: string) => `/design-home-assets/${name}`;

const buttonPage =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#168a56] bg-[#168a56] font-extrabold text-white shadow-[0_8px_22px_rgba(22,138,86,0.18)] transition-colors hover:bg-[#0f6f45]";
const buttonPageSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#9fd7bd] bg-white font-extrabold text-[#106b43] shadow-[0_8px_22px_rgba(22,138,86,0.08)] transition-colors hover:border-[#168a56] hover:bg-[#f0fbf6]";
const buttonAffiliate =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#ff7a00] bg-[#ff7a00] font-extrabold text-white shadow-[0_8px_22px_rgba(255,122,0,0.24)] transition-colors hover:bg-[#e66700]";
const buttonPagePill =
  "inline-flex items-center gap-2 rounded-xl border border-[#b8dfca] bg-[#f0fbf6] font-extrabold text-[#106b43] shadow-[0_6px_16px_rgba(22,138,86,0.06)] transition-colors hover:border-[#168a56] hover:bg-white";
const buttonAffiliatePill =
  "inline-flex items-center gap-2 rounded-xl border border-[#ffb56b] bg-[#fff3e7] font-extrabold text-[#b44b00] shadow-[0_6px_16px_rgba(255,122,0,0.10)] transition-colors hover:border-[#ff7a00] hover:bg-white";

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
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visSlowLoading, setVisSlowLoading] = useState(false);
  const [visError, setVisError] = useState(false);

  const featureCards = useMemo(() => [
    { title: t("featureCards.seatChecker.title"), description: t("featureCards.seatChecker.desc"), href: "/#seat-checker", icon: Train },
    { title: t("featureCards.tripPlanner.title"), description: t("featureCards.tripPlanner.desc"), href: "/planner", icon: CalendarDays },
    { title: t("featureCards.quietTokyo.title"), description: t("featureCards.quietTokyo.desc"), href: "/local-tokyo", icon: Leaf },
    { title: t("featureCards.stayAreas.title"), description: t("featureCards.stayAreas.desc"), href: "/areas-to-stay", icon: Bed },
    { title: t("featureCards.essentials.title"), description: t("featureCards.essentials.desc"), href: "/plan-your-trip", icon: Luggage },
  ], [t]);

  const popularLinks: PopularLink[] = useMemo(() => [
    { label: t("footer.shinkansenGuide"), href: "/guide", icon: Train },
    { label: t("popularLinks.kyoto.title"), href: "/itineraries/7-day-first-time-japan", icon: CalendarDays },
    { label: t("featureCards.quietTokyo.title"), href: "/local-tokyo", icon: Leaf },
    { label: t("essentialsCta.esim.title"), href: ESIM_URL, icon: Wifi, external: true, tracking: "home_popular_esim" },
    { label: t("essentialsCta.airportTransfer.title"), href: "/airport-transfers", icon: Car },
  ], [t]);

  const routeCards = useMemo(() => [
    { title: t("popularLinks.tokyo.title"), description: t("popularLinks.tokyo.desc"), image: image2Placeholder("route-tokyo.png") },
    { title: t("popularLinks.fujiView.title"), description: t("popularLinks.fujiView.desc"), image: image2Placeholder("route-fuji.png") },
    { title: t("popularLinks.kyoto.title"), description: t("popularLinks.kyoto.desc"), image: image2Placeholder("route-kyoto.png") },
    { title: t("popularLinks.osaka.title"), description: t("popularLinks.osaka.desc"), image: image2Placeholder("route-osaka.png") },
  ], [t]);

  const tokyoBaseChoices: AreaChoice[] = useMemo(() => [
    { name: t("tokyoBases.shinjuku.name"), bestFor: t("tokyoBases.shinjuku.bestFor"), mood: t("tokyoBases.shinjuku.mood"), weakness: t("tokyoBases.shinjuku.weakness"), compareHref: "/areas-to-stay/tokyo-first-time#shinjuku", compareCta: "View Shinjuku" },
    { name: t("tokyoBases.shibuya.name"), bestFor: t("tokyoBases.shibuya.bestFor"), mood: t("tokyoBases.shibuya.mood"), weakness: t("tokyoBases.shibuya.weakness"), compareHref: "/areas-to-stay/tokyo-first-time#comparison", compareCta: "Compare fit" },
    { name: t("tokyoBases.ueno.name"), bestFor: t("tokyoBases.ueno.bestFor"), mood: t("tokyoBases.ueno.mood"), weakness: t("tokyoBases.ueno.weakness"), compareHref: "/areas-to-stay/tokyo-first-time#ueno", compareCta: "View Ueno" },
    { name: t("tokyoBases.asakusa.name"), bestFor: t("tokyoBases.asakusa.bestFor"), mood: t("tokyoBases.asakusa.mood"), weakness: t("tokyoBases.asakusa.weakness"), compareHref: "/areas-to-stay/tokyo-first-time#asakusa", compareCta: "View Asakusa" },
    { name: t("tokyoBases.tokyoStation.name"), bestFor: t("tokyoBases.tokyoStation.bestFor"), mood: t("tokyoBases.tokyoStation.mood"), weakness: t("tokyoBases.tokyoStation.weakness"), compareHref: "/areas-to-stay/tokyo-first-time#tokyo-station", compareCta: "View Tokyo Station" },
    { name: t("tokyoBases.eastTokyo.name"), bestFor: t("tokyoBases.eastTokyo.bestFor"), mood: t("tokyoBases.eastTokyo.mood"), weakness: t("tokyoBases.eastTokyo.weakness"), compareHref: "/local-tokyo", compareCta: "See Local Tokyo", localHref: "/local-tokyo/kiyosumi-shirakawa", localCta: "Start with Kiyosumi" },
  ], [t]);

  const localLensPicks: LocalLensPick[] = useMemo(() => [
    { name: t("localTokyo.kiyosumi.name"), summary: t("localTokyo.kiyosumi.summary"), bestFor: t("localTokyo.kiyosumi.bestFor"), avoidIf: t("localTokyo.kiyosumi.avoidIf"), timing: t("localTokyo.kiyosumi.timing"), href: "/local-tokyo/kiyosumi-shirakawa", image: image2Placeholder("quiet-kiyosumi.jpg") },
    { name: t("localTokyo.kuramae.name"), summary: t("localTokyo.kuramae.summary"), bestFor: t("localTokyo.kuramae.bestFor"), avoidIf: t("localTokyo.kuramae.avoidIf"), timing: t("localTokyo.kuramae.timing"), href: "/local-tokyo/kuramae", image: image2Placeholder("quiet-kuramae.jpg") },
    { name: t("localTokyo.oshiage.name"), summary: t("localTokyo.oshiage.summary"), bestFor: t("localTokyo.oshiage.bestFor"), avoidIf: t("localTokyo.oshiage.avoidIf"), timing: t("localTokyo.oshiage.timing"), href: "/local-tokyo/oshiage", image: image2Placeholder("quiet-oshiage.jpg") },
    { name: t("localTokyo.monzenNakacho.name"), summary: t("localTokyo.monzenNakacho.summary"), bestFor: t("localTokyo.monzenNakacho.bestFor"), avoidIf: t("localTokyo.monzenNakacho.avoidIf"), timing: t("localTokyo.monzenNakacho.timing"), href: "/local-tokyo/monzen-nakacho", image: image2Placeholder("quiet-monzen-nakacho.jpg") },
    { name: t("localTokyo.ryogoku.name"), summary: t("localTokyo.ryogoku.summary"), bestFor: t("localTokyo.ryogoku.bestFor"), avoidIf: t("localTokyo.ryogoku.avoidIf"), timing: t("localTokyo.ryogoku.timing"), href: "/local-tokyo/ryogoku", image: image2Placeholder("quiet-ryogoku.jpg") },
  ], [t]);

  const essentialCtas = useMemo(() => [
    { title: t("essentialsCta.shinkansen.title"), description: t("essentialsCta.shinkansen.desc"), href: SHINKANSEN_TICKET_URL, icon: Train, tracking: "home_essentials_shinkansen" },
    { title: t("essentialsCta.esim.title"), description: t("essentialsCta.esim.desc"), href: ESIM_URL, icon: Wifi, tracking: "home_essentials_esim" },
    { title: t("essentialsCta.airportTransfer.title"), description: t("essentialsCta.airportTransfer.desc"), href: AIRPORT_TRANSFER_URL, icon: Car, tracking: "home_essentials_airport_transfer" },
    { title: t("essentialsCta.jrPass.title"), description: t("essentialsCta.jrPass.desc"), href: JR_PASS_URL, icon: Train, tracking: "home_essentials_jrpass" },
    { title: t("essentialsCta.insurance.title"), description: t("essentialsCta.insurance.desc"), href: INSURANCE_URL, icon: ShieldCheck, tracking: "home_essentials_insurance" },
  ], [t]);

  const trustItems = useMemo(() => [
    { title: t("featureCards.seatChecker.title"), description: t("featureCards.seatChecker.desc"), icon: MapPinned },
    { title: t("featureCards.tripPlanner.title"), description: t("featureCards.tripPlanner.desc"), icon: Leaf },
    { title: t("featureCards.stayAreas.title"), description: t("featureCards.stayAreas.desc"), icon: CheckCircle2 },
    { title: t("featureCards.essentials.title"), description: t("featureCards.essentials.desc"), icon: ShieldCheck },
  ], [t]);

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
                className={`${buttonPage} h-14 px-6 text-sm`}
              >
                <Train className="h-4 w-4" />
                {t("nav.seat")}
              </Link>
              <Link
                href="/planner"
                className={`${buttonPageSecondary} h-14 px-6 text-sm`}
              >
                <CalendarDays className="h-4 w-4" />
                {t("nav.planner")}
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
                    onClick={() => trackAffiliateClick("home-popular-links", link.tracking ?? link.label)}
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
              onCheck={() => setHasChecked(true)}
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
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <a
                href={SHINKANSEN_TICKET_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                onClick={() => trackAffiliateClick("home-after-seat", "shinkansen_ticket")}
                className={`${buttonAffiliate} h-11 px-4 text-xs`}
              >
                <Train className="h-3.5 w-3.5" />
                Book a single ride
              </a>
              <Link
                href="/jr-pass-vs-single-ticket"
                className={`${buttonPage} h-11 px-4 text-xs`}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                JR Pass guide
              </Link>
              <Link
                href="/guide"
                className={`${buttonPage} h-11 px-4 text-xs`}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Seat guide
              </Link>
              <Link
                href="/planner"
                className={`${buttonPageSecondary} h-11 px-4 text-xs`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Plan trip
              </Link>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <Link href="/shinkansen-seat-e" className="underline underline-offset-2 transition-colors hover:text-slate-600">Seat E guide</Link>
            <Link href="/shinkansen-seat-letters" className="underline underline-offset-2 transition-colors hover:text-slate-600">Seat letters A–E</Link>
            <Link href="/shinkansen-seat-guides" className="underline underline-offset-2 transition-colors hover:text-slate-600">All seat guides</Link>
          </div>
        </section>

        <section className="py-9">
          <SectionTitle
            eyebrow="Plan Your Route"
            description="A classic journey. Designed with time, comfort, and views in mind."
          />
          <div className="grid items-center gap-3 lg:grid-cols-[1fr_70px_1fr_70px_1fr_70px_1fr]">
            {routeCards.map((card, index) => (
              <div key={card.title} className="contents">
                <article className="overflow-hidden rounded-[9px] border border-[#d9e5f2] bg-white shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
                  <div className="relative h-[126px] w-full lg:h-[86px]">
                    <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-[#082653]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f7190]">{card.description}</p>
                  </div>
                </article>
                {index < routeCards.length - 1 && (
                  <div className="hidden text-center text-sm font-black text-[#082653] lg:block">
                    <div className="mb-2 border-t-[3px] border-dotted border-[#7e98bb]" />
                    {index === 0 ? "~1.5 hr" : index === 1 ? "~2.5 hr" : "~30 min"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/planner"
              className={`${buttonPage} h-11 px-5 text-sm`}
            >
              Open planner
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/command-center"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#0b1a33] px-5 text-sm font-extrabold text-sky-300 shadow-[0_8px_22px_rgba(7,20,47,0.3)] transition-colors hover:bg-[#132744] hover:text-sky-200 h-11"
            >
              {t("footer.commandCenter")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-9">
          <SectionTitle
            eyebrow={t("tokyoBases.eyebrow")}
            description={t("tokyoBases.desc")}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tokyoBaseChoices.map((area) => (
              <AreaChoiceCard key={area.name} area={area} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href="/areas-to-stay/tokyo-first-time"
              className={`${buttonPageSecondary} h-11 px-5 text-sm`}
            >
              Compare all Tokyo bases
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
          <div className="mx-auto mt-5 grid max-w-3xl gap-5 md:grid-cols-2">
            {localLensPicks.slice(3).map((pick) => (
              <LocalLensCard key={pick.name} pick={pick} />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href="/local-tokyo"
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
                  onClick={() => trackAffiliateClick("home-essentials", item.tracking)}
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
                  onClick={() => trackAffiliateClick("home-essentials", item.tracking)}
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

      <footer className="mt-10 border-t border-slate-700/60 bg-[#07142f] py-10 text-slate-300 shadow-[0_-16px_50px_rgba(15,23,42,0.16)]">
        <div className="mx-auto max-w-[1180px] px-5 md:px-7">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr_1fr_1fr_1.7fr]">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <BrandMark size="sm" />
                <span className="text-xl font-extrabold text-white">fujiseat.com</span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.plan")}</h4>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/#seat-checker">{t("footer.seatChecker")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/planner">{t("footer.planner")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/areas-to-stay">{t("footer.stayAreas")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/plan-your-trip">{t("footer.essentials")}</Link>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.guides")}</h4>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/guide">{t("footer.shinkansenGuide")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/itineraries">{t("footer.itineraries")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/airport-transfers">{t("footer.airportTransfers")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/command-center">{t("footer.commandCenter")}</Link>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-[0.06em] text-sky-200">{t("footer.support")}</h4>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/about">{t("footer.about")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/local-tokyo">{t("footer.localTokyo")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/privacy">{t("footer.privacy")}</Link>
              <Link className="mb-2 block text-sm text-slate-300 transition-colors hover:text-white" href="/terms">{t("footer.terms")}</Link>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/5 p-5">
              <h4 className="text-xs font-black uppercase tracking-[0.06em] text-sky-200">
                {t("footer.feedbackTitle")}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {t("footer.feedbackDesc")}
              </p>
              <Link
                href="/questions"
                className={`${buttonPage} mt-4 h-10 px-4 text-sm`}
              >
                {t("footer.feedbackCta")}
              </Link>
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
            <p>
              {t("footer.affiliateNote").split("Terms").map((part, i) =>
                i === 0 ? <span key={i}>{part}<Link href="/terms" className="underline underline-offset-2 hover:text-white">{t("footer.terms")}</Link></span> : <span key={i}>{part}</span>
              )}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
