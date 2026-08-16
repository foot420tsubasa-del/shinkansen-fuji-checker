"use client";

import { useEffect, useRef, useState } from "react";
import {
  trackAffiliateClick,
  trackAffiliateCtaView,
  type AffiliateClickParams,
} from "@/lib/analytics";
import type { AffiliatePlacement } from "@/lib/affiliate/links";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { DirectionId } from "@/lib/seat-checker";

/**
 * Direction persisted by the home Seat Checker (localStorage) so the guide's
 * Klook CTA and mobile sticky can react to an answered check. Shared between
 * GuideKlookCta and GuideStickyCta.
 */
export const SEAT_DIRECTION_STORAGE_KEY = "fs-seat-direction";

/**
 * Shared shape for the filled Klook CTA (design system "purchase" tier, md).
 * Full width on phones so it stays a comfortable thumb target; capped on
 * desktop, where w-full was producing 900px-wide buttons inside the article
 * column. Height is pinned so the tier reads the same everywhere.
 */
export const KLOOK_FILLED_CTA =
  "inline-flex min-h-12 md:min-h-11 w-full sm:w-auto sm:min-w-[15rem] sm:max-w-[22rem] items-center justify-center gap-2 rounded-[12px] border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94A32]/40";

export function readStoredDirection(): DirectionId | null {
  try {
    const raw = window.localStorage.getItem(SEAT_DIRECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { direction?: string };
    return parsed.direction === "tokyo-osaka" || parsed.direction === "osaka-tokyo"
      ? parsed.direction
      : null;
  } catch {
    return null;
  }
}

export function directionGaParams(direction: DirectionId | null) {
  if (direction === "tokyo-osaka") {
    return { direction, origin: "tokyo", destination: "kyoto-osaka", selected_seat: "E" };
  }
  if (direction === "osaka-tokyo") {
    return { direction, origin: "kyoto-osaka", destination: "tokyo", selected_seat: "E" };
  }
  return {};
}

export type GuideKlookCtaCopy = {
  title: string;
  note: string;
  button: string;
  dirToKyoto: string;
  dirToTokyo: string;
  dirSeatNote: string;
};

/**
 * The guide's primary Shinkansen booking CTA (Quick Answer position).
 * Klook only — no Omio anywhere near this slot (revenue-funnel spec).
 * After the Seat Checker has been answered, the heading switches to the
 * direction-specific copy; the link target stays the verified Klook
 * Shinkansen link (no unverified deep links are invented).
 */
export function GuideKlookCta({
  href,
  locale,
  copy,
  placement = "guide_quick_answer",
  linkId = "guide_klook_quick_answer",
  pagePath = "/guide",
  pageType = "shinkansen_guide",
}: {
  href: string;
  locale: string;
  copy: GuideKlookCtaCopy;
  /** Overridable so other booking-intent pages report separately in GA4. */
  placement?: AffiliatePlacement;
  linkId?: string;
  pagePath?: string;
  pageType?: AffiliateClickParams["page_type"];
}) {
  const [direction, setDirection] = useState<DirectionId | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    // Deferred: reads browser storage after paint, avoiding a sync
    // setState-in-effect cascade (and any hydration mismatch).
    const id = window.setTimeout(() => setDirection(readStoredDirection()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || viewedRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (viewedRef.current) return;
      if (entries.some((entry) => entry.isIntersecting)) {
        viewedRef.current = true;
        trackAffiliateCtaView({
          provider: "klook",
          product: "shinkansen",
          placement,
          page_path: pagePath,
          link_id: linkId,
          locale,
        });
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [locale, placement, linkId, pagePath]);

  const heading = direction === "tokyo-osaka" ? copy.dirToKyoto : direction === "osaka-tokyo" ? copy.dirToTokyo : copy.title;
  const note = direction ? copy.dirSeatNote : copy.note;

  return (
    <section
      ref={rootRef}
      className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/70 lg:px-5"
    >
      <p className="text-sm font-semibold text-slate-950">{heading}</p>
      <p className="mt-1 text-[12px] leading-5 text-slate-600">{note}</p>
      <a
        href={href}
        target="_blank"
        rel={AFFILIATE_REL}
        onClick={() =>
          trackAffiliateClick({
            category: "train",
            provider: "klook",
            product: "shinkansen",
            placement,
            link_id: linkId,
            page_path: pagePath,
            page_type: pageType,
            locale,
            href,
            label: copy.button,
            ...directionGaParams(direction),
          })
        }
        className={`mt-3 ${KLOOK_FILLED_CTA}`}
      >
        {copy.button}
      </a>
    </section>
  );
}
