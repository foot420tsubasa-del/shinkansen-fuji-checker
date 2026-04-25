import { DecisionCard } from "@/components/travel/DecisionCard";
import { TripPicks } from "@/components/travel/TripPicks";
import { homeDecisionModules, starterTripPicks } from "@/lib/trip-picks";

export function GuideNextSteps() {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)] md:p-5">
      <div className="rounded-[24px] bg-[#07142f] px-5 py-5 text-white">
        <p className="text-[11px] font-semibold uppercase text-sky-300">
          Next steps
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight">
          After you know the Fuji-side seat
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Use the seat decision as the first planning anchor, then sort the travel pieces that usually create friction.
        </p>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {homeDecisionModules.slice(0, 4).map((module, index) => (
          <DecisionCard
            key={module.id}
            label={module.label}
            title={module.title}
            description={module.description}
            tradeoff={module.tradeoff}
            href={module.href}
            cta={module.cta}
            external={module.external}
            accent={index === 0 ? "sky" : index === 1 ? "amber" : index === 2 ? "indigo" : "emerald"}
          />
        ))}
      </div>
      <div className="mt-4">
      <TripPicks picks={starterTripPicks} compact />
      </div>
    </section>
  );
}
