import { ArrowRight, Check, X } from "lucide-react";

type AreaCardProps = {
  name: string;
  vibe: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  transport: string;
  hotelLink: string;
};

export function AreaCard({ name, vibe, pros, cons, bestFor, transport, hotelLink }: AreaCardProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{name}</h3>
          <p className="mt-1 text-xs text-slate-500">{vibe}</p>
        </div>
        <span className="shrink-0 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
          {bestFor}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-emerald-600">Pros</p>
          <ul className="space-y-1.5">
            {pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase text-red-500">Cons</p>
          <ul className="space-y-1.5">
            {cons.map((c) => (
              <li key={c} className="flex items-start gap-2 text-xs leading-5 text-slate-700">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-slate-700">Transport:</span> {transport}
      </div>

      <a
        href={hotelLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#07142f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        Browse {name} hotels
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
