import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata: Metadata = {
  title: "Terms of Service | Peak Gaming",
  description: "Peak Gaming terms of service.",
  alternates: {
    canonical: "/en/terms-of-service",
    languages: {
      ro: "/termeni-si-conditii",
      en: "/en/terms-of-service",
    },
  },
};

export default function TermsPage() {
  const t = getTranslations("en");
  return <LegalPageContent t={t} page="terms" basePath="/en" />;
}
