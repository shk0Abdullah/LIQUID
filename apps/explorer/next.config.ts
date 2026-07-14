import type { NextConfig } from "next";

const config: NextConfig = {
  async rewrites() {
    const backend = process.env.NODE_API_URL ?? "http://localhost:3000";
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default config;
