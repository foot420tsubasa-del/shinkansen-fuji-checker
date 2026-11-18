import relatedLinkData from "@/data/scenic-related-links.json";
import { Link } from "@/i18n/navigation";
import { LIVE_ROUTES } from "@/lib/scenic";

type RelatedLink = {
  routeId: string;
  messageId: string;
};

type Props = {
  pagePath: string;
  locale: string;
  className?: string;
};

const pages = relatedLinkData.pages as Record<string, RelatedLink[]>;
const messages = relatedLinkData.messages as Record<string, Record<string, string>>;

export function RelatedScenicLinks({ pagePath, locale, className = "" }: Props) {
  const links = (pages[pagePath] ?? []).slice(0, 2).flatMap((item) => {
    const route = LIVE_ROUTES.find((candidate) => candidate.id === item.routeId && candidate.slug);
    const message = messages[item.messageId]?.[locale];
    return route?.slug && message ? [{ slug: route.slug, message }] : [];
  });

  if (links.length === 0) return null;

  return (
    <aside aria-label="Related scenic route guides" className={["grid gap-2 text-sm leading-6 text-slate-600", className].join(" ")}>
      {links.map((item) => (
        <p key={item.slug}>
          <Link href={`/scenic/${item.slug}`} className="font-semibold text-fuji underline decoration-fuji/30 underline-offset-4 hover:decoration-fuji">
            {item.message}
          </Link>
        </p>
      ))}
    </aside>
  );
}
