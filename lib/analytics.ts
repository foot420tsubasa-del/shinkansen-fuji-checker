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
  area_id?: string;
  city?: string;
  rank?: number;
  itinerary_slug?: string;
  day_number?: number;
  cta_type?: "stay" | "booking" | "prepare" | "esim" | "rail" | "seat_checker" | "guide";
  hotel_name?: string;
  hotel_id?: string;
  sub_id?: string;
  route?: string;
  route_type?: string;
  transport_type?: string;
  route_from?: string;
  route_to?: string;
  url_status?: string;
};

export function getProviderFromHref(href: string): AffiliateClickParams["provider"] {
  try {
    const host = new URL(href).hostname;
    if (host.includes("klook")) return "klook";
    if (host.includes("agoda")) return "agoda";
    if (host.includes("booking.com") || host.includes("travelpayouts") || host.includes("tp.media")) return "booking_travelpayouts";
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
      area_id: params.area_id,
      city: params.city ?? registryMeta.city,
      rank: params.rank,
      itinerary_slug: params.itinerary_slug,
      day_number: params.day_number,
      cta_type: params.cta_type,
      hotel_name: params.hotel_name,
      hotel_id: params.hotel_id,
      sub_id: params.sub_id,
      route: params.route,
      route_type: params.route_type,
      transport_type: params.transport_type ?? registryMeta.transport_type,
      route_from: params.route_from ?? registryMeta.route_from,
      route_to: params.route_to ?? registryMeta.route_to,
      url_status: params.url_status ?? registryMeta.url_status,
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

export function trackInternalLinkClick(params: {
  source_page: string;
  placement: string;
  target_path: string;
  link_label: string;
  locale?: string;
}) {
  trackEvent({
    action: "internal_link_click",
    category: "navigation",
    label: params.link_label,
    params: {
      source_page: params.source_page,
      placement: params.placement,
      target_path: params.target_path,
      link_label: params.link_label,
      locale: params.locale,
    },
  });
}

export function trackStayAreaFilterClick(params: {
  filter_id: string;
  filter_label: string;
  page_path: string;
  result_count: number;
  top_area_id_after_filter: string;
  top_area_score_after_filter: number;
}) {
  trackEvent({
    action: "stay_area_filter_click",
    category: "stay_area_index",
    label: params.filter_label,
    params,
  });
}

export function trackStayAreaDetailSelect(params: {
  area_id: string;
  area_name: string;
  overall_score: number;
  rank_position: number;
  match_label: string;
  crowd_level: string;
  complexity_level: string;
  page_path: string;
}) {
  trackEvent({
    action: "stay_area_detail_select",
    category: "stay_area_index",
    label: params.area_name,
    params,
  });
}

export function trackStayAreaContinueClick(params: {
  area_id?: string;
  target_path: string;
  link_label: string;
  placement: string;
  page_path: string;
}) {
  trackEvent({
    action: "stay_area_continue_click",
    category: "stay_area_index",
    label: params.link_label,
    params,
  });
}

export function trackFinderStart(params: {
  page_path: string;
  locale?: string;
}) {
  trackEvent({
    action: "finder_start",
    category: "tokyo_hotel_area_finder",
    label: "Start",
    params,
  });
}

export function trackFinderStepAnswered(params: {
  step_id: string;
  step_label: string;
  answer_ids: string;
  answer_count: number;
  page_path: string;
  locale?: string;
}) {
  trackEvent({
    action: "finder_step_answered",
    category: "tokyo_hotel_area_finder",
    label: params.step_label,
    params,
  });
}

export function trackFinderResultsView(params: {
  page_path: string;
  locale?: string;
  result_count: number;
  top_area_id: string;
  top_area_score: number;
}) {
  trackEvent({
    action: "finder_results_view",
    category: "tokyo_hotel_area_finder",
    label: params.top_area_id,
    params,
  });
}

export function trackFinderAreaDetailsClick(params: {
  area_id: string;
  area_name: string;
  rank: number;
  page_path: string;
  locale?: string;
}) {
  trackEvent({
    action: "finder_area_details_click",
    category: "tokyo_hotel_area_finder",
    label: params.area_name,
    params,
  });
}

export function trackFinderShowMoreClick(params: {
  action_type: "show_more_matches" | "compare_all_areas";
  visible_count: number;
  page_path: string;
  locale?: string;
}) {
  trackEvent({
    action: "finder_show_more_click",
    category: "tokyo_hotel_area_finder",
    label: params.action_type,
    params,
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
