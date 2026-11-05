import Script from "next/script";
import { getAdsenseClientId, isAdsenseEnabled } from "@/lib/ads";

/**
 * Loads the AdSense tag once, site-wide.
 *
 * It used to load from inside AdSlot, which meant it was absent from every
 * page without an ad unit — including /guide, which is 69% of the site's
 * traffic. Two things depend on it being present regardless of whether a unit
 * renders: Google's review of the site, and the consent message shown to
 * readers in the EEA, the UK and Switzerland, who are 26% of search clicks.
 *
 * It stays behind NEXT_PUBLIC_ADSENSE_ENABLED, so nothing loads until the
 * account is approved and the flag is set.
 *
 * Auto ads must stay off in the AdSense console. Given a free hand, Google
 * places units wherever it likes, and the seat checker's result CTA is the one
 * slot on this site that earns — 3.80% against 0.43% for everything shown
 * before a reader interacts. Ad units go where this codebase puts them.
 */
export function AdsenseScript() {
  if (!isAdsenseEnabled()) return null;
  const clientId = getAdsenseClientId();
  if (!clientId) return null;

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
