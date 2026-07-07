import { getTranslations } from "next-intl/server";
import {
  CompactStayFinderClient,
  type CompactStayFinderCopy,
} from "./CompactStayFinderClient";

type FinderStepRaw = {
  id: string;
  title: string;
  options: Array<{ id: string; label: string }>;
};

/**
 * Server wrapper for the §4-3 compact Stay Finder embed. Pulls the already
 * translated quiz steps (Q1 shinkansen + Q2 luggage) and the compact labels
 * from the tokyoStayAreaIndex.finder namespace, so every embed surface stays
 * in sync with the full Finder in all 9 locales.
 */
export async function CompactStayFinder({
  locale,
  pagePath,
  placement,
}: {
  locale: string;
  pagePath: string;
  placement: string;
}) {
  const t = await getTranslations({ locale, namespace: "tokyoStayAreaIndex" });
  const steps = t.raw("finder.steps") as FinderStepRaw[];
  const questions = steps
    .filter((step) => step.id === "shinkansen" || step.id === "luggage")
    .map((step) => ({
      id: step.id as "shinkansen" | "luggage",
      title: step.title,
      options: step.options.map((option) => ({ id: option.id, label: option.label })),
    }));
  if (questions.length !== 2) return null;

  const copy: CompactStayFinderCopy = {
    title: t.raw("finder.compactTitle") as string,
    body: t.raw("finder.compactBody") as string,
    cta: t.raw("finder.compactCta") as string,
    questions,
  };

  return (
    <CompactStayFinderClient
      copy={copy}
      locale={locale}
      pagePath={pagePath}
      placement={placement}
    />
  );
}
