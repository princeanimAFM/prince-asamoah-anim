import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RMR Hub",
    short_name: "RMR Hub",
    description: "RMR Dev Works business assistant",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9FD",
    theme_color: "#1E2A44",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
