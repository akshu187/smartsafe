import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://smartsafe.local"

  const pages = ["", "/welcome", "/login", "/dashboard", "/about", "/contact"]

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" || path === "/dashboard" ? 1 : 0.8,
  }))
}

