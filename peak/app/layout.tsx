import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { GlobalFooter } from "@/components/GlobalFooter";
import { AuthProvider } from "@/context/AuthContext";
import {
  absoluteUrl,
  businessName,
  businessPhone,
  businessStreet,
  city,
  country,
  instagramUrl,
  siteUrl,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Internet Cafe in Suceava | Peak Gaming",
  description:
    "Internet cafe in Suceava pentru gaming pe PS5 si PC-uri performante. Rezervari rapide, preturi bune, program zilnic 12:00-24:00.",
  alternates: {
    canonical: "/",
    languages: {
      ro: "/",
      en: "/en",
    },
  },
  openGraph: {
    title: "Internet Cafe in Suceava | Peak Gaming",
    description:
      "Internet cafe in Suceava pentru gaming pe PS5 si PC-uri performante. Rezervari rapide, preturi bune, program zilnic 12:00-24:00.",
    url: siteUrl,
    siteName: businessName,
    type: "website",
    images: [{ url: "/peak-logo.jpeg?v=2", type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Internet Cafe in Suceava | Peak Gaming",
    description:
      "Internet cafe in Suceava pentru gaming pe PS5 si PC-uri performante. Rezervari rapide, preturi bune, program zilnic 12:00-24:00.",
    images: ["/peak-logo.jpeg?v=2"],
  },
  icons: {
    icon: [{ url: "/peak-logo.jpeg?v=2", type: "image/jpeg" }],
    shortcut: [{ url: "/peak-logo.jpeg?v=2", type: "image/jpeg" }],
    apple: [{ url: "/peak-logo.jpeg?v=2", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "InternetCafe",
    name: businessName,
    url: siteUrl,
    image: absoluteUrl("/peak-logo.jpeg"),
    telephone: businessPhone,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessStreet,
      addressLocality: city,
      addressCountry: country,
    },
    areaServed: city,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "12:00",
        closes: "24:00",
      },
    ],
    sameAs: [instagramUrl],
  };

  return (
    <html lang="ro" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <AuthProvider>
          <Header />
          {children}
          <GlobalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
