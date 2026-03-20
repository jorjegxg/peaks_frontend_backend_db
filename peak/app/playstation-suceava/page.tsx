import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PlayStation Suceava - Rezervari PS5 | Peak Gaming",
  description:
    "Joaca PlayStation in Suceava la Peak Gaming. Rezerva online statii PS5, vezi tarifele si programul zilnic.",
  alternates: {
    canonical: "/playstation-suceava",
    languages: {
      ro: "/playstation-suceava",
      en: "/en",
    },
  },
};

export default function PlaystationSuceavaPage() {
  return (
    <main className="min-h-screen bg-grid-led bg-background px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          PlayStation Suceava - <span className="text-accent led-text">PS5 la Peak Gaming</span>
        </h1>

        <p className="text-foreground/80">
          Daca vrei PlayStation in Suceava, Peak Gaming iti ofera 5 statii PS5 cu jocuri
          populare si rezervare online rapida. Poti veni cu prietenii pentru sesiuni de
          FIFA/FC, fighting sau racing.
        </p>

        <section className="rounded-xl border border-accent/40 bg-foreground/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">De ce sa rezervi PS5 la noi</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-foreground/80">
            <li>Statii PlayStation 5 dedicate sesiunilor de gaming</li>
            <li>Program zilnic 12:00-24:00</li>
            <li>Tarife transparente pe intervale orare</li>
            <li>Confirmare rapida prin pagina de rezervare</li>
          </ul>
        </section>

        <section className="rounded-xl border border-accent/40 bg-foreground/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">Rezervare PlayStation Suceava</h2>
          <p className="mt-2 text-foreground/80">
            Intra pe pagina de rezervare, selecteaza tipul PS5, statia si intervalul dorit.
            Daca preferi PC, poti schimba imediat in acelasi formular.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/rezervare" className="rounded-lg bg-accent px-4 py-2 text-white">
            Rezerva PS5 in Suceava
          </Link>
          <Link
            href="/internet-cafe-suceava"
            className="rounded-lg border border-accent/50 px-4 py-2 text-accent"
          >
            Internet Cafe Suceava
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-accent/50 px-4 py-2 text-accent"
          >
            Contact
          </Link>
        </div>
      </article>
    </main>
  );
}
