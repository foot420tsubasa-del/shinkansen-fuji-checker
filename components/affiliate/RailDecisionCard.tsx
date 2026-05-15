import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import type { AffiliateClickParams } from "@/lib/analytics";

type RailCta = {
  label: string;
  href: string;
  provider?: AffiliateClickParams["provider"];
  category?: AffiliateClickParams["category"];
  linkId?: string;
  product?: string;
  adid?: string;
  external?: boolean;
};

type RailDecisionCardProps = {
  title: string;
  body: string;
  primaryCta: RailCta;
  secondaryCta: RailCta;
  tertiaryTextLink?: RailCta;
  placement: AffiliateClickParams["placement"];
  locale: string;
  routeType?: string;
};

function RailButton({
  cta,
  placement,
  locale,
  routeType,
  variant,
}: {
  cta: RailCta;
  placement: AffiliateClickParams["placement"];
  locale: string;
  routeType?: string;
  variant: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "border-[#ff7a00] bg-[#ff7a00] text-white hover:bg-[#e66700]"
      : cta.provider === "omio"
        ? "border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-800"
      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50";

  return (
    <TrackedAffiliateLink
      href={cta.href}
      target="_blank"
      rel={AFFILIATE_REL}
      category={cta.category ?? "train"}
      provider={cta.provider}
      placement={placement}
      locale={locale}
      label={cta.label}
      linkId={cta.linkId}
      product={cta.product}
      adid={cta.adid}
      routeType={routeType}
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors",
        classes,
      ].join(" ")}
    >
      {cta.label}
      <ExternalLink className="h-3.5 w-3.5" />
    </TrackedAffiliateLink>
  );
}

export function RailDecisionCard({
  title,
  body,
  primaryCta,
  secondaryCta,
  tertiaryTextLink,
  placement,
  locale,
  routeType,
}: RailDecisionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70 lg:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Rail booking decision
      </p>
      <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-slate-600">{body}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <RailButton cta={primaryCta} placement={placement} locale={locale} routeType={routeType} variant="primary" />
        <RailButton cta={secondaryCta} placement={placement} locale={locale} routeType={routeType} variant="secondary" />
      </div>
      {tertiaryTextLink?.href ? (
        tertiaryTextLink.external ?? true ? (
          <TrackedAffiliateLink
            href={tertiaryTextLink.href}
            target="_blank"
            rel={AFFILIATE_REL}
            category={tertiaryTextLink.category ?? "train"}
            provider={tertiaryTextLink.provider}
            placement={placement}
            locale={locale}
            label={tertiaryTextLink.label}
            linkId={tertiaryTextLink.linkId}
            product={tertiaryTextLink.product}
            adid={tertiaryTextLink.adid}
            routeType={routeType}
            className={[
              "mt-3 inline-flex text-xs font-semibold transition-colors",
              tertiaryTextLink.provider === "omio"
                ? "min-h-9 items-center justify-center rounded-lg border border-indigo-700 bg-indigo-700 px-3 py-2 text-white hover:bg-indigo-800"
                : "text-indigo-700 underline underline-offset-2 hover:text-indigo-900",
            ].join(" ")}
          >
            {tertiaryTextLink.label}
          </TrackedAffiliateLink>
        ) : (
          <Link
            href={tertiaryTextLink.href}
            className="mt-3 inline-flex text-xs font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
          >
            {tertiaryTextLink.label}
          </Link>
        )
      ) : null}
    </section>
  );
}
