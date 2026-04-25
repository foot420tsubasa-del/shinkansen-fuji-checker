import type { Metadata } from "next";
import { ArrowRight, Bed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { stayPages } from "@/lib/content/stay";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Where to Stay in Japan — Area Guides for First-Timers | fujiseat",
    description:
      "Compare the best areas to stay in Tokyo, Kyoto, Osaka, and near Mt Fuji. Find neighborhoods that match your budget, pace, and travel style.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: "Where to Stay in Japan — Area Guides",
      description:
        "Compare neighborhoods across Tokyo, Kyoto, Osaka, and Mt Fuji for your first Japan trip.",
      siteName: "fujiseat",
    },
  };
}

export default function AreasToStayIndex() {
  return (
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Where to Stay" },
        ]}
      />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-indigo-600" />
          <p className="text-[11px] font-semibold uppercase text-indigo-700">
            Where to Stay
          </p>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">
          Best areas to stay in Japan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Picking the right neighborhood makes or breaks your trip. Each guide
          compares areas by transport access, vibe, and budget — so you can book
          with confidence.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {stayPages.map((page) => (
          <Link
            key={page.slug}
            href={`/areas-to-stay/${page.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-700">
                  {page.quickRec.area} recommended
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-950 group-hover:text-indigo-800">
                  {page.title}
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  {page.description}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-600" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {page.areas.map((area) => (
                <span
                  key={area.name}
                  className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                >
                  {area.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        Hotel links are partner links — we earn a small commission at no extra cost to you.
      </p>
      <LastCheckedNote className="mt-2 text-center" />
    </Container>
  );
}
