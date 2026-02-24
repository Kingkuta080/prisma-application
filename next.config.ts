import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // disable typescript errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;