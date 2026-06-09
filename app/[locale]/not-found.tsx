import { Link } from "@/i18n/navigation";
import { ArrowLeft, MapPinOff } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-screen items-center text-slate-950">
      <Container className="py-16 text-center">
        <MapPinOff className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#2E7D5B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#246449]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to fujiseat
        </Link>
      </Container>
    </main>
  );
}
