"use client";

import { useEffect } from "react";
import { trackScenicFilter, trackScenicRouteView } from "@/lib/analytics";

/** Fires scenic_filter_apply once when /scenic opens with filters (it is a GET form, so each search is a page load). */
export function ScenicFilterTracker(props: { view?: string; region?: string; season?: string; results: number; best?: number }) {
  useEffect(() => {
    if (!props.view && !props.region && !props.season) return;
    trackScenicFilter(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per page load
  }, []);
  return null;
}

/** Fires scenic_route_view once per route guide, noting whether the reader came from /scenic. */
export function ScenicRouteViewTracker({ routeId, locale }: { routeId: string; locale: string }) {
  useEffect(() => {
    let fromHub = false;
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      fromHub = Boolean(ref && ref.host === window.location.host && /\/scenic\/?$/.test(ref.pathname));
    } catch {
      // referrer is best-effort
    }
    trackScenicRouteView({ route_id: routeId, from_hub: fromHub, locale });
  }, [routeId, locale]);
  return null;
}
