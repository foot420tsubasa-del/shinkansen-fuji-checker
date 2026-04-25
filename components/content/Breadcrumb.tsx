import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
      <Link href="/" className="hover:text-slate-700">fujiseat</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-700">{item.label}</Link>
          ) : (
            <span className="font-medium text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
