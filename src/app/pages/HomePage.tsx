import { useEffect, useState } from "react";
import { getActivePublicEvent } from "../services/eventService";
import { getPublicPosts } from "../services/postService";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { getPublicRunnerProfiles } from "../services/runnerProfileService";
import { getActiveDesignTheme } from "../services/publicDesignThemeService";
import {
  Play,
  Users,
  Trophy,
  Gamepad2,
  ChevronDown,
  Zap,
  Heart,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Sparkles,
  Megaphone,
  Newspaper,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

type PublicPost = {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  publishDate?: string | null;
  createdAt?: string | null;
};

type PublicRunnerProfile = {
  id: string;
  displayName: string;
  country?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  presentationVideoUrl?: string | null;
  sortOrder: number;
  socialLinks: {
    socialNetworkId: string;
    name: string;
    url: string;
  }[];
};


type PublicEvent = {
  id: string;
  name?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
  applicationsOpen?: boolean;
  publicRunsVisible?: boolean;
  seasonKey?: string | null;
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  heroMetaText?: string | null;
};


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

function getSeasonVideoSrc(
  season: SeasonAssetKey
) {
  switch (season) {
    case "Winter":
      return "/videos/SGW.mp4";

    case "Fall":
      return "/videos/SGF.mp4";

    default:
      return "/videos/SGS.mp4";
  }
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

function formatPostDate(
  value?: string | null
) {
  if (!value) {
    return "Anuncio oficial";
  }

  return new Date(value)
    .toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
}

function getPostPreview(
  content: string
) {
  const cleanContent =
    content?.trim() ?? "";

  if (cleanContent.length <= 170) {
    return cleanContent;
  }

  return `${cleanContent.slice(0, 170)}...`;
}

function parseApiDateOnly(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const datePart =
    value.split("T")[0];

  const parts =
    datePart
      .split("-")
      .map((part) => Number(part));

  if (
    parts.length !== 3 ||
    parts.some((part) => Number.isNaN(part))
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  return new Date(
    year,
    month - 1,
    day
  );
}

function getMonthName(
  date: Date
) {
  return date.toLocaleDateString(
    "es-MX",
    {
      month: "long",
    }
  );
}

function formatEventDateRange(
  startDate?: string | null,
  endDate?: string | null
) {
  const start =
    parseApiDateOnly(startDate);

  const end =
    parseApiDateOnly(endDate);

  if (!start && !end) {
    return "Fecha por confirmar";
  }

  if (start && !end) {
    return start.toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (!start && end) {
    return end.toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (!start || !end) {
    return "Fecha por confirmar";
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return start.toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  const sameMonthAndYear =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonthAndYear) {
    return `${start.getDate()} - ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
  }

  const sameYear =
    start.getFullYear() === end.getFullYear();

  if (sameYear) {
    return `${start.getDate()} ${getMonthName(start)} - ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
  }

  return `${start.getDate()} ${getMonthName(start)} ${start.getFullYear()} - ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
}

function formatEventDateDescription(
  activeEvent: PublicEvent | null
) {
  const start =
    parseApiDateOnly(activeEvent?.startDate);

  const end =
    parseApiDateOnly(activeEvent?.endDate);

  if (!start || !end) {
    return activeEvent?.description?.trim()
      ? activeEvent.description
      : "La fecha oficial se actualizará cuando el staff la confirme.";
  }

  const dayDifference =
    Math.round(
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  const safeDays =
    Math.max(
      dayDifference,
      1
    );

  if (activeEvent?.description?.trim()) {
    return activeEvent.description;
  }

  return safeDays === 1
    ? "Una jornada dedicada a runs, comunidad y juegos variados."
    : `${safeDays} días dedicados a runs, comunidad y juegos variados.`;
}

export default function HomePage() {
  const [activeEvent, setActiveEvent] =
    useState<PublicEvent | null>(null);

  const [applicationsOpen, setApplicationsOpen] =
    useState(false);

  const [hasActivePublicEvent, setHasActivePublicEvent] =
    useState(false);

  const [activeSeasonKey, setActiveSeasonKey] =
    useState<string>("Summer");

  const [logoFallbackIndex, setLogoFallbackIndex] =
    useState(0);

  const [logoFailed, setLogoFailed] =
    useState(false);

  const [publicPosts, setPublicPosts] =
    useState<PublicPost[]>([]);

    const [publicRunners, setPublicRunners] =
  useState<PublicRunnerProfile[]>([]);

    const [selectedPost, setSelectedPost] =
  useState<PublicPost | null>(null);

const [postDialogOpen, setPostDialogOpen] =
  useState(false);

function openPost(post: PublicPost) {
  setSelectedPost(post);
  setPostDialogOpen(true);
}
const [selectedRunner, setSelectedRunner] =
  useState<PublicRunnerProfile | null>(null);

const [runnerDialogOpen, setRunnerDialogOpen] =
  useState(false);

function openRunner(runner: PublicRunnerProfile) {
  setSelectedRunner(runner);
  setRunnerDialogOpen(true);
}
  useEffect(() => {
    loadHomeData();
  }, []);
async function loadPublicRunners() {
  try {
    const runners =
      await getPublicRunnerProfiles();

    setPublicRunners(
      Array.isArray(runners)
        ? runners
        : []
    );
  } catch (error) {
    console.error(error);
    setPublicRunners([]);
  }
}
  async function loadHomeData() {
    await Promise.all([
      loadActiveEventStatus(),
      loadPublicPosts(),
      loadPublicRunners(),
      loadActiveTheme(),
    ]);
  }

  async function loadActiveTheme() {
    try {
      const theme =
        await getActiveDesignTheme();

      setActiveSeasonKey(
        theme?.seasonKey ?? "Summer"
      );
    } catch (error) {
      console.error(error);
      setActiveSeasonKey("Summer");
    }
  }

  async function loadActiveEventStatus() {
    try {
      const activeEvent =
        await getActivePublicEvent();

      if (!activeEvent) {
        setActiveEvent(null);
        setHasActivePublicEvent(false);
        setApplicationsOpen(false);
        return;
      }

      setActiveEvent(activeEvent);
      setHasActivePublicEvent(true);
      setApplicationsOpen(
        activeEvent.applicationsOpen ?? false
      );
    } catch (error) {
      console.error(error);
      setHasActivePublicEvent(false);
      setApplicationsOpen(false);
    }
  }

  async function loadPublicPosts() {
    try {
      const posts =
        await getPublicPosts();

      const normalizedPosts =
        Array.isArray(posts)
          ? posts
          : [];

      setPublicPosts(
        normalizedPosts.slice(0, 3)
      );
    } catch (error) {
      console.error(error);
      setPublicPosts([]);
    }
  }

  const features = [
    {
      icon: Play,
      title: "Speedruns en vivo",
      description:
        "Runs preparadas por la comunidad para compartir juegos, categorías y rutas con otros espectadores.",
    },
    {
      icon: Users,
      title: "Comunidad",
      description:
        "Un espacio para runners, espectadores y organizadores que disfrutan los videojuegos y los retos cronometrados.",
    },
    {
      icon: Trophy,
      title: "Competencia amistosa",
      description:
        "El objetivo es mostrar talento, constancia y buen ambiente, sin perder el respeto entre participantes.",
    },
    {
      icon: Gamepad2,
      title: "Variedad de plataformas",
      description:
        "Aceptamos propuestas de PC, consolas modernas, retro, portátiles y otras plataformas válidas.",
    },
  ];

  const eventInfo = [
    {
      icon: CalendarDays,
      title: "Fecha del evento",
      value: formatEventDateRange(
        activeEvent?.startDate,
        activeEvent?.endDate
      ),
      description:
        formatEventDateDescription(
          activeEvent
        ),
    },
    {
      icon: ClipboardCheck,
      title: "Postulaciones",
      value: applicationsOpen
        ? "Abiertas"
        : "Cerradas",
      description: applicationsOpen
        ? "Envía tu run desde el formulario público para revisión del staff."
        : "Las postulaciones para esta edición ya fueron cerradas por el staff.",
    },
    {
      icon: Clock3,
      title: "Horario",
      value: activeEvent?.isPublished
        ? "Publicado por el staff"
        : "Pendiente de publicación",
      description: activeEvent?.isPublished
        ? "El calendario se actualizará conforme se aprueben y acomoden las runs."
        : "El staff publicará el horario cuando el acomodo esté listo.",
    },
    {
      icon: Sparkles,
      title: "Lineup",
      value: "Curado por SGames",
      description:
        "Buscamos variedad de juegos, categorías, plataformas y runners.",
    },
  ];

  const faqs = [
    {
      question: "¿Cómo puedo participar?",
      answer:
        'Ve a la sección "Postulación" y completa el formulario con tu nombre, juego, categoría, plataforma, tiempo estimado, video demostrativo y datos de contacto. El staff revisará tu propuesta.',
    },
    {
      question: "¿Qué juegos son aceptados?",
      answer:
        "Puedes postular juegos de distintas plataformas y generaciones. La selección final dependerá de la calidad de la propuesta, variedad del lineup, duración y organización del evento.",
    },
    {
      question: "¿Necesito video demostrativo?",
      answer:
        "Sí. El video demostrativo ayuda al staff a revisar que la run sea viable, que el tiempo estimado sea razonable y que la categoría esté clara.",
    },
    {
      question: "¿Cuándo se publica el horario?",
      answer:
        'El horario se publicará cuando el staff acomode las runs aprobadas. Podrás consultarlo en la sección "Horario".',
    },
    {
      question: "¿Puedo poner redes sociales?",
      answer:
        "Sí. Son opcionales, pero recomendadas para que la comunidad pueda conocer tu contenido o seguirte durante el evento.",
    },
  ];

  const runnerCarouselItems =
    publicRunners.length > 1
      ? [
          ...publicRunners,
          ...publicRunners,
        ]
      : publicRunners;

  const seasonAssetKey =
    normalizeSeasonAssetKey(activeSeasonKey);

  const seasonVideoSrc =
    getSeasonVideoSrc(seasonAssetKey);

  const seasonLogoCandidates =
    getSeasonLogoCandidates(
      seasonAssetKey
    );

  const seasonLogoSrc =
    seasonLogoCandidates[
      Math.min(
        logoFallbackIndex,
        seasonLogoCandidates.length - 1
      )
    ];

  const heroEyebrowText =
    activeEvent?.heroEyebrow?.trim() ||
    "Speedrun Event";

  const heroTitleText =
    activeEvent?.heroTitle?.trim() ||
    "SGames";

  const heroDescriptionText =
    activeEvent?.heroDescription?.trim() ||
    "Un evento comunitario para reunir speedrunners de distintos juegos, categorías y plataformas.";

  const heroMetaText =
    activeEvent?.heroMetaText?.trim() ||
    `Del ${formatEventDateRange(
      activeEvent?.startDate,
      activeEvent?.endDate
    )}. Postula tu run, comparte tu talento y forma parte del lineup.`;


  useEffect(() => {
    setLogoFallbackIndex(0);
    setLogoFailed(false);
  }, [seasonAssetKey]);

  return (
    <div className="overflow-hidden bg-[var(--sg-background)]">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[var(--sg-background)] py-20 lg:py-28">
        {/* Video Background */}
        <video
          key={seasonVideoSrc}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src={seasonVideoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />

        {/* Video Overlays */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity:
              seasonAssetKey === "Fall"
                ? 0.34
                : 0.48,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "var(--sg-hero-gradient)",
            opacity:
              seasonAssetKey === "Fall"
                ? 0.42
                : 0.62,
          }}
        />

        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--sg-background)] to-transparent" />

        <div className="absolute left-8 top-20 hidden text-[var(--sg-primary)] opacity-40 lg:block">
          <div className="font-mono text-sm">
            00:15:42.31
          </div>
        </div>

        <div className="absolute right-12 top-32 hidden text-[var(--sg-accent)] opacity-40 lg:block">
          <div className="font-mono text-sm">
            PB: 00:14:58
          </div>
        </div>

        <div className="absolute bottom-24 left-16 hidden text-[var(--sg-secondary)] opacity-40 lg:block">
          <div className="font-mono text-sm">
            RUN READY
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-[var(--sg-accent)]/40 blur-2xl" />

                {!logoFailed ? (
                  <img
                    src={seasonLogoSrc}
                    alt={`Logo de SGames ${seasonAssetKey}`}
                    onError={() => {
                      setLogoFallbackIndex((current) => {
                        if (
                          current <
                          seasonLogoCandidates.length - 1
                        ) {
                          return current + 1;
                        }

                        setLogoFailed(true);
                        return current;
                      });
                    }}
                    className="sgames-logo-shadow relative h-36 w-36 rounded-[2rem] border border-white/25 object-cover md:h-44 md:w-44"
                  />
                ) : (
                  <div className="sgames-logo-shadow relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/25 bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] text-4xl font-black text-white md:h-44 md:w-44 md:text-5xl">
                    SG
                  </div>
                )}
              </div>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-[var(--sg-primary)]">
              {heroEyebrowText}
            </p>

            <h1 className="sgames-neon-text mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
              {heroTitleText}
            </h1>

            <p className="mx-auto mb-4 max-w-3xl text-lg text-[var(--sg-text)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] md:text-xl lg:text-2xl">
              {heroDescriptionText}
            </p>

            {hasActivePublicEvent && (
              <p className="mx-auto mb-8 max-w-2xl text-sm text-[var(--sg-muted-text)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] md:text-base">
                {heroMetaText}
              </p>
            )}

            {hasActivePublicEvent && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {applicationsOpen ? (
                <Link to="/postulacion">
                  <Button
                    size="lg"
                    className="sgames-primary-button text-base font-bold sgames-neon-border"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Enviar Postulación
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="cursor-not-allowed bg-gray-700 text-base font-bold text-gray-300"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Postulaciones cerradas
                </Button>
              )}

              <Link to="/horario">
                <Button
                  size="lg"
                  variant="outline"
                  className="sgames-outline-button text-base font-bold backdrop-blur-md"
                >
                  Ver Horario
                </Button>
              </Link>
            </div>
            )}
          </div>

          <div className="mt-16 flex justify-center">
            <ChevronDown className="h-8 w-8 animate-bounce text-[var(--sg-primary)]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--sg-background)] py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-[var(--sg-text)] md:text-4xl">
            ¿Por qué participar en{" "}
            <span className="sgames-neon-text">
              SGames
            </span>
            ?
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className="sgames-glass group transition-all hover:-translate-y-1 hover:border-[var(--sg-accent)]/50 hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] sgames-neon-border">
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-[var(--sg-text)]">
                      {feature.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-[var(--sg-muted-text)]">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      {hasActivePublicEvent && (
      <section className="border-y border-[var(--sg-border)] py-16" style={{ background: "var(--sg-card-gradient)" }}>
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-[var(--sg-text)] md:text-4xl">
              Información del evento
            </h2>

            <p className="mt-3 text-[var(--sg-muted-text)]">
              Datos base para participantes y espectadores.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {eventInfo.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="sgames-glass rounded-2xl p-6 shadow-[0_0_30px_rgba(15,23,42,0.35)]"
                >
                  <Icon className="mb-4 h-7 w-7 text-[var(--sg-primary)]" />

                  <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[var(--sg-muted-text)] opacity-70">
                    {item.title}
                  </p>

                  <p className="mb-3 text-xl font-black text-[var(--sg-text)]">
                    {item.value}
                  </p>

                  <p className="text-sm leading-relaxed text-[var(--sg-muted-text)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

            {/* Official Announcements Section */}
{hasActivePublicEvent && publicPosts.length > 0 && (
  <section className="bg-[var(--sg-background)] py-20">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] sgames-neon-border">
            <Megaphone className="h-7 w-7 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-[var(--sg-text)] md:text-4xl">
          Anuncios oficiales
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-[var(--sg-muted-text)]">
          Noticias, avisos y actualizaciones importantes del staff de SGames.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publicPosts.map((post) => (
          <Card
            key={post.id}
            role="button"
            tabIndex={0}
            onClick={() =>
              openPost(post)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                openPost(post);
              }
            }}
            className="sgames-glass group cursor-pointer transition-all hover:-translate-y-1 hover:border-[var(--sg-primary)]/50 hover:shadow-xl"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--sg-primary)]/10 text-[var(--sg-primary)]">
                  <Newspaper className="h-5 w-5" />
                </div>

                {post.category && (
                  <span className="rounded-full border border-[var(--sg-accent)]/30 bg-[var(--sg-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--sg-accent)]">
                    {post.category}
                  </span>
                )}
              </div>

              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sg-muted-text)] opacity-70">
                {formatPostDate(
                  post.publishDate ??
                    post.createdAt
                )}
              </p>

              <h3 className="mb-3 text-xl font-black text-[var(--sg-text)] transition-colors group-hover:text-[var(--sg-primary)]">
                {post.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--sg-muted-text)]">
                {getPostPreview(
                  post.content
                )}
              </p>

              <p className="mt-5 text-sm font-semibold text-[var(--sg-primary)] transition-colors group-hover:text-[var(--sg-accent)]">
                Ver anuncio completo
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)}


{publicRunners.length > 0 && (
  <section className="bg-[var(--sg-background)] py-20">
    <style>
      {`
        @keyframes sgames-runner-carousel-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .sgames-runner-track {
          animation: sgames-runner-carousel-scroll 38s linear infinite;
        }

        .sgames-runner-carousel:hover .sgames-runner-track,
        .sgames-runner-carousel:focus-within .sgames-runner-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .sgames-runner-track {
            animation: none;
          }
        }
      `}
    </style>

    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--sg-primary),var(--sg-secondary),var(--sg-accent))] sgames-neon-border">
            <Users className="h-7 w-7 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-[var(--sg-text)] md:text-4xl">
          Runners participantes
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-[var(--sg-muted-text)]">
          Conoce a todos los runners que formarán parte de esta primera maratón.
          El carrusel se pausa al pasar el cursor o enfocar una tarjeta.
        </p>
      </div>

      <div className="sgames-runner-carousel relative overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--sg-background)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--sg-background)] to-transparent" />

        <div
          className={`flex w-max gap-4 ${
            publicRunners.length > 1
              ? "sgames-runner-track"
              : ""
          }`}
        >
          {runnerCarouselItems.map((runner, index) => (
            <Card
              key={`${runner.id}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => openRunner(runner)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  openRunner(runner);
                }
              }}
              className="sgames-glass group w-[230px] shrink-0 cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:border-[var(--sg-primary)]/50 hover:shadow-xl sm:w-[250px] lg:w-[270px]"
            >
              <div className="aspect-square bg-[var(--sg-background)]">
                {runner.photoUrl ? (
                  <img
                    src={runner.photoUrl}
                    alt={runner.displayName}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Users className="h-10 w-10 text-slate-700" />
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                  Runner
                </p>

                <h3 className="line-clamp-1 text-lg font-black text-[var(--sg-text)]">
                  {runner.displayName}
                </h3>

                {runner.country && (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--sg-muted-text)]">
                    {runner.country}
                  </p>
                )}

                {runner.bio && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--sg-muted-text)]">
                    {runner.bio}
                  </p>
                )}

                <p className="mt-4 text-xs font-semibold text-[var(--sg-primary)] transition-colors group-hover:text-[var(--sg-accent)]">
                  Ver perfil completo
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </section>
)}

{/* Announcement Detail Dialog */}
<Dialog
  open={postDialogOpen}
  onOpenChange={setPostDialogOpen}
>
  <DialogContent className="sgames-glass max-h-[90vh] w-[95vw] max-w-2xl overflow-hidden p-0 text-[var(--sg-text)]">
    <DialogHeader className="border-b border-[var(--sg-border)] px-6 py-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sg-primary)]/10 text-[var(--sg-primary)]">
          <Megaphone className="h-5 w-5" />
        </div>

        {selectedPost?.category && (
          <span className="rounded-full border border-[var(--sg-accent)]/30 bg-[var(--sg-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--sg-accent)]">
            {selectedPost.category}
          </span>
        )}
      </div>

      <DialogTitle className="text-2xl font-black text-[var(--sg-text)]">
        {selectedPost?.title}
      </DialogTitle>

      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--sg-muted-text)] opacity-70">
        {formatPostDate(
          selectedPost?.publishDate ??
            selectedPost?.createdAt
        )}
      </p>
    </DialogHeader>

    <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
      {selectedPost?.content?.trim() ? (
        <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-[var(--sg-muted-text)]">
          {selectedPost.content}
        </p>
      ) : (
        <p className="text-[var(--sg-muted-text)]">
          Este anuncio no tiene contenido adicional.
        </p>
      )}
    </div>

    <DialogFooter className="border-t border-[var(--sg-border)] px-6 py-4">
      <Button
        variant="outline"
        onClick={() =>
          setPostDialogOpen(false)
        }
        className="border-[var(--sg-primary)]/40 text-[var(--sg-primary)] hover:bg-[var(--sg-primary)]/10"
      >
        Cerrar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Runner Profile Section */}
<Dialog
  open={runnerDialogOpen}
  onOpenChange={setRunnerDialogOpen}
>
  <DialogContent className="sgames-glass flex h-[92vh] w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 text-[var(--sg-text)] sm:max-w-[1200px] xl:max-w-[1280px]">
    <DialogHeader className="shrink-0 border-b border-[var(--sg-border)] px-6 py-5">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--sg-primary)]">
          Perfil del runner
        </p>

        <DialogTitle className="text-3xl font-black text-[var(--sg-text)] md:text-4xl">
          {selectedRunner?.displayName}
        </DialogTitle>

        <DialogDescription className="mt-2 text-sm text-[var(--sg-muted-text)]">
          {selectedRunner?.country
            ? selectedRunner.country
            : "Runner participante de SGames"}
        </DialogDescription>
      </div>
    </DialogHeader>

    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="grid gap-0 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)]">
        {/* Imagen */}
        <div className="min-w-0 border-b border-[var(--sg-border)] bg-[var(--sg-background)] p-5 lg:border-b-0 lg:border-r lg:border-[var(--sg-border)]">
          <div className="mx-auto aspect-[4/5] max-h-[66vh] overflow-hidden rounded-3xl border border-[var(--sg-border)] bg-black/40 shadow-[0_0_35px_rgba(56,189,248,0.10)]">
            {selectedRunner?.photoUrl ? (
              <img
                src={selectedRunner.photoUrl}
                alt={selectedRunner.displayName}
                className="h-full w-full object-contain object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Users className="h-16 w-16 text-slate-700" />
              </div>
            )}
          </div>
        </div>

        {/* Info + video */}
        <div className="min-w-0 space-y-5 p-5 md:p-6">
          <div className="sgames-glass rounded-3xl p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--sg-primary)]">
              Presentación
            </p>

            <h3 className="text-2xl font-black text-[var(--sg-text)]">
              {selectedRunner?.displayName}
            </h3>

            {selectedRunner?.bio ? (
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[var(--sg-muted-text)]">
                {selectedRunner.bio}
              </p>
            ) : (
              <p className="mt-4 text-[var(--sg-muted-text)] opacity-70">
                Este runner todavía no tiene presentación escrita.
              </p>
            )}
          </div>

          <div className="sgames-glass rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--sg-accent)]">
              Video
            </p>

            <h3 className="mt-1 mb-4 text-2xl font-black text-[var(--sg-text)]">
              Video de presentación
            </h3>

            {selectedRunner?.presentationVideoUrl ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--sg-accent)]/20 bg-black">
                <video
                  src={selectedRunner.presentationVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-black"
                >
                  Tu navegador no puede reproducir este video.
                </video>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-black/30 text-center">
                <div>
                  <p className="font-semibold text-[var(--sg-text)]">
                    Sin video de presentación
                  </p>

                  <p className="mt-1 text-sm text-[var(--sg-muted-text)] opacity-70">
                    Cuando el staff suba un video, aparecerá aquí.
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedRunner?.socialLinks?.length ? (
            <div className="sgames-glass rounded-3xl p-5">
              <p className="mb-3 text-sm font-semibold text-[var(--sg-primary)]">
                Redes sociales
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedRunner.socialLinks.map((link) => (
                  <a
                    key={`${selectedRunner.id}-${link.socialNetworkId}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[var(--sg-primary)]/30 bg-[var(--sg-primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--sg-primary)] hover:bg-[var(--sg-primary)]/20"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>

    <DialogFooter className="shrink-0 border-t border-[var(--sg-border)] px-6 py-4">
      <Button
        variant="outline"
        onClick={() => setRunnerDialogOpen(false)}
        className="border-[var(--sg-primary)]/40 text-[var(--sg-primary)] hover:bg-[var(--sg-primary)]/10"
      >
        Cerrar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-[var(--sg-background)] py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-[var(--sg-text)] md:text-4xl">
            Preguntas Frecuentes
          </h2>

          <div className="mx-auto max-w-3xl">
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="sgames-glass rounded-2xl px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-bold text-[var(--sg-text)] hover:text-[var(--sg-primary)]">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="leading-relaxed text-[var(--sg-muted-text)]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {hasActivePublicEvent && (
      <section className="relative overflow-hidden py-20" style={{ background: "var(--sg-card-gradient)" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--sg-hero-gradient)" }} />

        <div className="container relative mx-auto px-4 text-center">
          <Heart className="mx-auto mb-6 h-16 w-16 text-[var(--sg-accent)]" />

          <h2 className="mb-4 text-3xl font-black text-[var(--sg-text)] md:text-4xl">
            ¿Listo para mostrar tu run?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--sg-muted-text)]">
            Envía tu postulación y ayúdanos a construir un
            lineup variado, entretenido y memorable.
          </p>

          {applicationsOpen ? (
            <Link to="/postulacion">
              <Button
                size="lg"
                className="sgames-primary-button text-lg font-bold sgames-neon-border"
              >
                <Zap className="mr-2 h-5 w-5" />
                Enviar mi Postulación
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              disabled
              className="cursor-not-allowed bg-gray-700 text-lg font-bold text-gray-300"
            >
              <Zap className="mr-2 h-5 w-5" />
              Postulaciones cerradas
            </Button>
          )}
        </div>
      </section>
      )}
    </div>
  );
}