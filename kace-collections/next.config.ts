import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are served as AVIF or WebP at the right width for each screen, so they stay sharp on
  // high-resolution phones without slowing the page down.
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
