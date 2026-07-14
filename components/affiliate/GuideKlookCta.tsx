"use client";

import { useEffect, useRef, useState } from "react";
import {
  trackAffiliateClick,
  trackAffiliateCtaView,
} from "@/lib/analytics";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { DirectionId } from "@/lib/seat-checker";

/**
 * Direction persisted by the home Seat Checker (localStorage) so the guide's
 * Klook CTA and mobile sticky can react to an answered check. Shared between
 * GuideKlookCta and GuideStickyCta.
 */
export const SEAT_DIRECTION_STORAGE_KEY = "fs-seat-direction";

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
}: {
  href: string;
  locale: string;
  copy: GuideKlookCtaCopy;
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
          placement: "guide_quick_answer",
          page_path: "/guide",
          link_id: "guide_klook_quick_answer",
          locale,
        });
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [locale]);

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
            placement: "guide_quick_answer",
            link_id: "guide_klook_quick_answer",
            page_path: "/guide",
            page_type: "shinkansen_guide",
            locale,
            href,
            label: copy.button,
            ...directionGaParams(direction),
          })
        }
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94A32]/40 focus-visible:ring-offset-2"
      >
        {copy.button}
      </a>
    </section>
  );
}
