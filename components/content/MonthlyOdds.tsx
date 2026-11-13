import { getTranslations } from "next-intl/server";
import { CLEAR_MORNING_ODDS, ODDS_PERIOD } from "@/lib/fuji-odds";

/**
 * Twelve bars: how often mornings over the Fuji stretch are clear, by month.
 *
 * A real table rather than a drawing, so the figures are text a reader can
 * select, a screen reader can walk, and a search engine can quote. One series,
 * so one hue and no legend; every bar carries its own number, which makes the
 * chart its own table view. Bars share a zero baseline and a fixed 0–60 scale
 * — the data tops out at 48 — so their lengths compare honestly.
 */
const SCALE_MAX = 60;

export async function MonthlyOdds({ locale, className = "" }: { locale: string; className?: string }) {
  const t = await getTranslations({ locale, namespace: "fujiWindow" });
  const monthName = (m: number, style: "short" | "long") =>
    new Intl.DateTimeFormat(locale, { month: style, timeZone: "UTC" }).format(new Date(Date.UTC(2026, m, 15)));
  const best = Math.max(...CLEAR_MORNING_ODDS);

  return (
    <figure className={className}>
      <figcaption>
        <p className="text-[13px] font-semibold text-slate-900">{t("oddsTitle")}</p>
        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{t("oddsCaption")}</p>
      </figcaption>
      <table className="mt-2 w-full border-separate border-spacing-y-1 text-[12px]">
        <tbody>
          {CLEAR_MORNING_ODDS.map((value, m) => (
            <tr key={m} title={`${monthName(m, "long")}: ${value}%`}>
              <th scope="row" className="w-12 whitespace-nowrap pr-2 text-left font-medium text-slate-600">
                {monthName(m, "short")}
              </th>
              <td className="w-full">
                <div className="h-2.5 w-full rounded-r bg-slate-100">
                  <div
                    className={`h-2.5 rounded-r ${value === best ? "bg-[#0b214a]" : "bg-[#1d4e89]"}`}
                    style={{ width: `${(value / SCALE_MAX) * 100}%` }}
                  />
                </div>
              </td>
              <td className="w-10 whitespace-nowrap pl-2 text-right font-semibold tabular-nums text-slate-900">
                {value}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
        {t("oddsNote", { start: ODDS_PERIOD.start, end: ODDS_PERIOD.end })}
      </p>
    </figure>
  );
}
