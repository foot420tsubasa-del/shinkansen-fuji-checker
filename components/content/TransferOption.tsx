import { ArrowRight, Check, Clock, Luggage, Wallet, X, Zap } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";

type TransferOptionProps = {
  name: string;
  badge: "fastest" | "easiest" | "cheapest";
  duration: string;
  cost: string;
  pros: string[];
  cons: string[];
  luggageFriendly: boolean;
  lateOk: boolean;
  bookingLink: string;
  bookingLabel?: string;
};

const badgeConfig = {
  fastest: { label: "Fastest", icon: Zap, className: "border-amber-200 bg-amber-50 text-amber-700" },
  easiest: { label: "Easiest", icon: Check, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cheapest: { label: "Cheapest", icon: Wallet, className: "border-sky-200 bg-sky-50 text-sky-700" },
};

export function TransferOption({
  name, badge, duration, cost, pros, cons,
  luggageFriendly, lateOk, bookingLink, bookingLabel = "Book ticket",
}: TransferOptionProps) {
  const b = badgeConfig[badge];
  const BadgeIcon = b.icon;

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-slate-900">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {duration}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-900">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              {cost}
            </span>
          </div>
        </div>
        <span className={["inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold", b.className].join(" ")}>
          <BadgeIcon className="h-3 w-3" />
          {b.label}
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
          luggageFriendly
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-500",
        ].join(" ")}>
          <Luggage className="h-3 w-3" />
          {luggageFriendly ? "Luggage friendly" : "Luggage difficult"}
        </span>
        <span className={["inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
          lateOk
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-amber-200 bg-amber-50 text-amber-700",
        ].join(" ")}>
          <Clock className="h-3 w-3" />
          {lateOk ? "Late arrival OK" : "Ends early evening"}
        </span>
      </div>

      <a
        href={bookingLink}
        target="_blank"
        rel={AFFILIATE_REL}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#07142f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        {bookingLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
