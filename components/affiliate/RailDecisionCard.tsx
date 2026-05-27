import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import type { AffiliateClickParams } from "@/lib/analytics";

type RailCta = {
  label: string;
  href: string;
  provider?: AffiliateClickParams["provider"];
  category?: AffiliateClickParams["category"];
  placement?: AffiliateClickParams["placement"];
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
  secondaryTitle: string;
  secondaryBody: string;
  sectionLabel?: string;
  placement: AffiliateClickParams["placement"];
  locale: string;
  routeType?: string;
};

function toProviderChoice(
  cta: RailCta,
  placement: AffiliateClickParams["placement"],
  variant: ProviderChoiceButton["variant"],
): ProviderChoiceButton {
  return {
    label: cta.label,
    href: cta.href,
    provider: cta.provider ?? "other",
    product: cta.product ?? "route_compare",
    adid: cta.adid,
    linkId: cta.linkId,
    placement: cta.placement ?? placement,
    variant,
    category: cta.category ?? "train",
  };
}

export function RailDecisionCard({
  title,
  body,
  primaryCta,
  secondaryCta,
  tertiaryTextLink,
  secondaryTitle,
  secondaryBody,
  sectionLabel = "Rail booking decision",
  placement,
  locale,
  routeType,
}: RailDecisionCardProps) {
  const shinkansenProviders = [
    toProviderChoice(primaryCta, placement, "primary"),
    tertiaryTextLink?.href ? toProviderChoice(tertiaryTextLink, placement, "secondary") : null,
  ].filter((provider): provider is ProviderChoiceButton => Boolean(provider));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70 lg:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {sectionLabel}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ProviderChoiceCTA
          actionLabel={title}
          description={body}
          providers={shinkansenProviders}
          pagePath="/guide"
          locale={locale}
          routeType={routeType}
          className="h-full border-orange-100 bg-orange-50/50"
        />
        <ProviderChoiceCTA
          actionLabel={secondaryTitle}
          description={secondaryBody}
          providers={[toProviderChoice(secondaryCta, placement, "primary")]}
          pagePath="/guide"
          locale={locale}
          routeType={routeType}
          className="h-full border-emerald-100 bg-emerald-50/50"
        />
      </div>
    </section>
  );
}
