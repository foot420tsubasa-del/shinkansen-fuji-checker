"use client";

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
}: {
  href: string;
  label: string;
  note: string;
  placement: AffiliatePlacement;
  linkId: string;
  adid?: string;
  locale: string;
  pagePath: string;
  className?: string;
}) {
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
        className="font-semibold text-[#c2410c] underline underline-offset-2 hover:text-[#9a3412]"
      >
        {label}
      </a>
      <span className="mt-0.5 block text-[10.5px] text-slate-500">{note}</span>
    </p>
  );
}
