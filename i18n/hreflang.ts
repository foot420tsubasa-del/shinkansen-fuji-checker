const BASE = "https://fujiseat.com";

const LOCALES = ["en", "pt-BR", "es", "ko", "zh-TW", "zh-CN", "fr"] as const;

export function getAlternates(path: string, locale: string) {
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
