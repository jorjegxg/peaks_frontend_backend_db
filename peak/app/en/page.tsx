import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { HomeContent } from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Internet Cafe Suceava | Peak Gaming",
  description:
    "Internet cafe in Suceava with PS5 and high-end gaming PCs. Fast online booking and daily schedule 12:00-24:00.",
  alternates: {
    canonical: "/en",
    languages: {
      ro: "/",
      en: "/en",
    },
  },
};

export default function EnHome() {
  const t = getTranslations("en");
  return <HomeContent t={t} basePath="/en" />;
}
