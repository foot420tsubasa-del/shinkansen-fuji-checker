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
        className="text-[11px] font-medium text-slate-600 bg-transparent border border-slate-200 rounded-lg px-1.5 py-1 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-colors"
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
