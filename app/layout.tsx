// Root layout – minimal pass-through.
// Locale-specific <html lang="..."> is set in app/[locale]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
