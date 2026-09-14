import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Ghost FC moved from the projects fan to the experience list (Sep 13 2026).
      { source: '/work/ghost-fc', destination: '/experience/ghost-fc', permanent: true },
    ];
  },
};

export default nextConfig;
