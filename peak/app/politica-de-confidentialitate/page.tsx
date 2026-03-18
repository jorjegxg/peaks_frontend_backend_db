import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata = {
  title: "Politica de confidențialitate | Peak Gaming",
  description: "Politica de confidențialitate Peak Gaming.",
};

export default function PrivacyPage() {
  const t = getTranslations("ro");
  return <LegalPageContent t={t} page="privacy" />;
}
