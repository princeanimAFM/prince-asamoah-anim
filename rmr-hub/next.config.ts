import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Receipt photos are shrunk in the browser first, but PDFs can be a few megabytes.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  // Set by netlify.toml during the build: the build migrates the database, so the running
  // app skips that check. Written into the app at build time (runtime env wouldn't see it).
  env: { MIGRATIONS_AT_BUILD: process.env.MIGRATIONS_AT_BUILD ?? "" },
  serverExternalPackages: ["@electric-sql/pglite", "@react-pdf/renderer"],
  // Files the server reads from disk at runtime: database migrations, the invoice logo, and
  // the PDF library's built-in fonts (loaded through "#standard-fonts/…" imports, which the
  // file tracer doesn't follow, so hosts like Netlify would leave them out).
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "./public/logo-invoice.png", "./node_modules/pdfkit/js/standard-fonts/**/*"],
  },
};

export default nextConfig;
