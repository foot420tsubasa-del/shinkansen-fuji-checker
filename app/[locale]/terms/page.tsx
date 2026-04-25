import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Terms & Notices | fujiseat",
  description:
    "Terms, travel notices, affiliate disclosure, and important limitations for using fujiseat.",
};

const sections = [
  {
    title: "1. Free, unofficial travel tool",
    body: [
      "fujiseat is a free, independent travel utility. It is not operated by, sponsored by, or endorsed by JR Central, JR Group, Klook, Google, or any railway, travel, insurance, or booking provider.",
      "The site is intended to help travelers understand common Shinkansen seat guidance, compare planning options, and find useful booking resources. It is not an official booking system or transport authority.",
    ],
  },
  {
    title: "2. Seat, route, weather, and price information",
    body: [
      "Seat recommendations, route notes, weather data, currency conversion, hotel areas, transfer notes, and itinerary suggestions are provided for general planning only.",
      "Train formations, seat maps, schedules, prices, pass rules, platform guidance, weather, and availability can change. Always confirm details with official railway sources, station staff, your ticket seller, and the final booking page before you buy or travel.",
    ],
  },
  {
    title: "3. Affiliate disclosure",
    body: [
      "Some links on fujiseat are affiliate links. If you click a partner link and make a purchase, fujiseat may earn a commission at no extra cost to you.",
      "Affiliate links help keep the tool free. Partner links do not make a product official, guaranteed, or necessarily the best option for every traveler. You should compare price, refund rules, validity, coverage, and provider terms before purchasing.",
    ],
  },
  {
    title: "4. Travel, insurance, and booking responsibility",
    body: [
      "You are responsible for your own travel decisions, bookings, documents, visas, insurance, timing, routes, luggage, health needs, and safety choices.",
      "Insurance, pass, hotel, tour, and transfer products are provided by third parties. Their terms, cancellation policies, eligibility rules, coverage limits, and support processes apply.",
    ],
  },
  {
    title: "5. No warranties",
    body: [
      "fujiseat is provided as-is and as-available. I try to keep information useful and practical, but I do not guarantee accuracy, completeness, availability, uninterrupted service, or that any recommendation will fit your exact trip.",
      "To the maximum extent allowed by law, fujiseat is not liable for losses, missed trains, booking errors, price changes, bad weather, unavailable seats, cancelled services, third-party issues, or decisions made using this site.",
    ],
  },
  {
    title: "6. Fair use of the site",
    body: [
      "Do not abuse the site, scrape it aggressively, attempt to bypass technical limits, interfere with service operation, or use the content in a misleading way.",
      "You may share links to fujiseat and use the tool for personal travel planning. Please do not present the site as official railway guidance.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-sky-700 hover:text-sky-900">
            Privacy
          </Link>
        </div>

        <Card className="mx-auto max-w-4xl p-5 md:p-8">
          <div className="flex items-start gap-3">
            <BrandMark />
            <div>
              <p className="text-[11px] font-semibold uppercase text-sky-700">fujiseat</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">Terms & notices</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                These notes are written for a small free travel tool. They are not legal advice, but they explain how to use the site sensibly.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
                <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <h2 className="text-base font-semibold text-slate-950">Useful references</h2>
              <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <a
                  href="https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900"
                >
                  FTC Endorsement Guides
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://support.google.com/analytics/answer/7318509"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900"
                >
                  Google Analytics disclosure policy
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>
          </div>
        </Card>
      </Container>
    </main>
  );
}
