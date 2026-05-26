"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  DollarSign,
  ExternalLink,
  MapPin,
  Phone,
  Plane,
  ShoppingBag,
  Sun,
  Train,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { getAffUrl, requireAffUrl } from "@/src/affiliateLinks";
import { getProviderFromHref, trackAffiliateClick, trackChecklistComplete, trackTemplateSelect } from "@/lib/analytics";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { AFFILIATE_REL } from "@/lib/link-rel";

// ─── Constants ──────────────────────────────────────────────────────────────

const LS_PLANNER_TEMPLATE = "fujiseat_planner_template";
const LS_PLANNER_DATE = "fujiseat_planner_date";
const LS_PLANNER_CHECKS = "fujiseat_planner_checks";

type CityData = { key: string; daysKey: string; emoji: string };

type TemplateData = {
  id: string;
  days: number;
  cityKeys: CityData[];
  itinerarySlug: string;
  jrPassWorthIt: boolean;
};

const TEMPLATE_DATA: TemplateData[] = [
  {
    id: "classic-7",
    days: 7,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_3", emoji: "🗼" },
      { key: "kyoto", daysKey: "day4_5", emoji: "⛩️" },
      { key: "osaka", daysKey: "day6_7", emoji: "🍣" },
    ],
    itinerarySlug: "7-day-first-time-japan",
    jrPassWorthIt: false,
  },
  {
    id: "express-5",
    days: 5,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_2", emoji: "🗼" },
      { key: "kyoto", daysKey: "day3_4", emoji: "⛩️" },
      { key: "depart", daysKey: "day5", emoji: "✈️" },
    ],
    itinerarySlug: "5-day-express-japan",
    jrPassWorthIt: false,
  },
  {
    id: "full-10",
    days: 10,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_3", emoji: "🗼" },
      { key: "kawaguchiko", daysKey: "day4", emoji: "🗻" },
      { key: "hakone", daysKey: "day5", emoji: "♨️" },
      { key: "kyoto", daysKey: "day6_8", emoji: "⛩️" },
      { key: "osaka", daysKey: "day9_10", emoji: "🍣" },
    ],
    itinerarySlug: "10-day-japan-with-fuji",
    jrPassWorthIt: false,
  },
  {
    id: "deep-14",
    days: 14,
    cityKeys: [
      { key: "tokyo", daysKey: "day1_4", emoji: "🗼" },
      { key: "kawaguchiko", daysKey: "day5_6", emoji: "🗻" },
      { key: "kyoto", daysKey: "day7_10", emoji: "⛩️" },
      { key: "hiroshima", daysKey: "day11_12", emoji: "☮️" },
      { key: "osaka", daysKey: "day13_14", emoji: "🍣" },
    ],
    itinerarySlug: "14-day-japan-golden-route",
    jrPassWorthIt: true,
  },
];

type CheckData = {
  id: string;
  critical: boolean;
  href?: string;
  hasLink?: boolean;
  affiliate?: {
    category: "hotel" | "esim" | "transfer" | "train" | "activity" | "tour" | "insurance";
    provider: "klook" | "agoda" | "trip" | "other";
    label: string;
    area?: string;
    href?: string;
  };
};

const plannerHotel = getHotelLink("shinjuku");

const CHECKLIST_DATA: CheckData[] = [
  { id: "passport", critical: true },
  { id: "esim", critical: true, href: requireAffUrl("esim"), hasLink: true },
  { id: "train", critical: false, href: "/jr-pass-vs-single-ticket", hasLink: true },
  { id: "transfer", critical: true, href: "/airport-transfers/narita-to-shinjuku", hasLink: true },
  {
    id: "hotel",
    critical: true,
    href: plannerHotel.href,
    hasLink: true,
    affiliate: {
      category: "hotel",
      provider: plannerHotel.provider,
      label: plannerHotel.label,
      area: `${plannerHotel.city}: ${plannerHotel.areaName}`,
      href: plannerHotel.trackingHref,
    },
  },
  { id: "insurance", critical: false, href: requireAffUrl("insurance"), hasLink: true },
  { id: "cash", critical: false },
  { id: "maps", critical: false },
  { id: "translate", critical: false },
];

type RouteBookingAction = {
  label: string;
  href: string;
  provider?: "klook" | "omio" | "trip" | "agoda";
  category?: "hotel" | "esim" | "transfer" | "train" | "insurance";
  linkId?: string;
  product?: string;
  adid?: string;
  routeType?: string;
  area?: string;
  trackingHref?: string;
  external?: boolean;
  priority: "primary" | "secondary" | "text";
};

type RouteHotelAction = {
  actionLabel: string;
  hotelKey: HotelAreaKey;
  area: string;
};

type RouteHotelDetailLink = {
  label: string;
  href: string;
};

type RouteBookingRecommendation = {
  routeId: string;
  railRecommendation: string;
  railActionLabel: string;
  railActionDescription?: string;
  railActions: RouteBookingAction[];
  hotelRecommendation: string;
  hotelRecommendedAreas: string[];
  hotelPrimaryAction?: RouteBookingAction;
  hotelDetailLinks: RouteHotelDetailLink[];
  hotelActions: RouteHotelAction[];
  arrivalRecommendation: string;
  arrivalActions: RouteBookingAction[];
  optionalAddOns: RouteBookingAction[];
};

const shinkansenTicketUrl = getAffUrl("shinkansenTicket");
const jrPassUrl = getAffUrl("jrPass");
const omioJapanTrainUrl = getAffUrl("omioJapanTrain");
const omioTrainUrl = omioJapanTrainUrl ?? getAffUrl("omioShinkansen");
const omioTrainLinkId = omioJapanTrainUrl ? "omioJapanTrain" : "omioShinkansen";
const esimUrl = getAffUrl("esim");
const insuranceUrl = getAffUrl("insurance");

function plannerHotelProviders(hotelKey: HotelAreaKey): ProviderChoiceButton[] {
  const hotelLink = getHotelLink(hotelKey);
  const config = getTripHotelConfig(hotelKey);
  const tripUrl = config.tripUrl?.trim() ?? "";
  const agodaLink = getAgodaHotelAreaUrl(hotelKey);
  const providers: ProviderChoiceButton[] = [];

  if (tripUrl) {
    providers.push({
      label: "Trip.com",
      href: hotelLink.provider === "trip" ? hotelLink.href : tripUrl,
      trackingHref: tripUrl,
      provider: "trip",
      product: "hotel",
      linkId: `hotelArea.${hotelKey}.trip`,
      placement: "planner_route_stack",
      variant: "primary",
      category: "hotel",
    });
  }

  if (agodaLink) {
    providers.push({
      label: "Agoda",
      href: agodaLink.href,
      trackingHref: agodaLink.trackingHref,
      provider: "agoda",
      product: "hotel",
      linkId: agodaLink.linkId,
      placement: "planner_route_stack",
      variant: providers.length > 0 ? "secondary" : "primary",
      category: "hotel",
    });
  }

  return providers;
}

const routeBookingRecommendations: Record<string, RouteBookingRecommendation> = {
  "express-5": {
    routeId: "express-5",
    railRecommendation:
      "A single Shinkansen ticket is usually simpler for this short Tokyo → Kyoto route. JR Pass is usually not needed unless you return to Tokyo by Shinkansen.",
    railActionLabel: "Book Shinkansen ticket",
    railActionDescription: "Best for Tokyo → Kyoto / Osaka, one-way, or simple first-time routes.",
    railActions: [
      shinkansenTicketUrl
        ? { label: "Klook", href: shinkansenTicketUrl, provider: "klook", category: "train", linkId: "shinkansenTicket", product: "shinkansen_ticket", adid: "1265303", routeType: "express-5", external: true, priority: "primary" }
        : null,
      omioTrainUrl
        ? { label: "Omio", href: omioTrainUrl, provider: "omio", category: "train", linkId: omioTrainLinkId, product: "route_compare", routeType: "express-5", external: true, priority: "secondary" }
        : null,
      jrPassUrl
        ? { label: "JR Pass usually not needed for this route", href: jrPassUrl, provider: "klook", category: "train", linkId: "jrPass", product: "jr_pass", adid: "1165791", routeType: "express-5", external: true, priority: "text" }
        : null,
    ].filter(Boolean) as RouteBookingAction[],
    hotelRecommendation: "Short trip, fewer transfers, and easier early rail days.",
    hotelRecommendedAreas: ["Tokyo Station", "Shinjuku"],
    hotelPrimaryAction: { label: "Choose Tokyo base", href: "/areas-to-stay/tokyo-first-time", external: false, priority: "secondary" },
    hotelDetailLinks: [
      { label: "Tokyo Station details", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
      { label: "Shinjuku details", href: "/areas-to-stay/tokyo/shinjuku" },
    ],
    hotelActions: [
      { actionLabel: "Compare hotels near Tokyo Station", hotelKey: "tokyoStation", area: "Tokyo: Tokyo Station" },
    ],
    arrivalRecommendation: "Set up data and airport movement before landing so the short route does not start with friction.",
    arrivalActions: [
      esimUrl ? { label: "Get Japan eSIM", href: esimUrl, provider: "klook", category: "esim", linkId: "esim", product: "esim", adid: "1166001", external: true, priority: "secondary" } : null,
      { label: "Plan airport transfer", href: "/airport-transfers", external: false, priority: "text" },
    ].filter(Boolean) as RouteBookingAction[],
    optionalAddOns: insuranceUrl ? [{ label: "Check travel insurance", href: insuranceUrl, provider: "klook", category: "insurance", linkId: "insurance", product: "travel_insurance", adid: "1166002", external: true, priority: "text" }] : [],
  },
  "classic-7": {
    routeId: "classic-7",
    railRecommendation:
      "A single Shinkansen ticket is usually simpler for Tokyo → Kyoto / Osaka. Compare the JR Pass only if you add Hiroshima, multiple long-distance rides, or return to Tokyo by Shinkansen.",
    railActionLabel: "Book Shinkansen ticket",
    railActionDescription: "Best for Tokyo → Kyoto / Osaka, one-way, or simple first-time routes.",
    railActions: [
      shinkansenTicketUrl
        ? { label: "Klook", href: shinkansenTicketUrl, provider: "klook", category: "train", linkId: "shinkansenTicket", product: "shinkansen_ticket", adid: "1265303", routeType: "classic-7", external: true, priority: "primary" }
        : null,
      omioTrainUrl
        ? { label: "Omio", href: omioTrainUrl, provider: "omio", category: "train", linkId: omioTrainLinkId, product: "route_compare", routeType: "classic-7", external: true, priority: "secondary" }
        : null,
      jrPassUrl
        ? { label: "Check JR Pass options if adding Hiroshima or return-to-Tokyo", href: jrPassUrl, provider: "klook", category: "train", linkId: "jrPass", product: "jr_pass", adid: "1165791", routeType: "classic-7", external: true, priority: "text" }
        : null,
    ].filter(Boolean) as RouteBookingAction[],
    hotelRecommendation: "Best balance for first-time Tokyo, Kyoto / Osaka transfer, and airport access.",
    hotelRecommendedAreas: ["Shinjuku", "Ueno / Asakusa", "Tokyo Station"],
    hotelPrimaryAction: { label: "Choose Tokyo base", href: "/areas-to-stay/tokyo-first-time", external: false, priority: "secondary" },
    hotelDetailLinks: [
      { label: "Shinjuku details", href: "/areas-to-stay/tokyo/shinjuku" },
      { label: "Ueno details", href: "/areas-to-stay/tokyo/ueno" },
      { label: "Asakusa details", href: "/areas-to-stay/tokyo/asakusa" },
      { label: "Tokyo Station details", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
    ],
    hotelActions: [
      { actionLabel: "Compare Shinjuku hotels", hotelKey: "shinjuku", area: "Tokyo: Shinjuku" },
    ],
    arrivalRecommendation: "Prepare data and airport transfer first; activities can wait until the route is stable.",
    arrivalActions: [
      esimUrl ? { label: "Get Japan eSIM", href: esimUrl, provider: "klook", category: "esim", linkId: "esim", product: "esim", adid: "1166001", external: true, priority: "secondary" } : null,
      { label: "Plan airport transfer", href: "/airport-transfers", external: false, priority: "text" },
    ].filter(Boolean) as RouteBookingAction[],
    optionalAddOns: insuranceUrl ? [{ label: "Check travel insurance", href: insuranceUrl, provider: "klook", category: "insurance", linkId: "insurance", product: "travel_insurance", adid: "1166002", external: true, priority: "text" }] : [],
  },
  "full-10": {
    routeId: "full-10",
    railRecommendation:
      "Because this route mixes Fuji-side travel, Hakone, and the Shinkansen to Kyoto, compare the route first. Then book the Shinkansen legs that fit your final order.",
    railActionLabel: "Compare rail routes",
    railActionDescription: "Best when Fuji, Hakone, and Kyoto order are still flexible.",
    railActions: [
      omioTrainUrl
        ? { label: "Omio", href: omioTrainUrl, provider: "omio", category: "train", linkId: omioTrainLinkId, product: "route_compare", routeType: "full-10", external: true, priority: "primary" }
        : null,
      shinkansenTicketUrl
        ? { label: "Klook", href: shinkansenTicketUrl, provider: "klook", category: "train", linkId: "shinkansenTicket", product: "shinkansen_ticket", adid: "1265303", routeType: "full-10", external: true, priority: "secondary" }
        : null,
      jrPassUrl
        ? { label: "JR Pass is conditional if adding more JR rides", href: jrPassUrl, provider: "klook", category: "train", linkId: "jrPass", product: "jr_pass", adid: "1165791", routeType: "full-10", external: true, priority: "text" }
        : null,
    ].filter(Boolean) as RouteBookingAction[],
    hotelRecommendation: "Good balance between Tokyo sightseeing and onward rail movement.",
    hotelRecommendedAreas: ["Shinjuku", "Tokyo Station"],
    hotelPrimaryAction: { label: "Choose Tokyo base", href: "/areas-to-stay/tokyo-first-time", external: false, priority: "secondary" },
    hotelDetailLinks: [
      { label: "Shinjuku details", href: "/areas-to-stay/tokyo/shinjuku" },
      { label: "Tokyo Station details", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
    ],
    hotelActions: [
      { actionLabel: "Compare Shinjuku hotels", hotelKey: "shinjuku", area: "Tokyo: Shinjuku" },
      { actionLabel: "Compare hotels near Tokyo Station", hotelKey: "tokyoStation", area: "Tokyo: Tokyo Station" },
    ],
    arrivalRecommendation: "Use eSIM and airport transfer planning to keep the first Tokyo day flexible.",
    arrivalActions: [
      esimUrl ? { label: "Get Japan eSIM", href: esimUrl, provider: "klook", category: "esim", linkId: "esim", product: "esim", adid: "1166001", external: true, priority: "secondary" } : null,
      { label: "Plan airport transfer", href: "/airport-transfers", external: false, priority: "text" },
    ].filter(Boolean) as RouteBookingAction[],
    optionalAddOns: insuranceUrl ? [{ label: "Check travel insurance", href: insuranceUrl, provider: "klook", category: "insurance", linkId: "insurance", product: "travel_insurance", adid: "1166002", external: true, priority: "text" }] : [],
  },
  "deep-14": {
    routeId: "deep-14",
    railRecommendation:
      "Because this route includes more long-distance travel, compare the JR Pass before buying separate tickets.",
    railActionLabel: "Check JR Pass options",
    railActionDescription: "Best if your route includes Hiroshima, multiple long-distance JR rides, or returning to Tokyo by Shinkansen.",
    railActions: [
      jrPassUrl
        ? { label: "Klook", href: jrPassUrl, provider: "klook", category: "train", linkId: "jrPass", product: "jr_pass", adid: "1165791", routeType: "deep-14", external: true, priority: "primary" }
        : null,
      omioTrainUrl
        ? { label: "Omio", href: omioTrainUrl, provider: "omio", category: "train", linkId: omioTrainLinkId, product: "route_compare", routeType: "deep-14", external: true, priority: "secondary" }
        : null,
      shinkansenTicketUrl
        ? { label: "Book known Shinkansen leg on Klook", href: shinkansenTicketUrl, provider: "klook", category: "train", linkId: "shinkansenTicket", product: "shinkansen_ticket", adid: "1265303", routeType: "deep-14", external: true, priority: "text" }
        : null,
    ].filter(Boolean) as RouteBookingAction[],
    hotelRecommendation: "Multiple long-distance rail days and luggage movement make logistics more important.",
    hotelRecommendedAreas: ["Tokyo Station", "Ueno"],
    hotelPrimaryAction: { label: "Choose Tokyo base", href: "/areas-to-stay/tokyo-first-time", external: false, priority: "secondary" },
    hotelDetailLinks: [
      { label: "Tokyo Station details", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
      { label: "Ueno details", href: "/areas-to-stay/tokyo/ueno" },
    ],
    hotelActions: [
      { actionLabel: "Compare hotels near Tokyo Station", hotelKey: "tokyoStation", area: "Tokyo: Tokyo Station" },
      { actionLabel: "Compare Ueno hotels", hotelKey: "ueno", area: "Tokyo: Ueno" },
    ],
    arrivalRecommendation: "Prepare eSIM and airport transfer before landing; this route has less margin for early confusion.",
    arrivalActions: [
      esimUrl ? { label: "Get Japan eSIM", href: esimUrl, provider: "klook", category: "esim", linkId: "esim", product: "esim", adid: "1166001", external: true, priority: "secondary" } : null,
      { label: "Plan airport transfer", href: "/airport-transfers", external: false, priority: "text" },
    ].filter(Boolean) as RouteBookingAction[],
    optionalAddOns: insuranceUrl ? [{ label: "Check travel insurance", href: insuranceUrl, provider: "klook", category: "insurance", linkId: "insurance", product: "travel_insurance", adid: "1166002", external: true, priority: "text" }] : [],
  },
};

const EMERGENCY_DATA = [
  { key: "police", number: "110", emoji: "🚨" },
  { key: "ambulance", number: "119", emoji: "🚑" },
  { key: "tourist", number: "050-3816-2787", emoji: "📞" },
  { key: "translation", number: "03-5285-8185", emoji: "🌐" },
];

type WeatherData = {
  cityKey: string;
  temp: number;
  high: number;
  low: number;
  code: number;
  precip: number;
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  tokyo: { lat: 35.6812, lng: 139.7671 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  osaka: { lat: 34.6937, lng: 135.5023 },
  hiroshima: { lat: 34.3853, lng: 132.4553 },
  kawaguchiko: { lat: 35.5109, lng: 138.7558 },
  hakone: { lat: 35.2323, lng: 139.1069 },
};

function weatherIcon(code: number) {
  if (code <= 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  return "⛈️";
}

function routeActionClass(action: RouteBookingAction) {
  if (action.priority === "text") {
    return [
      "inline-flex min-h-9 items-center gap-1 text-xs font-semibold underline underline-offset-4 transition-colors",
      action.provider === "omio" ? "text-indigo-700 hover:text-indigo-900" : "text-[#106b43] hover:text-[#0f6f45]",
    ].join(" ");
  }
  if (action.priority === "primary") {
    if (action.provider === "omio") {
      return "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-indigo-700 bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-800";
    }
    return "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e66700]";
  }
  if (action.provider === "trip") {
    return "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#0a4ca8] bg-[#0a4ca8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a3f8b]";
  }
  if (action.provider === "omio") {
    return "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-indigo-700 bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-800";
  }
  return "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]";
}

function RouteBookingActionLink({ action, routeId, locale }: { action: RouteBookingAction; routeId: string; locale?: string }) {
  const className = routeActionClass(action);

  if (!action.external) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
        {action.priority !== "text" ? <ArrowRight className="h-3 w-3" /> : null}
      </Link>
    );
  }

  return (
    <a
      href={action.href}
      target="_blank"
      rel={AFFILIATE_REL}
      onClick={() =>
        trackAffiliateClick({
          category: action.category ?? "train",
          provider: action.provider ?? getProviderFromHref(action.href),
          placement: "planner_route_stack",
          page_path: "/planner",
          locale,
          href: action.trackingHref ?? action.href,
          label: action.label,
          area: action.area,
          link_id: action.linkId,
          product: action.product,
          adid: action.adid,
          route_type: action.routeType ?? routeId,
        })
      }
      className={className}
    >
      {action.label}
      {action.priority !== "text" ? <ExternalLink className="h-3 w-3" /> : null}
    </a>
  );
}

function RouteBookingStack({
  routeId,
  routeTitle,
  railRecommendation,
  railActionLabel,
  railActionDescription,
  hotelRecommendation,
  hotelRecommendedAreas,
  hotelPrimaryAction,
  hotelDetailLinks,
  hotelActions,
  arrivalRecommendation,
  optionalAddOns,
  railActions,
  arrivalActions,
  locale,
}: RouteBookingRecommendation & { routeTitle: string; locale?: string }) {
  const railProviderActions = railActions.filter((action) => action.priority !== "text").slice(0, 2);
  const railTextActions = railActions.filter((action) => action.priority === "text");
  const isJrPassPrimary = railActionLabel === "Check JR Pass options";
  const primaryRailProviderActions = isJrPassPrimary
    ? railProviderActions.filter((action) => action.product === "jr_pass")
    : railProviderActions;
  const secondaryRailProviderActions = isJrPassPrimary
    ? railProviderActions.filter((action) => action.product !== "jr_pass")
    : [];
  const t = useTranslations("planner.routeBooking.ui");

  return (
    <section className="rounded-[22px] border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-sky-700" />
        <h3 className="text-sm font-semibold text-slate-950">{t("title", { routeTitle })}</h3>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{t("subtitle")}</p>
      <div className="mt-3 space-y-3">
        <div className="rounded-xl border border-white bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">{t("rail")}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{railRecommendation}</p>
          <ProviderChoiceCTA
            actionLabel={railActionLabel}
            description={railActionDescription}
            pagePath="/planner"
            locale={locale}
            routeType={routeId}
            className="mt-2 border-slate-100 bg-slate-50"
            providers={primaryRailProviderActions.map((action) => ({
              label: action.label,
              href: action.external ? action.href : undefined,
              internalLink: action.external ? undefined : action.href,
              provider: action.provider ?? "other",
              product: action.product ?? "route_compare",
              adid: action.adid,
              linkId: action.linkId,
              placement: "planner_route_stack",
              variant: action.priority,
              category: action.category ?? "train",
              trackingHref: action.trackingHref,
            }))}
          />
          {secondaryRailProviderActions.length > 0 ? (
            <ProviderChoiceCTA
              actionLabel="Compare rail routes"
              description="Use this when the route order or transport mode is still flexible."
              pagePath="/planner"
              locale={locale}
              routeType={routeId}
              className="mt-2 border-sky-100 bg-sky-50/60"
              providers={secondaryRailProviderActions.map((action) => ({
                label: action.label,
                href: action.external ? action.href : undefined,
                internalLink: action.external ? undefined : action.href,
                provider: action.provider ?? "other",
                product: action.product ?? "route_compare",
                adid: action.adid,
                linkId: action.linkId,
                placement: "planner_route_stack",
                variant: action.priority,
                category: action.category ?? "train",
                trackingHref: action.trackingHref,
              }))}
            />
          ) : null}
          {railTextActions.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1">
              {railTextActions.map((action) => (
                <RouteBookingActionLink key={`${routeId}-rail-note-${action.label}`} action={action} routeId={routeId} locale={locale} />
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-white bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">{t("hotel")}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{hotelRecommendation}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hotelRecommendedAreas.map((area) => (
              <span key={`${routeId}-hotel-area-${area}`} className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-[#106b43]">
                {area}
              </span>
            ))}
          </div>
          {hotelPrimaryAction ? (
            <div className="mt-2">
              <RouteBookingActionLink action={hotelPrimaryAction} routeId={routeId} locale={locale} />
            </div>
          ) : null}
          {hotelDetailLinks.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {hotelDetailLinks.map((link) => (
                <Link key={`${routeId}-hotel-detail-${link.href}`} href={link.href} className="text-[10px] font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-2 space-y-2">
            {hotelActions.map((action) => (
              <ProviderChoiceCTA
                key={`${routeId}-hotel-action-${action.hotelKey}`}
                actionLabel={action.actionLabel}
                pagePath="/planner"
                locale={locale}
                area={action.area}
                routeType={routeId}
                className="border-emerald-100 bg-emerald-50/50"
                providers={plannerHotelProviders(action.hotelKey)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">{t("arrival")}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{arrivalRecommendation}</p>
          <div className="mt-2 flex flex-col gap-2">
            {arrivalActions.map((action) => (
              <RouteBookingActionLink key={`${routeId}-arrival-${action.label}`} action={action} routeId={routeId} locale={locale} />
            ))}
          </div>
        </div>

        {optionalAddOns.length > 0 ? (
          <div className="rounded-xl border border-white bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold text-slate-900">{t("optional")}</p>
            <div className="mt-2 flex flex-col gap-2">
              {optionalAddOns.map((action) => (
                <RouteBookingActionLink key={`${routeId}-optional-${action.label}`} action={action} routeId={routeId} locale={locale} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-[10px] text-slate-400">
        {t("partnerNote")}
      </p>
    </section>
  );
}

function localizeRouteBooking(
  base: RouteBookingRecommendation,
  t: ReturnType<typeof useTranslations<"planner">>,
): RouteBookingRecommendation {
  const key = `routeBooking.routes.${base.routeId}`;
  const railActionLabels = t.raw(`${key}.railActions`) as string[];
  const hotelAreas = t.raw(`${key}.hotelRecommendedAreas`) as string[];
  const hotelDetailLabels = t.raw(`${key}.hotelDetailLinks`) as string[];
  const hotelActionLabels = t.raw(`${key}.hotelActions`) as string[];
  const arrivalActionLabels = t.raw(`${key}.arrivalActions`) as string[];
  const optionalActionLabels = t.raw(`${key}.optionalAddOns`) as string[];

  return {
    ...base,
    railRecommendation: t(`${key}.railRecommendation`),
    railActionLabel: t(`${key}.railActionLabel`),
    railActionDescription: t(`${key}.railActionDescription`),
    railActions: base.railActions.map((action, index) => ({ ...action, label: railActionLabels[index] ?? action.label })),
    hotelRecommendation: t(`${key}.hotelRecommendation`),
    hotelRecommendedAreas: hotelAreas,
    hotelPrimaryAction: base.hotelPrimaryAction
      ? { ...base.hotelPrimaryAction, label: t(`${key}.hotelPrimaryAction`) }
      : undefined,
    hotelDetailLinks: base.hotelDetailLinks.map((link, index) => ({ ...link, label: hotelDetailLabels[index] ?? link.label })),
    hotelActions: base.hotelActions.map((action, index) => ({ ...action, actionLabel: hotelActionLabels[index] ?? action.actionLabel })),
    arrivalRecommendation: t(`${key}.arrivalRecommendation`),
    arrivalActions: base.arrivalActions.map((action, index) => ({ ...action, label: arrivalActionLabels[index] ?? action.label })),
    optionalAddOns: base.optionalAddOns.map((action, index) => ({ ...action, label: optionalActionLabels[index] ?? action.label })),
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PlannerClient() {
  const t = useTranslations("planner");
  const locale = useLocale();

  const [plannerState, setPlannerState] = useState<{
    templateId: string;
    departureDate: string;
    checks: Record<string, boolean>;
    now: number;
  } | null>(null);

  const [weather, setWeather] = useState<{ forTemplate: string; data: WeatherData[] } | null>(null);
  const [jpyInput, setJpyInput] = useState("");
  const [usdResult, setUsdResult] = useState("");
  const [rate, setRate] = useState(155);

  const mounted = plannerState !== null;
  const templateId = plannerState?.templateId ?? "classic-7";
  const departureDate = plannerState?.departureDate ?? "";
  const checks = plannerState?.checks ?? {};

  const setTemplateId = useCallback((id: string) => {
    trackTemplateSelect(id);
    setPlannerState((prev) => {
      if (!prev) return prev;
      localStorage.setItem(LS_PLANNER_TEMPLATE, id);
      return { ...prev, templateId: id };
    });
  }, []);

  const setDepartureDate = useCallback((d: string) => {
    setPlannerState((prev) => {
      if (!prev) return prev;
      localStorage.setItem(LS_PLANNER_DATE, d);
      return { ...prev, departureDate: d };
    });
  }, []);

  const setChecks = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setPlannerState((prev) => {
      if (!prev) return prev;
      const next = updater(prev.checks);
      localStorage.setItem(LS_PLANNER_CHECKS, JSON.stringify(next));
      return { ...prev, checks: next };
    });
  }, []);

  // Hydrate from localStorage + set client time
  useEffect(() => {
    let tid = "classic-7";
    let dd = "";
    let ch: Record<string, boolean> = {};
    try {
      const stored = localStorage.getItem(LS_PLANNER_TEMPLATE);
      if (stored && TEMPLATE_DATA.find((x) => x.id === stored)) tid = stored;
      const d = localStorage.getItem(LS_PLANNER_DATE);
      if (d) dd = d;
      const c = localStorage.getItem(LS_PLANNER_CHECKS);
      if (c) ch = JSON.parse(c);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR requires effect-based localStorage hydration
    setPlannerState({ templateId: tid, departureDate: dd, checks: ch, now: Date.now() });
  }, []);

  const templateData = TEMPLATE_DATA.find((td) => td.id === templateId) ?? TEMPLATE_DATA[0];

  const templateName = t(`routes.${templateData.id}.name`);
  const templateDesc = t(`routes.${templateData.id}.desc`);
  const templateJrNote = t(`routes.${templateData.id}.jrNote`);
  const baseRouteBooking = routeBookingRecommendations[templateData.id] ?? routeBookingRecommendations["classic-7"];
  const routeBooking = localizeRouteBooking(baseRouteBooking, t);

  const templateCities = useMemo(
    () =>
      templateData.cityKeys.map((c) => ({
        key: c.key,
        name: t(`cities.${c.key}`),
        days: t(`dayRanges.${c.daysKey}`),
        emoji: c.emoji,
      })),
    [templateData, t],
  );

  // Countdown
  const daysUntil = useMemo(() => {
    if (!departureDate || !plannerState) return null;
    const diff = new Date(departureDate + "T00:00:00").getTime() - plannerState.now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / 86400000);
  }, [departureDate, plannerState]);

  const weatherLoading = weather === null || weather.forTemplate !== templateId;

  // Fetch weather for route cities
  useEffect(() => {
    const uniqueKeys = [...new Set(
      templateData.cityKeys.map((c) => c.key).filter((key) => CITY_COORDS[key]),
    )];
    if (uniqueKeys.length === 0) return;

    const lats = uniqueKeys.map((k) => CITY_COORDS[k].lat).join(",");
    const lngs = uniqueKeys.map((k) => CITY_COORDS[k].lng).join(",");
    const tid = templateData.id;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia/Tokyo&forecast_days=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [data];
        const results: WeatherData[] = [];
        items.forEach((d, i) => {
          if (d.current && uniqueKeys[i]) {
            results.push({
              cityKey: uniqueKeys[i],
              temp: d.current.temperature_2m,
              code: d.current.weather_code,
              high: d.daily?.temperature_2m_max?.[0] ?? d.current.temperature_2m,
              low: d.daily?.temperature_2m_min?.[0] ?? d.current.temperature_2m,
              precip: d.daily?.precipitation_probability_max?.[0] ?? 0,
            });
          }
        });
        setWeather({ forTemplate: tid, data: results });
      })
      .catch(() => setWeather({ forTemplate: tid, data: [] }));
  }, [templateData]);

  // Fetch exchange rate
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates?.JPY) setRate(data.rates.JPY);
      })
      .catch(() => {});
  }, []);

  const handleJpy = (v: string) => {
    setJpyInput(v);
    const n = parseFloat(v);
    setUsdResult(isNaN(n) ? "" : `$${(n / rate).toFixed(2)}`);
  };

  const toggleCheck = useCallback((id: string) => {
    setChecks((prev) => {
      if (!prev[id]) trackChecklistComplete(id);
      return { ...prev, [id]: !prev[id] };
    });
  }, [setChecks]);

  const checkedCount = CHECKLIST_DATA.filter((c) => checks[c.id]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-sky-700">{t("badge")}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
            {t("title")}
          </h1>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          {t("home")}
        </Link>
      </div>

      {/* Countdown banner */}
      {mounted && departureDate && daysUntil !== null && (
        <div className="rounded-[18px] border border-sky-200 bg-sky-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-5 w-5 text-sky-600" />
              <div>
                <p className="text-sm font-semibold text-sky-900">
                  {daysUntil === 0
                    ? t("departureDay")
                    : t("daysUntil", { count: daysUntil })}
                </p>
                <p className="text-xs text-sky-700">{departureDate}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sky-700">
                {checkedCount}/{CHECKLIST_DATA.length}
              </p>
              <p className="text-[10px] text-sky-600">{t("tasksDone")}</p>
            </div>
          </div>
          {checkedCount > 0 && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sky-200">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${(checkedCount / CHECKLIST_DATA.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Route selector */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step1")}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("chooseRoute")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TEMPLATE_DATA.map((td) => (
                <button
                  key={td.id}
                  type="button"
                  onClick={() => setTemplateId(td.id)}
                  className={[
                    "rounded-2xl border px-4 py-3 text-left transition-all",
                    templateId === td.id
                      ? "border-sky-300 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{t(`routes.${td.id}.name`)}</p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {t(`routes.${td.id}.duration`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t(`routes.${td.id}.desc`)}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Route timeline */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {t("routeLabel", { name: templateName })}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{templateDesc}</p>
              </div>
              <Link
                href={`/itineraries/${templateData.itinerarySlug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
              >
                {t("fullItinerary")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="mt-5">
              {templateCities.map((city, i) => (
                <div key={`${city.key}-${i}`} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sm">
                      {city.emoji}
                    </div>
                    {i < templateCities.length - 1 && (
                      <div className="w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="text-sm font-semibold text-slate-900">{city.name}</p>
                    <p className="text-xs text-slate-500">{city.days}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* JR Pass route-specific note */}
            <div className={[
              "rounded-xl border px-3 py-2.5 text-xs",
              templateData.jrPassWorthIt
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800",
            ].join(" ")}>
              <span className="font-semibold">
                {templateData.jrPassWorthIt ? t("jrRecommended") : t("jrMayNotPayOff")}
              </span>
              <span className="ml-1">{templateJrNote}</span>
            </div>
          </section>

          {/* Departure date */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step2")}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("setDate")}</h2>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 sm:w-64"
            />
          </section>

          {/* Pre-departure checklist */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase text-slate-500">{t("step3")}</p>
            <div className="flex items-center justify-between">
              <h2 className="mt-1 text-lg font-semibold text-slate-950">{t("checklist")}</h2>
              {mounted && (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  {checkedCount}/{CHECKLIST_DATA.length}
                </span>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {CHECKLIST_DATA.map((item) => {
                const isDone = mounted && checks[item.id];
                const isExternal = item.href?.startsWith("http") || item.affiliate?.provider === "trip";
                const checkLinkLabel = item.id === "hotel" ? t("checkLinks.hotel") : item.hasLink ? t(`checkLinks.${item.id}`) : "";
                return (
                  <div
                    key={item.id}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all",
                      isDone
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-white",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 transition-colors hover:border-[#168a56]"
                    >
                      {isDone && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                    <span
                      className={[
                        "flex-1 text-sm",
                        isDone
                          ? "text-emerald-700 line-through decoration-emerald-300"
                          : "text-slate-800",
                      ].join(" ")}
                    >
                      {item.critical && !isDone && (
                        <span className="mr-1 text-amber-500">!</span>
                      )}
                      {t(`checks.${item.id}`)}
                    </span>
                    {item.hasLink && item.href && !isDone && (
                      isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel={AFFILIATE_REL}
                          onClick={() =>
                            trackAffiliateClick({
                              category: item.affiliate?.category ?? (item.id === "esim" ? "esim" : item.id === "train" ? "train" : item.id === "insurance" ? "insurance" : "activity"),
                              provider: item.affiliate?.provider ?? getProviderFromHref(item.href ?? ""),
                              placement: "next_steps",
                              page_path: "/planner",
                              locale,
                              href: item.affiliate?.href ?? item.href ?? "",
                              label: item.affiliate?.label ?? checkLinkLabel,
                              area: item.affiliate?.area,
                            })
                          }
                          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e66700]"
                        >
                          {checkLinkLabel}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#168a56] bg-[#168a56] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                        >
                          {checkLinkLabel}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] text-slate-400">
              {t("partnerNote")}
            </p>
            {mounted && checkedCount === CHECKLIST_DATA.length && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
                {t("allSet")}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div className="lg:sticky lg:top-6 space-y-6 self-start">
          <RouteBookingStack {...routeBooking} routeTitle={templateName} locale={locale} />

          {/* Weather */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-950">{t("weather.title")}</h3>
            </div>
            <div className="mt-3 space-y-2">
              {weatherLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : weather && weather.data.length > 0 ? (
                weather.data.map((w) => (
                  <div
                    key={w.cityKey}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{weatherIcon(w.code)}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{t(`cities.${w.cityKey}`)}</p>
                        <p className="text-[10px] text-slate-500">
                          {t("weather.highShort")} {Math.round(w.high)}° / {t("weather.lowShort")} {Math.round(w.low)}°
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800">{Math.round(w.temp)}°</p>
                      {w.precip > 0 && (
                        <p className="text-[10px] text-sky-600">💧 {w.precip}%</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">{t("weather.unavailable")}</p>
              )}
            </div>
          </section>

          {/* Currency */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-950">{t("currency.title")}</h3>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              $1 = ¥{rate.toFixed(0)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-400">JPY</label>
                <input
                  type="number"
                  value={jpyInput}
                  onChange={(e) => handleJpy(e.target.value)}
                  placeholder="10000"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300"
                />
              </div>
              <span className="mt-4 text-slate-400">→</span>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-400">USD</label>
                <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {usdResult || "—"}
                </div>
              </div>
            </div>
          </section>

          {/* Emergency contacts */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-950">{t("emergency.title")}</h3>
            </div>
            <p className="mt-1 text-[10px] text-amber-600">{t("emergency.save")}</p>
            <div className="mt-3 space-y-2">
              {EMERGENCY_DATA.map((e) => (
                <div
                  key={e.number}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{e.emoji}</span>
                    <span className="text-xs font-medium text-slate-700">{t(`emergency.${e.key}`)}</span>
                  </div>
                  <a
                    href={`tel:${e.number}`}
                    className="text-xs font-bold text-sky-700"
                  >
                    {e.number}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Quick links */}
          <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-950">{t("quickLinks.title")}</h3>
            <div className="mt-3 space-y-1.5">
              {([
                { key: "airport", href: "/airport-transfers/narita-to-shinjuku", icon: Plane },
                { key: "stay", href: "/areas-to-stay/tokyo-first-time", icon: MapPin },
                { key: "seat", href: "/", icon: Train },
                { key: "itinerary", href: `/itineraries/${templateData.itinerarySlug}`, icon: Calendar },
                { key: "map", href: "/command-center", icon: MapPin },
              ] as const).map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-white"
                >
                  <link.icon className="h-3.5 w-3.5 text-slate-400" />
                  {t(`quickLinks.${link.key}`)}
                  <ArrowRight className="ml-auto h-3 w-3 text-slate-300" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
