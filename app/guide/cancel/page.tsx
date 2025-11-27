// app/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-3xl font-bold">Checkout canceled</h1>
      <p>
        No worries — your card was not charged. You can start the checkout
        again anytime if you still want access to the full guide.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
      >
        Back to pricing
      </Link>
    </main>
  );
}
