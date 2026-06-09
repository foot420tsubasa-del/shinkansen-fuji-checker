"use client";

import { useLocale, useTranslations } from "next-intl";
import { JR_PASS_URL, SHINKANSEN_TICKET_URL, ESIM_URL } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick } from "@/lib/analytics";

export function KlookCTA() {
  const t = useTranslations("klook");
  const locale = useLocale();

  return (
    <div className="space-y-3 rounded-2xl border border-[#ffb56b] bg-[#fff8f0] px-4 py-4 shadow-sm shadow-orange-100">
      <p className="text-[13px] font-semibold text-slate-800">{t("heading")}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={SHINKANSEN_TICKET_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() =>
            trackAffiliateClick({
              category: "train",
              provider: "klook",
              placement: "guide_top",
              href: SHINKANSEN_TICKET_URL,
              label: "Book Shinkansen ticket",
              locale,
            })
          }
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-[#bf3d28] active:brightness-95"
        >
          Book Shinkansen ticket
        </a>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
        <a
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() =>
            trackAffiliateClick({
              category: "train",
              provider: "klook",
              placement: "guide_top",
              href: JR_PASS_URL,
              label: "Check JR Pass options",
              locale,
            })
          }
          className="text-slate-600 underline underline-offset-2 transition-colors hover:text-slate-950"
        >
          Check JR Pass options
        </a>
        <a
          href={ESIM_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          onClick={() =>
            trackAffiliateClick({
              category: "esim",
              provider: "klook",
              placement: "guide_top",
              href: ESIM_URL,
              label: "Get Japan eSIM",
              locale,
            })
          }
          className="text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-800"
        >
          Get Japan eSIM
        </a>
      </div>
    </div>
  );
}
