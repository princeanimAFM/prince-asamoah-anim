import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopProvider } from "@/components/ShopProvider";
import { parseRate } from "@/lib/currency";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${SITE.name} · Ghanaian designer fashion`, template: `%s · ${SITE.name}` },
  description: `${SITE.tagline}. Patchwork corduroy, denim and made-to-order pieces from designers in Ghana.`,
  // Keep the preview out of search engines until the shop opens.
  robots: SITE.preview ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = { themeColor: "#121212", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="flex min-h-dvh flex-col antialiased">
        <ShopProvider ghsPerGbp={parseRate(process.env.GHS_PER_GBP)}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:p-3">Skip to content</a>
          <Header />
          <main id="main" className="flex-1">{children}</main>
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}
