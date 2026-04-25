import type { Metadata } from "next";
import { ArrowRight, Plane } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { transferPages } from "@/lib/content/transfers";

export const metadata: Metadata = {
  title: "Airport Transfers in Japan — Narita & Haneda to Tokyo | fujiseat",
  description:
    "Compare the fastest, cheapest, and easiest ways to get from Narita and Haneda airports to central Tokyo. N'EX, Skyliner, limousine bus, and more.",
  openGraph: {
    title: "Airport Transfers — Narita & Haneda to Tokyo",
    description:
      "Compare the fastest, cheapest, and easiest ways to get from Narita and Haneda airports to Tokyo.",
    siteName: "fujiseat",
  },
};

export default function AirportTransfersIndex() {
  return (
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Airport Transfers" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-sky-600" />
          <p className="text-[11px] font-semibold uppercase text-sky-700">
            Airport Transfers
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
          How to get from the airport to Tokyo
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Narita and Haneda both have fast, easy connections to central Tokyo.
          Pick your airport and destination below to compare options side by side.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {transferPages.map((page) => (
          <Link
            key={page.slug}
            href={`/airport-transfers/${page.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-sky-700">
                  {page.from} → {page.to}
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-950 group-hover:text-sky-800">
                  {page.title}
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {page.description}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-sky-600" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {page.options.map((opt) => (
                <span
                  key={opt.name}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600"
                >
                  {opt.name} · {opt.duration} · {opt.cost}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        All transfer information verified as of 2024. Prices may vary by season.
      </p>
    </Container>
  );
}
