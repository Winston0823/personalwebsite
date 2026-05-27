import type { Metadata } from "next";
import localFont from "next/font/local";
import GradientBackground from "@/components/background/GradientBackground";
import DotGridBackground from "@/components/background/DotGridBackground";
import CornerTicker from "@/components/background/CornerTicker";
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
    <html lang="en" className={`h-full ${plein.variable} ${switzer.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <GradientBackground />
        <DotGridBackground />
        <CornerTicker />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
