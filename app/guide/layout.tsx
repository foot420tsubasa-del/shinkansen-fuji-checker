import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export default function GuideUtilityLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  );
}
