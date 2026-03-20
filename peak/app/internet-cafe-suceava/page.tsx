import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Internet Cafe Suceava - PS5 si PC | Peak Gaming",
  description:
    "Cauti internet cafe in Suceava? Peak Gaming ofera statii PlayStation 5, calculatoare gaming si rezervare online rapida.",
  alternates: {
    canonical: "/internet-cafe-suceava",
    languages: {
      ro: "/internet-cafe-suceava",
      en: "/en",
    },
  },
};

export default function InternetCafeSuceavaPage() {
  return (
    <main className="min-h-screen bg-grid-led bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Internet Cafe Suceava -{" "}
          <span className="text-accent led-text">Peak Gaming</span>
        </h1>
        <p className="text-foreground/80">
          Peak Gaming este un internet cafe din Suceava dedicat sesiunilor de
          gaming pe PlayStation 5 si PC. Ai acces la 5 statii PS5 si 9
          calculatoare de gaming, cu program zilnic intre 12:00 si 24:00.
        </p>
        <p className="text-foreground/80">
          Daca vrei un loc pentru FC, Fortnite, CS2 sau Valorant, poti rezerva
          online rapid. Pagina de rezervari iti arata disponibilitatea pe
          intervale orare.
        </p>

        <section className="rounded-xl border border-accent/40 bg-foreground/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">
            Ce gasesti la noi
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>
              5 statii PlayStation 5 in Suceava, gata pentru sesiuni solo sau
              duo
            </li>
            <li>9 calculatoare de gaming pentru jocuri competitive</li>
            <li>
              Preturi clare pe ora si oferta speciala in intervalul 12:00-16:00
            </li>
            <li>Rezervare online pentru internet cafe in Suceava</li>
          </ul>
        </section>

        <section className="rounded-xl border border-accent/40 bg-foreground/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">
            Intrebari frecvente
          </h2>
          <div className="mt-3 space-y-3 text-foreground/80">
            <p>
              <strong className="text-foreground">
                Unde este internet cafe-ul?
              </strong>{" "}
              In Suceava. Vezi datele complete pe pagina de contact.
            </p>
            <p>
              <strong className="text-foreground">Pot rezerva PS5?</strong> Da,
              ai rezervare online pentru statiile PlayStation.
            </p>
            <p>
              <strong className="text-foreground">
                Aveti calculatoare de gaming?
              </strong>{" "}
              Da, avem 9 statii PC pregatite pentru jocuri populare.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/rezervare"
            className="rounded-lg bg-accent px-4 py-2 text-white"
          >
            Rezerva internet cafe Suceava
          </Link>
          <Link
            href="/preturi"
            className="rounded-lg border border-accent/50 px-4 py-2 text-accent"
          >
            Vezi preturile
          </Link>
          <Link
            href="/playstation-suceava"
            className="rounded-lg border border-accent/50 px-4 py-2 text-accent"
          >
            Pagina PlayStation Suceava
          </Link>
        </div>
      </article>
    </main>
  );
}
