import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { ReservationContent } from "@/components/ReservationContent";

export const metadata: Metadata = {
  title: "Book Internet Cafe Suceava | Peak Gaming",
  description:
    "Book PS5 and gaming PC stations online at Peak Gaming internet cafe in Suceava.",
  alternates: {
    canonical: "/en/reservation",
    languages: {
      ro: "/rezervare",
      en: "/en/reservation",
    },
  },
};

export default function ReservationPage() {
  const t = getTranslations("en");
  return <ReservationContent t={t} basePath="/en" />;
}
