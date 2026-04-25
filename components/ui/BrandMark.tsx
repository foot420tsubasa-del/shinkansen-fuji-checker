import Image from "next/image";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BrandMark({ className = "", size = "md" }: BrandMarkProps) {
  const sizeClass = size === "sm" ? "h-10 w-10 rounded-2xl" : "h-11 w-11 rounded-2xl";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-[#07142f] shadow-[0_12px_30px_rgba(7,20,47,0.18)] ring-1 ring-white/80",
        sizeClass,
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <Image
        src="/fujiseat-window-fuji-icon.png"
        alt=""
        width={96}
        height={96}
        className="h-full w-full object-cover"
        priority={size === "md"}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/45" />
    </div>
  );
}
