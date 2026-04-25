import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  tone?: "surface" | "navy" | "soft" | "accent";
};

export function Card({ children, className = "", tone = "surface" }: CardProps) {
  const toneClass =
    tone === "navy"
      ? "border-slate-900 bg-[#07142f] text-white shadow-[0_24px_70px_rgba(7,20,47,0.28)]"
      : tone === "accent"
        ? "border-sky-100 bg-sky-50/70 text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
      : tone === "soft"
        ? "border-slate-200 bg-slate-50/90 text-slate-950 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
        : "border-slate-200/80 bg-white text-slate-950 shadow-[0_20px_55px_rgba(15,23,42,0.08)]";

  return (
    <section className={["rounded-[28px] border", toneClass, className].join(" ")}>
      {children}
    </section>
  );
}
