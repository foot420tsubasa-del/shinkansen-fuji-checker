import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import type { AffiliatePlacement } from "@/lib/affiliate/links";

type StayBaseCardProps = {
  title: string;
  subtitle: string;
  bestFor: string;
  weakness?: string;
  image?: {
    src: string;
    alt: string;
  };
  area: string;
  city?: string;
  primaryAction: string;
  providerChoices: ProviderChoiceButton[];
  secondaryInternalLink?: {
    href: string;
    label: string;
  };
  placement: AffiliatePlacement;
  pagePath: string;
  locale: string;
};

export function StayBaseCard({
  title,
  subtitle,
  bestFor,
  weakness,
  image,
  area,
  city,
  primaryAction,
  providerChoices,
  secondaryInternalLink,
  placement,
  pagePath,
  locale,
}: StayBaseCardProps) {
  return (
    <article id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
      {image ? (
        // Existing public image path is validated by the server page before it is passed here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt={image.alt} className="aspect-[16/10] w-full object-cover" loading="lazy" />
      ) : (
        <div className="aspect-[16/10] border-b border-slate-100 bg-[linear-gradient(135deg,#eef6fb,#fff_48%,#f0fbf6)]" aria-hidden="true" />
      )}
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{area}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        <div className="mt-4 grid gap-3 text-sm">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Best for</p>
            <p className="mt-1 leading-5 text-slate-700">{bestFor}</p>
          </div>
          {weakness ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">Watch out</p>
              <p className="mt-1 leading-5 text-slate-700">{weakness}</p>
            </div>
          ) : null}
        </div>
        {providerChoices.length > 0 ? (
          <ProviderChoiceCTA
            actionLabel={primaryAction}
            providers={providerChoices.map((choice) => ({ ...choice, placement }))}
            pagePath={pagePath}
            locale={locale}
            area={area}
            city={city}
            className="mt-4"
          />
        ) : null}
        {secondaryInternalLink ? (
          <Link href={secondaryInternalLink.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#106b43] underline underline-offset-4 transition-colors hover:text-[#0f6f45]">
            {secondaryInternalLink.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
