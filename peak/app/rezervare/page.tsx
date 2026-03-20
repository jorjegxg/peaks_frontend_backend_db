import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { ReservationContent } from "@/components/ReservationContent";

export const metadata: Metadata = {
  title: "Rezervare Internet Cafe Suceava | Peak Gaming",
  description:
    "Rezerva online statii PlayStation 5 si calculatoare gaming la internet cafe-ul Peak Gaming din Suceava.",
  alternates: {
    canonical: "/rezervare",
    languages: {
      ro: "/rezervare",
      en: "/en/reservation",
    },
  },
};

export default function RezervarePage() {
  const t = getTranslations("ro");
  return <ReservationContent t={t} />;
}
