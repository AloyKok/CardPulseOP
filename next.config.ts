import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/admin",
          destination: "https://tcginvent.vercel.app/admin",
        },
        {
          source: "/admin/:path*",
          destination: "https://tcginvent.vercel.app/admin/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
