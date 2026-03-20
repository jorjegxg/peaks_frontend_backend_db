import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { PricesContent } from "@/components/PricesContent";

export const metadata: Metadata = {
  title: "Pret Internet Cafe Suceava | Peak Gaming",
  description:
    "Preturi internet cafe in Suceava pentru PlayStation 5 si calculatoare gaming. Vezi tarifele Peak Gaming si ofertele zilnice.",
  alternates: {
    canonical: "/preturi",
    languages: {
      ro: "/preturi",
      en: "/en/prices",
    },
  },
};

export default function PreturiPage() {
  const t = getTranslations("ro");
  return <PricesContent t={t} />;
}
