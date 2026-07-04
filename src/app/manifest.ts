import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/** Web app manifest (installable PWA + richer social/search presence). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "ธรรมกิจ",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#178a5a",
    lang: "th",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
