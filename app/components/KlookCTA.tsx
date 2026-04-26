"use client";

import { AFFILIATE_REL } from "@/lib/link-rel";
import { JR_PASS_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";

export function KlookCTA() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 space-y-3 shadow-sm shadow-red-100">
      <p className="text-[13px] font-semibold text-slate-800">
        Ready to book? Get your Shinkansen ticket via Klook (English OK)
      </p>
      <div className="flex gap-2">
        <a
          href={SHINKANSEN_TICKET_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 hover:brightness-110 active:brightness-95 transition-all"
        >
          Book Shinkansen
        </a>
        <a
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          className="flex-1 inline-flex items-center justify-center rounded-2xl border border-red-400 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 active:brightness-95 transition-all"
        >
          Compare JR Pass
        </a>
      </div>
    </div>
  );
}
