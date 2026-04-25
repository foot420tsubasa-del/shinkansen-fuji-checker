import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "navy" | "ghost";
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

function variantClass(variant: BaseProps["variant"] = "primary") {
  switch (variant) {
    case "navy":
      return "bg-slate-950 text-white hover:bg-slate-800";
    case "secondary":
      return "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50";
    case "ghost":
      return "text-slate-600 hover:bg-slate-100";
    case "primary":
    default:
      return "bg-red-500 text-white shadow-red-200 hover:brightness-110";
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
