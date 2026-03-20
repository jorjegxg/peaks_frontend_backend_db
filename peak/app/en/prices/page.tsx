import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { PricesContent } from "@/components/PricesContent";

export const metadata: Metadata = {
  title: "Internet Cafe Prices Suceava | Peak Gaming",
  description:
    "Check internet cafe prices in Suceava for PS5 and gaming PC stations at Peak Gaming.",
  alternates: {
    canonical: "/en/prices",
    languages: {
      ro: "/preturi",
      en: "/en/prices",
    },
  },
};

export default function PricesPage() {
  const t = getTranslations("en");
  return <PricesContent t={t} basePath="/en" />;
}
