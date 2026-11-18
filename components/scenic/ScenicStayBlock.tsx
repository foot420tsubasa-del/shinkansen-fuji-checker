import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import type { ResolvedScenicStay } from "@/lib/scenic-stays";

type Props = {
  stay: ResolvedScenicStay;
  routeId: string;
  locale: string;
  pagePath: string;
};

export function ScenicStayBlock({ stay, routeId, locale, pagePath }: Props) {
  const providers: ProviderChoiceButton[] = stay.links.map((link) => ({
    label: link.label,
    href: link.href,
    trackingHref: link.href,
    provider: link.provider,
    product: "hotel_area",
    placement: "scenic_route_stay",
    variant: "secondary",
    linkId: link.id,
    areaId: link.areaId,
    route: routeId,
  }));

  return (
    <section className="mt-10" aria-labelledby="scenic-stay-heading">
      <h2 id="scenic-stay-heading" className="text-xl font-extrabold tracking-[-0.02em]">
        {stay.title}
      </h2>
      <ProviderChoiceCTA
        actionLabel="Find a convenient base"
        description={stay.description}
        providers={providers}
        pagePath={pagePath}
        locale={locale}
        routeType="scenic"
        className="mt-3 max-w-2xl"
      />
      <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">PR: {stay.disclosure}</p>
    </section>
  );
}
