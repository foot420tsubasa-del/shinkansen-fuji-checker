// Root layout – minimal pass-through.
// Locale-specific <html lang="..."> is set in app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
