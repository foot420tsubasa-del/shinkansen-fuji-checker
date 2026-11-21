"use client";

import { ArrowRight, ExternalLink, Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";
import type { TicketGuideData } from "@/lib/scenic";
import type { AffiliateProvider } from "@/lib/affiliate/links";

export type ResolvedTicketLink =
  | { kind: "affiliate"; href: string; label: string; product: string; linkId: string; provider: AffiliateProvider; adid?: string }
  | { kind: "official"; href: string; label: string };

/**
 * "Which ticket?" for one scenic route: the answer in a line, who should buy
 * what, prices as read on the operators' own pages (with the month), and the
 * booking links — affiliate links only where one already exists in the
 * repository, each with the commission line; otherwise the official page.
 */
export function TicketGuide({
  routeId,
  line,
  guide,
  links,
}: {
  routeId: string;
  line: string;
  guide: TicketGuideData;
  links: ResolvedTicketLink[];
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(11,18,32,0.07)] md:p-6">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-fuji">
        <Ticket className="h-4 w-4" aria-hidden="true" />
        Tickets for the {line}
      </p>
      <p className="mt-2 text-lg font-bold leading-snug text-ink">{guide.verdict}</p>

      <ul className="mt-4 grid gap-2">
        {guide.options.map((o) => (
          <li key={o.who} className="grid gap-1 rounded-2xl bg-slate-50 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-4">
            <span className="text-sm text-slate-600">{o.who}</span>
            <span className="text-sm font-bold text-ink">
              {o.buy}
              {o.price ? <span className="ml-1.5 font-semibold text-slate-500">· {o.price}</span> : null}
            </span>
          </li>
        ))}
      </ul>

      {links.length ? (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {links.map((l) =>
            l.kind === "affiliate" ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel={AFFILIATE_REL}
                onClick={() =>
                  trackAffiliateClick({
                    category: "train",
                    provider: l.provider,
                    placement: "scenic_route_ticket",
                    href: l.href,
                    label: routeId,
                    link_id: l.linkId,
                    product: l.product,
                    adid: l.adid,
                  })
                }
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-fuji px-5 text-center text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(217,74,50,0.28)] transition-colors hover:bg-fuji-hover"
              >
                {l.label}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-center text-[15px] font-bold text-ink hover:bg-slate-50"
              >
                {l.label}
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            ),
          )}
        </div>
      ) : null}

      {guide.more ? (
        <Link href={guide.more.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-fuji">
          {guide.more.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}

      <p className="mt-4 border-t border-slate-100 pt-3 text-[11.5px] leading-5 text-slate-500">
        Official details:{" "}
        {guide.sources.map((src, i) => (
          <span key={src.url}>
            {i ? " · " : null}
            <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {src.label}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}
