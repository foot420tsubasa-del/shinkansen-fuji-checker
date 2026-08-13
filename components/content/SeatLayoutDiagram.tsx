type Variant = "ordinary" | "green";

type SeatCell = {
  letter: string;
  window?: boolean;
  /** The Mt. Fuji-side window for the Tokyo → Kyoto direction. */
  fuji?: boolean;
};

const LAYOUTS: Record<Variant, { left: SeatCell[]; right: SeatCell[]; caption: string }> = {
  ordinary: {
    // 3+2: A B C | D E, with E on the Fuji side heading to Kyoto.
    left: [{ letter: "A", window: true }, { letter: "B" }, { letter: "C" }],
    right: [{ letter: "D" }, { letter: "E", window: true, fuji: true }],
    caption: "Ordinary Car — 3+2 seating",
  },
  green: {
    // 2+2: A B | C D, no Seat E; D takes the Fuji-side window.
    left: [{ letter: "A", window: true }, { letter: "B" }],
    right: [{ letter: "C" }, { letter: "D", window: true, fuji: true }],
    caption: "Green Car — 2+2 seating",
  },
};

function Seat({ seat }: { seat: SeatCell }) {
  const base =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border text-sm font-bold sm:h-12 sm:w-12 sm:text-base";
  const style = seat.fuji
    ? "border-[#2E7D5B] bg-[#2E7D5B] text-white shadow-sm"
    : seat.window
      ? "border-sky-300 bg-sky-50 text-sky-900"
      : "border-slate-200 bg-white text-slate-500";
  return (
    <span className={`${base} ${style}`} aria-hidden="true">
      {seat.letter}
    </span>
  );
}

/**
 * Seat-letter map for the Tokaido Shinkansen. The page explained the layout in
 * prose and a table only; readers arriving from "which seat" searches are
 * matching a picture in their head, so the diagram carries the answer faster
 * than the table does. Decorative markup is aria-hidden and the meaning is
 * repeated in the visible legend, so nothing depends on colour alone.
 */
export function SeatLayoutDiagram({
  variant,
  directionNote,
}: {
  variant: Variant;
  directionNote: string;
}) {
  const layout = LAYOUTS[variant];
  const fujiLetter = layout.right.find((s) => s.fuji)?.letter ?? "E";

  return (
    <figure className="mt-4 overflow-hidden rounded-[18px] border border-slate-200 bg-[#f8fbff]">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {layout.caption}
        </p>

        {/* Small screens: side labels stack above and below, because five seats
            plus two vertical labels overflow a 375px viewport. */}
        <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide sm:hidden">
          <span className="text-slate-500">← Sea side</span>
          <span className="text-[#2E7D5B]">Fuji side →</span>
        </div>

        <div className="mt-2 flex items-stretch gap-2 sm:mt-3 sm:gap-3">
          {/* Sea side */}
          <span className="hidden w-9 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-500 sm:flex sm:w-11 sm:text-[10px]">
            <span className="[writing-mode:vertical-rl] rotate-180 py-1">Sea side</span>
          </span>

          <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2">
            {layout.left.map((seat) => (
              <Seat key={seat.letter} seat={seat} />
            ))}
            {/* Aisle */}
            <span className="mx-0.5 flex h-11 w-6 shrink-0 items-center justify-center rounded-[10px] border border-dashed border-slate-300 text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:h-12 sm:w-8 sm:text-[10px]">
              <span className="[writing-mode:vertical-rl] rotate-180">Aisle</span>
            </span>
            {layout.right.map((seat) => (
              <Seat key={seat.letter} seat={seat} />
            ))}
          </div>

          {/* Fuji side */}
          <span className="hidden w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e8f3ed] text-[9px] font-bold uppercase leading-tight tracking-wide text-[#2E7D5B] sm:flex sm:w-11 sm:text-[10px]">
            <span className="[writing-mode:vertical-rl] rotate-180 py-1">Fuji side</span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] leading-5 text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-[#2E7D5B] bg-[#2E7D5B]" aria-hidden="true" />
            Seat {fujiLetter} — Mt. Fuji-side window
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-sky-300 bg-sky-50" aria-hidden="true" />
            Other window seat
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-slate-200 bg-white" aria-hidden="true" />
            Aisle / middle
          </span>
        </div>
      </div>

      <figcaption className="border-t border-slate-200 bg-white px-4 py-2.5 text-[12px] leading-5 text-slate-600 sm:px-5">
        {directionNote}
      </figcaption>
    </figure>
  );
}
