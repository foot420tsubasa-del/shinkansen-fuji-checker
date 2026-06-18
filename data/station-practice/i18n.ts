/**
 * Runtime localisation for the station-practice landing page, FAQ, and the
 * branching missions (Missions 1 & 2).
 *
 * The branching scene data and the landing page hold their copy in English +
 * Japanese (labelJa/textJa are the Japanese signs the user is learning to
 * read). Rather than re-key ~300 strings across 1900 lines of scene data and
 * a dozen components, every translatable ENGLISH string is looked up at render
 * time against an auto-generated per-locale dictionary (sp-translations.json,
 * built by scripts/build-sp-dict from the 8 translation files). Japanese sign
 * fields are never touched, so they stay verbatim in every locale.
 *
 * tr() falls back to the English source when a locale or key is missing, so a
 * gap degrades to English rather than showing a raw key.
 */
import dict from "./sp-translations.json";
import type { Mission } from "./branching/types";
import type { FaqItem } from "./faq";

const translations = dict as Record<string, Record<string, string>>;

export function tr(locale: string, en: string): string {
  if (!en) return en;
  return translations[locale]?.[en] ?? en;
}

/** Deep-localise a branching mission, leaving Japanese sign fields intact. */
export function localizeMission(mission: Mission, locale: string): Mission {
  if (locale === "en" || !translations[locale]) return mission;
  const t = (s: string) => tr(locale, s);
  return {
    ...mission,
    title: t(mission.title),
    subtitle: t(mission.subtitle),
    missionCopy: t(mission.missionCopy),
    scenes: mission.scenes.map((sc) => ({
      ...sc,
      imageAlt: t(sc.imageAlt),
      currentLocation: t(sc.currentLocation),
      missionText: t(sc.missionText),
      hint: sc.hint ? t(sc.hint) : sc.hint,
      clearSummary: sc.clearSummary ? t(sc.clearSummary) : sc.clearSummary,
      clearLessons: sc.clearLessons ? sc.clearLessons.map(t) : sc.clearLessons,
      signs: sc.signs.map((sg) => ({ ...sg, textEn: t(sg.textEn) })),
      choices: sc.choices.map((ch) => ({
        ...ch,
        labelEn: t(ch.labelEn),
        feedback: ch.feedback ? t(ch.feedback) : ch.feedback,
      })),
    })),
  };
}

export function localizeFaq(items: FaqItem[], locale: string): FaqItem[] {
  if (locale === "en" || !translations[locale]) return items;
  return items.map((i) => ({
    question: tr(locale, i.question),
    answer: tr(locale, i.answer),
  }));
}
