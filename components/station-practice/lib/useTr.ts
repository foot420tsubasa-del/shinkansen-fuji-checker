"use client";

import { useLocale } from "next-intl";
import { tr } from "@/data/station-practice/i18n";

/**
 * Client hook returning a translator bound to the active locale, backed by the
 * same English-keyed dictionary used for the branching mission data. Falls back
 * to the English source string when a key/locale is missing.
 */
export function useTr() {
  const locale = useLocale();
  return (s: string) => tr(locale, s);
}
