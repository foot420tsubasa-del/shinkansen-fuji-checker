import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import JapanTripCommandCenter from "@/src/JapanTripCommandCenter";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { LanguageSelector } from "../components/LanguageSelector";

export const metadata: Metadata = {
  title: "Japan Trip Command Center — fujiseat.com",
  description:
    "Use an interactive Japan trip command center to organize Tokyo, Mt. Fuji Shinkansen views, Kyoto, Osaka, stay areas, airport transfers, and booking essentials.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Japan Trip Command Center",
    description: "Interactive route map and planning checklist for Tokyo, Mt. Fuji Shinkansen views, Kyoto, Osaka, stay areas, airport transfers, and booking essentials.",
    siteName: "fujiseat",
    images: [{ url: "https://fujiseat.com/og-command-center.png", width: 1200, height: 630 }],
  },
};

export default function CommandCenterPage() {
  return (
    <main>
      <section className="bg-[#0a0e1a] px-5 py-6 text-[#c8d8f0] md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4a9eff]">
                Japan trip route map
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                Japan Trip Command Center
              </h1>
            </div>
            <LanguageSelector />
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8fa8c8]">
            Plan the practical flow of a first Japan trip: Tokyo arrival, Mt.
            Fuji views from the Shinkansen, Kyoto and Osaka stays, airport
            transfers, hotel-area decisions, and route timing.
          </p>
          <nav
            aria-label="Command Center planning links"
            className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#8fd0ff]"
          >
            <Link href="/guide" className="underline underline-offset-4">Seat Checker</Link>
            <Link href="/itineraries" className="underline underline-offset-4">Itineraries</Link>
            <Link href="/areas-to-stay" className="underline underline-offset-4">Stay Areas</Link>
            <Link href="/airport-transfers" className="underline underline-offset-4">Airport Transfers</Link>
          </nav>
          <div className="mt-5 max-w-xl rounded-2xl border border-[#233653] bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8fd0ff]">
              Practice tool
            </p>
            <h2 className="mt-1 text-base font-semibold text-white">
              Practice station navigation
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#8fa8c8]">
              Learn exits, transfer gates, and platform signs before your trip.
            </p>
            <TrackedCtaLink
              href="/station-practice"
              placement="command_center_station_practice"
              label="Start station practice"
              pagePath="/command-center"
              category="station_practice"
              className="mt-3 inline-flex text-xs font-semibold text-[#8fd0ff] underline underline-offset-4 hover:text-white"
            >
              Start station practice
            </TrackedCtaLink>
          </div>
        </div>
        <noscript>
          The interactive Command Center requires JavaScript. You can still
          plan your route with the Seat Checker, itinerary guides, stay-area
          guides, and airport transfer guides.
        </noscript>
      </section>
      <JapanTripCommandCenter />
    </main>
  );
}
