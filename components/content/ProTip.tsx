import { Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

export function ProTip({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs leading-5 text-amber-900">{children}</p>
    </div>
  );
}
