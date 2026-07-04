import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

/** robots.txt — allow crawling of storefront, block admin/api/account. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/checkout", "/orders"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
