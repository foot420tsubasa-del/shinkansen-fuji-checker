"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/data/station-practice/faq";
import { localizeFaq } from "@/data/station-practice/i18n";
import { cn } from "@/components/station-practice/lib/utils";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const locale = useLocale();
  const items = localizeFaq(faqItems, locale);

  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-white">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-yellow-300 transition-transform",
                  isOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </button>
            <div
              className={cn(
                "grid overflow-hidden px-6 text-sm leading-6 text-neutral-300 transition-all",
                isOpen
                  ? "grid-rows-[1fr] pb-6 opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="min-h-0">{item.answer}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
