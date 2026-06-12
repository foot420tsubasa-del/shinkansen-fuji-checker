"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Mobile-only sticky bottom CTA bar.
 *
 * Travel-affiliate traffic is overwhelmingly mobile, and the page-level
 * provider CTAs scroll out of view long before the reader finishes the
 * content. This bar keeps ONE high-intent action reachable at all times
 * without adding a new CTA to the desktop layout (hidden at md+).
 *
 * Behaviour:
 * - Hidden until the reader scrolls past `showAfterPx` (so it never covers
 *   the hero CTA they can already see).
 * - Slides up from the bottom; respects iOS safe-area insets.
 * - Pure presentation: the child is expected to be an existing tracked
 *   link component (ProviderButton / TrackedAffiliateLink), so all
 *   affiliate_click analytics flow through unchanged.
 */
export function StickyMobileCta({
  children,
  showAfterPx = 480,
}: {
  children: ReactNode;
  showAfterPx?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfterPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterPx]);

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2.5 shadow-[0_-6px_20px_rgba(15,23,42,0.14)] backdrop-blur transition-transform duration-200 md:hidden",
        "pb-[calc(0.625rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
