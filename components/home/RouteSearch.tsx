"use client";

import { useId, useState } from "react";
import { ArrowLeftRight, ArrowRight, MapPin, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveStation, suggestStations, ROUTES, type ViewTag } from "@/lib/scenic";

const CHIPS: { tag: ViewTag; emoji: string }[] = [
  { tag: "fuji", emoji: "🗻" },
  { tag: "mountain", emoji: "🏔️" },
  { tag: "sea", emoji: "🌊" },
  { tag: "countryside", emoji: "🌾" },
  { tag: "city", emoji: "🌆" },
];

const POPULAR: [string, string][] = [
  ["Tokyo", "Kyoto"],
  ["Kyoto", "Tokyo"],
  ["Tokyo", "Kanazawa"],
];

/** View names offered as suggestions for the third field (not free text). */
const VIEW_SUGGESTIONS: { name: string; tag: ViewTag }[] = [
  ...ROUTES.flatMap((r) => (r.views ?? []).filter((v) => !/glimpse|after the reversal/i.test(v.name)).map((v) => ({ name: v.name, tag: v.tags[0] }))),
  { name: "Shonan coast (Enoden)", tag: "sea" as ViewTag },
  { name: "Tokyo Bay at night (Yurikamome)", tag: "city" as ViewTag },
  { name: "Hozu gorge (Sagano)", tag: "countryside" as ViewTag },
].filter((v, i, all) => all.findIndex((x) => x.name === v.name) === i);

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
  const [open, setOpen] = useState(false);
  const options = suggestStations(value);
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-slate-500">
        {label}
      </label>
      <div className="flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-slate-300 bg-white px-4 focus-within:border-ink">
        <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-slate-400"
        />
      </div>
      {open && options.length ? (
        <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_16px_40px_rgba(11,18,32,0.18)]">
          {options.map((o) => (
            <li key={o.name} role="option" aria-selected={o.name === value}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.name);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="font-semibold text-ink">{o.name}</span>
                <span className="text-xs text-slate-400">{o.ja ?? ""}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * The hero search: From and To with station suggestions, a "what would you
 * like to see" field that only offers known views, view chips, and popular
 * routes as one-tap shortcuts. Not free text: every answer it leads to is one
 * the data can back.
 */
export function RouteSearch({
  initialFrom = "Tokyo",
  initialTo = "Kyoto",
  tags,
  onTagsChange,
  onSubmit,
}: {
  initialFrom?: string;
  initialTo?: string;
  tags: ViewTag[];
  onTagsChange: (tags: ViewTag[]) => void;
  onSubmit: (from: string, to: string) => void;
}) {
  const t = useTranslations("home.search");
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [view, setView] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [error, setError] = useState(false);
  const viewOptions = VIEW_SUGGESTIONS.filter((v) => v.name.toLowerCase().includes(view.trim().toLowerCase())).slice(0, 6);

  const submit = (a = from, b = to) => {
    const ra = resolveStation(a);
    const rb = resolveStation(b);
    if (!ra || !rb) {
      setError(true);
      return;
    }
    setError(false);
    setFrom(ra);
    setTo(rb);
    onSubmit(ra, rb);
  };

  const toggleTag = (tag: ViewTag) => onTagsChange(tags.includes(tag) ? tags.filter((x) => x !== tag) : [...tags, tag]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-3"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-x-2 gap-y-3 md:grid-cols-[1fr_auto_1fr_1.2fr_auto] md:gap-3">
        <StationField label={t("from")} placeholder={t("fromPh")} value={from} onChange={setFrom} />
        <button
          type="button"
          aria-label={t("swap")}
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <StationField label={t("to")} placeholder={t("toPh")} value={to} onChange={setTo} />
        <div className="relative col-span-3 min-w-0 md:col-span-1">
          <label className="mb-1 block text-xs font-bold text-slate-500">{t("see")}</label>
          <div className="flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-slate-300 bg-white px-4 focus-within:border-ink">
            <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              value={view}
              placeholder={t("seePh")}
              autoComplete="off"
              onFocus={() => setViewOpen(true)}
              onBlur={() => setTimeout(() => setViewOpen(false), 120)}
              onChange={(e) => {
                setView(e.target.value);
                setViewOpen(true);
              }}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-slate-400"
            />
          </div>
          {viewOpen && viewOptions.length ? (
            <ul className="absolute inset-x-0 top-full z-20 mt-1 rounded-2xl border border-slate-200 bg-white py-1 shadow-[0_16px_40px_rgba(11,18,32,0.18)]">
              {viewOptions.map((v) => (
                <li key={v.name}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setView(v.name);
                      setViewOpen(false);
                      if (!tags.includes(v.tag)) onTagsChange([...tags, v.tag]);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-ink hover:bg-slate-50"
                  >
                    {v.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button type="submit" className="col-span-3 flex min-h-12 items-center md:col-span-1 justify-center gap-2 rounded-full bg-fuji px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(217,74,50,0.3)] transition-colors hover:bg-fuji-hover">
          {t("submit")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error ? <p className="text-sm font-semibold text-fuji">{t("pickStation")}</p> : null}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {CHIPS.map((chip) => {
          const on = tags.includes(chip.tag);
          return (
            <button
              key={chip.tag}
              type="button"
              aria-pressed={on}
              onClick={() => toggleTag(chip.tag)}
              className={[
                "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                on ? "border-ink bg-ink text-white" : "border-slate-300 bg-white text-ink hover:bg-slate-50",
              ].join(" ")}
            >
              <span aria-hidden="true">{chip.emoji}</span>
              {t(chip.tag)}
            </button>
          );
        })}
      </div>
      <p className="text-center text-[12.5px] text-slate-500">
        {t("popular")}:{" "}
        {POPULAR.map(([a, b], i) => (
          <span key={`${a}-${b}`}>
            {i ? " · " : ""}
            <button
              type="button"
              onClick={() => {
                setFrom(a);
                setTo(b);
                submit(a, b);
              }}
              className="font-bold text-ink underline-offset-2 hover:underline"
            >
              {a} → {b}
            </button>
          </span>
        ))}
      </p>
    </form>
  );
}
