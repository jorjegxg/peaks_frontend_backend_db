import type { Metadata } from "next";
import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata: Metadata = {
  title: "Termeni și condiții | Peak Gaming",
  description: "Termenii și condițiile Peak Gaming.",
  alternates: {
    canonical: "/termeni-si-conditii",
    languages: {
      ro: "/termeni-si-conditii",
      en: "/en/terms-of-service",
    },
  },
};

export default function TermsPage() {
  const t = getTranslations("ro");
  return <LegalPageContent t={t} page="terms" />;
}
