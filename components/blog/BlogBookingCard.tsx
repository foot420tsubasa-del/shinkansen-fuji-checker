"use client";

import { ArrowRight, Train } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";

/**
 * The one booking card in a blog post: the Tokyo → Kyoto route link, the
 * best-converting slot on the site, under its own placement so the blog's
 * contribution can be read separately.
 */
export function BlogBookingCard({
  href,
  linkId,
  adid,
  slug,
}: {
  href: string;
  linkId: string;
  adid?: string;
  slug: string;
}) {
  return (
    <div className="not-prose rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-ink">Tokyo → Kyoto / Osaka</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Reserved Shinkansen seats. Ask for Seat E if it is still there.</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Klook</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel={AFFILIATE_REL}
        onClick={() =>
          trackAffiliateClick({
            category: "train",
            provider: "klook",
            placement: "blog_article_booking",
            href,
            label: slug,
            link_id: linkId,
            product: "shinkansen_ticket",
            adid,
          })
        }
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-fuji px-5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(217,74,50,0.28)] transition-colors hover:bg-fuji-hover"
      >
        <Train className="h-4 w-4" aria-hidden="true" />
        Book on Klook
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
      <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">
        We may earn a commission if you book through this link, at no extra cost to you.
      </p>
    </div>
  );
}
