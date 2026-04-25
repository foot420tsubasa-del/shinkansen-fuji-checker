type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GtagEvent) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export function trackAffiliateClick(provider: string, destination: string) {
  trackEvent({
    action: "affiliate_click",
    category: provider,
    label: destination,
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
