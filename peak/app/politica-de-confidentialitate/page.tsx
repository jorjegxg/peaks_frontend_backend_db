import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata: Metadata = {
  title: "Politica de confidențialitate | Peak Gaming",
  description: "Politica de confidențialitate Peak Gaming.",
  alternates: {
    canonical: "/politica-de-confidentialitate",
    languages: {
      ro: "/politica-de-confidentialitate",
      en: "/en/privacy-policy",
    },
  },
};

export default function PrivacyPage() {
  const t = getTranslations("ro");
  return <LegalPageContent t={t} page="privacy" />;
}
