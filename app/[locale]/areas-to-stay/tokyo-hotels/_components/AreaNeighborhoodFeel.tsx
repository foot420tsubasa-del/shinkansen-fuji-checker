import { AlertCircle, CheckCircle2, Footprints } from "lucide-react";

/**
 * "Neighborhood feel after leaving the station" block.
 *
 * A short, editorial read on what the street around a station feels like for
 * a traveller choosing where to stay — exit feel, walking with luggage, night
 * convenience, quiet vs busy, who it suits / should avoid. Presentation only:
 * all copy comes from the area's `neighborhoodFeel` data (English, like the
 * rest of the detail page). Sits after the access/area content and before the
 * booking CTA so area understanding deepens before a provider link is tapped.
 */
export function AreaNeighborhoodFeel({
  eyebrow,
  title,
  summary,
  goodForTitle,
  watchOutTitle,
  goodFor,
  watchOutFor,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  goodForTitle: string;
  watchOutTitle: string;
  goodFor: string[];
  watchOutFor: string[];
}) {
  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2 text-[#106b43]">
        <Footprints className="h-4 w-4" aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">{eyebrow}</p>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <FeelColumn
          tone="good"
          title={goodForTitle}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          items={goodFor}
        />
        <FeelColumn
          tone="watch"
          title={watchOutTitle}
          icon={<AlertCircle className="h-4 w-4" aria-hidden="true" />}
          items={watchOutFor}
        />
      </div>
    </section>
  );
}

function FeelColumn({
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
