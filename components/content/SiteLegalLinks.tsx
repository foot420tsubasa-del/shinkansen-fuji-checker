import { Link } from "@/i18n/navigation";

type SiteLegalLinksProps = {
  className?: string;
};

export function SiteLegalLinks({ className = "" }: SiteLegalLinksProps) {
  return (
    <div className={["flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]", className].join(" ")}>
      <Link href="/terms" className="underline underline-offset-2 hover:text-slate-600">
        Terms & notices
      </Link>
      <span aria-hidden="true">·</span>
      <Link href="/privacy" className="underline underline-offset-2 hover:text-slate-600">
        Privacy
      </Link>
    </div>
  );
}
