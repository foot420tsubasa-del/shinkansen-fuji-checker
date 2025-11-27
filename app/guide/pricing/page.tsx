// app/pricing/page.tsx
"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session.");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url as string;
      } else {
        throw new Error("Checkout URL not returned.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-3xl font-bold mb-2">
        Mt. Fuji Shinkansen Pro Guide
      </h1>
      <p className="text-gray-600">
        One-time purchase. Lifetime access. Written by a Japan-based AI & travel
        enthusiast.
      </p>

      <div className="border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">¥1,200</span>
          <span className="text-gray-500 text-sm">one-time</span>
        </div>

        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Seat maps for common Shinkansen train types</li>
          <li>Best timing & landmarks to watch for</li>
          <li>Photo tips (where to sit, which window, reflections etc.)</li>
          <li>FAQ: bad weather, sold-out seats, green car layouts…</li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition w-full sm:w-auto"
        >
          {loading ? "Redirecting to checkout..." : "Unlock the full guide"}
        </button>

        {error && (
          <p className="text-sm text-red-600">
            {error} Please try again in a moment.
          </p>
        )}

        <p className="text-xs text-gray-500">
          Payment is processed securely by Stripe. Your card details never touch
          our servers.
        </p>
      </div>
    </main>
  );
}
