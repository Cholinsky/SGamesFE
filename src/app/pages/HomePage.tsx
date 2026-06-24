import { useEffect, useState } from "react";
import { getActivePublicEvent } from "../services/eventService";
import { getPublicPosts } from "../services/postService";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { getPublicRunnerProfiles } from "../services/runnerProfileService";
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
import logoSgames from "../../assets/logo-sgames.jpeg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export default function HomePage() {
  const [applicationsOpen, setApplicationsOpen] =
    useState(true);

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
]);
  }

  async function loadActiveEventStatus() {
    try {
      const activeEvent =
        await getActivePublicEvent();

      setApplicationsOpen(
        activeEvent.applicationsOpen ?? true
      );
    } catch (error) {
      console.error(error);
      setApplicationsOpen(true);
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
      value: "31 julio - 2 agosto 2026",
      description:
        "Tres días dedicados a runs, comunidad y juegos variados.",
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
      value: "Publicado por el staff",
      description:
        "El calendario se actualizará conforme se aprueben y acomoden las runs.",
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

  return (
    <div className="overflow-hidden bg-[#070817]">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#070817] py-20 lg:py-28">
        {/* Video Background */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="/videos/transicion-sg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />

        {/* Video Overlays */}
        <div className="absolute inset-0 bg-[#050713]/70" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_35%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.24),transparent_35%),linear-gradient(180deg,rgba(7,8,23,0.30)_0%,rgba(7,8,23,0.72)_70%,#070817_100%)]" />

        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070817] to-transparent" />

        <div className="absolute left-8 top-20 hidden text-cyan-300/30 lg:block">
          <div className="font-mono text-sm">
            00:15:42.31
          </div>
        </div>

        <div className="absolute right-12 top-32 hidden text-pink-300/30 lg:block">
          <div className="font-mono text-sm">
            PB: 00:14:58
          </div>
        </div>

        <div className="absolute bottom-24 left-16 hidden text-violet-300/30 lg:block">
          <div className="font-mono text-sm">
            RUN READY
          </div>
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-pink-500/45 blur-2xl" />

                <img
                  src={logoSgames}
                  alt="Logo de SGames"
                  className="relative h-36 w-36 rounded-[2rem] border border-white/25 object-cover shadow-[0_0_55px_rgba(217,70,239,0.55)] md:h-44 md:w-44"
                />
              </div>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              Speedrun Event
            </p>

            <h1 className="mb-6 bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_0_28px_rgba(217,70,239,0.35)] md:text-7xl lg:text-8xl">
              SGames
            </h1>

            <p className="mx-auto mb-4 max-w-3xl text-lg text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] md:text-xl lg:text-2xl">
              Un evento comunitario para reunir speedrunners
              de distintos juegos, categorías y plataformas.
            </p>

            <p className="mx-auto mb-8 max-w-2xl text-sm text-slate-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] md:text-base">
              Del 31 de julio al 2 de agosto de 2026.
              Postula tu run, comparte tu talento y forma parte
              del lineup.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {applicationsOpen ? (
                <Link to="/postulacion">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-base font-bold text-white shadow-[0_0_32px_rgba(217,70,239,0.45)] hover:from-cyan-300 hover:via-violet-400 hover:to-pink-400"
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
                  className="border-cyan-300/50 bg-[#070817]/55 text-base font-bold text-cyan-100 backdrop-blur-md hover:border-pink-300/70 hover:bg-pink-500/15 hover:text-pink-100"
                >
                  Ver Horario
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <ChevronDown className="h-8 w-8 animate-bounce text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#070817] py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-white md:text-4xl">
            ¿Por qué participar en{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
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
                  className="group border-violet-500/20 bg-[#10182b]/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.18)]"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_22px_rgba(56,189,248,0.25)]">
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-white">
                      {feature.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-400">
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
      <section className="border-y border-violet-500/20 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16),transparent_55%)] py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              Información del evento
            </h2>

            <p className="mt-3 text-slate-400">
              Datos base para participantes y espectadores.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {eventInfo.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-violet-500/20 bg-[#10182b]/70 p-6 shadow-[0_0_30px_rgba(15,23,42,0.35)]"
                >
                  <Icon className="mb-4 h-7 w-7 text-cyan-300" />

                  <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">
                    {item.title}
                  </p>

                  <p className="mb-3 text-xl font-black text-white">
                    {item.value}
                  </p>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {publicRunners.length > 0 && (
  <section className="bg-[#070817] py-20">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_28px_rgba(217,70,239,0.30)]">
            <Users className="h-7 w-7 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white md:text-4xl">
          Runners participantes
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Conoce a algunos de los runners que formarán parte de esta primera maratón.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publicRunners.map((runner) => (
          <Card
            key={runner.id}
            className="group overflow-hidden border-violet-500/20 bg-[#10182b]/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.16)]"
          >
            <div className="aspect-video bg-[#070817]">
              {runner.photoUrl ? (
                <img
                  src={runner.photoUrl}
                  alt={runner.displayName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Users className="h-12 w-12 text-slate-700" />
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
                Runner
              </p>

              <h3 className="text-2xl font-black text-white">
                {runner.displayName}
              </h3>

              {runner.country && (
                <p className="mt-1 text-sm text-slate-400">
                  {runner.country}
                </p>
              )}

              {runner.bio && (
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-400">
                  {runner.bio}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {runner.presentationVideoUrl && (
                  <a
                    href={runner.presentationVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-200 hover:bg-pink-500/20"
                  >
                    Ver presentación
                  </a>
                )}

                {runner.socialLinks?.map((link) => (
                  <a
                    key={`${runner.id}-${link.socialNetworkId}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)}

      {/* Official Announcements Section */}
{publicPosts.length > 0 && (
  <section className="bg-[#070817] py-20">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_28px_rgba(217,70,239,0.30)]">
            <Megaphone className="h-7 w-7 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white md:text-4xl">
          Anuncios oficiales
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
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
            className="group cursor-pointer border-violet-500/20 bg-[#10182b]/70 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.16)]"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <Newspaper className="h-5 w-5" />
                </div>

                {post.category && (
                  <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-pink-200">
                    {post.category}
                  </span>
                )}
              </div>

              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                {formatPostDate(
                  post.publishDate ??
                    post.createdAt
                )}
              </p>

              <h3 className="mb-3 text-xl font-black text-white transition-colors group-hover:text-cyan-200">
                {post.title}
              </h3>

              <p className="text-sm leading-relaxed text-slate-400">
                {getPostPreview(
                  post.content
                )}
              </p>

              <p className="mt-5 text-sm font-semibold text-cyan-300 transition-colors group-hover:text-pink-200">
                Ver anuncio completo
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)}

{/* Announcement Detail Dialog */}
<Dialog
  open={postDialogOpen}
  onOpenChange={setPostDialogOpen}
>
  <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-hidden border-violet-500/30 bg-[#0b1022] p-0 text-white">
    <DialogHeader className="border-b border-violet-500/20 px-6 py-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
          <Megaphone className="h-5 w-5" />
        </div>

        {selectedPost?.category && (
          <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-pink-200">
            {selectedPost.category}
          </span>
        )}
      </div>

      <DialogTitle className="text-2xl font-black text-white">
        {selectedPost?.title}
      </DialogTitle>

      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500">
        {formatPostDate(
          selectedPost?.publishDate ??
            selectedPost?.createdAt
        )}
      </p>
    </DialogHeader>

    <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
      {selectedPost?.content?.trim() ? (
        <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-slate-300">
          {selectedPost.content}
        </p>
      ) : (
        <p className="text-slate-400">
          Este anuncio no tiene contenido adicional.
        </p>
      )}
    </div>

    <DialogFooter className="border-t border-violet-500/20 px-6 py-4">
      <Button
        variant="outline"
        onClick={() =>
          setPostDialogOpen(false)
        }
        className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
      >
        Cerrar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* FAQ Section */}
      <section
        id="faq"
        className="bg-[#070817] py-20"
      >
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-black text-white md:text-4xl">
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
                  className="rounded-2xl border border-violet-500/20 bg-[#10182b]/70 px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-cyan-300">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="leading-relaxed text-slate-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(168,85,247,0.18),rgba(236,72,153,0.14))] py-20">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16)_0,transparent_25%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,0.2)_0,transparent_25%)]" />

        <div className="container relative mx-auto px-4 text-center">
          <Heart className="mx-auto mb-6 h-16 w-16 text-pink-300" />

          <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">
            ¿Listo para mostrar tu run?
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            Envía tu postulación y ayúdanos a construir un
            lineup variado, entretenido y memorable.
          </p>

          {applicationsOpen ? (
            <Link to="/postulacion">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-lg font-bold text-white shadow-[0_0_28px_rgba(217,70,239,0.35)] hover:from-cyan-300 hover:via-violet-400 hover:to-pink-400"
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
    </div>
  );
}

