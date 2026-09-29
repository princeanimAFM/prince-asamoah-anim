import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "@react-pdf/renderer"],
  // Files the server reads from disk at runtime: database migrations and the invoice logo.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "./public/logo-invoice.png"],
  },
};

export default nextConfig;
