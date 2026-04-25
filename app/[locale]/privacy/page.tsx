import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Privacy Policy | fujiseat",
  description: "Privacy policy for fujiseat, including analytics, affiliate links, and local browser storage.",
};

const sections = [
  {
    title: "Information you provide",
    body: [
      "fujiseat does not ask you to create an account. The planner and command center may store route selections, checklist items, departure date, and activity notes in your own browser using localStorage or sessionStorage.",
      "If you submit the anonymous feedback form, the feedback text, selected topic, page URL, locale, submission time, and browser user-agent may be sent to a private spreadsheet or similar storage so I can review common patterns and improve the site.",
      "This locally stored planning data is intended to make the tool feel persistent on your device. It is not an account sync feature.",
    ],
  },
  {
    title: "Analytics",
    body: [
      "In production, fujiseat uses Google Analytics to understand aggregate site usage, such as pages viewed, interactions, device/browser information, and general traffic patterns.",
      "Google Analytics may use cookies or similar identifiers. Google states that site owners using Google Analytics should disclose its use and how data is collected and processed.",
    ],
  },
  {
    title: "Affiliate and third-party links",
    body: [
      "fujiseat includes links to third-party services such as booking, eSIM, transport, hotel, activity, insurance, and map providers. When you click those links, the third party may receive information such as your browser, device, referral URL, and any information you provide on their site.",
      "Purchases, bookings, refunds, cancellations, support, and personal data handled by those third parties are governed by their own terms and privacy policies.",
    ],
  },
  {
    title: "What fujiseat does not do",
    body: [
      "fujiseat does not sell a user account database because it does not operate user accounts. It does not intentionally send passport numbers, payment card data, medical information, or booking confirmation details to its own backend.",
      "Do not enter sensitive personal information into free-text planner notes or the feedback form.",
    ],
  },
  {
    title: "Your controls",
    body: [
      "You can clear local planner data by clearing your browser storage for this site. You can block or delete cookies in your browser settings.",
      "Google provides information about Analytics privacy controls and opt-out options. Third-party booking providers may offer their own privacy controls.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link href="/terms" className="text-sm font-medium text-sky-700 hover:text-sky-900">
            Terms & notices
          </Link>
        </div>

        <Card className="mx-auto max-w-4xl p-5 md:p-8">
          <div className="flex items-start gap-3">
            <BrandMark />
            <div>
              <p className="text-[11px] font-semibold uppercase text-sky-700">fujiseat</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">Privacy policy</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This page explains the privacy basics for this free travel utility.
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
              <h2 className="text-base font-semibold text-slate-950">References</h2>
              <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <a
                  href="https://support.google.com/analytics/answer/7318509"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900"
                >
                  Google Analytics disclosure policy
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://support.google.com/analytics/answer/6004245"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900"
                >
                  How Google Analytics handles data
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
