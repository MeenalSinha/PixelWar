import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelWar: Sovereign Canvas",
  description: "Build. Defend. Conquer. One world. Infinite legends.",
  keywords: ["pixel war", "strategy game", "multiplayer", "real-time", "civilization"],
  openGraph: {
    title: "PixelWar: Sovereign Canvas",
    description: "Claim territory. Build your empire. Dominate the canvas.",
    type: "website",
  },
};

import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-pw-cream text-pw-border overflow-x-hidden" suppressHydrationWarning>
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
