import areaData from "@/data/stay-area/tokyo-areas.base.json";

type AreaRecord = {
  id: string;
  displayName: string;
  editorialScores?: Record<string, number>;
};

const AREAS = areaData as AreaRecord[];

/** The eight dimensions worth putting side by side; `confidence` is metadata. */
export const SCORE_KEYS = [
  "airportAccess",
  "shinkansenAccess",
  "luggageFriendly",
  "stationSimplicity",
  "touristAccess",
  "lodgingChoice",
  "localFeel",
  "crowdStress",
] as const;

export type ScoreKey = (typeof SCORE_KEYS)[number];

export type AreaScoreCopy = {
  title: string;
  intro: string;
  /** Marks the higher score in a row. */
  best: string;
  labels: Record<ScoreKey, string>;
};

/**
 * The scored comparison behind a "which area" decision.
 *
 * The Tokyo Stay Finder carried these scores and was folded on 2026-09-29: one
 * search click in six months. The scores themselves were never the problem —
 * the page they sat on had no distribution. The comparison pages do, so the
 * data moves to where the readers already are.
 *
 * Bars share one hue and carry their own visible labels and numbers, so the
 * comparison never depends on telling two colours apart.
 */
export function AreaScoreCompare({
  areaIds,
  copy,
}: {
  areaIds: string[];
  copy: AreaScoreCopy;
}) {
  const areas = areaIds
    .map((id) => AREAS.find((a) => a.id === id))
    .filter((a): a is AreaRecord => Boolean(a?.editorialScores));

  // Renders nothing rather than a half-empty table if an id stops matching.
  if (areas.length < 2) return null;

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{copy.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy.intro}</p>

      <div className="mt-5 flex flex-col gap-4">
        {SCORE_KEYS.map((key) => {
          const values = areas.map((a) => a.editorialScores?.[key] ?? 0);
          const top = Math.max(...values);
          return (
            <div key={key}>
              <p className="text-[12px] font-semibold text-slate-700">{copy.labels[key]}</p>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {areas.map((area, i) => {
                  const value = values[i];
                  const leads = value === top && values.filter((v) => v === top).length === 1;
                  return (
                    <div key={area.id} className="flex items-center gap-2.5">
                      <span className="w-20 shrink-0 text-[12px] text-slate-600 sm:w-24">
                        {area.displayName}
                      </span>
                      <span className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={`block h-3 rounded-full ${leads ? "bg-[#0b214a]" : "bg-[#9fb2cc]"}`}
                          style={{ width: `${Math.max(2, value)}%` }}
                        />
                      </span>
                      <span className="w-14 shrink-0 text-right text-[12px] font-semibold tabular-nums text-slate-900">
                        {value}
                        {leads ? (
                          <span className="ml-1 text-[10px] font-bold uppercase text-[#0b214a]">
                            {copy.best}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
