const BASE = "https://fujiseat.com";

const LOCALES = ["en", "pt-BR", "es", "ko", "zh-TW", "zh-CN", "fr"] as const;

/**
 * Returns alternates metadata (canonical + hreflang) for a given path.
 *
 * path=""  → home  (en: /,  others: /pt-BR  /es  /ko …)
 * path="/guide" → guide (en: /guide, others: /pt-BR/guide …)
 */
export function getAlternates(path: "" | "/guide" | "/plan-your-trip", locale: string) {
  const enUrl = path === "" ? `${BASE}/` : `${BASE}${path}`;
  const localeUrl = (loc: string) =>
    loc === "en" ? enUrl : `${BASE}/${loc}${path}`;

  const languages: Record<string, string> = { "x-default": enUrl };
  for (const loc of LOCALES) {
    languages[loc] = localeUrl(loc);
  }

  return {
    canonical: localeUrl(locale),
    languages,
  };
}
