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

  const shareAlike = photo.license.startsWith("CC BY-SA");
  const titleRequired = photo.license === "CC BY-SA 2.0" || photo.license === "CC BY-SA 3.0";

  return (
    <p className={`text-xs leading-5 text-slate-600 ${className}`}>
      {detailed || photo.cardCaption ? <span className="block">{photo.caption}</span> : null}
      Photo by{" "}
      {titleRequired ? (
        <>{photo.author} · <a href={photo.source} className="underline underline-offset-2 hover:text-ink">{photo.title.replace(/\.jpg$/i, "")}</a></>
      ) : (
        <a href={photo.source} title={photo.title} className="underline underline-offset-2 hover:text-ink">{photo.author}</a>
      )}{" "}
      · <a href={photo.licenseUrl} className="underline underline-offset-2 hover:text-ink">{photo.license}</a>
      {shareAlike ? " · WebP under the same license. Resized, cropped for display." : " · Resized, cropped for display."}
    </p>
  );
}
