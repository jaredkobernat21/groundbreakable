import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundbreakable",
  description: "Local market change intelligence for real estate professionals.",
  robots: {
    index: false,
    follow: false,
  },
};

// viewportFit: "cover" lets the mobile map experience (NationalMapExperience,
// MobileBottomSheet) read real env(safe-area-inset-*) values on notch/home-
// indicator iPhones instead of them resolving to 0 -- without this, the
// full-screen mobile map would render under the notch/home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
