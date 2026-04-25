export function LastCheckedNote({ className = "" }: { className?: string }) {
  return (
    <p className={["text-[10px] leading-5 text-slate-400", className].join(" ")}>
      Last checked: April 2026. Prices, schedules, and rules can change. Always confirm details on the official operator or booking site before travel.
    </p>
  );
}
