/**
 * 4 large horizontal score bars — the "primary score graph" block.
 * Headline metrics:
 *   Airport access, Luggage ease, Station usability, Stay feel.
 * No gradients; emerald fills on slate track.
 */
export function AreaPrimaryScoreGraph({
  eyebrow,
  title,
  intro,
  bars,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  bars: Array<{ key: string; label: string; value: number; hint?: string }>;
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      <div className="mt-5 grid gap-4">
        {bars.map(({ key, label, value, hint }) => (
          <PrimaryBar key={key} label={label} value={value} hint={hint} />
        ))}
      </div>
    </section>
  );
}

function PrimaryBar({ label, value, hint }: { label: string; value: number; hint?: string }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <span className="text-base font-black tabular-nums text-slate-950">{normalized}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#2E7D5B]"
          style={{ width: `${Math.max(4, normalized)}%` }}
        />
      </div>
      {hint ? <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}
