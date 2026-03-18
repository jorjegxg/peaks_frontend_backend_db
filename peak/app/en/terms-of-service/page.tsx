import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata = {
  title: "Terms of Service | Peak Gaming",
  description: "Peak Gaming terms of service.",
};

export default function TermsPage() {
  const t = getTranslations("en");
  return <LegalPageContent t={t} page="terms" basePath="/en" />;
}
