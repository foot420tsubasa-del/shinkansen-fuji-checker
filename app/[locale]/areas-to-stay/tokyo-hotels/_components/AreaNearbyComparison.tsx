import { ArrowRight } from "lucide-react";
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#106b43] underline underline-offset-4 hover:no-underline"
                    >
                      {openLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </TrackedInternalLink>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="mt-5 grid gap-3 md:hidden">
        {allRows.map((row) => (
          <article
            key={row.key}
            className={[
              "rounded-2xl border p-4 shadow-sm",
              row.isCurrent
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-slate-200 bg-white",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-950">{row.name}</p>
                {row.reason ? (
                  <p className="mt-1 text-xs leading-5 text-slate-600">{row.reason}</p>
                ) : null}
              </div>
              {row.isCurrent ? (
                <span className="rounded-full bg-[#106b43] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                  you
                </span>
              ) : null}
            </div>
            <dl className="mt-3 grid gap-1.5">
              {metricLabels.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3 text-xs">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="tabular-nums font-bold text-slate-900">
                    {Math.round(row.metrics[key] ?? 0)}
                  </dd>
                </div>
              ))}
            </dl>
            {!row.isCurrent ? (
              <p className="mt-3">
                <TrackedInternalLink
                  href={row.href}
                  sourcePage={sourcePage}
                  placement="tokyo_hotels_nearby"
                  label={`${openLabel}: ${row.name}`}
                  locale={locale}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#106b43] underline underline-offset-4 hover:no-underline"
                >
                  {openLabel}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </TrackedInternalLink>
              </p>
            ) : null}
          </article>
        ))}
      </div>

      {/* "Currently viewing" back-anchor (mobile shows the current area marked; this is a safety link if a user lands deep) */}
      <p className="mt-4 text-[11px] leading-4 text-slate-500" aria-hidden="true">
        <span className="sr-only">Current page: {currentHref}</span>
      </p>
    </section>
  );
}
