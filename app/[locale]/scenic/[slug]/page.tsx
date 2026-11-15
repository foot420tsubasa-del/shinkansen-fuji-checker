import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { getAlternates } from "@/i18n/hreflang";
import { RouteViewMap, type RouteView } from "@/components/scenic/RouteViewMap";
import { ScenicPassCard } from "@/components/scenic/ScenicPassCard";
import catalogue from "@/data/scenic-routes.json";
import { JR_PASS_URL } from "@/src/affiliateLinks";

type Props = { params: Promise<{ locale: string; slug: string }> };

type LiveRoute = {
  id: string;
  slug: string;
  status: string;
  title: string;
  line: string;
  between: [string, string];
  stations: { name: string; lat: number; lng: number }[];
  targets: { id: string; name: string; lat: number; lng: number }[];
  views: (RouteView & { kmFrom: number; kmTo: number; maxAngle: number })[];
  viewshed: string;
  season: string;
  verification: string;
  image: { src: string; alt: string; illustrative: boolean };
};

const PAGE_COPY: Record<string, { title: string; description: string; h1: string; labelStations: string[] }> = {
  "hokuriku-shinkansen": {
    title: "Hokuriku Shinkansen: Which Side for Mt. Asama and the Japan Alps?",
    description:
      "Going from Tokyo to Kanazawa, Mt. Asama is on the right between Karuizawa and Sakudaira, and the Northern Alps are on the left from Kurobe-Unazukionsen to Shin-Takaoka. A terrain model of every sight line, with a map.",
    h1: "Hokuriku Shinkansen: which side for Mt. Asama and the Japan Alps?",
    labelStations: ["Takasaki", "Karuizawa", "Sakudaira", "Nagano", "Joetsu-Myoko", "Itoigawa", "Kurobe-Unazukionsen", "Toyama", "Kanazawa"],
  },
};

function liveRoute(slug: string): LiveRoute | undefined {
  return (catalogue.routes as unknown as LiveRoute[]).find((r) => r.slug === slug && r.status === "live");
}

export function generateStaticParams() {
  return (catalogue.routes as unknown as LiveRoute[])
    .filter((r) => r.status === "live" && r.slug && PAGE_COPY[r.slug])
    .map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const copy = PAGE_COPY[slug];
  if (!copy || !liveRoute(slug)) return {};
  return {
    title: `${copy.title} | fujiseat`,
    description: copy.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(`/scenic/${slug}`, locale),
    openGraph: { title: copy.title, description: copy.description, siteName: "fujiseat — Japan Rail Seats, Stays & Routes" },
  };
}

/** Degrees above the horizon in terms a traveller can picture. */
function howBig(angle: number): string {
  if (angle >= 8) return "Big: a fist high at arm's length";
  if (angle >= 4) return "Clear: three fingers high";
  return "Small: a thumb high";
}
const flip = (side: "left" | "right") => (side === "left" ? "right" : "left");

export default async function ScenicRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = liveRoute(slug);
  const copy = PAGE_COPY[slug];
  if (!route || !copy) notFound();

  const viewshed = JSON.parse(readFileSync(path.join(process.cwd(), route.viewshed), "utf8"));
  const [from, to] = route.between;

  const faq = [
    ...route.views.map((v) => ({
      q: `Which side of the ${route.line} is ${v.name} on?`,
      a: `Going from ${from} to ${to}, ${v.name} is on the ${v.sideToKanazawa} side, between ${v.from} and ${v.to}. Going from ${to} to ${from}, it is on the ${flip(v.sideToKanazawa)}.`,
    })),
    {
      q: `Which seat letter should I book on the ${route.line}?`,
      a: "Pick a window seat on the side you need for your direction of travel when you choose seats. We give sides rather than seat letters because we have not yet verified the letters for this line.",
    },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <main className="page-shell min-h-screen text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteHeader />
      <article className="mx-auto max-w-[900px] px-5 pb-16 pt-8 md:pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-fuji">Scenic routes · {route.line}</p>
        <h1 className="mt-3 text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[44px]">{copy.h1}</h1>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[22px] bg-ink">
          <Image src={route.image.src} alt={route.image.alt} fill priority sizes="(min-width: 940px) 900px, 100vw" className="object-cover" />
          {route.image.illustrative ? (
            <span className="absolute bottom-2 right-3 text-[10px] font-medium text-white/75">Illustrative image</span>
          ) : null}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { label: `${from} → ${to}`, side: (v: RouteView) => v.sideToKanazawa },
            { label: `${to} → ${from}`, side: (v: RouteView) => flip(v.sideToKanazawa) },
          ].map((dir) => (
            <div key={dir.label} className="rounded-[22px] bg-ink p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">{dir.label}</p>
              <ul className="mt-3 grid gap-3">
                {route.views.map((v) => (
                  <li key={v.id} className="flex gap-3 text-[15px] leading-6">
                    <span
                      className={[
                        "mt-0.5 shrink-0 self-start rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase",
                        dir.side(v) === "right" ? "bg-[#d94a32] text-white" : "bg-[#2f6fd6] text-white",
                      ].join(" ")}
                    >
                      {dir.side(v)}
                    </span>
                    <span>
                      <b>{v.name}</b>
                      <span className="block text-sm text-white/70">
                        {dir.label.startsWith(from) ? `${v.from} → ${v.to}` : `${v.to} → ${v.from}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <RouteViewMap
            points={viewshed.points}
            stations={route.stations}
            targets={route.targets}
            views={route.views}
            labelStations={copy.labelStations}
            direction={viewshed.direction}
          />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Each view, and how big it looks</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.06em] text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">View</th>
                  <th className="px-4 py-2.5 font-semibold">Where</th>
                  <th className="px-4 py-2.5 font-semibold">Size</th>
                </tr>
              </thead>
              <tbody>
                {route.views.map((v) => (
                  <tr key={v.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-semibold">{v.name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {v.from} – {v.to}
                      <span className="block text-xs text-slate-500">{Math.round(v.kmTo - v.kmFrom)} km of line, with gaps for tunnels and hills</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{howBig(v.maxAngle)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-5 grid gap-2.5">
            {[
              `When: ${route.season}. The Hokuriku sky is often overcast in midwinter, so check the forecast before you count on the Alps.`,
              "Faster trains still pass every one of these stretches; they just do not stop. The views are between stations, not at them.",
              "Seat letters: we give sides, not letters, until the letters for this line are verified. Choose a window seat on the side you need when you book.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-[16px] leading-7 text-slate-700">
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <ScenicPassCard href={JR_PASS_URL} routeId={route.id} line={route.line} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Questions</h2>
          <div className="mt-4 grid gap-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <summary className="cursor-pointer list-none text-[16px] font-bold">{item.q}</summary>
                <p className="mt-2 text-[15px] leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          <p className="font-bold text-ink">How we worked this out</p>
          <p className="mt-1">{route.verification}</p>
        </section>

        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-fuji">
          Mt. Fuji from the Tokaido Shinkansen <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
      <SiteFooter />
    </main>
  );
}
