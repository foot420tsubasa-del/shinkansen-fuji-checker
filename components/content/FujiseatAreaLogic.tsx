"use client";

import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { useTranslations } from "next-intl";

type FujiseatAreaLogicProps = {
  sourcePage: string;
  locale?: string;
  placement: string;
  className?: string;
  showFinderLink?: boolean;
  note?: string;
};

export function FujiseatAreaLogic({
  sourcePage,
  locale,
  placement,
  className = "",
  showFinderLink = true,
  note,
}: FujiseatAreaLogicProps) {
  const t = useTranslations("fujiseatAreaLogic");
  const noteText = note ?? t("note");

  return (
    <section className={["rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm", className].join(" ")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{t("eyebrow")}</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("title")}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {t("body")}
      </p>
      {showFinderLink ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-stay-area-index"
            sourcePage={sourcePage}
            placement={placement}
            label={t("finderCta")}
            locale={locale}
            className="inline-flex min-h-10 items-center rounded-xl border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
          >
            {t("finderCta")}
          </TrackedInternalLink>
          <p className="max-w-xl text-xs leading-5 text-slate-500">
            {noteText}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {noteText}
        </p>
      )}
    </section>
  );
}
