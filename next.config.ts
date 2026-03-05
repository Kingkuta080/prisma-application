import type { NextConfig } from "next";
import path from "path";

// Resolve from config file directory so Turbopack always uses project root (fixes "Can't resolve tailwindcss in Desktop")
const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname),
  },
  // disable typescript errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
