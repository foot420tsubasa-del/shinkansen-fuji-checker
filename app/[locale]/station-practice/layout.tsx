import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

/*
 * Route-scoped layout for /station-practice.
 *
 * The fujiseat global stylesheet (app/globals.css) sets a light page
 * background and Arial font on <body>. The station-practice MVP is a
 * dark, premium UI built around the Geist font. This layout wraps the
 * whole sub-route in a self-contained dark wrapper that fills the
 * viewport, hiding the global body bg behind it, and scopes Geist to
 * this subtree only — no global CSS edit, no font leak.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function StationPracticeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans flex min-h-screen flex-col bg-[#0a0e1a] text-neutral-100 antialiased`}
    >
      {children}
    </div>
  );
}
