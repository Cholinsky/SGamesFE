import { Link } from "react-router";
import { Button } from "../components/ui/button";
import {
  Play,
  Users,
  Trophy,
  Gamepad2,
  ChevronDown,
  Zap,
  Globe,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

export default function HomePage() {
  const features = [
    {
      icon: Play,
      title: "Speedruns en vivo",
      description:
        "Disfruta de carreras cronometradas en tiempo real por los mejores jugadores.",
    },
    {
      icon: Users,
      title: "Comunidad",
      description:
        "Conecta con otros speedrunners y comparte tu pasión por los videojuegos.",
    },
    {
      icon: Trophy,
      title: "Competencia amistosa",
      description:
        "Participa en un ambiente competitivo pero amigable y de respeto mutuo.",
    },
    {
      icon: Gamepad2,
      title: "Múltiples plataformas",
      description:
        "Aceptamos speedruns de PC, consolas retro, modernas y dispositivos móviles.",
    },
  ];

  const faqs = [
    {
      question: "¿Cómo puedo participar?",
      answer:
        'Para participar, dirígete a la sección de "Postulación" en el menú superior y completa el formulario con toda la información requerida sobre tu speedrun. Nuestro equipo revisará tu postulación y te contactaremos vía correo electrónico.',
    },
    {
      question: "¿Qué juegos son aceptados?",
      answer:
        "Aceptamos speedruns de cualquier videojuego, desde títulos clásicos hasta lanzamientos recientes. Lo importante es que tengas un tiempo competitivo y un video demostrativo de tu run. Priorizamos la diversidad en el lineup del evento.",
    },
    {
      question: "¿Necesito video demostrativo?",
      answer:
        "Sí, es obligatorio incluir un enlace a un video demostrativo de tu speedrun en YouTube. Este video nos ayuda a evaluar la calidad de tu run y asegurar que cumple con los estándares del evento.",
    },
    {
      question: "¿Cómo se publican los horarios?",
      answer:
        'Una vez finalizadas las postulaciones, nuestro equipo organizará el horario del evento. Los horarios oficiales se publicarán en la sección "Horario" y notificaremos a todos los participantes seleccionados vía correo electrónico.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />

        {/* Speedrun decorative elements - subtle timers */}
        <div className="absolute left-8 top-20 hidden text-cyan-400/20 lg:block">
          <div className="font-mono text-sm">00:15:42.31</div>
        </div>
        <div className="absolute right-12 top-32 hidden text-purple-400/20 lg:block">
          <div className="font-mono text-sm">00:15:42.32</div>
        </div>
        <div className="absolute bottom-24 left-16 hidden text-pink-400/20 lg:block">
          <div className="font-mono text-sm">00:15:42.33</div>
        </div>
        <div className="absolute bottom-32 right-20 hidden text-cyan-400/20 lg:block">
          <div className="font-mono text-sm">PB: 00:14:58</div>
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl lg:text-7xl">
              Bienvenido a SGames
            </h1>
            <p className="mb-8 text-lg text-gray-300 md:text-xl lg:text-2xl">
              Un evento dedicado a reunir speedrunners de distintos juegos y
              plataformas para compartir su talento con la comunidad.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/postulacion">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-lg hover:from-cyan-600 hover:to-purple-700"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Enviar Postulación
                </Button>
              </Link>
              <Link to="/horario">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-cyan-500/50 text-lg text-cyan-400 hover:bg-cyan-500/10"
                >
                  Ver Horario
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <ChevronDown className="h-8 w-8 animate-bounce text-cyan-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            ¿Por qué participar en{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              SGames
            </span>
            ?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-cyan-400">150+</div>
              <div className="text-gray-400">Speedrunners</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-purple-400">72h</div>
              <div className="text-gray-400">Duración del evento</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-pink-400">50+</div>
              <div className="text-gray-400">Juegos distintos</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-400">10k+</div>
              <div className="text-gray-400">Espectadores</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Preguntas Frecuentes
          </h2>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-lg border border-gray-800 bg-gray-900/50 px-6"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-cyan-400">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cyan-900/30 to-purple-900/30 py-20">
        {/* Enhanced pattern with circuit/speedrun theme */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNpcmN1aXQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMiIgZmlsbD0icmdiYSgwLDI1NSwyNTUsMC4wNSkiLz48cGF0aCBkPSJNIDQwIDAgTCA0MCA0MCBNIDAgNDAgTCA0MCA0MCBNIDQwIDQwIEwgODAgNDAgTSA0MCA0MCBMIDQWIDA4MCIgc3Ryb2tlPSJyZ2JhKDAsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NpcmN1aXQpIi8+PC9zdmc+')] opacity-20" />

        <div className="container relative mx-auto px-4 text-center">
          <Heart className="mx-auto mb-6 h-16 w-16 text-pink-400" />
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            ¿Listo para mostrar tu talento?
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Únete a la comunidad de speedrunning más grande de la región
          </p>
          <Link to="/postulacion">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-lg hover:from-cyan-600 hover:to-purple-700"
            >
              <Zap className="mr-2 h-5 w-5" />
              Enviar mi Postulación
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
