import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * 2-column "Good fit for" / "Watch out for" block.
 *
 * Content is supplied by the page from existing editorial.bestFor / watchOut
 * arrays and from score-based derived flags — this component is presentation
 * only. No invented claims; the page decides what items to include.
 */
export function AreaFitProfile({
  eyebrow,
  title,
  goodFitTitle,
  watchOutTitle,
  goodFit,
  watchOut,
}: {
  eyebrow: string;
  title: string;
  goodFitTitle: string;
  watchOutTitle: string;
  goodFit: string[];
  watchOut: string[];
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FitColumn
          tone="good"
          title={goodFitTitle}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          items={goodFit}
        />
        <FitColumn
          tone="watch"
          title={watchOutTitle}
          icon={<AlertCircle className="h-4 w-4" aria-hidden="true" />}
          items={watchOut}
        />
      </div>
    </section>
  );
}

function FitColumn({
  tone,
  title,
  icon,
  items,
}: {
  tone: "good" | "watch";
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  const wrap =
    tone === "good"
      ? "border-emerald-100 bg-emerald-50/60"
      : "border-amber-100 bg-amber-50/50";
  const accent = tone === "good" ? "text-[#106b43]" : "text-amber-800";
  return (
    <div className={["rounded-2xl border p-4", wrap].join(" ")}>
      <div className={["flex items-center gap-2", accent].join(" ")}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
          {icon}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border border-white/80 bg-white p-3 text-xs leading-5 text-slate-700 shadow-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
