import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walnut Medical R&D Procurement & Tracking Portal",
  description: "Standard Operating Procedure WMPL-QAS-025-01A R&D Procurement and Tracking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-100">{children}</body>
    </html>
  );
}

