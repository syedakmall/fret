import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: emits `out/` with an HTML file per route.
  // The app is entirely client-side, so no server runtime is needed.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
