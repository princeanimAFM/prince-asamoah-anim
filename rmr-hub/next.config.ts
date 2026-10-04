import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Receipt photos are shrunk in the browser first, but PDFs can be a few megabytes.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  serverExternalPackages: ["@electric-sql/pglite", "@react-pdf/renderer"],
  // Files the server reads from disk at runtime: database migrations and the invoice logo.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "./public/logo-invoice.png"],
  },
};

export default nextConfig;
