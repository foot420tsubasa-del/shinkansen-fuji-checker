// app/success/page.tsx
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
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
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          Back to the guide
        </Link>
      </div>
    </main>
  );
}
