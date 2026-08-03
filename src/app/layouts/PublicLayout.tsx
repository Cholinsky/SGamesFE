import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import {
  Twitch,
  Youtube,
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  ExternalLink,
} from "lucide-react";
import {
  getPublicSettings,
  type PublicSettings,
} from "../services/publicSettingsService";
import {
  getActiveDesignTheme,
  type PublicDesignTheme,
} from "../services/publicDesignThemeService";


type SeasonAssetKey =
  | "Summer"
  | "Fall"
  | "Winter";

function normalizeSeasonAssetKey(
  seasonKey?: string | null
): SeasonAssetKey {
  const cleanSeason =
    seasonKey?.trim().toLowerCase();

  if (cleanSeason === "winter") {
    return "Winter";
  }

  if (
    cleanSeason === "autumn" ||
    cleanSeason === "fall"
  ) {
    return "Fall";
  }

  return "Summer";
}

function getSeasonLogoBaseName(
  season: SeasonAssetKey
) {
  switch (season) {
    case "Winter":
      return "LogoWinter";

    case "Fall":
      return "LogoFall";

    default:
      return "LogoSummer";
  }
}

function getSeasonLogoCandidates(
  season: SeasonAssetKey
) {
  const logoName =
    getSeasonLogoBaseName(season);

  return [
    `/logos/${logoName}.png`,
    `/logos/${logoName}.Png`,
    `/logos/${logoName}.PNG`,
    `/logos/${logoName}.webp`,
    `/logos/${logoName}.jpg`,
    `/logos/${logoName}.jpeg`,
    `/logos/${logoName}.svg`,
    `/logos/${logoName}.avif`,
    "/logos/LogoSummer.png",
    "/logos/LogoSummer.Png",
    "/logos/LogoSummer.PNG",
    "/logos/LogoSummer.webp",
    "/logos/LogoSummer.jpg",
    "/logos/LogoSummer.jpeg",
    "/logos/LogoSummer.svg",
    "/logos/LogoSummer.avif",
  ];
}



type SeasonLogoProps = {
  season: SeasonAssetKey;
  className: string;
  fallbackClassName: string;
  fallbackTextClassName?: string;
  alt?: string;
};

function SeasonLogo({
  season,
  className,
  fallbackClassName,
  fallbackTextClassName = "font-black text-white",
  alt = "SGames",
}: SeasonLogoProps) {
  const [fallbackIndex, setFallbackIndex] =
    useState(0);

  const [failed, setFailed] =
    useState(false);

  const candidates =
    getSeasonLogoCandidates(season);

  const src =
    candidates[
      Math.min(
        fallbackIndex,
        candidates.length - 1
      )
    ];

  useEffect(() => {
    setFallbackIndex(0);
    setFailed(false);
  }, [season]);

  if (failed) {
    return (
      <div className={fallbackClassName}>
        <span className={fallbackTextClassName}>
          SG
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${alt} ${season}`}
      onError={() => {
        setFallbackIndex((current) => {
          if (
            current <
            candidates.length - 1
          ) {
            return current + 1;
          }

          setFailed(true);
          return current;
        });
      }}
      className={className}
    />
  );
}

export function PublicLayout() {
  const [publicSettings, setPublicSettings] =
    useState<PublicSettings | null>(null);

  const [activeTheme, setActiveTheme] =
    useState<PublicDesignTheme | null>(null);

  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const seasonAssetKey =
    normalizeSeasonAssetKey(
      activeTheme?.seasonKey
    );

  useEffect(() => {
    loadPublicSettings();
  }, []);

  async function loadPublicSettings() {
    try {
      const [settingsData, themeData] =
        await Promise.all([
          getPublicSettings(),
          getActiveDesignTheme(),
        ]);

      setPublicSettings(settingsData);
      setActiveTheme(themeData);
    } catch (error) {
      console.error(error);
      setPublicSettings(null);
      setActiveTheme(null);
    }
  }

  useEffect(() => {
    if (!activeTheme) {
      return;
    }

    const root =
      document.documentElement;

    root.style.setProperty(
      "--sg-primary",
      activeTheme.primaryColor
    );
    root.style.setProperty(
      "--sg-secondary",
      activeTheme.secondaryColor
    );
    root.style.setProperty(
      "--sg-accent",
      activeTheme.accentColor
    );
    root.style.setProperty(
      "--sg-background",
      activeTheme.backgroundColor
    );
    root.style.setProperty(
      "--sg-surface",
      activeTheme.surfaceColor
    );
    root.style.setProperty(
      "--sg-text",
      activeTheme.textColor
    );
    root.style.setProperty(
      "--sg-muted-text",
      activeTheme.mutedTextColor
    );
    root.style.setProperty(
      "--sg-border",
      activeTheme.borderColor
    );

    if (activeTheme.heroGradient) {
      root.style.setProperty(
        "--sg-hero-gradient",
        activeTheme.heroGradient
      );
    }

    if (activeTheme.cardGradient) {
      root.style.setProperty(
        "--sg-card-gradient",
        activeTheme.cardGradient
      );
    }
  }, [activeTheme]);

  const isActive = (path: string) =>
    location.pathname === path;

  const navLinkClass = (path: string) =>
    `sgames-nav-link ${
      isActive(path)
        ? "sgames-nav-link-active"
        : ""
    }`;

  const officialSocialLinks = [
    {
      name: "Twitch",
      url: publicSettings?.twitchUrl,
      icon: Twitch,
    },
    {
      name: "YouTube",
      url: publicSettings?.youtubeUrl,
      icon: Youtube,
    },
    {
      name: "Facebook",
      url: publicSettings?.facebookUrl,
      icon: Facebook,
    },
    {
      name: "Instagram",
      url: publicSettings?.instagramUrl,
      icon: Instagram,
    },
    {
      name: "X / Twitter",
      url: publicSettings?.twitterUrl,
      icon: ExternalLink,
    },
    {
      name: "Discord",
      url: publicSettings?.discordUrl,
      icon: MessageCircle,
    },
  ].filter(
    (item) =>
      item.url &&
      item.url.trim().length > 0
  );

  if (publicSettings?.maintenanceMode) {
    return (
      <div
        className="sgames-public-shell min-h-screen text-white"
        data-season-theme={
          activeTheme?.seasonKey ?? "Summer"
        }
      >
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
          <div className="sgames-glass sgames-neon-border w-full max-w-2xl rounded-3xl p-8 text-center md:p-12">
            <div className="sgames-logo-shell mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl">
                              <SeasonLogo
                  season={seasonAssetKey}
                  className="h-16 w-16 rounded-2xl object-cover"
                  fallbackClassName="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))]"
                  fallbackTextClassName="text-xl font-black text-white"
                />
            </div>

            <Badge className="sgames-badge-warning mb-5">
              Sitio en mantenimiento
            </Badge>

            <h1 className="sgames-neon-text mb-4 text-4xl font-black md:text-5xl">
              Estamos trabajando en mejoras
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-lg text-[var(--sg-muted-text)]">
              {publicSettings.maintenanceMessage ||
                "Estamos trabajando en mejoras. Vuelve más tarde."}
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              {publicSettings.twitchUrl && (
                <a
                  href={publicSettings.twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="sgames-primary-button">
                    <Twitch className="mr-2 h-4 w-4" />
                    Ir al Twitch
                  </Button>
                </a>
              )}

              <Link to="/admin/login">
                <Button
                  variant="outline"
                  className="sgames-outline-button"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sgames-public-shell min-h-screen text-white"
      data-season-theme={
        activeTheme?.seasonKey ?? "Summer"
      }
    >
      <header className="sgames-theme-header sticky top-0 z-50 backdrop-blur-xl">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className="sgames-logo-glow absolute inset-0 rounded-2xl blur-md transition" />

                              <SeasonLogo
                  season={seasonAssetKey}
                  className="relative h-12 w-12 rounded-2xl border border-white/20 object-cover"
                  fallbackClassName="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))]"
                  fallbackTextClassName="text-sm font-black text-white"
                />
            </div>

            <div className="leading-tight">
              <span className="sgames-neon-text block text-xl font-black tracking-wide">
                SGames
              </span>

              <span className="hidden text-[11px] uppercase tracking-[0.25em] text-[var(--sg-muted-text)] sm:block">
                Speedrun Event
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className={navLinkClass("/")}
            >
              Inicio
            </Link>

            <Link
              to="/postulacion"
              className={navLinkClass("/postulacion")}
            >
              Postulación
            </Link>

            <Link
              to="/runs"
              className={navLinkClass("/runs")}
            >
              Runs
            </Link>

            <Link
              to="/horario"
              className={navLinkClass("/horario")}
            >
              Horario
            </Link>

            <Link
              to="/#faq"
              className="sgames-nav-link"
            >
              FAQ
            </Link>

            <div className="ml-3 border-l border-[var(--sg-border)] pl-5">
              <Link to="/admin/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="sgames-outline-button"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>

          <button
            className="sgames-mobile-menu-button rounded-lg p-2 md:hidden"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="sgames-mobile-menu md:hidden">
            <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
              <Link
                to="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={navLinkClass("/")}
              >
                Inicio
              </Link>

              <Link
                to="/postulacion"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={navLinkClass("/postulacion")}
              >
                Postulación
              </Link>

              <Link
                to="/runs"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={navLinkClass("/runs")}
              >
                Runs
              </Link>

              <Link
                to="/horario"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={navLinkClass("/horario")}
              >
                Horario
              </Link>

              <Link
                to="/#faq"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="sgames-nav-link"
              >
                FAQ
              </Link>

              <div className="mt-3 border-t border-[var(--sg-border)] pt-4">
                <Link
                  to="/admin/login"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="sgames-outline-button w-full"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Panel de Administración
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="sgames-footer py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <SeasonLogo
                  season={seasonAssetKey}
                  className="h-10 w-10 rounded-xl border border-white/20 object-cover"
                  fallbackClassName="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))]"
                  fallbackTextClassName="text-xs font-black text-white"
                />

                <div>
                  <span className="sgames-neon-text block font-black">
                    SGames
                  </span>

                  <span className="text-xs text-[var(--sg-muted-text)]">
                    Speedrun Event
                  </span>
                </div>
              </div>

              <p className="max-w-sm text-sm text-[var(--sg-muted-text)]">
                Evento comunitario dedicado a reunir runners,
                juegos y categorías distintas en un espacio
                competitivo, amigable y organizado.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-[var(--sg-primary)]">
                Navegación
              </h3>

              <div className="flex flex-col gap-2 text-sm text-[var(--sg-muted-text)]">
                <Link
                  to="/postulacion"
                  className="transition hover:text-[var(--sg-accent)]"
                >
                  Enviar postulación
                </Link>

                <Link
                  to="/runs"
                  className="transition hover:text-[var(--sg-accent)]"
                >
                  Ver runs
                </Link>

                <Link
                  to="/horario"
                  className="transition hover:text-[var(--sg-accent)]"
                >
                  Ver horario
                </Link>

                <Link
                  to="/#faq"
                  className="transition hover:text-[var(--sg-accent)]"
                >
                  Preguntas frecuentes
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-[var(--sg-primary)]">
                Ediciones
              </h3>

              <div className="space-y-2 text-sm text-[var(--sg-muted-text)]">
                <p>
                  <span className="text-[var(--sg-text)]">
                    Invierno:
                  </span>{" "}
                  Febrero
                </p>

                <p>
                  <span className="text-[var(--sg-text)]">
                    Verano:
                  </span>{" "}
                  Junio / Julio
                </p>

                <p>
                  <span className="text-[var(--sg-text)]">
                    Otoño:
                  </span>{" "}
                  Octubre
                </p>
              </div>
            </div>

            <div className="lg:justify-self-end lg:text-right">
              <h3 className="mb-4 text-lg font-bold text-[var(--sg-primary)]">
                Redes oficiales
              </h3>

              {officialSocialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {officialSocialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.name}
                        href={social.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sgames-social-link"
                        title={social.name}
                        aria-label={social.name}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--sg-muted-text)]">
                  Redes oficiales próximamente.
                </p>
              )}

              {publicSettings?.contactEmail && (
                <div className="mt-5 flex lg:justify-end">
                  <a
                    href={`mailto:${publicSettings.contactEmail}`}
                    className="inline-flex items-center gap-2 text-sm text-[var(--sg-muted-text)] transition hover:text-[var(--sg-primary)]"
                  >
                    <Mail className="h-4 w-4" />
                    {publicSettings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--sg-border)] pt-8 text-center text-sm text-[var(--sg-muted-text)]">
            © 2026 SGames. Proyecto comunitario de speedruns.
          </div>
        </div>
      </footer>
    </div>
  );
}