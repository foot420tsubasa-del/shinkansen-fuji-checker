import type { Metadata } from "next";
import { ArrowRight, Map } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { itineraryPages } from "@/lib/content/itineraries";

const paceConfig = {
  relaxed: { label: "Relaxed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  moderate: { label: "Moderate", color: "bg-amber-50 text-amber-700 border-amber-200" },
  fast: { label: "Fast", color: "bg-red-50 text-red-700 border-red-200" },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Japan Itineraries — 5 to 14 Day Trip Plans | fujiseat",
    description:
      "Day-by-day Japan itineraries for first-time visitors. From a 5-day express trip to a 14-day deep dive — each plan includes hotels, transport, and booking links.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: "Japan Itineraries — Day-by-Day Trip Plans",
      description:
        "Detailed itineraries from 5 to 14 days. Hotels, transport, and activities included.",
      siteName: "fujiseat",
    },
  };
}

export default function ItinerariesIndex() {
  return (
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Itineraries" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-sky-600" />
          <p className="text-[11px] font-semibold uppercase text-sky-700">
            Itineraries
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
          Japan trip plans — day by day
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Each itinerary is a complete day-by-day plan with hotel recommendations,
          transport tips, and booking links. Pick the duration that fits your schedule.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {itineraryPages.map((page) => {
          const pace = paceConfig[page.pace];
          const cities = [...new Set(page.days.map((d) => d.location))];
          return (
            <Link
              key={page.slug}
              href={`/itineraries/${page.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {page.duration}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${pace.color}`}>
                      {pace.label}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-slate-950 group-hover:text-sky-800">
                    {page.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {page.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-sky-600" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Best for: {page.bestFor}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        Booking links are partner links — we earn a small commission at no extra cost to you.
      </p>
      <LastCheckedNote className="mt-2 text-center" />
    </Container>
  );
}
