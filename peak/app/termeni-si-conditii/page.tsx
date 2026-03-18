import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata = {
  title: "Termeni și condiții | Peak Gaming",
  description: "Termenii și condițiile Peak Gaming.",
};

export default function TermsPage() {
  const t = getTranslations("ro");
  return <LegalPageContent t={t} page="terms" />;
}
