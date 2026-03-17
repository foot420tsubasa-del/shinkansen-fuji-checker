"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  "pt-BR": "PT",
  es: "ES",
  ko: "KO",
  "zh-TW": "繁中",
  "zh-CN": "简中",
  fr: "FR",
};

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value });
  };

  return (
    <div className="shrink-0">
      <select
        value={locale}
        onChange={handleChange}
        className="text-[13px] font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg px-2 py-1 cursor-pointer hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors"
        aria-label="Select language"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc] ?? loc}
          </option>
        ))}
      </select>
    </div>
  );
}
