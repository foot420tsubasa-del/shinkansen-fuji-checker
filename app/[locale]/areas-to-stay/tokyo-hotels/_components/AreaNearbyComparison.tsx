import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { AreaOptionalImage } from "./AreaOptionalImage";

/**
 * Compact comparison of the current area against 2–3 nearby alternatives.
 *
 * Renders as:
 *   - desktop: a table with one column per metric
 *   - mobile:  stacked cards per alternative
 *
 * Drives internal page-to-page exploration only (no Booking/Trip leaks).
 * Linked targets are determined by the page (pilot → /tokyo-hotels/<slug>,
 * non-pilot → Finder deep-link).
 */

export type ComparisonRow = {
  key: string;
  name: string;
  reason?: string;
  href: string;
  hasOwnPage: boolean;
  metrics: Record<string, number>;
};

export function AreaNearbyComparison({
  eyebrow,
  title,
  intro,
  currentAreaName,
  currentHref,
  currentRow,
  alternatives,
  metricLabels,
  openLabel,
  sourcePage,
  locale,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  currentAreaName: string;
  currentHref: string;
  currentRow: ComparisonRow;
  alternatives: ComparisonRow[];
  metricLabels: Array<{ key: string; label: string }>;
  openLabel: string;
  sourcePage: string;
  locale: string;
  /** Optional generated comparison image. Renders above the table/cards;
   *  the comparison itself always renders so meaning is never image-only. */
  image?: { src: string | null | undefined; alt: string; caption?: string };
}) {
  const allRows: Array<ComparisonRow & { isCurrent: boolean }> = [
    { ...currentRow, isCurrent: true },
    ...alternatives.map((alt) => ({ ...alt, isCurrent: false })),
  ];

  return (
    <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      {intro ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{intro}</p> : null}

      {image?.src ? (
        <div className="mt-5">
          <AreaOptionalImage
            src={image.src}
            alt={image.alt}
            caption={image.caption}
            aspect="wide"
          />
        </div>
      ) : null}

      {/* Desktop: comparison table */}
      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
              <th className="px-3 py-3 font-semibold">{currentAreaName}</th>
              {metricLabels.map(({ key, label }) => (
                <th key={key} className="px-3 py-3 text-right font-semibold">
                  {label}
                </th>
              ))}
              <th className="px-3 py-3 text-right font-semibold" aria-label="open">
                {" "}
              </th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => (
              <tr
                key={row.key}
                className={[
                  "border-b border-slate-100 last:border-0",
                  row.isCurrent ? "bg-emerald-50/40" : "",
                ].join(" ")}
              >
                <td className="px-3 py-3 align-top">
                  <p className="font-semibold text-slate-950">
                    {row.name}
                    {row.isCurrent ? (
                      <span className="ml-2 rounded-full bg-[#106b43] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                        you
                      </span>
                    ) : null}
                  </p>
                  {row.reason ? (
                    <p className="mt-1 text-xs leading-5 text-slate-500">{row.reason}</p>
                  ) : null}
                </td>
                {metricLabels.map(({ key }) => (
                  <td
                    key={key}
                    className="px-3 py-3 text-right align-top text-sm font-bold tabular-nums text-slate-900"
                  >
                    {Math.round(row.metrics[key] ?? 0)}
                  </td>
                ))}
                <td className="px-3 py-3 text-right align-top">
                  {row.isCurrent ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <TrackedInternalLink
                      href={row.href}
                      sourcePage={sourcePage}
                      placement="tokyo_hotels_nearby"
                      label={`${openLabel}: ${row.name}`}
                      locale={locale}
                      className="inline-flex items-center text-xs font-semibold text-[#0b214a] underline underline-offset-4 hover:no-underline"
                    >
                      {openLabel}
                    </TrackedInternalLink>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: side-by-side matrix so users can compare the same metric across areas. */}
      <div className="mt-5 md:hidden">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[620px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="sticky left-0 z-10 w-[118px] bg-slate-50 px-3 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Compare
                </th>
                {allRows.map((row) => (
                  <th
                    key={row.key}
                    className={[
                      "min-w-[122px] px-3 py-3 align-top",
                      row.isCurrent ? "bg-emerald-50/70" : "",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-bold leading-5 text-slate-950">
                      {row.name}
                    </span>
                    {row.isCurrent ? (
                      <span className="mt-1 inline-flex rounded-full bg-[#106b43] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                        you
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricLabels.map(({ key, label }) => (
                <tr key={key} className="border-b border-slate-100 last:border-0">
                  <th className="sticky left-0 z-10 bg-white px-3 py-2.5 font-semibold text-slate-500">
                    {label}
                  </th>
                  {allRows.map((row) => (
                    <td
                      key={`${row.key}-${key}`}
                      className={[
                        "px-3 py-2.5 text-center tabular-nums",
                        row.isCurrent ? "bg-emerald-50/50" : "",
                      ].join(" ")}
                    >
                      <span className="text-base font-black text-slate-950">
                        {Math.round(row.metrics[key] ?? 0)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="sticky left-0 z-10 bg-white px-3 py-3 font-semibold text-slate-500">
                  Open
                </th>
                {allRows.map((row) => (
                  <td
                    key={`${row.key}-open`}
                    className={[
                      "px-3 py-3 text-center",
                      row.isCurrent ? "bg-emerald-50/50" : "",
                    ].join(" ")}
                  >
                    {row.isCurrent ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <TrackedInternalLink
                        href={row.href}
                        sourcePage={sourcePage}
                        placement="tokyo_hotels_nearby"
                        label={`${openLabel}: ${row.name}`}
                        locale={locale}
                        className="inline-flex items-center text-xs font-semibold text-[#0b214a] underline underline-offset-4 hover:no-underline"
                      >
                        {openLabel}
                      </TrackedInternalLink>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid gap-2">
          {allRows
            .filter((row) => row.reason)
            .map((row) => (
              <p
                key={`${row.key}-reason`}
                className={[
                  "rounded-xl border px-3 py-2 text-xs leading-5",
                  row.isCurrent
                    ? "border-emerald-100 bg-emerald-50 text-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-600",
                ].join(" ")}
              >
                <span className="font-bold text-slate-900">{row.name}: </span>
                {row.reason}
              </p>
            ))}
        </div>
      </div>

      {/* "Currently viewing" back-anchor (mobile shows the current area marked; this is a safety link if a user lands deep) */}
      <p className="mt-4 text-[11px] leading-4 text-slate-500" aria-hidden="true">
        <span className="sr-only">Current page: {currentHref}</span>
      </p>
    </section>
  );
}
