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
  provider: "klook" | "agoda" | "trip" | "other";
  placement:
    | "guide_top"
    | "seat_result"
    | "stay_area"
    | "itinerary_day_card"
    | "airport_transfer"
    | "local_tokyo"
    | "footer"
    | "next_steps"
    | "home_popular"
    | "home_essentials"
    | "home_after_seat"
    | "train_signs_quick_answer"
    | "train_signs_google_maps"
    | "train_signs_checklist";
  page_path?: string;
  locale?: string;
  href: string;
  label: string;
  area?: string;
  itinerary_slug?: string;
  day_number?: number;
  cta_type?: "stay" | "booking" | "prepare" | "esim" | "rail" | "seat_checker" | "guide";
  hotel_name?: string;
};

export function getProviderFromHref(href: string): AffiliateClickParams["provider"] {
  try {
    const host = new URL(href).hostname;
    if (host.includes("klook")) return "klook";
    if (host.includes("agoda")) return "agoda";
    if (host.includes("trip.com")) return "trip";
  } catch {
    return "other";
  }
  return "other";
}

export function trackAffiliateClick(params: AffiliateClickParams) {
  const pagePath =
    params.page_path ??
    (typeof window === "undefined" ? undefined : window.location.pathname);
  trackEvent({
    action: "affiliate_click",
    category: params.category,
    label: params.label,
    params: {
      provider: params.provider,
      placement: params.placement,
      page_path: pagePath,
      locale: params.locale,
      href: params.href,
      label: params.label,
      area: params.area,
      itinerary_slug: params.itinerary_slug,
      day_number: params.day_number,
      cta_type: params.cta_type,
      hotel_name: params.hotel_name,
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
