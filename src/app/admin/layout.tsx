import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "Admin | Groupe Pure",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[#101211]">{children}</body>
    </html>
  );
}
