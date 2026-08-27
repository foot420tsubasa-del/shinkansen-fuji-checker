type LineCode = { code: string; en: string; ja: string };

type Group = { key: "jr" | "metro" | "private"; label: string; lines: LineCode[] };

/* Codes and names taken from the same dataset the Rail 3D tools render, so the
   table and the map can never disagree. A sign reads the code and a two-digit
   station number — JY 08 is Shibuya on the Yamanote Line — and the code is the
   part travellers cannot look up from the station name alone. */
const GROUPS: Group[] = [
  {
    key: "jr",
    label: "JR East",
    lines: [
      { code: "JY", en: "Yamanote Line", ja: "山手線" },
      { code: "JK", en: "Keihin-Tohoku Line", ja: "京浜東北線" },
      { code: "JC", en: "Chuo Line (Rapid)", ja: "中央線快速" },
      { code: "JB", en: "Chuo-Sobu Line (Local)", ja: "中央・総武線各停" },
      { code: "JO", en: "Sobu Line (Rapid)", ja: "総武線快速" },
      { code: "JT", en: "Tokaido Line", ja: "東海道線" },
      { code: "JA", en: "Saikyo Line", ja: "埼京線" },
      { code: "JJ", en: "Joban Line (Rapid)", ja: "常磐線快速" },
      { code: "JE", en: "Keiyo Line", ja: "京葉線" },
    ],
  },
  {
    key: "metro",
    label: "Tokyo Metro / Toei Subway",
    lines: [
      { code: "G", en: "Ginza Line", ja: "銀座線" },
      { code: "M", en: "Marunouchi Line", ja: "丸ノ内線" },
      { code: "H", en: "Hibiya Line", ja: "日比谷線" },
      { code: "T", en: "Tozai Line", ja: "東西線" },
      { code: "C", en: "Chiyoda Line", ja: "千代田線" },
      { code: "Y", en: "Yurakucho Line", ja: "有楽町線" },
      { code: "Z", en: "Hanzomon Line", ja: "半蔵門線" },
      { code: "N", en: "Namboku Line", ja: "南北線" },
      { code: "F", en: "Fukutoshin Line", ja: "副都心線" },
      { code: "A", en: "Toei Asakusa Line", ja: "都営浅草線" },
      { code: "I", en: "Toei Mita Line", ja: "都営三田線" },
      { code: "S", en: "Toei Shinjuku Line", ja: "都営新宿線" },
      { code: "E", en: "Toei Oedo Line", ja: "都営大江戸線" },
    ],
  },
  {
    key: "private",
    label: "Private railways",
    lines: [
      { code: "TY", en: "Tokyu Toyoko Line", ja: "東急東横線" },
      { code: "DT", en: "Tokyu Den-en-toshi Line", ja: "東急田園都市線" },
      { code: "OH", en: "Odakyu Line", ja: "小田急線" },
      { code: "KO", en: "Keio Line", ja: "京王線" },
      { code: "SI", en: "Seibu Ikebukuro Line", ja: "西武池袋線" },
      { code: "TS", en: "Tobu Skytree Line", ja: "東武スカイツリーライン" },
      { code: "KK", en: "Keikyu Main Line", ja: "京急本線" },
      { code: "KS", en: "Keisei Main Line", ja: "京成本線" },
    ],
  },
];

/**
 * Reference table for the letter codes printed on Tokyo station signage.
 *
 * The page ranks 7th-12th for "japan train signs" and "japan train symbol
 * meanings" but explained the system in prose only, with nothing a reader
 * standing on a platform could scan. This is the part of a sign that cannot be
 * guessed from the station name, so it is the piece worth tabulating.
 */
export function LineCodeTable({
  heading,
  intro,
  columnCode,
  columnLine,
}: {
  heading: string;
  intro: string;
  columnCode: string;
  columnLine: string;
}) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{heading}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{intro}</p>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
              {group.label}
            </p>
            <table className="mt-2 w-full text-sm">
              <caption className="sr-only">
                {group.label} — {columnCode} / {columnLine}
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th scope="col" className="w-14 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {columnCode}
                  </th>
                  <th scope="col" className="py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {columnLine}
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.lines.map((line) => (
                  <tr key={line.code} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 pr-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-1.5 font-mono text-[11px] font-bold text-slate-700">
                        {line.code}
                      </span>
                    </td>
                    <td className="py-1.5 text-[13px] leading-5 text-slate-700">
                      {line.en}
                      <span className="ml-1 text-[11px] text-slate-400">{line.ja}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}
