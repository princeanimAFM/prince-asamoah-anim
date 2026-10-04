import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const baloo = localFont({
  src: [
    { path: "./fonts/baloo-600.woff2", weight: "600" },
    { path: "./fonts/baloo-800.woff2", weight: "800" },
  ],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = localFont({
  src: "./fonts/nunito.woff2",
  weight: "200 1000",
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "RMR Hub", template: "%s · RMR Hub" },
  description: "RMR Dev Works business assistant",
  appleWebApp: { capable: true, title: "RMR Hub", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1E2A44",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
