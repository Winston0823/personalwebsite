import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Phosphor is a barrel-export icon package — only pull in the icons
    // actually used instead of the whole index. Next-documented, behaviour-safe.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
