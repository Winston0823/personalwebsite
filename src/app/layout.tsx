import type { Metadata } from "next";
import localFont from "next/font/local";
import GradientBackground from "@/components/background/GradientBackground";
import DesktopChrome from "@/components/background/DesktopChrome";
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

export const metadata: Metadata = {
  title: "Winston Gu",
  description: "Developer & Designer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${plein.variable} ${switzer.variable} ${clash.variable}`} suppressHydrationWarning>
      <head>
        {/* Adobe Fonts (Typekit) — Astronef Std Super, used by the AWL poster */}
        <link rel="stylesheet" href="https://use.typekit.net/ovr8aqn.css" />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <GradientBackground />
        <DesktopChrome />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
