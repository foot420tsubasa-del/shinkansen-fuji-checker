"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import type { AgodaHotelMapConfig } from "@/lib/agoda-hotel-maps";
import { trackAgodaHotelMapClick, trackAgodaHotelMapView } from "@/lib/analytics";

type AgodaHotelMapClientProps = {
  config: AgodaHotelMapConfig;
  placement: string;
  title: string;
  description?: string;
  className?: string;
  locale?: string;
};

export function AgodaHotelMapClient({
  config,
  placement,
  title,
  description,
  className,
  locale,
}: AgodaHotelMapClientProps) {
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackAgodaHotelMapView({
      map_id: config.id,
      area: config.areaName,
      city: config.city,
      placement,
      locale,
    });
  }, [config.areaName, config.city, config.id, locale, placement]);

  const handleClick = () => {
    // Clicks inside third-party iframes cannot be observed reliably from the parent page.
    // This captures clicks on the wrapper or non-iframe embed surface as a supplemental event.
    trackAgodaHotelMapClick({
      map_id: config.id,
      area: config.areaName,
      city: config.city,
      placement,
      locale,
    });
  };

  return (
    <section className={`rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm ${className ?? ""}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-red-700">Agoda hotel map</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>

      <div
        onClick={handleClick}
        className="mt-4 min-h-[320px] overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50"
      >
        {!config.embedCode.trim() && config.iframeUrl.trim() ? (
          <iframe
            src={config.iframeUrl}
            title={title}
            loading="lazy"
            className="min-h-[320px] w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : null}

        {config.embedCode.trim() ? (
          <div
            className="min-w-full [&_iframe]:min-h-[320px] [&_iframe]:w-full [&_iframe]:max-w-full"
            // Agoda Hotel Map embed code is stored from the admin-only screen.
            // This intentionally renders trusted partner-provided HTML; do not expose this input publicly.
            dangerouslySetInnerHTML={{ __html: config.embedCode }}
          />
        ) : null}

        {config.scriptUrl.trim() ? (
          <Script src={config.scriptUrl} strategy="lazyOnload" />
        ) : null}
      </div>
    </section>
  );
}
