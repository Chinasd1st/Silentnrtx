import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Silentnrtx",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;