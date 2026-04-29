// app/success/page.tsx
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="page-shell min-h-screen px-4 py-16 text-center text-slate-950">
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold">Thank you! 🙏</h1>
      <p>
        Your purchase was successful. We&apos;re preparing your access to the
        full Mt. Fuji Shinkansen guide.
      </p>
      <p className="text-sm text-gray-600">
        For now, this is a placeholder page. Next steps you might implement:
      </p>
      <ul className="text-left text-sm text-gray-600 list-disc list-inside space-y-1">
        <li>Look up the Stripe session on the server</li>
        <li>Store the buyer&apos;s email in your database</li>
        <li>Send a magic-link email to access the Pro guide</li>
      </ul>

      <div className="space-x-3">
        <Link
          href="/guide"
          className="inline-flex items-center rounded-lg border border-[#168a56] bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
        >
          Back to the guide
        </Link>
      </div>
      </div>
    </main>
  );
}
