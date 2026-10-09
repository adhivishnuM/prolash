import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: "https://paolash-studio.adhivishnu-m.chatgpt.site/",
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
  }];
}
