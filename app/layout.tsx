import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shinkansen Mt. Fuji Seat Checker — Which Side & Seat? (Free)",
  description:
    "Find the exact Shinkansen seat for the best Mt. Fuji view. Seat E, right side (Tokyo→Osaka). Free instant checker + book tickets via Klook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
