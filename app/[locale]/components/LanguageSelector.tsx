"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_OPTIONS: Record<string, { code: string; label: string }> = {
  en: { code: "EN", label: "English" },
  "pt-BR": { code: "PT-BR", label: "Português do Brasil" },
  es: { code: "ES", label: "Español" },
  ko: { code: "KO", label: "한국어" },
  "zh-TW": { code: "繁", label: "繁體中文" },
  "zh-CN": { code: "简", label: "简体中文" },
  fr: { code: "FR", label: "Français" },
  de: { code: "DE", label: "Deutsch" },
  ru: { code: "RU", label: "Русский" },
};

const localeSet = new Set<string>(routing.locales);

function stripLocalePrefix(pathname: string) {
  const normalizedPath = pathname || "/";
  const segments = normalizedPath.split("/");
  const maybeLocale = segments[1];

  if (!maybeLocale || !localeSet.has(maybeLocale)) {
    return normalizedPath;
  }

  const pathWithoutLocale = `/${segments.slice(2).join("/")}`;
  return pathWithoutLocale === "/" ? "/" : pathWithoutLocale.replace(/\/$/, "");
}

function getLocalizedPathname(pathname: string, nextLocale: string) {
  const basePath = stripLocalePrefix(pathname);

  if (nextLocale === routing.defaultLocale) {
    return basePath;
  }

  return basePath === "/" ? `/${nextLocale}` : `/${nextLocale}${basePath}`;
}

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS[locale] ?? { code: locale.toUpperCase(), label: locale };

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextLocale: string) => {
    setOpen(false);

    if (nextLocale === locale) {
      return;
    }

    const nextPathname = getLocalizedPathname(pathname, nextLocale);
    const search = window.location.search;
    const hash = window.location.hash;

    router.replace(`${nextPathname}${search}${hash}`);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-xs font-black text-white shadow-sm transition-colors hover:border-sky-200/70 hover:bg-white/14 focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <Globe2 className="h-4 w-4 text-sky-200" />
        <span className="min-w-[2.4rem] text-left">{current.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.22)]"
        >
          {routing.locales.map((loc) => {
            const option = LOCALE_OPTIONS[loc] ?? { code: loc.toUpperCase(), label: loc };
            const selected = loc === locale;

            return (
              <button
                key={loc}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => handleSelect(loc)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors ${
                  selected ? "bg-[#f0fbf6] text-[#082653]" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {selected ? <Check className="h-4 w-4 text-[#168a56]" /> : null}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold">{option.label}</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                  {option.code}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
