import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Needed for better-sqlite3
  serverExternalPackages: ["better-sqlite3"],

  // Increase server action payload size limit to 5MB
  serverActions: {
    bodySizeLimit: "5mb",
  },
};

export default nextConfig;
