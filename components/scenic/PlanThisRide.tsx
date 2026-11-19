import { ExternalLink } from "lucide-react";
import tripEssentials from "@/data/trip-essentials.json";

type Source = { label: string; url: string };
type Fact = { text: string; source?: Source; validUntil?: string; expiryNote?: string };
export type TripEssentials = {
  checked: string;
  board: Fact;
  access: { from: string; text: string }[];
  ride: Fact;
  fare: Fact;
  reservation: Fact;
  operation: Fact;
  tickets: Fact[];
  officialLanguage?: string;
};

export function getTripEssentials(routeId: string): TripEssentials | null {
  return ((tripEssentials.routes as Record<string, TripEssentials>)[routeId] ?? null);
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00+09:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Tokyo" });

function SourceLink({ source }: { source?: Source }) {
  if (!source) return null;
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="ml-1 inline break-words text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-ink">
      {source.label}
      <ExternalLink className="ml-0.5 inline h-3 w-3 align-[-1px]" aria-hidden="true" />
    </a>
  );
}

/**
 * "Plan this ride": where to board, how to get there, how long, what it costs,
 * reservations, operating days and where to buy — each with its official
 * source and the date it was checked (data/trip-essentials.json). Facts past
 * their validUntil are flagged here and fail the test suite.
 */
export function PlanThisRide({ essentials, today }: { essentials: TripEssentials; today: string }) {
  const stale = (fact: Fact) => Boolean(fact.validUntil && fact.validUntil < today);
  const row = (label: string, fact: Fact) => (
    <div className="grid gap-1 border-t border-slate-100 py-3 first:border-t-0 sm:grid-cols-[150px_1fr]">
      <dt className="text-sm font-bold text-ink">{label}</dt>
      <dd className="text-[15px] leading-6 text-slate-700">
        {fact.text}
        {fact.expiryNote ? <span className="block text-xs text-slate-500">{fact.expiryNote}</span> : null}
        {stale(fact) ? <span className="block text-xs font-bold text-amber-800">Checked before {fmtDate(fact.validUntil!)} — this may have changed.</span> : null}
        <SourceLink source={fact.source} />
      </dd>
    </div>
  );

  return (
    <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="plan-ride-heading">
      <h2 id="plan-ride-heading" tabIndex={-1} className="scroll-mt-20 text-2xl font-extrabold tracking-[-0.02em]">Plan this ride</h2>
      <p className="mt-1 text-sm text-slate-600">From the operators&apos; own sites, checked {fmtDate(essentials.checked)}. Fares are one-way adult fares for the section shown.</p>
      <dl className="mt-3">
        {row("Where to board", essentials.board)}
        <div className="grid gap-1 border-t border-slate-100 py-3 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-bold text-ink">How to get there</dt>
          <dd className="text-[15px] leading-6 text-slate-700">
            <ul className="grid gap-1.5">
              {essentials.access.map((a) => (
                <li key={a.from}>
                  <b className="text-ink">From {a.from}:</b> {a.text}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {row("Ride time", essentials.ride)}
        {row("Fare", essentials.fare)}
        {row("Reservations", essentials.reservation)}
        {row("When it runs", essentials.operation)}
        <div className="grid gap-1 border-t border-slate-100 py-3 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-bold text-ink">Where to buy</dt>
          <dd className="text-[15px] leading-6 text-slate-700">
            <ul className="grid gap-1.5">
              {essentials.tickets.map((t) => (
                <li key={t.text}>
                  {t.text}
                  <SourceLink source={t.source} />
                </li>
              ))}
            </ul>
            <a href="#tickets" className="mt-2 inline-block text-sm font-bold text-fuji underline underline-offset-2">Which ticket fits your trip →</a>
          </dd>
        </div>
      </dl>
      {essentials.officialLanguage ? <p className="mt-2 text-xs leading-5 text-slate-500">{essentials.officialLanguage}</p> : null}
    </section>
  );
}
