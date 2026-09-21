import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Alya Nisrina — Business × Technology", template: "%s — Alya Nisrina" },
  description: "Alya Nisrina's portfolio: evidence-led work across business analysis, systems, software, ERP, and quality.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
