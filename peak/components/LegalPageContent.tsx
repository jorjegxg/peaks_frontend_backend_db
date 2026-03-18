import Link from "next/link";
import type { Translations } from "@/lib/translations";

type Props = {
  t: Translations;
  page: "privacy" | "terms";
  basePath?: string;
};

export function LegalPageContent({ t, page, basePath = "" }: Props) {
  const data = t[page];
  const home = basePath || "/";

  return (
    <main className="relative min-h-screen bg-background">
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href={home}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-foreground/60 transition-colors hover:text-accent"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.nav.home}
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-2 text-sm text-foreground/50">{data.lastUpdated}</p>

          <div className="mt-10 space-y-8">
            {data.sections.map((section, i) => (
              <article key={i}>
                <h2 className="text-lg font-semibold text-foreground">
                  {section.heading}
                </h2>
                <p className="mt-2 leading-relaxed text-foreground/80">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 border-t border-accent/20 pt-6 text-sm text-foreground/50">
            <p>
              © {new Date().getFullYear()} Peak Gaming. {t.footer.rights}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
