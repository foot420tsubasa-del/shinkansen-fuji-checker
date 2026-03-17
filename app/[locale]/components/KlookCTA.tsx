"use client";

import { useTranslations } from "next-intl";

const KLOOK_URL =
  "https://affiliate.klook.com/redirect?aid=104861&aff_adid=1165791&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2Factivity%2F1420-7-day-whole-japan-rail-pass-jr-pass%2F";

export function KlookCTA() {
  const t = useTranslations("klook");

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 space-y-3 shadow-sm shadow-red-100">
      <p className="text-[13px] font-semibold text-slate-800">{t("heading")}</p>
      <div className="flex gap-2">
        <a
          href={KLOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
        >
          {t("book")}
        </a>
        <a
          href={KLOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100 active:brightness-95 transition-all"
        >
          {t("jrPass")}
        </a>
      </div>
    </div>
  );
}
