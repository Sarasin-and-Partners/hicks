import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Needed for better-sqlite3
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
