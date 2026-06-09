// app/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-center text-slate-950">
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold">Checkout canceled</h1>
      <p>
        No worries — your card was not charged. You can start the checkout
        again anytime if you still want access to the full guide.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center rounded-lg border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#246449]"
      >
        Back to pricing
      </Link>
      </div>
    </main>
  );
}
