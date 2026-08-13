import { getAffUrl, AFFILIATE_LINKS } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import type { AffiliatePlacement } from "@/lib/affiliate/links";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";

export type KlookProductItem = {
  /** Key in data/affiliate-links.json. Renders only once that entry has a URL. */
  linkId: string;
  /** Shown instead of the registry label when the page needs its own wording. */
  title?: string;
  note: string;
  product: string;
};

/**
 * Renders Klook products straight from the admin registry, and renders nothing
 * for entries that have no URL yet. That is deliberate: the whole row can be
 * committed before the affiliate links exist, and each product switches itself
 * on the moment its adid / directUrl is filled in — no code change, no risk of
 * a fabricated deep link going live.
 */
export function KlookProductRow({
  items,
  heading,
  intro,
  placement,
  pagePath,
  locale,
  className = "",
}: {
  items: KlookProductItem[];
  heading: string;
  intro?: string;
  placement: AffiliatePlacement;
  pagePath: string;
  locale: string;
  className?: string;
}) {
  const ready = items
    .map((item) => {
      const href = getAffUrl(item.linkId);
      const entry = AFFILIATE_LINKS[item.linkId];
      return href && entry ? { ...item, href, label: item.title ?? entry.label } : null;
    })
    .filter((x): x is KlookProductItem & { href: string; label: string } => x !== null);

  if (!ready.length) return null;

  return (
    <section className={`rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-slate-950">{heading}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-slate-600">{intro}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ready.map((item) => (
          <TrackedAffiliateLink
            key={item.linkId}
            href={item.href}
            target="_blank"
            rel={AFFILIATE_REL}
            category="train"
            provider="klook"
            product={item.product}
            placement={placement}
            pagePath={pagePath}
            locale={locale}
            label={item.label}
            linkId={item.linkId}
            adid={AFFILIATE_LINKS[item.linkId]?.adid || undefined}
            className="flex h-full flex-col rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-[12px] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-100"
          >
            <span className="block text-sm font-semibold text-slate-950">{item.label}</span>
            <span className="mt-1 block leading-5 text-slate-600">{item.note}</span>
            <span className="mt-auto inline-flex w-fit rounded-full border border-orange-300 bg-white px-3 py-1.5 pt-1.5 font-semibold text-orange-700">
              Check on Klook
            </span>
          </TrackedAffiliateLink>
        ))}
      </div>
    </section>
  );
}
