import { getTranslations } from "@/lib/translations";
import { LegalPageContent } from "@/components/LegalPageContent";

export const metadata = {
  title: "Privacy Policy | Peak Gaming",
  description: "Peak Gaming privacy policy.",
};

export default function PrivacyPage() {
  const t = getTranslations("en");
  return <LegalPageContent t={t} page="privacy" basePath="/en" />;
}
