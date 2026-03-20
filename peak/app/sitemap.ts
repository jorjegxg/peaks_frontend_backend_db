import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const publicRoutes = [
  "/en",
  "/en/prices",
  "/en/reservation",
  "/en/contact",
  "/en/terms-of-service",
  "/en/privacy-policy",
  "/internet-cafe-suceava",
  "/playstation-suceava",
  "/",
  "/preturi",
  "/rezervare",
  "/contact",
  "/termeni-si-conditii",
  "/politica-de-confidentialitate",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.7,
  }));
}
