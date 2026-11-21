"use client";

import { ExternalLink } from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";
import type { AffiliatePlacement } from "@/lib/affiliate/links";
import { AFFILIATE_REL } from "@/lib/link-rel";

/**
 * A quiet, in-text Klook link for the guide (2026-11-17): one sentence, not a
 * button, so the seat checker's booking CTA right below stays the main
 * action. Tracked under its own placement, with the commission line.
 */
export function GuideKlookTextLink({
  href,
  label,
  note,
  placement,
  linkId,
  adid,
  locale,
  pagePath,
  className = "",
  variant = "text",
}: {
  href: string;
  label: string;
  /** Omit when the page's one disclosure already sits above this link. */
  note?: string;
  placement: AffiliatePlacement;
  linkId: string;
  adid?: string;
  locale: string;
  pagePath: string;
  className?: string;
  /** "button" (2026-11-21, user request): a filled CTA instead of the in-text link. Tracking is identical. */
  variant?: "text" | "button";
}) {
  const asButton = variant === "button";
  // A trailing arrow belongs to the text-link style; the button has its own icon.
  const text = asButton ? label.replace(/\s*[→›»]\s*$/, "") : label;
  return (
    <p className={className}>
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
            adid,
            page_path: pagePath,
            page_type: "shinkansen_guide",
            locale,
            href,
            label,
          })
        }
        className={
          asButton
            ? "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-fuji px-5 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-fuji-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
            : "font-semibold text-[#c2410c] underline underline-offset-2 hover:text-[#9a3412]"
        }
      >
        {text}
        {asButton ? <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      </a>
      {note ? <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{note}</span> : null}
    </p>
  );
}
