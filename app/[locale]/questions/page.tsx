import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { QuestionForm } from "./QuestionForm";

export const metadata: Metadata = {
  title: "Feedback and Japan travel tips — fujiseat",
  description: "Send feedback, trip reports, reviews, or Japan travel tips for future fujiseat improvements and articles.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function QuestionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feedback" });

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <div className="page-header border-b border-sky-100/80 backdrop-blur">
        <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950 md:text-base">fujiseat</p>
              <p className="hidden text-xs leading-5 text-slate-500 sm:block">{t("hub")}</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-slate-950">{t("seatChecker")}</Link>
            <Link href="/planner" className="hover:text-slate-950">{t("planner")}</Link>
          </nav>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{t("eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t("description")}
            </p>
            <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {t("playful")}
            </p>
          </div>

          <QuestionForm locale={locale} />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs leading-6 text-slate-500">
            {t("privacyNote")}
          </div>

          <SiteLegalLinks className="mt-8 text-slate-500" />
        </div>
      </Container>
    </main>
  );
}
