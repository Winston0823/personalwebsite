import type { MetadataRoute } from "next";

/**
 * Without a manifest, Android's "Add to home screen" has no name, no theme,
 * and falls back to the transparent tab icon — often rendering a generated
 * letter tile instead of the mark. This gives it the real thing.
 *
 * Both `any` and `maskable` icons are listed: Android crops adaptive icons to
 * roughly the inner 80%, so the maskable variant carries extra safe-zone
 * padding to stop the ears being shaved off.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Winston Gu",
    short_name: "Winston Gu",
    description: "Developer & Designer",
    start_url: "/",
    display: "standalone",
    background_color: "#A8BFB0",
    theme_color: "#A8BFB0",
    icons: [
      { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
