type ComparisonRow = {
  feature: string;
  values: Record<string, string>;
};

type ComparisonTableProps = {
  columns: string[];
  rows: ComparisonRow[];
  highlight?: string;
};

export function ComparisonTable({ columns, rows, highlight }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="px-4 py-3 text-[11px] font-semibold uppercase text-slate-500" />
            {columns.map((col) => (
              <th
                key={col}
                className={[
                  "px-4 py-3 text-[11px] font-semibold uppercase",
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
              <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                {row.feature}
              </td>
              {columns.map((col) => (
                <td
                  key={col}
                  className={[
                    "px-4 py-3 text-xs",
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
