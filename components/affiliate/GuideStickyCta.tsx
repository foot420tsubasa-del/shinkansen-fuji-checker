"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  trackAffiliateClick,
  trackAffiliateCtaView,
} from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { DirectionId } from "@/lib/seat-checker";
import { directionGaParams, readStoredDirection } from "./GuideKlookCta";

const DISMISS_KEY = "fs-guide-sticky-dismissed";

export type GuideStickyCtaCopy = {
  confirmed: string;
  button: string;
};

/**
 * Guide mobile sticky CTA (revenue-funnel spec, Phase 1-6):
 * - Shows ONLY after the Seat Checker has been answered (direction stored),
 *   so it never appears for cold visitors.
 * - Dismissible; stays dismissed for the rest of the session.
 * - Auto-hides near the footer, never covers it.
 * - Fixed overlay + transform animation only — zero CLS.
 * - Mobile only (hidden at md+).
 */
export function GuideStickyCta({
  href,
  locale,
  copy,
}: {
  href: string;
  locale: string;
  copy: GuideStickyCtaCopy;
}) {
  const [direction, setDirection] = useState<DirectionId | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDirection(readStoredDirection());
      try {
        setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
      } catch {
        setDismissed(false);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      setNearFooter(entries.some((entry) => entry.isIntersecting));
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const visible = Boolean(direction) && !dismissed && scrolled && !nearFooter;

  useEffect(() => {
    if (!visible || viewedRef.current) return;
    viewedRef.current = true;
    trackAffiliateCtaView({
      provider: "klook",
      product: "shinkansen",
      placement: "guide_mobile_sticky_after_checker",
      page_path: "/guide",
      link_id: "guide_klook_mobile_sticky",
      locale,
    });
  }, [visible, locale]);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Session storage is best-effort.
    }
  };

  return (
    <div
      aria-hidden={!visible}
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 shadow-[0_-6px_20px_rgba(15,23,42,0.14)] backdrop-blur transition-transform duration-200 md:hidden",
        "pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            {copy.confirmed}
          </p>
          <a
            href={href}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() =>
              trackAffiliateClick({
                category: "train",
                provider: "klook",
                product: "shinkansen",
                placement: "guide_mobile_sticky_after_checker",
                link_id: "guide_klook_mobile_sticky",
                page_path: "/guide",
                page_type: "shinkansen_guide",
                locale,
                href,
                label: copy.button,
                ...directionGaParams(direction),
              })
            }
            className="mt-1 inline-flex min-h-10 w-full items-center justify-center rounded-[10px] border border-[#D94A32] bg-[#D94A32] px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#bf3d28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94A32]/40"
          >
            {copy.button}
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
