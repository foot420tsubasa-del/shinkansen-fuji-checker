type ComparisonRow = {
  feature: string;
  values: Record<string, string>;
};

type ComparisonTableProps = {
  columns: string[];
  rows: ComparisonRow[];
  highlight?: string;
  wrapOnMobile?: boolean;
};

export function ComparisonTable({ columns, rows, highlight, wrapOnMobile = false }: ComparisonTableProps) {
  const cellPadding = wrapOnMobile ? "px-2.5 py-2.5 sm:px-4 sm:py-3" : "px-4 py-3";
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className={["w-full text-left text-sm", wrapOnMobile ? "table-fixed break-words sm:table-auto" : "min-w-[480px]"].join(" ")}>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th scope="col" className={wrapOnMobile ? "w-[26%] sm:w-auto" : cellPadding} />
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className={[
                  cellPadding,
                  "text-[11px] font-semibold uppercase",
                  col === highlight ? "text-emerald-700" : "text-slate-500",
                ].join(" ")}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.feature}
              className={i < rows.length - 1 ? "border-b border-slate-100" : ""}
            >
              <th scope="row" className={`${cellPadding} text-xs font-semibold text-slate-700`}>
                {row.feature}
              </th>
              {columns.map((col) => (
                <td
                  key={col}
                  className={[
                    cellPadding,
                    "text-xs",
                    col === highlight ? "font-medium text-slate-900" : "text-slate-600",
                  ].join(" ")}
                >
                  {row.values[col] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
