import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://paolash-studio.adhivishnu-m.chatgpt.site/sitemap.xml",
  };
}
