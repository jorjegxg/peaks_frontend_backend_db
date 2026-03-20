import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Peak Gaming",
  description: "Peak Gaming privacy policy.",
  alternates: {
    canonical: "/en/privacy-policy",
    languages: {
      ro: "/politica-de-confidentialitate",
      en: "/en/privacy-policy",
    },
  },
};

export default function PrivacyPage() {
  const t = getTranslations("en");
  return <LegalPageContent t={t} page="privacy" basePath="/en" />;
}
