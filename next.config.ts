import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Needed for better-sqlite3
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default nextConfig;
