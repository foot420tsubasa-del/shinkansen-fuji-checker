import { Mountain, Train, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-900 flex flex-col">
      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-b from-sky-300 to-sky-500 flex items-center justify-center shadow-sm">
              <Mountain className="h-6 w-6 text-white" />
              <div className="pointer-events-none absolute bottom-1.5 h-2 w-4 bg-white/95 rounded-t-[999px] rounded-b-[6px]" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">
                Mt. Fuji from the Shinkansen – Quick Guide
              </h1>
              <p className="text-xs text-slate-500">
                How to get the best Mt. Fuji view between Tokyo and Osaka/Kyoto.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Seat Checker</span>
          </Link>
        </header>

        {/* Intro */}
        <section className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <p>
            Many visitors to Japan want to see Mt. Fuji from the Shinkansen, but
            it&apos;s easy to miss if you don&apos;t know which side or
            section to sit in. This guide explains{" "}
            <span className="font-semibold">
              where and when Mt. Fuji is visible
            </span>{" "}
            on the Tokaido Shinkansen, and how to make it easier by using our
            free Seat Checker tool.
          </p>
        </section>

        <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
          {/* Section 1: Which side? */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Which side of the train is Mt. Fuji on?
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Tokyo → Osaka / Kyoto:</span>{" "}
                Mt. Fuji is on the <span className="font-semibold">right</span>{" "}
                side of the train (window seat E in standard cars).
              </li>
              <li>
                <span className="font-semibold">Osaka / Kyoto → Tokyo:</span>{" "}
                Mt. Fuji is on the{" "}
                <span className="font-semibold">left</span> side of the train
                (again, window seat E in standard cars).
              </li>
            </ul>
            <p className="mt-2 text-[12px] text-slate-600">
              In most standard (non–Green Car) 3+2 seat cars,{" "}
              <span className="font-semibold">Seat E</span> is the window seat
              on the Mt. Fuji side.
            </p>
          </section>

          {/* Section 2: Best section & timing */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Best section and timing to see Mt. Fuji
            </h2>
            <p>
              Mt. Fuji is usually visible on clear days between{" "}
              <span className="font-semibold">Shin-Yokohama</span> and{" "}
              <span className="font-semibold">Shizuoka</span>, especially
              around <span className="font-semibold">Shin-Fuji</span> station.
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Direction:</span> Tokyo ⇄ Osaka /
                Kyoto (Tokaido Shinkansen: Nozomi / Hikari / Kodama)
              </li>
              <li>
                <span className="font-semibold">Time of day:</span> Late morning
                to early afternoon often gives a clearer silhouette. In summer,
                early morning can also work well.
              </li>
              <li>
                <span className="font-semibold">Weather:</span> On cloudy or
                hazy days, Mt. Fuji may be hard to see even from the right seat.
              </li>
            </ul>
          </section>

          {/* Section 3: Practical tips */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Practical tips for getting a good view
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Reserve your seat:</span> When
                booking, choose a reserved seat in a standard car and request
                <span className="font-semibold"> seat E</span> on the Mt. Fuji
                side if possible.
              </li>
              <li>
                <span className="font-semibold">Keep your camera ready:</span>{" "}
                Mt. Fuji can appear and disappear quickly, especially when
                passing Shin-Fuji station.
              </li>
              <li>
                <span className="font-semibold">Watch the announcements:</span>{" "}
                Some trains announce when Mt. Fuji is visible—listen for
                English announcements.
              </li>
            </ul>
          </section>

          {/* Section 4: Use the Seat Checker */}
          <section className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-4 shadow-sm shadow-sky-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-700" />
              Make it easy with the Seat Checker
            </h2>
            <p>
              If you don&apos;t want to remember all the details, you can use
              our free{" "}
              <span className="font-semibold">
                Shinkansen Mt. Fuji Seat Checker
              </span>
              . Just choose your direction and it tells you which seat to book.
            </p>
            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
              >
                Open Seat Checker
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
