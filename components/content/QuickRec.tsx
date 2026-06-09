"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, type AffiliateClickParams } from "@/lib/analytics";

type QuickRecProps = {
  area: string;
  why: string;
  link: string;
  cta?: string;
  locale?: string;
  pagePath?: string;
  provider?: AffiliateClickParams["provider"];
  placement?: AffiliateClickParams["placement"];
  showCta?: boolean;
};

export function QuickRec({
  area,
  why,
  link,
  cta,
  locale,
  pagePath,
  provider = "trip",
  placement = "stay_quick_recommendation",
  showCta = true,
}: QuickRecProps) {
  const t = useTranslations("stayShared.quickRec");
  const ctaLabel = cta ?? t("seeHotels");

  return (
    <div className="rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-emerald-700">
        <Zap className="h-3.5 w-3.5" />
        {t("title")}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-950">
        {t("stayIn")} <span className="text-emerald-700">{area}</span>
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{why}</p>
      {showCta ? (
        <a
          href={link}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() =>
            trackAffiliateClick({
              category: "hotel",
              provider,
              placement,
              page_path: pagePath,
              locale,
              href: link,
              label: ctaLabel,
              area,
              product: "hotel",
            })
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-[#bf3d28]"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  );
}
