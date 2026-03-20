export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://peak-gaming.site";

export const businessName = "Peak Gaming";
export const city = "Suceava";
export const country = "Romania";
export const instagramUrl = "https://www.instagram.com/peak.gaming.suceava/";

export const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+40";
export const businessStreet =
  process.env.NEXT_PUBLIC_BUSINESS_STREET || "Centru, Suceava";

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}
