"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { trackAffiliateClick, trackAffiliateCtaView, trackCtaClick } from "@/lib/analytics";

type CarType = "ordinary-reserved" | "ordinary-nonreserved" | "green";

type CarSpec = {
  id: CarType;
  /** Car numbers on a 16-car Tokaido Nozomi/Hikari formation. */
  cars: string;
  layout: "3+2" | "2+2";
  left: string[];
  right: string[];
  /** Window seat facing Mt. Fuji when heading Tokyo → Kyoto. */
  fuji: string;
  seaSide: string;
};

/* 16-car Tokaido Shinkansen (Nozomi / Hikari). Ordinary cars are 3+2 with
   A-B-C on the sea side and D-E on the Fuji side; Green Cars are 2+2 with no
   Seat E, which is the detail readers most often get wrong. */
const CARS: CarSpec[] = [
  {
    id: "ordinary-nonreserved",
    cars: "Cars 1–3",
    layout: "3+2",
    left: ["A", "B", "C"],
    right: ["D", "E"],
    fuji: "E",
    seaSide: "A",
  },
  {
    id: "ordinary-reserved",
    cars: "Cars 4–7, 11–16",
    layout: "3+2",
    left: ["A", "B", "C"],
    right: ["D", "E"],
    fuji: "E",
    seaSide: "A",
  },
  {
    id: "green",
    cars: "Cars 8–10",
    layout: "2+2",
    left: ["A", "B"],
    right: ["C", "D"],
    fuji: "D",
    seaSide: "A",
  },
];

export type SeatMapCopy = {
  eyebrow: string;
  question: string;
  carLabels: Record<CarType, string>;
  /** "{seat}" is substituted. */
  result: string;
  seaNote: string;
  rowsNote: string;
  directionNote: string;
  book: string;
  legendFuji: string;
  legendWindow: string;
  legendOther: string;
  aisle: string;
  seaSide: string;
  fujiSide: string;
};

function Seat({ letter, state }: { letter: string; state: "fuji" | "window" | "plain" }) {
  const style =
    state === "fuji"
      ? "border-[#2E7D5B] bg-[#2E7D5B] text-white shadow-sm"
      : state === "window"
        ? "border-sky-300 bg-sky-50 text-sky-900"
        : "border-slate-200 bg-white text-slate-500";
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] border text-sm font-bold sm:h-11 sm:w-11 ${style}`}
    >
      {letter}
    </span>
  );
}

/**
 * Seat map for the car the reader is actually booking.
 *
 * The page ranks for "shinkansen seat map" (261 impressions in 28 days, the
 * top query by a wide margin) but answered with prose, a table and a generic
 * A–E diagram, and converted at 0.7% against the guide's 2.6%. This gives the
 * searched artefact — pick your car, see that car's rows, the Fuji-side window
 * lit — and then the booking step, the same answer-then-book shape that lifted
 * the guide.
 */
export function SeatMapTool({
  href,
  locale,
  pagePath,
  copy,
}: {
  href: string;
  locale: string;
  pagePath: string;
  copy: SeatMapCopy;
}) {
  const [carType, setCarType] = useState<CarType | null>(null);
  const car = CARS.find((c) => c.id === carType) ?? null;

  const choose = (next: CarType) => {
    setCarType(next);
    trackCtaClick({
      placement: "seat_map_car_select",
      href: pagePath,
      label: next,
      category: "seat_checker",
      page_path: pagePath,
      locale,
    });
    trackAffiliateCtaView({
      provider: "klook",
      product: "shinkansen",
      placement: "seat_map_result",
      page_path: pagePath,
      link_id: "seat_map_klook_booking",
      locale,
    });
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#0b214a]/15 bg-[#f4f8fd] shadow-sm">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1d4e89]">
          {copy.eyebrow}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-950">{copy.question}</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {CARS.map((c) => {
            const active = carType === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.id)}
                aria-pressed={active}
                className={[
                  "flex min-h-11 flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4e89]/40",
                  active
                    ? "border-[#0b214a] bg-[#0b214a] text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-[#1d4e89]",
                ].join(" ")}
              >
                <span className="text-[13px] font-semibold leading-tight">
                  {copy.carLabels[c.id]}
                </span>
                <span
                  className={`text-[10px] leading-tight ${active ? "text-slate-300" : "text-slate-500"}`}
                >
                  {c.cars} · {c.layout}
                </span>
              </button>
            );
          })}
        </div>

        {car ? (
          <div className="mt-3.5 rounded-xl border border-[#0b214a]/15 bg-white p-3.5">
            <p className="text-base font-bold text-slate-950">
              {copy.result.replace("{seat}", car.fuji)}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-slate-600">
              {copy.seaNote.replace("{seat}", car.seaSide)}
            </p>

            {/* Small screens carry the side markers above the rows, because the
                seats plus two vertical labels overflow a 375px viewport. */}
            <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide sm:hidden">
              <span className="text-slate-500">← {copy.seaSide}</span>
              <span className="text-[#2E7D5B]">{copy.fujiSide} →</span>
            </div>

            <div className="mt-2 flex items-stretch gap-2 sm:mt-3">
              <span className="hidden w-9 shrink-0 items-center justify-center rounded-[9px] bg-slate-100 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500 sm:flex">
                <span className="[writing-mode:vertical-rl] rotate-180 py-1">{copy.seaSide}</span>
              </span>

              <div className="flex flex-1 flex-col gap-1.5">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-center gap-1.5">
                    <span className="w-5 shrink-0 text-right text-[10px] font-semibold text-slate-400">
                      {row}
                    </span>
                    {car.left.map((s) => (
                      <Seat
                        key={s}
                        letter={s}
                        state={s === car.seaSide ? "window" : "plain"}
                      />
                    ))}
                    <span className="mx-0.5 flex h-10 w-5 shrink-0 items-center justify-center rounded-[9px] border border-dashed border-slate-300 text-[8px] font-semibold uppercase text-slate-400 sm:h-11 sm:w-6">
                      <span className="[writing-mode:vertical-rl] rotate-180">{copy.aisle}</span>
                    </span>
                    {car.right.map((s) => (
                      <Seat key={s} letter={s} state={s === car.fuji ? "fuji" : "plain"} />
                    ))}
                  </div>
                ))}
              </div>

              <span className="hidden w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#e8f3ed] text-[9px] font-bold uppercase leading-tight tracking-wide text-[#2E7D5B] sm:flex">
                <span className="[writing-mode:vertical-rl] rotate-180 py-1">{copy.fujiSide}</span>
              </span>
            </div>

            <p className="mt-2.5 text-[11px] leading-5 text-slate-500">{copy.rowsNote}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] leading-5 text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-[#2E7D5B] bg-[#2E7D5B]" aria-hidden="true" />
                {copy.legendFuji.replace("{seat}", car.fuji)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-sky-300 bg-sky-50" aria-hidden="true" />
                {copy.legendWindow}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] border border-slate-200 bg-white" aria-hidden="true" />
                {copy.legendOther}
              </span>
            </div>

            <p className="mt-3 text-[12px] leading-5 text-slate-600">{copy.directionNote}</p>

            <a
              href={href}
              target="_blank"
              rel={AFFILIATE_REL}
              onClick={() =>
                trackAffiliateClick({
                  category: "train",
                  provider: "klook",
                  product: "shinkansen",
                  placement: "seat_map_result",
                  link_id: "seat_map_klook_booking",
                  page_path: pagePath,
                  page_type: "shinkansen_tool",
                  locale,
                  href,
                  label: copy.book,
                  selected_seat: car.fuji,
                })
              }
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94A32]/40 sm:w-auto sm:min-w-[15rem] sm:max-w-[22rem] md:min-h-11"
            >
              {copy.book}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
