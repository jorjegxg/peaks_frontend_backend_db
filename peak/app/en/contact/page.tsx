import type { Metadata } from "next";
import Link from "next/link";
import { businessName, businessPhone, businessStreet, city, instagramUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Internet Cafe Contact in Suceava | Peak Gaming",
  description:
    "Contact Peak Gaming internet cafe in Suceava: address, phone number, opening hours and booking links.",
  alternates: {
    canonical: "/en/contact",
    languages: {
      ro: "/contact",
      en: "/en/contact",
    },
  },
};

export default function EnContactPage() {
  const mapQuery = encodeURIComponent(`${businessName} ${city}`);
  const mapEmbed = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <main className="min-h-screen bg-grid-led bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Contact <span className="text-accent led-text">{businessName}</span>
        </h1>
        <p className="text-foreground/75">
          Internet cafe in {city} for PlayStation 5 and gaming PC sessions. Reach us for
          bookings and local details.
        </p>

        <section className="grid gap-4 rounded-xl border border-accent/40 bg-foreground/5 p-5 sm:grid-cols-2">
          <div>
            <h2 className="text-sm uppercase tracking-wide text-foreground/60">Address</h2>
            <p className="mt-2 text-foreground">{businessStreet}</p>
            <p className="text-foreground">{city}, Romania</p>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-wide text-foreground/60">Hours</h2>
            <p className="mt-2 text-foreground">Daily: 12:00 - 24:00</p>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-wide text-foreground/60">Phone</h2>
            <a className="mt-2 inline-block text-accent" href={`tel:${businessPhone}`}>
              {businessPhone}
            </a>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-wide text-foreground/60">Social</h2>
            <a
              className="mt-2 inline-block text-accent"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Peak Gaming Suceava Instagram
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-accent/40 bg-foreground/5 p-3">
          <iframe
            title="Peak Gaming Suceava map"
            src={mapEmbed}
            className="h-72 w-full rounded-lg border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/en/reservation"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Book now
          </Link>
          <Link
            href="/internet-cafe-suceava"
            className="rounded-lg border border-accent/50 px-4 py-2 text-sm text-accent"
          >
            Internet Cafe Suceava page
          </Link>
        </div>
      </div>
    </main>
  );
}
