import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "affiliate" | "secondary" | "navy" | "ghost";
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

function variantClass(variant: BaseProps["variant"] = "primary") {
  switch (variant) {
    case "navy":
      return "border border-slate-700 bg-[#0b1a33] text-sky-200 hover:bg-[#132744]";
    case "affiliate":
      return "border border-[#ff7a00] bg-[#ff7a00] text-white shadow-orange-200 hover:bg-[#e66700]";
    case "secondary":
      return "border border-[#9fd7bd] bg-white text-[#106b43] hover:border-[#168a56] hover:bg-[#f0fbf6]";
    case "ghost":
      return "text-slate-600 hover:bg-slate-100";
    case "primary":
    default:
      return "border border-[#168a56] bg-[#168a56] text-white shadow-emerald-100 hover:bg-[#0f6f45]";
  }
}

export function Button({ children, className = "", variant, ...props }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all",
        variantClass(variant),
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function AnchorButton({ children, className = "", variant, ...props }: AnchorButtonProps) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold no-underline transition-all",
        variantClass(variant),
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
