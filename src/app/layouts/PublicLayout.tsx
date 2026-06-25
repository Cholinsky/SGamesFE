import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import logoSgames from "../../assets/logo-sgames.jpeg";
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

export function PublicLayout() {

  const [publicSettings, setPublicSettings] =
  useState<PublicSettings | null>(null);

useEffect(() => {
  loadPublicSettings();
}, []);

async function loadPublicSettings() {
  try {
    const data =
      await getPublicSettings();

    setPublicSettings(data);
  } catch (error) {
    console.error(error);
    setPublicSettings(null);
  }
}
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const isActive = (path: string) =>
    location.pathname === path;

  const navLinkClass = (path: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-white/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
        : "text-slate-300 hover:bg-white/5 hover:text-pink-300"
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
  return (
    <div className="min-h-screen bg-[#070817] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#0b1022]/95 shadow-[0_0_35px_rgba(88,28,135,0.25)] backdrop-blur-xl">
        <nav className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/30 blur-md transition group-hover:bg-pink-400/40" />
              <img
                src={logoSgames}
                alt="SGames"
                className="relative h-12 w-12 rounded-2xl border border-white/20 object-cover shadow-[0_0_20px_rgba(217,70,239,0.35)]"
              />
            </div>

            <div className="leading-tight">
              <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-xl font-black tracking-wide text-transparent">
                SGames
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.25em] text-slate-500 sm:block">
                Speedrun Event
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
              to="/horario"
              className={navLinkClass("/horario")}
            >
              Horario
            </Link>

            <Link
              to="/#faq"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-pink-300"
            >
              FAQ
            </Link>

            <div className="ml-3 border-l border-violet-500/30 pl-5">
              <Link to="/admin/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-cyan-400/50 bg-cyan-400/5 text-cyan-300 hover:border-pink-400/60 hover:bg-pink-500/10 hover:text-pink-200"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg border border-violet-500/30 p-2 text-slate-200 md:hidden"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-violet-500/20 bg-[#0b1022] md:hidden">
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
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-pink-300"
              >
                FAQ
              </Link>

              <div className="mt-3 border-t border-violet-500/20 pt-4">
                <Link
                  to="/admin/login"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-cyan-400/50 bg-cyan-400/5 text-cyan-300 hover:border-pink-400/60 hover:bg-pink-500/10 hover:text-pink-200"
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

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-500/20 bg-[#090c1a] py-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={logoSgames}
                  alt="SGames"
                  className="h-10 w-10 rounded-xl border border-white/20 object-cover"
                />

                <div>
                  <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text font-black text-transparent">
                    SGames
                  </span>
                  <span className="text-xs text-slate-500">
                    Speedrun Event
                  </span>
                </div>
              </div>

              <p className="max-w-sm text-sm text-slate-400">
                Evento comunitario dedicado a reunir runners,
                juegos y categorías distintas en un espacio
                competitivo, amigable y organizado.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-cyan-300">
                Navegación
              </h3>

              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <Link
                  to="/postulacion"
                  className="hover:text-pink-300"
                >
                  Enviar postulación
                </Link>

                <Link
                  to="/horario"
                  className="hover:text-pink-300"
                >
                  Ver horario
                </Link>

                <Link
                  to="/#faq"
                  className="hover:text-pink-300"
                >
                  Preguntas frecuentes
                </Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-cyan-300">
                Evento
              </h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>
                  <span className="text-slate-300">
                    Fechas:
                  </span>{" "}
                  31 de julio al 2 de agosto de 2026
                </p>

                <p>
                  <span className="text-slate-300">
                    Estado:
                  </span>{" "}
                  Postulaciones abiertas
                </p>

                <p>
                  Los canales oficiales y avisos del evento
                  se comunicarán por el staff de SGames.
                </p>
              </div>
            </div>
          </div>
          <div>
  <h3 className="mb-4 text-lg font-bold text-cyan-300">
    Redes oficiales
  </h3>

  {officialSocialLinks.length > 0 ? (
    <div className="flex flex-wrap gap-3">
      {officialSocialLinks.map((social) => {
        const Icon =
          social.icon;

        return (
          <a
            key={social.name}
            href={social.url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200 transition-all hover:-translate-y-0.5 hover:border-pink-400/40 hover:bg-pink-500/15 hover:text-pink-200 hover:shadow-[0_0_18px_rgba(236,72,153,0.22)]"
            title={social.name}
            aria-label={social.name}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  ) : (
    <p className="text-sm text-slate-500">
      Redes oficiales próximamente.
    </p>
  )}

  {publicSettings?.contactEmail && (
    <a
      href={`mailto:${publicSettings.contactEmail}`}
      className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-300"
    >
      <Mail className="h-4 w-4" />
      {publicSettings.contactEmail}
    </a>
  )}
</div>

          <div className="mt-8 border-t border-violet-500/20 pt-8 text-center text-sm text-slate-500">
            © 2026 SGames. Proyecto comunitario de speedruns.
          </div>
        </div>
      </footer>
    </div>
  );
}