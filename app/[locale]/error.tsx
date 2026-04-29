"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell flex min-h-screen items-center text-slate-950">
      <Container className="py-16 text-center">
        <p className="text-5xl font-bold text-slate-200">500</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          An unexpected error occurred. You can try again or head back to the homepage.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-2xl bg-[#168a56] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
          >
            Back to fujiseat
          </Link>
        </div>
      </Container>
    </main>
  );
}
