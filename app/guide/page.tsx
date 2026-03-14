import type { Metadata } from "next";
import { Mountain, Train, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { KlookCTA } from "../components/KlookCTA";

export const metadata: Metadata = {
  title: "How to See Mt. Fuji from the Shinkansen — Seat, Side & Timing Guide",
  description:
    "Which seat to book for the best Mt. Fuji view on the Shinkansen? Seat E, right side (Tokyo→Osaka). Complete guide with season tips, car numbers, JR Pass vs ticket comparison, and FAQ.",
};

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
              {/* H1 にキーワードをしっかり入れる */}
              <h1 className="text-base font-semibold tracking-tight">
                How to see Mt. Fuji from the Shinkansen (Tokyo ⇄ Osaka/Kyoto)
              </h1>
              <p className="text-xs text-slate-500">
                A practical guide to the best Shinkansen seats, sections, and timing for Mt. Fuji views.
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Written by a Japanese local, for visitors who don&apos;t want to miss the Mt. Fuji × Shinkansen view.
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
          {/* 追加の H2（SEO寄せ） */}
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            Mt. Fuji view basics on the Tokaido Shinkansen
          </h2>
          <p>
            Many visitors to Japan want to see Mt. Fuji from the Shinkansen, but
            it&apos;s easy to miss if you don&apos;t know which side or section
            to sit in. This guide explains{" "}
            <span className="font-semibold">
              where and when Mt. Fuji is visible from the Tokaido Shinkansen
            </span>{" "}
            between Tokyo and Osaka/Kyoto, and how to make it easier by using our
            free Shinkansen Mt. Fuji Seat Checker tool.
          </p>
          <p className="mt-2 text-[12px] text-slate-600">
            You won&apos;t see Mt. Fuji for the whole ride – it appears only for a short
            stretch of the journey, and it can be completely hidden by clouds on some days.
          </p>
        </section>

        {/* TL;DR */}
        <section className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            TL;DR – quick answers
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="font-semibold">Which side?</span> Tokyo → Osaka/Kyoto ={" "}
              <span className="font-semibold">right</span> side. Osaka/Kyoto → Tokyo ={" "}
              <span className="font-semibold">left</span> side.
            </li>
            <li>
              <span className="font-semibold">Which seat?</span> In most standard 3+2 cars,{" "}
              <span className="font-semibold">Seat E</span> is the Mt. Fuji window seat.
            </li>
            <li>
              <span className="font-semibold">Where on the route?</span> Around{" "}
              <span className="font-semibold">Shin-Fuji</span> station, between Shin-Yokohama
              and Shizuoka.
            </li>
            <li>
              <span className="font-semibold">When?</span> Clear days, usually late morning
              to early afternoon (season-dependent).
            </li>
            <li>
              <span className="font-semibold">Don&apos;t want to memorize this?</span>{" "}
              Use the free{" "}
              <span className="font-semibold">
                Shinkansen Mt. Fuji Seat Checker
              </span>{" "}
              on{" "}
              <span className="font-semibold">
                fujiseat.com
              </span>{" "}
              before you book.
            </li>
          </ul>
        </section>

        <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
          {/* Section 1: Which side? */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Which side of the Shinkansen is Mt. Fuji on? (Seat E explained)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Tokyo → Osaka / Kyoto:</span>{" "}
                Mt. Fuji is on the{" "}
                <span className="font-semibold">right</span> side of the train
                (window seat E in most standard cars).
              </li>
              <li>
                <span className="font-semibold">Osaka / Kyoto → Tokyo:</span>{" "}
                Mt. Fuji is on the{" "}
                <span className="font-semibold">left</span> side of the train
                (again, window seat E in most standard cars).
              </li>
            </ul>
            <p className="mt-2 text-[12px] text-slate-600">
              In most standard (non–Green Car) 3+2 seat cars,{" "}
              <span className="font-semibold">Seat E</span> is the window seat
              on the Mt. Fuji side. Green Cars may have a different layout, but
              the same left/right rule still applies. Some older guides still mention
              different seat letters, but on most modern 3+2 standard cars, Seat E
              is the Mt. Fuji window seat.
            </p>
          </section>

          {/* Section 2: Best section & timing */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Best section and timing to see Mt. Fuji from the train
            </h2>
            <p>
              You won&apos;t see Mt. Fuji for the whole ride – it appears only for a short
              stretch of the journey. Mt. Fuji is usually visible on clear days between{" "}
              <span className="font-semibold">Shin-Yokohama</span> and{" "}
              <span className="font-semibold">Shizuoka</span>, especially
              around <span className="font-semibold">Shin-Fuji</span> station.
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Route:</span> Tokaido
                Shinkansen between Tokyo, Nagoya and Osaka/Kyoto (Nozomi /
                Hikari / Kodama).
              </li>
              <li>
                <span className="font-semibold">Time of day:</span> Late
                morning to early afternoon often gives a clearer silhouette. In
                summer, early morning can also work well.
              </li>
              <li>
                <span className="font-semibold">Weather:</span> On cloudy or
                hazy days, Mt. Fuji may be hard to see even from the correct
                side and seat.
              </li>
            </ul>
          </section>

          {/* Section 3: Practical tips */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Practical seat tips for a better Mt. Fuji view
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Reserve your seat:</span> When
                booking, choose a reserved seat in a standard car and request
                <span className="font-semibold"> seat E</span> on the Mt. Fuji
                side if possible.
              </li>
              <li>
                <span className="font-semibold">Avoid obstructions:</span>{" "}
                Window seats near the middle of the car often have the clearest
                views, away from doors and bulkheads.
              </li>
              <li>
                <span className="font-semibold">Keep your camera ready:</span>{" "}
                Mt. Fuji can appear and disappear quickly, especially around
                Shin-Fuji station.
              </li>
              <li>
                <span className="font-semibold">Listen for announcements:</span>{" "}
                Some trains announce when Mt. Fuji is visible—listen for English
                announcements if you&apos;re not watching the map.
              </li>
            </ul>
          </section>

          <KlookCTA />

          {/* Section 4: Common mistakes */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Common mistakes when trying to see Mt. Fuji
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Booking the wrong side:</span>{" "}
                Forgetting that Tokyo → Osaka/Kyoto is right side, and the
                opposite for the return.
              </li>
              <li>
                <span className="font-semibold">Expecting a guaranteed view:</span>{" "}
                Even with the correct seat, clouds or haze can fully cover the
                mountain.
              </li>
              <li>
                <span className="font-semibold">Looking too late:</span> If you
                start looking only near Shizuoka, you might miss the best view
                around Shin-Fuji.
              </li>
            </ul>
          </section>

          {/* Section A: JR Pass vs Single Ticket */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              JR Pass vs Single Ticket: Which is cheaper?
            </h2>
            <p className="mb-2">
              Single reserved seat prices (Tokyo ↔ Osaka/Kyoto):
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Tokyo → Shin-Osaka: approx. <span className="font-semibold">¥14,720</span></li>
              <li>Tokyo → Kyoto: approx. <span className="font-semibold">¥13,850</span></li>
              <li>Round trip Tokyo ↔ Osaka: approx. <span className="font-semibold">¥29,440</span></li>
            </ul>
            <p className="mt-2.5 mb-2">
              JR Pass prices:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-semibold">7-day:</span> ¥50,000</li>
              <li><span className="font-semibold">14-day:</span> ¥80,000</li>
              <li><span className="font-semibold">21-day:</span> ¥100,000</li>
            </ul>
            <div className="mt-3 space-y-2 text-[12px] text-slate-600">
              <p>
                <span className="font-semibold">JR Pass is worth it</span> if taking 2+ long Shinkansen
                rides (e.g. Tokyo → Kyoto → Hiroshima → Tokyo). For a single round trip Tokyo ↔ Osaka,
                single tickets are cheaper.
              </p>
              <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                <span className="font-semibold">Note:</span> The Nozomi (fastest) is <span className="font-semibold">NOT covered</span> by
                the JR Pass. Use Hikari or Kodama — these stop near Shin-Fuji station, which is actually
                better for Mt. Fuji views.
              </p>
            </div>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          {/* Section B: Best Season & Time of Day */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              Best Season &amp; Time of Day to See Mt. Fuji
            </h2>
            <p className="mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">Season guide</p>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
              {[
                { season: "Winter (Dec–Feb)", stars: "★★★★★", rating: "Best", note: "Snow-capped, clear skies", color: "text-emerald-700" },
                { season: "Autumn (Sep–Nov)", stars: "★★★★", rating: "Very good", note: "Clear skies, early snow from October", color: "text-sky-700" },
                { season: "Spring (Mar–May)", stars: "★★★", rating: "Good", note: "More haze possible", color: "text-amber-700" },
                { season: "Summer (Jun–Aug)", stars: "★", rating: "Difficult", note: "Clouds, haze, rainy season", color: "text-slate-500" },
              ].map(({ season, stars, rating, note, color }) => (
                <div key={season} className="flex items-start gap-2 px-3 py-2 bg-white">
                  <span className={`shrink-0 font-semibold ${color}`}>{stars}</span>
                  <div>
                    <span className="font-semibold text-slate-800">{season}:</span>{" "}
                    <span className={`font-semibold ${color}`}>{rating}</span>
                    {" "}— {note}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">Time of day</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">Before 10am:</span> Often clearest before haze builds
              </li>
              <li>
                <span className="font-semibold">Late morning to early afternoon:</span> Good on clear days
              </li>
              <li>
                <span className="font-semibold">Late afternoon:</span> Sun glare possible on the Mt. Fuji side
              </li>
            </ul>
            <p className="mt-3 text-[12px] text-slate-600 rounded-xl bg-sky-50 border border-sky-200 px-3 py-2">
              <span className="font-semibold">Pro tip:</span> Check Shizuoka Prefecture weather the night before.
              Our tool shows live visibility near Shin-Fuji at the top of the page.
            </p>
          </section>

          {/* Section C: Car Number & Seat Detail Guide */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              Car Number &amp; Seat Detail Guide
            </h2>
            <p className="mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">Standard cars (3+2 layout)</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Cars 4–7 often give the clearest unobstructed views</li>
              <li><span className="font-semibold">Seat E</span> = Mt. Fuji window seat in all standard cars</li>
            </ul>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">Green Car (cars 8–10, 2+2 layout)</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mt. Fuji window seat = <span className="font-semibold">Seat D</span></li>
            </ul>
            <p className="mt-3 mb-2 font-semibold text-[12px] uppercase tracking-wide text-slate-500">How to request Seat E</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">At JR ticket office:</span> show{" "}
                <span className="font-semibold">「E席をお願いします」</span>
              </li>
              <li>
                <span className="font-semibold">Via Klook:</span> select column E on the seat map
              </li>
              <li>
                <span className="font-semibold">With JR Pass:</span> reserve free at any JR station counter
              </li>
            </ul>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          {/* Section D: FAQ */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Info className="h-4 w-4 text-sky-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "Can I see Mt. Fuji from a non-reserved car?",
                  a: "Yes, but risky — you may end up in an aisle seat with no view. Reserve Seat E in advance.",
                },
                {
                  q: "How long can I see Mt. Fuji from the train?",
                  a: "Only about 30–60 seconds at Shinkansen speed. Have your camera ready before reaching Shin-Fuji station.",
                },
                {
                  q: "Is Seat E always the Mt. Fuji side?",
                  a: "In standard 3+2 cars, yes. In Green Cars (2+2 layout), the Mt. Fuji window seat is Seat D.",
                },
                {
                  q: "What if it's cloudy?",
                  a: "Mt. Fuji is often hidden, especially in summer. Check our live visibility indicator at the top of the page.",
                },
                {
                  q: "Can I see Mt. Fuji on the return trip (Osaka/Kyoto → Tokyo)?",
                  a: "Yes — Mt. Fuji is on the LEFT side, which is again Seat E. Use our checker and select the opposite direction.",
                },
                {
                  q: "Does the Nozomi stop near Mt. Fuji?",
                  a: "No, but you can still see it through the window as the train passes. Hikari and Kodama stop at Shin-Fuji station.",
                },
                {
                  q: "Is the JR Pass worth it for Tokyo–Osaka only?",
                  a: "Generally no. Round trip ≈ ¥29,000 vs 7-day Pass ¥50,000. The Pass makes sense if also visiting Hiroshima, Nara, etc.",
                },
                {
                  q: "Can I bring large luggage on the Shinkansen?",
                  a: "Bags with total dimensions over 160cm need a designated overhead space — reserve when booking your seat.",
                },
                {
                  q: "Is there WiFi on the Shinkansen?",
                  a: "Onboard WiFi exists but can be unreliable. A Japan eSIM is recommended for consistent connectivity throughout your trip.",
                },
                {
                  q: "What is the best way to book as a foreigner?",
                  a: "Klook — fully in English, instant mobile voucher, and you can select Seat E on the seat map.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <p className="font-semibold text-slate-800 mb-1">Q: {q}</p>
                  <p className="text-[12px] text-slate-600">A: {a}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <KlookCTA />
            </div>
          </section>

          {/* Section 5: Use the Seat Checker */}
          <section className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-4 shadow-sm shadow-sky-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-700" />
              Make it easy with the Shinkansen Mt. Fuji Seat Checker
            </h2>
            <p>
              If you don&apos;t want to remember all the details, you can use
              our free{" "}
              <span className="font-semibold">
                Shinkansen Mt. Fuji Seat Checker
              </span>
              . Just choose your direction and it tells you which seat to book
              for the best chance of seeing Mt. Fuji.
            </p>
            <p className="mt-2 text-[12px] text-slate-600">
              The tool is designed to work well on mobile, so you can quickly
              check it while booking tickets or travelling in Japan.
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

          <KlookCTA />

          {/* Section 6: From the developer (KanjiFlick) */}
          <section className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="text-sm font-semibold text-slate-900 mb-1.5">
              From the developer
            </h2>

            <p className="text-[13px] leading-relaxed text-slate-700">
              I&apos;m also building a small side project called{" "}
              <span className="font-semibold">KanjiFlick</span> — a swipe-style list of{" "}
              <span className="font-semibold">single kanji meanings</span> (the kind Japanese kids learn).
              It&apos;s <span className="font-semibold">not a travel app</span>, but if you&apos;re curious about
              the characters you&apos;ll see around Japan, you might enjoy it.
            </p>

            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://apps.apple.com/app/id6757971053?ct=fujiseat_guide"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
                aria-label="Download KanjiFlick on the App Store"
                title="KanjiFlick on the App Store"
              >
                <img
                  src="/appstore-badge.svg"
                  alt="Download on the App Store"
                  className="h-10 w-auto hover:opacity-90 active:opacity-80 transition-opacity"
                />
              </a>

              <span className="text-[11px] text-slate-500">
                (opens in a new tab)
              </span>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
