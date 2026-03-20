"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getTranslations } from "@/lib/translations";
import { instagramUrl } from "@/lib/site";

export function GlobalFooter() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const t = getTranslations(isEn ? "en" : "ro");

  return (
    <footer className="border-t border-accent/20 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-2 font-semibold text-accent led-text">
          <Image
            src="/peak-logo.jpeg"
            alt="Peak Gaming logo"
            width={24}
            height={24}
            className="h-6 w-6 rounded-md object-cover"
          />
          Peak Gaming
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/50">
          <Link
            href={isEn ? "/en/privacy-policy" : "/politica-de-confidentialitate"}
            className="transition-colors hover:text-accent"
          >
            {t.footer.privacyPolicy}
          </Link>
          <span className="text-foreground/20">·</span>
          <Link
            href={isEn ? "/en/terms-of-service" : "/termeni-si-conditii"}
            className="transition-colors hover:text-accent"
          >
            {t.footer.termsOfService}
          </Link>
          <span className="text-foreground/20">·</span>
          <Link
            href={isEn ? "/en/contact" : "/contact"}
            className="transition-colors hover:text-accent"
          >
            {t.nav.contact}
          </Link>
          <span className="text-foreground/20">·</span>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            Instagram
          </a>
        </div>
        <p className="text-sm text-foreground/60">
          © {new Date().getFullYear()} Peak Gaming. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
