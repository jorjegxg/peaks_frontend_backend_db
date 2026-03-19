import Image from "next/image";
import Link from "next/link";
import type { Translations } from "@/lib/translations";

const HERO_IMAGE = "/crowd2.jpg";
const PS5_IMAGE = "/3ps5.jpg";
const PC_IMAGE = "/2pc.jpg";
const CAFE_IMAGE = "/warzone.jpg";
const STEERING_WHEEL_IMAGE = "/steering.jpg";

// Game images from public/games – only games that have files in this folder
const GAMES = "";
const PC_GAMES = [
  { id: "csgo", key: "csgo" as const, image: `${GAMES}/2cs2.jpg` },
  { id: "valorant", key: "valorant" as const, image: `${GAMES}/valorant.png` },
  { id: "fortnite", key: "fortnite" as const, image: `${GAMES}/2fortnite.jpg` },
  {
    id: "roblox",
    key: "roblox" as const,
    image: `${GAMES}/roblox-pictures.jpg`,
  },
] as const;
const PS5_GAMES = [
  { id: "fc26", key: "fc26" as const, image: `${GAMES}/fc.avif` },
  { id: "ufc5", key: "ufc5" as const, image: `${GAMES}/ufc.avif` },
  {
    id: "mortalKombat11",
    key: "mortalKombat11" as const,
    image: `${GAMES}/mortal-kombat.jpg`,
  },
  {
    id: "itTakesTwo",
    key: "itTakesTwo" as const,
    image: `${GAMES}/it_takes_two.jpg`,
  },
  { id: "forza", key: "forza" as const, image: `${GAMES}/forza.jpg` },
  { id: "wwe", key: "wwe" as const, image: `${GAMES}/wwe.jpg` },
  { id: "nba2k25", key: "nba2k25" as const, image: `${GAMES}/2k25.jpg` },
  { id: "roblox", key: "roblox" as const, image: `${GAMES}/roblox.png` },
  { id: "fortnite", key: "fortnite" as const, image: `${GAMES}/fortnite.jpg` },
  {
    id: "assettoCorsa",
    key: "assettoCorsa" as const,
    image: `${GAMES}/assetto_corsa_competizione.jpg`,
  },
  {
    id: "needForSpeedHeat",
    key: "needForSpeedHeat" as const,
    image: `${GAMES}/need_for_speed_heat.jpg`,
  },
  { id: "aWayOut", key: "aWayOut" as const, image: `${GAMES}/a_way_out.jpg` },
  { id: "dirt5", key: "dirt5" as const, image: `${GAMES}/dirt5.jpg` },
  { id: "wrc", key: "wrc" as const, image: `${GAMES}/w2c.jpg` },
] as const;

type Props = { t: Translations; basePath?: string };

export function HomeContent({ t, basePath = "" }: Props) {
  return (
    <main className="relative min-h-screen bg-grid-led bg-background">
      {/* Hero */}

      <section className="relative min-h-[70vh] overflow-hidden border-b border-accent/20">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Neon gaming atmosphere"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/70 to-background" />
          <div className="absolute inset-0 bg-grid-led opacity-50" />
        </div>
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-5xl md:text-7xl">
            {t.hero.welcome}{" "}
            <span className="text-accent led-text">Peak Gaming</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90 sm:text-xl">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Games */}
      <section id="games" className="scroll-mt-20 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-accent led-text">{t.games.title}</span>{" "}
            {t.games.titleSuffix}
          </h2>
          <p className="mt-2 text-foreground/70">{t.games.subtitle}</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Link
              href={basePath ? "/en/reservation" : "/rezervare"}
              className="group relative overflow-hidden rounded-xl border border-accent/50 bg-foreground/5 transition hover:led-border-subtle block"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={PS5_IMAGE}
                  alt="PlayStation 5"
                  fill
                  className="object-cover transition"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-lg border border-accent/50 bg-background/80 px-3 py-1.5 text-sm font-semibold text-accent backdrop-blur led-border-subtle">
                  {t.games.ps5}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t.games.ps5Title}
                </h3>
                <p className="mt-2 text-foreground/80">{t.games.ps5Desc}</p>
              </div>
            </Link>
            <Link
              href={basePath ? "/en/reservation" : "/rezervare"}
              className="group relative overflow-hidden rounded-xl border border-accent/50 bg-foreground/5 transition hover:led-border-subtle block"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={PC_IMAGE}
                  alt="Gaming PC"
                  fill
                  className="object-cover transition"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-lg border border-accent/50 bg-background/80 px-3 py-1.5 text-sm font-semibold text-accent backdrop-blur led-border-subtle">
                  {t.games.pcs}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t.games.pcsTitle}
                </h3>
                <p className="mt-2 text-foreground/80">{t.games.pcsDesc}</p>
              </div>
            </Link>
            <Link
              href={basePath ? "/en/reservation" : "/rezervare"}
              id="steering-wheel"
              className="scroll-mt-20 group relative overflow-hidden rounded-xl border border-accent/50 bg-foreground/5 transition hover:led-border-subtle block"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={STEERING_WHEEL_IMAGE}
                  alt="Steering wheel"
                  fill
                  className="object-cover transition"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-lg border border-accent/50 bg-background/80 px-3 py-1.5 text-sm font-semibold text-accent backdrop-blur led-border-subtle">
                  {t.games.steeringWheelTitle}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t.games.steeringWheelTitle}
                </h3>
                <p className="mt-2 text-foreground/80">
                  {t.games.steeringWheel}
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              {t.games.gameLibrary}
            </h4>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-accent mb-4">
                  {t.games.pcGamesLabel}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  {PC_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className="group relative overflow-hidden rounded-xl border border-accent/50 bg-foreground/5 transition hover:led-border-subtle"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={game.image}
                          alt={t.games[game.key]}
                          fill
                          className="object-cover transition"
                          sizes="(max-width: 640px) 50vw, 300px"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent opacity-80" />
                        <span className="absolute bottom-2 left-2 font-semibold text-white drop-shadow-lg">
                          {t.games[game.key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-accent mb-4">
                  {t.games.ps5GamesLabel}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {PS5_GAMES.map((game) => (
                    <div
                      key={game.id}
                      className="group relative overflow-hidden rounded-xl border border-accent/50 bg-foreground/5 transition hover:led-border-subtle"
                    >
                      <div className="relative aspect-video">
                        <Image
                          src={game.image}
                          alt={t.games[game.key]}
                          fill
                          className="object-cover transition"
                          sizes="(max-width: 640px) 50vw, 200px"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent opacity-80" />
                        <span className="absolute bottom-2 left-2 text-sm font-semibold text-white drop-shadow-lg">
                          {t.games[game.key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t.about.title}{" "}
            <span className="text-accent led-text">{t.about.titleBrand}</span>
          </h2>
          <p className="mt-2 text-foreground/70">{t.about.subtitle}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-accent/50 md:aspect-auto md:min-h-[280px] led-border-subtle">
              <Image
                src={CAFE_IMAGE}
                alt="Gaming room"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 rounded-xl led-border-subtle ring-inset ring-accent/20" />
            </div>
            <div className="space-y-4 text-foreground/90">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <ul className="space-y-3 text-foreground/80">
                {t.about.features.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
              href={
                basePath
                  ? "/en/privacy-policy"
                  : "/politica-de-confidentialitate"
              }
              className="transition-colors hover:text-accent"
            >
              {t.footer.privacyPolicy}
            </Link>
            <span className="text-foreground/20">·</span>
            <Link
              href={basePath ? "/en/terms-of-service" : "/termeni-si-conditii"}
              className="transition-colors hover:text-accent"
            >
              {t.footer.termsOfService}
            </Link>
            <span className="text-foreground/20">·</span>
            <a
              href="https://www.instagram.com/peak.gaming.suceava/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-accent"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
          </div>
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Peak Gaming. {t.footer.rights}
          </p>
        </div>
      </footer>
    </main>
  );
}
