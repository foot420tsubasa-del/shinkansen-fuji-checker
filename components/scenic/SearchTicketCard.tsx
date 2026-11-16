"use client";

import { ArrowRight, Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";
import { AFFILIATE_LINKS, getAffUrl } from "@/src/affiliateLinks";
import type { AffiliateProvider } from "@/lib/affiliate/links";
import type { ScenicRoute } from "@/lib/scenic";

/**
 * Under a live route-search answer: the ticket verdict for that line and its
 * existing affiliate links (never invented ones), with the commission line,
 * and the way to the full "Which ticket?" on the route page.
 */
export function SearchTicketCard({ route, locale }: { route: ScenicRoute; locale: string }) {
  const guide = route.ticketGuide;
  if (!guide) return null;
  const links = guide.links.flatMap((l) => {
    if (l.kind !== "affiliate") return [];
    const href = getAffUrl(l.linkId);
    const config = AFFILIATE_LINKS[l.linkId];
    return href && config ? [{ ...l, href, provider: config.provider as AffiliateProvider, adid: config.adid || undefined }] : [];
  });
  if (!links.length) return null;
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.07)]">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-fuji">
        <Ticket className="h-4 w-4" aria-hidden="true" />
        Tickets for the {route.line}
      </p>
      <p className="mt-1.5 text-[15px] font-bold leading-snug text-ink">{guide.verdict}</p>
      <div className="mt-4 grid gap-2.5">
        {links.map((l) => (
          <a
            key={l.linkId}
            href={l.href}
            target="_blank"
            rel={AFFILIATE_REL}
            onClick={() =>
              trackAffiliateClick({
                category: "train",
                provider: l.provider,
                placement: "route_search_ticket",
                href: l.href,
                label: route.id,
                link_id: l.linkId,
                product: l.product,
                adid: l.adid,
                locale,
              })
            }
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-fuji px-5 text-center text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(217,74,50,0.28)] transition-colors hover:bg-fuji-hover"
          >
            {l.label}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] leading-4 text-slate-500">
        We may earn a commission if you book through this link, at no extra cost to you.
      </p>
      {route.href ? (
        <Link href={route.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-fuji">
          Which ticket? Prices and passes <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
