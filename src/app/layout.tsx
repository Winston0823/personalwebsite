import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import GradientBackground from "@/components/background/GradientBackground";
import DesktopChrome from "@/components/background/DesktopChrome";
import { PERF_TIER_SCRIPT } from "@/lib/perf-tier";
import "./globals.css";

// Display face — Chubbo (Fontshare), variable 200-700. Carries every heading,
// eyebrow label, and the name poster.
const chubbo = localFont({
  src: [
    { path: "../../public/fonts/Chubbo-Variable.woff2", weight: "200 700", style: "normal" },
  ],
  variable: "--font-chubbo",
  display: "swap",
});

// Text face — Supreme (Fontshare), variable 100-800. Body copy, UI labels,
// everything that isn't display.
const supreme = localFont({
  src: [
    { path: "../../public/fonts/Supreme-Variable.woff2", weight: "100 800", style: "normal" },
    { path: "../../public/fonts/Supreme-VariableItalic.woff2", weight: "100 800", style: "italic" },
  ],
  variable: "--font-supreme",
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
  themeColor: "#A8BFB0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${chubbo.variable} ${supreme.variable} ${clash.variable} ${zodiak.variable} ${jakarta.variable}`} suppressHydrationWarning>
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
