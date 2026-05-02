type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  params?: Record<string, string | number | boolean | undefined>;
};

export function trackEvent({ action, category, label, value, params }: GtagEvent) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
    ...params,
  });
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
    | "next_steps";
  page_path?: string;
  locale?: string;
  href: string;
  label: string;
  area?: string;
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

export function trackAffiliateClick(provider: string, destination: string): void;
export function trackAffiliateClick(params: AffiliateClickParams): void;
export function trackAffiliateClick(
  providerOrParams: string | AffiliateClickParams,
  destination?: string,
) {
  if (typeof providerOrParams === "string") {
    trackEvent({
      action: "affiliate_click",
      category: providerOrParams,
      label: destination,
      params: {
        provider: providerOrParams,
        label: destination,
        page_path: typeof window === "undefined" ? undefined : window.location.pathname,
      },
    });
    return;
  }
  const pagePath =
    providerOrParams.page_path ??
    (typeof window === "undefined" ? undefined : window.location.pathname);
  trackEvent({
    action: "affiliate_click",
    category: providerOrParams.category,
    label: providerOrParams.label,
    params: {
      provider: providerOrParams.provider,
      placement: providerOrParams.placement,
      page_path: pagePath,
      locale: providerOrParams.locale,
      href: providerOrParams.href,
      label: providerOrParams.label,
      area: providerOrParams.area,
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
