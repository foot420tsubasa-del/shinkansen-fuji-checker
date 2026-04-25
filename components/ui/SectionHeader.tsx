type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase text-sky-700">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>}
    </div>
  );
}
