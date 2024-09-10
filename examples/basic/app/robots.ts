import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const crawlableRobots: MetadataRoute.Robots = {
    rules: {
      userAgent: "*",
      allow: "/",
    },
  };
  return crawlableRobots;
}
