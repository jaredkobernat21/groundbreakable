import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundbreakable",
  description: "Local market intelligence for real estate investors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
