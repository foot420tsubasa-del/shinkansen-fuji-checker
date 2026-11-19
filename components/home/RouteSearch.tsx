"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { ArrowLeftRight, ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveStation, suggestStations } from "@/lib/scenic";
import { trackRouteSearch } from "@/lib/analytics";

const POPULAR = [
  ["Tokyo", "Kyoto"],
  ["Kyoto", "Tokyo"],
  ["Tokyo", "Kanazawa"],
  ["Fujisawa", "Kamakura"],
] as const;

function StationField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const t = useTranslations("home.search");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = suggestStations(value);
  const listId = `${id}-list`;

  const select = (name: string) => {
    onChange(name);
    setActive(-1);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length) {
      event.preventDefault();
      setOpen(true);
      const next = event.key === "ArrowDown"
        ? (active + 1) % options.length
        : (active <= 0 ? options.length - 1 : active - 1);
      setActive(next);
      requestAnimationFrame(() => document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" }));
    }
    if (event.key === "Enter" && open && active >= 0 && options[active]) {
      event.preventDefault();
      select(options[active].name);
    }
  };

  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-slate-700">{label}</label>
      <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
        <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && options.length > 0}
          aria-controls={open && options.length > 0 ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={() => { setOpen(false); setActive(-1); }}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            onChange(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          className="w-full min-w-0 bg-transparent text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-500"
        />
      </div>
      {open && options.length > 0 ? (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map((option, index) => (
            <li
              key={option.name}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={active === index}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(option.name)}
              className={`flex min-h-10 cursor-pointer flex-wrap items-center justify-between gap-x-2 px-3 py-2 text-sm hover:bg-slate-100 ${active === index ? "bg-slate-100" : ""}`}
            >
              <span className="font-semibold text-ink">{option.name}</span>
              <span className="text-xs text-slate-500">{option.ja ?? ""}</span>
            </li>
          ))}
        </ul>
      ) : open && value.trim() && !resolveStation(value) ? (
        <p role="status" className="absolute top-full z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-md">{t("stationNoMatches")}</p>
      ) : null}
    </div>
  );
}

export function RouteSearch({
  initialFrom = "Tokyo",
  initialTo = "Kyoto",
  onSubmit,
}: {
  initialFrom?: string;
  initialTo?: string;
  onSubmit: (from: string, to: string) => void;
}) {
  const t = useTranslations("home.search");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState<"station" | "same" | null>(null);

  const submit = (a = from, b = to) => {
    const resolvedFrom = resolveStation(a);
    const resolvedTo = resolveStation(b);
    if (!resolvedFrom || !resolvedTo) {
      trackRouteSearch({ result: "invalid", reason: "unresolved", from_station: resolvedFrom ?? "unresolved", to_station: resolvedTo ?? "unresolved", source: "form" });
      return setError("station");
    }
    if (resolvedFrom === resolvedTo) {
      trackRouteSearch({ result: "invalid", reason: "same_station", from_station: resolvedFrom, to_station: resolvedTo, source: "form" });
      return setError("same");
    }
    setError(null);
    onSubmit(resolvedFrom, resolvedTo);
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="grid gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
        <StationField label={t("from")} placeholder={t("fromPh")} value={from} onChange={(value) => { setFrom(value); setError(null); }} />
        <button
          type="button"
          aria-label={t("swap")}
          onClick={() => { setFrom(to); setTo(from); setError(null); }}
          className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <StationField label={t("to")} placeholder={t("toPh")} value={to} onChange={(value) => { setTo(value); setError(null); }} />
        <button type="submit" className="col-span-3 flex min-h-12 items-center justify-center gap-2 rounded-full bg-fuji px-4 text-[15px] font-bold text-white hover:bg-fuji-hover xl:col-span-1">
          {t("submit")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error ? <p role="alert" className="text-sm font-semibold text-fuji">{t(error === "same" ? "sameStation" : "pickStation")}</p> : null}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
        <span className="mr-1 font-semibold">{t("popular")}</span>
        {POPULAR.map(([a, b]) => (
          <button key={`${a}-${b}`} type="button" onClick={() => submit(a, b)} className="min-h-8 rounded-full bg-slate-100 px-2.5 font-semibold text-ink hover:bg-slate-200">
            {a} → {b}
          </button>
        ))}
      </div>
    </form>
  );
}
