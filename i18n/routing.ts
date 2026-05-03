import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pt-BR", "es", "ko", "zh-TW", "zh-CN", "fr", "de"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
});
