import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { HomeContent } from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Internet Cafe Suceava | Peak Gaming PS5 si PC",
  description:
    "Internet cafe Suceava cu 5 statii PlayStation 5 si 9 calculatoare de gaming. Rezerva rapid online la Peak Gaming.",
  alternates: {
    canonical: "/",
    languages: {
      ro: "/",
      en: "/en",
    },
  },
};

export default function Home() {
  const t = getTranslations("ro");
  return <HomeContent t={t} />;
}
