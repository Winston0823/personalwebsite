import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import GradientBackground from "@/components/background/GradientBackground";
import DesktopChrome from "@/components/background/DesktopChrome";
import { PERF_TIER_SCRIPT } from "@/lib/perf-tier";
import "./globals.css";

const plein = localFont({
  src: [
    { path: "../../public/fonts/Plein-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Plein-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-plein",
  display: "swap",
});

const switzer = localFont({
  src: [
    { path: "../../public/fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Switzer-Regular.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const clash = localFont({
  src: [
    { path: "../../public/fonts/ClashGrotesk-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
});

// Ambit's real type pairing, self-hosted from the Ambit app's own font files
// (constants/theme.ts → Zodiak-Bold display, PlusJakartaSans body). Scoped to
// the Ambit case study.
const zodiak = localFont({
  src: [{ path: "../../public/fonts/Zodiak-Bold.otf", weight: "700", style: "normal" }],
  variable: "--font-zodiak",
  display: "swap",
});

const jakarta = localFont({
  src: [{ path: "../../public/fonts/PlusJakartaSans-Regular.otf", weight: "400", style: "normal" }],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Winston Gu",
  description: "Developer & Designer",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Tint the mobile browser chrome to the site background.
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${plein.variable} ${switzer.variable} ${clash.variable} ${zodiak.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Tag weak devices (perf-lite) before first paint so the heavy
            always-on effects degrade synchronously rather than after hydration. */}
        <script dangerouslySetInnerHTML={{ __html: PERF_TIER_SCRIPT }} />
        {/* Adobe Fonts (Typekit) — Astronef Std Super, used by the AWL poster */}
        <link rel="stylesheet" href="https://use.typekit.net/ovr8aqn.css" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <GradientBackground />
        <DesktopChrome />
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
