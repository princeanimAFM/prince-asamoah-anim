import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the site as plain files (a preview that any static host can serve).
// The normal build runs on Netlify with image optimisation.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(staticExport ? { output: "export" as const, trailingSlash: true } : {}),
  // Photos are served as AVIF or WebP at the right width for each screen, so they stay sharp on
  // high-resolution phones without slowing the page down.
  images: {
    unoptimized: staticExport,
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
