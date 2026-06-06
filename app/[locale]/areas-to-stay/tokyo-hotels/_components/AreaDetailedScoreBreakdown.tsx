/**
 * Detailed breakdown — every sub-score grouped into 3 buckets:
 *   Access (airport / shinkansen / tourist)
 *   Ease (station simplicity / luggage / less daytime stress)
 *   Stay feel (local feel / hotel choice)
 *
 * Smaller compact bars, each card pale-slate; the three buckets are arranged
 * in a 3-column grid on desktop and stack on mobile. No gradients.
 */

export type ScoreBreakdownGroup = {
  key: string;
  title: string;
  metrics: Array<{ key: string; label: string; value: number }>;
};

export function AreaDetailedScoreBreakdown({
  eyebrow,
  title,
  intro,
  groups,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  groups: ScoreBreakdownGroup[];
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {groups.map((group) => (
          <BreakdownGroup key={group.key} group={group} />
        ))}
      </div>
    </section>
  );
}

function BreakdownGroup({ group }: { group: ScoreBreakdownGroup }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
        {group.title}
      </p>
      <div className="mt-3 grid gap-3">
        {group.metrics.map((metric) => (
          <MiniBar key={metric.key} label={metric.label} value={metric.value} />
        ))}
      </div>
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span className="tabular-nums text-slate-900">{normalized}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[#168a56]"
          style={{ width: `${Math.max(4, normalized)}%` }}
        />
      </div>
    </div>
  );
}
