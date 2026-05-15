import { resolveAffiliateClickMetadata, type AffiliatePlacement, type AffiliateProvider } from "@/lib/affiliate/links";

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  params?: Record<string, string | number | boolean | undefined>;
};

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

function isGaDebugMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("ga_debug") === "1";
}

export function trackEvent({ action, category, label, value, params }: GtagEvent) {
  if (typeof window === "undefined") return;
  const gaWindow = window as GtagWindow;
  const eventParams = {
    event_category: category,
    event_label: label,
    value,
    ...params,
    ...(isGaDebugMode() ? { debug_mode: true } : {}),
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[GA4 event]", action, eventParams);
  }

  if (gaWindow.gtag) {
    gaWindow.gtag("event", action, eventParams);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    gaWindow.dataLayer = gaWindow.dataLayer || [];
    gaWindow.dataLayer.push(["event", action, eventParams]);
  }
}

export type AffiliateClickParams = {
  category: "hotel" | "esim" | "transfer" | "train" | "activity" | "tour" | "insurance";
  provider: AffiliateProvider;
  placement: AffiliatePlacement;
  page_path?: string;
  locale?: string;
  href: string;
  label: string;
  link_id?: string;
  product?: string;
  adid?: string;
  area?: string;
  city?: string;
  itinerary_slug?: string;
  day_number?: number;
  cta_type?: "stay" | "booking" | "prepare" | "esim" | "rail" | "seat_checker" | "guide";
  hotel_name?: string;
  route?: string;
  route_type?: string;
};

export function getProviderFromHref(href: string): AffiliateClickParams["provider"] {
  try {
    const host = new URL(href).hostname;
    if (host.includes("klook")) return "klook";
    if (host.includes("agoda")) return "agoda";
    if (host.includes("trip.com")) return "trip";
    if (host.includes("omio")) return "omio";
  } catch {
    return "other";
  }
  return "other";
}

export function trackAffiliateClick(params: AffiliateClickParams) {
  const pagePath =
    params.page_path ??
    (typeof window === "undefined" ? undefined : window.location.pathname);
  const registryMeta = resolveAffiliateClickMetadata({
    linkId: params.link_id,
    href: params.href,
    provider: params.provider,
    label: params.label,
  });
  trackEvent({
    action: "affiliate_click",
    category: params.category,
    label: params.label,
    params: {
      provider: registryMeta.provider ?? params.provider,
      product: params.product ?? registryMeta.product,
      adid: params.adid ?? registryMeta.adid,
      placement: params.placement,
      page_path: pagePath,
      locale: params.locale,
      href: params.href,
      label: params.label,
      link_id: params.link_id ?? registryMeta.link_id,
      destination_type: registryMeta.destination_type,
      link_source: registryMeta.link_source,
      area: params.area,
      city: params.city,
      itinerary_slug: params.itinerary_slug,
      day_number: params.day_number,
      cta_type: params.cta_type,
      hotel_name: params.hotel_name,
      route: params.route,
      route_type: params.route_type,
      transport_type: "beacon",
    },
  });
}

export function trackSeatCheckComplete(params: {
  direction: string;
  route: string;
  result_seat: string;
  result_side: string;
  locale?: string;
  page_path?: string;
}) {
  trackEvent({
    action: "seat_check_complete",
    category: "seat_checker",
    label: `${params.direction} → ${params.result_seat}`,
    params: {
      direction: params.direction,
      route: params.route,
      result_seat: params.result_seat,
      result_side: params.result_side,
      locale: params.locale,
      page_path:
        params.page_path ??
        (typeof window === "undefined" ? undefined : window.location.pathname),
    },
  });
}

export function trackCtaClick(params: {
  placement: string;
  label: string;
  href: string;
  category?: string;
  page_path?: string;
  locale?: string;
  cta_type?: string;
}) {
  trackEvent({
    action: "cta_click",
    category: params.category ?? "navigation",
    label: params.label,
    params: {
      placement: params.placement,
      page_path:
        params.page_path ??
        (typeof window === "undefined" ? undefined : window.location.pathname),
      locale: params.locale,
      href: params.href,
      label: params.label,
      cta_type: params.cta_type,
    },
  });
}

export function trackShareClick(params: {
  platform: "native" | "copy" | "x" | "facebook" | "linkedin";
  page_path?: string;
  locale?: string;
  placement: string;
  label: string;
}) {
  trackEvent({
    action: "share_click",
    category: "share",
    label: params.label,
    params: {
      platform: params.platform,
      page_path:
        params.page_path ??
        (typeof window === "undefined" ? undefined : window.location.pathname),
      locale: params.locale,
      placement: params.placement,
      label: params.label,
    },
  });
}

export function trackAgodaHotelMapView(params: {
  map_id: string;
  area: string;
  city: string;
  placement: string;
  page_path?: string;
  locale?: string;
}) {
  trackEvent({
    action: "agoda_hotel_map_view",
    category: "hotel",
    label: params.map_id,
    params: {
      provider: "agoda",
      category: "hotel",
      map_id: params.map_id,
      area: params.area,
      city: params.city,
      placement: params.placement,
      page_path:
        params.page_path ??
        (typeof window === "undefined" ? undefined : window.location.pathname),
      locale: params.locale,
    },
  });
}

export function trackAgodaHotelMapClick(params: {
  map_id: string;
  area: string;
  city: string;
  placement: string;
  page_path?: string;
  locale?: string;
}) {
  trackEvent({
    action: "agoda_hotel_map_click",
    category: "hotel",
    label: params.map_id,
    params: {
      provider: "agoda",
      category: "hotel",
      map_id: params.map_id,
      area: params.area,
      city: params.city,
      placement: params.placement,
      page_path:
        params.page_path ??
        (typeof window === "undefined" ? undefined : window.location.pathname),
      locale: params.locale,
    },
  });
}

export function trackChecklistComplete(item: string) {
  trackEvent({
    action: "checklist_complete",
    category: "planner",
    label: item,
  });
}

export function trackTemplateSelect(templateId: string) {
  trackEvent({
    action: "template_select",
    category: "planner",
    label: templateId,
  });
}
