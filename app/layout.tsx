import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Which Shinkansen seat has the best Mt. Fuji view? | Free Seat Checker",
  description:
    "Free tool for visitors to Japan: easily find the best Shinkansen seat to see Mt. Fuji between Tokyo and Osaka/Kyoto, then book tickets via Klook for trains, eSIM and more.",
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
