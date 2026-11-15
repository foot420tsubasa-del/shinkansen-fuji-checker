import { Link } from "@/i18n/navigation";
import { SUICA_GUIDES, type SuicaGuide } from "@/data/suica-guides";
import { SuicaDiagram } from "./SuicaDiagram";

/** Picture-first grid of the short Suica guides: diagram on top, a short title under it. */
export function SuicaGuideGrid({ guides = SUICA_GUIDES }: { guides?: SuicaGuide[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {guides.map((g) => (
        <li key={g.slug}>
          <Link
            href={`/how-to-buy-suica/${g.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d9e5f2] bg-white shadow-[0_6px_18px_rgba(9,35,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(9,35,70,0.12)]"
          >
            <SuicaDiagram id={g.diagram} title={g.title} className="block aspect-[4/3] w-full" />
            <span className="flex flex-1 items-center justify-center border-t border-[#e6edf5] px-3 py-3 text-center text-[13.5px] font-bold leading-snug text-[#082653] group-hover:text-[#145aa0] md:text-[15px]">
              {g.card}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
