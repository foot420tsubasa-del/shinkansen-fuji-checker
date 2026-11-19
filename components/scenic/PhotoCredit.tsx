import credits from "@/data/scenic-photo-credits.json";

type Credit = (typeof credits)[keyof typeof credits];
const bySource: Record<string, Credit | undefined> = credits;

export function PhotoCredit({
  src,
  className = "",
  detailed = false,
}: {
  src: string;
  className?: string;
  detailed?: boolean;
}) {
  const photo = bySource[src];
  if (!photo) return null;

  return (
    <p className={`text-xs leading-5 text-slate-600 ${className}`}>
      {detailed || photo.cardCaption ? <span className="block">{photo.caption}</span> : null}
      Photo by{" "}
      <a href={photo.source} title={photo.title} className="underline underline-offset-2 hover:text-ink">
        {photo.author}
      </a>{" "}
      · <a href={photo.licenseUrl} className="underline underline-offset-2 hover:text-ink">{photo.license}</a>
      {" · Resized, cropped for display"}
    </p>
  );
}
