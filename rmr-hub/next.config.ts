import type { NextConfig } from "next";

/**
 * Sent with every response. No page may be framed (clickjacking), the browser mustn't
 * guess file types, and links out don't carry full addresses. form-action is left out of
 * the policy because signing in posts a form that then redirects to Google.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Signing links are secrets: never send them on as a referrer, and keep them out of search engines.
      {
        source: "/sign/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
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
