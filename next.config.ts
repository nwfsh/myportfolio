import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build to plain static files (the out/ folder) so it can be hosted on Cloudflare Pages.
  output: "export",
};

export default nextConfig;
