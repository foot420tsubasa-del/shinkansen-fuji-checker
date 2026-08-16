"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import {
  trackAffiliateClick,
  trackAffiliateCtaView,
  trackSeatCheckComplete,
} from "@/lib/analytics";
import { getSeatRecommendation, type DirectionId } from "@/lib/seat-checker";
import { SEAT_DIRECTION_STORAGE_KEY, directionGaParams, KLOOK_FILLED_CTA } from "@/components/affiliate/GuideKlookCta";

export type GuideSeatCheckCopy = {
  eyebrow: string;
  question: string;
  dirToKyoto: string;
  dirToTokyo: string;
  /** "{side} side, seat {seat}" — {side}/{seat} are substituted. */
  result: string;
  sideRight: string;
  sideLeft: string;
  greenCar: string;
  bookNote: string;
  book: string;
  /** Conditional JR Pass route — shown under the ticket CTA. */
  jrPassLead: string;
  jrPassLink: string;
};

/**
 * Compact seat checker for the guide (analytics finding, 2026-08):
 * `home_seat_result` is the best-converting affiliate slot on the site, but it
 * only exists on the homepage, which gets a fraction of the guide's organic
 * traffic. This reproduces the answer-then-book moment inline — same
 * recommendation data and the same stored direction as the homepage panel, so
 * the guide's other direction-aware CTAs light up too.
 */
export function GuideSeatCheck({
  href,
  jrPassHref,
  locale,
  pagePath,
  copy,
}: {
  href: string;
  jrPassHref: string;
  locale: string;
  /** Locale-aware path, so GA4 does not fold every language into /guide. */
  pagePath: string;
  copy: GuideSeatCheckCopy;
}) {
  const [direction, setDirection] = useState<DirectionId | null>(null);
  const recommendation = direction ? getSeatRecommendation(direction) : null;

  const choose = (next: DirectionId) => {
    setDirection(next);
    const result = getSeatRecommendation(next);
    // Deferred out of the click handler's render path: Date.now() is impure,
    // and the write only needs to land before the next paint.
    window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          SEAT_DIRECTION_STORAGE_KEY,
          JSON.stringify({ direction: next, ts: Date.now() }),
        );
      } catch {
        // Storage is best-effort.
      }
    }, 0);
    trackSeatCheckComplete({
      direction: next,
      route: next,
      result_seat: result.standardWindowSeat,
      result_side: result.sideLabel,
      locale,
      page_path: pagePath,
    });
    trackAffiliateCtaView({
      provider: "klook",
      product: "shinkansen",
      placement: "guide_seat_result",
      page_path: pagePath,
      link_id: "guide_klook_seat_result",
      locale,
    });
  };

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-[#0b214a]/15 bg-[#f4f8fd] shadow-sm">
      <div className="px-4 py-3.5 lg:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1d4e89]">
          {copy.eyebrow}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{copy.question}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["tokyo-osaka", copy.dirToKyoto],
              ["osaka-tokyo", copy.dirToTokyo],
            ] as Array<[DirectionId, string]>
          ).map(([id, label]) => {
            const active = direction === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                aria-pressed={active}
                className={[
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4e89]/40",
                  active
                    ? "border-[#0b214a] bg-[#0b214a] text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-[#1d4e89] hover:bg-white",
                ].join(" ")}
              >
                {active ? <Check className="h-4 w-4" /> : null}
                {label}
              </button>
            );
          })}
        </div>

        {recommendation ? (
          <div className="mt-3.5 rounded-xl border border-[#0b214a]/15 bg-white p-3.5">
            <p className="text-base font-bold text-slate-950">
              {copy.result
                .replace(
                  "{side}",
                  recommendation.sideLabel === "right" ? copy.sideRight : copy.sideLeft,
                )
                .replace("{seat}", recommendation.standardWindowSeat)}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-slate-600">
              {copy.greenCar.replace("{seat}", recommendation.greenCarWindowSeat)}
            </p>
            <p className="mt-2 text-[12px] leading-5 text-slate-600">{copy.bookNote}</p>
            <a
              href={href}
              target="_blank"
              rel={AFFILIATE_REL}
              onClick={() =>
                trackAffiliateClick({
                  category: "train",
                  provider: "klook",
                  product: "shinkansen",
                  placement: "guide_seat_result",
                  link_id: "guide_klook_seat_result",
                  page_path: pagePath,
                  page_type: "shinkansen_guide",
                  locale,
                  href,
                  label: copy.book,
                  ...directionGaParams(direction),
                })
              }
              className={`mt-3 ${KLOOK_FILLED_CTA}`}
            >
              {copy.book}
              <ArrowRight className="h-4 w-4" />
            </a>
            {/* Klook data: the Pass converts at ~2.5x the single-ticket rate for
                the readers it actually fits, so it gets a route from the
                highest-attention moment — conditional, never as a hard sell. */}
            <p className="mt-2.5 text-[12px] leading-5 text-slate-600">
              {copy.jrPassLead}{" "}
              <a
                href={jrPassHref}
                target="_blank"
                rel={AFFILIATE_REL}
                onClick={() =>
                  trackAffiliateClick({
                    category: "train",
                    provider: "klook",
                    product: "jr_pass",
                    placement: "guide_seat_result_jr_pass",
                    link_id: "jrPass",
                    adid: "1165791",
                    page_path: pagePath,
                    page_type: "shinkansen_guide",
                    locale,
                    href: jrPassHref,
                    label: copy.jrPassLink,
                    ...directionGaParams(direction),
                  })
                }
                className="font-semibold text-[#D94A32] underline underline-offset-2 hover:text-[#bf3d28]"
              >
                {copy.jrPassLink}
              </a>
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
