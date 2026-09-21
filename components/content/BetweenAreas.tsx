export type BetweenAreasRoute = {
  /** How you travel — a line name, "On foot", and so on. */
  mode: string;
  /** The part a traveller has to act on: which line, which exit, which stops. */
  detail: string;
  /** Journey time, or an em dash when the mode does not apply. */
  time: string;
  /** Marks the row a reader should take unless they have a reason not to. */
  best?: boolean;
};

/**
 * How to get between the two areas a comparison page covers.
 *
 * Search Console, 2026-09: `/areas-to-stay/asakusa-vs-ueno` collects ~760
 * impressions a quarter for "asakusa station to ueno station", "ueno to
 * asakusa" and their variants, and converts none of them — it sits at position
 * 18-23 because it argues about where to sleep and never states the hop. The
 * answer existed only inside a pro-tip and one FAQ line. This puts it where a
 * reader standing at a ticket machine can scan it.
 */
export function BetweenAreas({
  title,
  intro,
  routes,
  note,
}: {
  title: string;
  intro: string;
  routes: BetweenAreasRoute[];
  note?: string;
}) {
  return (
    <section id="getting-between" className="scroll-mt-24 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{intro}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[26rem] text-sm">
          <tbody>
            {routes.map((route) => (
              <tr key={route.mode} className="border-b border-slate-100 last:border-0 align-top">
                <th
                  scope="row"
                  className="w-32 py-2.5 pr-3 text-left text-[13px] font-semibold text-slate-900 sm:w-40"
                >
                  {route.mode}
                  {route.best ? (
                    <span className="ml-1.5 inline-flex rounded-full border border-[#2E7D5B] bg-[#e8f3ed] px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-[#2E7D5B]">
                      Best
                    </span>
                  ) : null}
                </th>
                <td className="py-2.5 pr-3 text-[13px] leading-6 text-slate-600">{route.detail}</td>
                <td className="w-20 py-2.5 text-right text-[13px] font-semibold tabular-nums text-slate-900">
                  {route.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note ? (
        <p className="mt-3 border-t border-slate-100 pt-3 text-[12px] leading-5 text-slate-500">{note}</p>
      ) : null}
    </section>
  );
}
