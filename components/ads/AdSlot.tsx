"use client";

import Script from "next/script";
import { useEffect } from "react";
import {
  getAdsenseClientId,
  getAdsenseSlot,
  isAdsenseEnabled,
  type AdFormat,
  type AdPlacement,
} from "@/lib/ads";

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
  format?: AdFormat;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ placement, className = "", format = "horizontal" }: AdSlotProps) {
  const enabled = isAdsenseEnabled();
  const clientId = getAdsenseClientId();
  const slotId = getAdsenseSlot(placement);
  const canRender = enabled && clientId.length > 0 && slotId.length > 0;

  useEffect(() => {
    if (!canRender) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ad blockers or script timing can prevent AdSense initialization.
    }
  }, [canRender, placement]);

  if (!canRender) return null;

  const minHeight =
    format === "rectangle" ? "min-h-[280px]" : format === "fluid" ? "min-h-[180px]" : "min-h-[96px]";

  return (
    <aside
      aria-label="Advertisement"
      className={`my-8 rounded-[18px] border border-slate-200 bg-white/80 p-3 shadow-sm ${minHeight} ${className}`}
    >
      <Script
        id="adsense-script"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
      />
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format === "rectangle" ? "auto" : format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
