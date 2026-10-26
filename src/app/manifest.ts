import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Donna — Kombini gör. Bedenini bil.",
    short_name: "Donna",
    description: "Gerçek insanlar, gerçek kıyafetler, aldıkları beden.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0EA",
    theme_color: "#F5F0EA",
    lang: "tr",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
