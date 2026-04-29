"use client";

import { AFFILIATE_REL } from "@/lib/link-rel";
import { JR_PASS_URL, SHINKANSEN_TICKET_URL } from "@/src/affiliateLinks";

export function KlookCTA() {
  return (
    <div className="space-y-3 rounded-2xl border border-[#ffb56b] bg-[#fff3e7] px-4 py-4 shadow-sm shadow-orange-100">
      <p className="text-[13px] font-semibold text-slate-800">
        Ready to book? Get your Shinkansen ticket via Klook (English OK)
      </p>
      <div className="flex gap-2">
        <a
          href={SHINKANSEN_TICKET_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#ff7a00] bg-[#ff7a00] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-[#e66700] active:brightness-95"
        >
          Book Shinkansen
        </a>
        <a
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#ff7a00] bg-white px-4 py-2.5 text-sm font-semibold text-[#b44b00] shadow-sm transition-all hover:bg-[#fff8f0] active:brightness-95"
        >
          Compare JR Pass
        </a>
      </div>
    </div>
  );
}
