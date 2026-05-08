import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  MapPinned,
  ShieldCheck,
  Signpost,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { missions } from "@/data/station-practice/missions";
import { FaqAccordion } from "@/components/station-practice/landing/FaqAccordion";

/*
 * Hidden internal-preview route. Must NOT be linked from any public nav,
 * sitemap, or footer. See:
 *   - app/sitemap.ts (intentionally does not list /station-practice)
 *   - app/robots.ts  (disallows /station-practice and /*​/station-practice)
 *   - metadata below (robots: index/follow false, no hreflang alternates)
 */
export const metadata: Metadata = {
  title: "Station Practice — internal preview",
  description:
    "Internal preview of the Tokyo-style station navigation practice simulator. Hidden — not linked from public navigation.",
  robots: { index: false, follow: false },
};

export default function StationPracticeLandingPage() {
  const featured = missions.slice(0, 3);

  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-20 px-6 py-5 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/station-practice" className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-6 rounded-sm bg-yellow-300" />
            <span className="text-sm font-semibold tracking-wide text-white">
              Tokyo Mega Station Practice
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-neutral-300 sm:flex">
            <a href="#missions" className="hover:text-white">
              Missions
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
          </nav>
          <Link
            href="/station-practice/practice"
            className="hidden items-center gap-1.5 rounded-full bg-yellow-300 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-yellow-200 sm:inline-flex"
          >
            Start practice <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
          <Image
            src="/images/station-practice/hero-station-bg.png"
            alt="A Japanese underground station corridor with overhead yellow signage"
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070a13]/95 via-[#070a13]/70 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#070a13] to-transparent"
          />

          <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-32 sm:px-10 sm:pb-28 sm:pt-40">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-yellow-300">
              <Signpost className="h-3.5 w-3.5" />
              Pre-travel simulation
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Practice navigating Tokyo&rsquo;s mega stations
              <span className="block text-yellow-300">
                before you arrive in Japan.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-300 sm:text-lg">
              A free, calm, premium simulator that helps travelers rehearse
              exits, transfers, and signage choices &mdash; so you can step off
              the train with confidence instead of confusion.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/station-practice/practice"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-7 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
              >
                Start a practice mission
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#missions"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
              >
                See the missions
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-[#080b14] px-6 py-14 sm:px-10">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<MapPinned className="h-5 w-5" />}
              title="Realistic stations"
              body="Layouts inspired by the patterns of complex Tokyo-style stations."
            />
            <Feature
              icon={<Signpost className="h-5 w-5" />}
              title="Bilingual signs"
              body="Practice reading the same kind of yellow-and-black overhead signage you will see on arrival."
            />
            <Feature
              icon={<Compass className="h-5 w-5" />}
              title="Practical skills"
              body="Learn the patterns: pick the city side first, then the numbered exit. Trust posted walking times."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Travel confidence"
              body="Arrive feeling rehearsed, not anxious. Great as a last step before your trip."
            />
          </div>
        </section>

        <section id="missions" className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Featured missions
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">
                  Each mission is a single navigation decision &mdash; the kind
                  you will face the moment you step off the train.
                </p>
              </div>
              <Link
                href="/station-practice/practice"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-300 hover:text-yellow-200"
              >
                Play all missions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((mission, idx) => (
                <li key={mission.id}>
                  <Link
                    href="/station-practice/practice"
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0d1322] to-[#070a13] p-6 transition-colors hover:border-yellow-300/40"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-300/0 via-yellow-300 to-yellow-300/0"
                    />
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-neutral-500">
                      <span>Mission {String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-yellow-300">{mission.difficulty}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {mission.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                      {mission.scenarioIntro}
                    </p>
                    <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
                      <span>~{mission.estimatedMinutes}</span>
                      <span className="inline-flex items-center gap-1 text-yellow-300/80 transition-colors group-hover:text-yellow-200">
                        Try this mission <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-white/5 bg-[#080b14] px-6 py-20 sm:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              <Step
                step="01"
                title="Choose a mission"
                body="Pick a realistic scenario &mdash; finding an exit, transferring lines, or catching the airport train."
              />
              <Step
                step="02"
                title="Read the signs"
                body="Use the overhead signage and route cues to make the right call, just like you will at the real station."
              />
              <Step
                step="03"
                title="Reach your goal"
                body="Complete the route, learn the travel tip, and move on with more confidence for your real trip."
              />
            </ol>
          </div>
        </section>

        <section id="faq" className="px-6 py-20 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              FAQ
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Quick answers about what this is and how it works.
            </p>
            <div className="mt-8">
              <FaqAccordion />
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-gradient-to-br from-[#0d1322] to-[#070a13] px-6 py-20 sm:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 rounded-3xl border border-white/5 bg-white/[0.02] p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Step off the train ready.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                Five short missions. About ten minutes total. No sign-up
                required.
              </p>
            </div>
            <Link
              href="/station-practice/practice"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-yellow-300 px-7 text-sm font-semibold text-black transition-colors hover:bg-yellow-200"
            >
              Start practice <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/5 bg-[#070a13] px-6 py-8 text-xs text-neutral-500 sm:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span>
              This is a practice simulator, not an official station map.
              Inspired by complex Tokyo-style stations. Layouts and signage
              are original.
            </span>
            <span>
              Internal preview &middot; not yet linked from fujiseat
              navigation
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-300/10 text-yellow-300">
        {icon}
      </div>
      <div className="mt-4 text-sm font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
    </div>
  );
}

function Step({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
        Step {step}
      </div>
      <div className="mt-3 text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p>
    </li>
  );
}
