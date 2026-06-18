import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Calendar,
  Clock,
  Gamepad2,
  User,
  Filter,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Info,
  Monitor,
  Timer,
  SearchX,
  ClipboardEdit,
} from "lucide-react";
import { getPublicSchedule } from "../services/scheduleService";

type ScheduleEntry = {
  id: string;
  dayDate: string;
  dayLabel: string;
  shortDayLabel: string;
  time: string;
  runner: string;
  game: string;
  category: string;
  platform: string;
  duration: string;
  durationMinutes: number;
  status?: "current" | "next" | "completed";
};

type PublicScheduleResponse = {
  isPublished: boolean;
  message?: string;
  event?: string;
  entries?: PublicScheduleEntryDto[];
};

type PublicScheduleEntryDto = {
  id: string;
  dayDate: string;
  startTime: string;
  durationMinutes: number;
  runnerName: string | null;
  game: string | null;
  category: string | null;
  platform: string | null;
};

type DayOption = {
  dayDate: string;
  label: string;
  shortLabel: string;
};

const EVENT_ID =
  "04337355-98CA-4836-A1C1-5A8F84869F6D";

function parseLocalDate(dayDate: string) {
  const cleanDate =
    dayDate.split("T")[0];

  const [year, month, day] =
    cleanDate.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatScheduleDate(dayDate: string) {
  const date =
    parseLocalDate(dayDate);

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatShortDay(dayDate: string) {
  const date =
    parseLocalDate(dayDate);

  const day =
    date.toLocaleDateString("es-MX", {
      weekday: "long",
    });

  return capitalize(day);
}

function formatDuration(minutes: number) {
  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (hours <= 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function compareEntries(
  a: ScheduleEntry,
  b: ScheduleEntry
) {
  const dateA =
    parseLocalDate(a.dayDate).getTime();

  const dateB =
    parseLocalDate(b.dayDate).getTime();

  if (dateA !== dateB) {
    return dateA - dateB;
  }

  return a.time.localeCompare(b.time);
}

function mapPublicEntry(
  entry: PublicScheduleEntryDto
): ScheduleEntry {
  return {
    id:
      entry.id,

    dayDate:
      entry.dayDate,

    dayLabel:
      formatScheduleDate(entry.dayDate),

    shortDayLabel:
      formatShortDay(entry.dayDate),

    time:
      String(entry.startTime).substring(0, 5),

    runner:
      entry.runnerName ?? "Bloque",

    game:
      entry.game ?? "Bloque del evento",

    category:
      entry.category ?? "General",

    platform:
      entry.platform ?? "-",

    duration:
      formatDuration(entry.durationMinutes),

    durationMinutes:
      entry.durationMinutes,
  };
}

function getStatusBadge(
  status?: string
) {
  if (status === "current") {
    return (
      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
        En vivo
      </Badge>
    );
  }

  if (status === "next") {
    return (
      <Badge className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
        Próximo
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">
        Completado
      </Badge>
    );
  }

  return null;
}

export default function HorarioPage() {
  const [selectedDay, setSelectedDay] =
    useState("todos");

  const [selectedGame, setSelectedGame] =
    useState("todos");

  const [selectedPlatform, setSelectedPlatform] =
    useState("todos");

  const [schedule, setSchedule] =
    useState<ScheduleEntry[]>([]);

  const [eventName, setEventName] =
    useState("SGames");

  const [isPublished, setIsPublished] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadPublicSchedule();
  }, []);

  async function loadPublicSchedule() {
    try {
      setLoading(true);

      const data: PublicScheduleResponse =
        await getPublicSchedule(EVENT_ID);

      setIsPublished(data.isPublished);

      if (!data.isPublished) {
        setMessage(
          data.message ??
            "El horario aún no ha sido publicado."
        );

        setSchedule([]);
        return;
      }

      setEventName(
        data.event ?? "SGames"
      );

      const mappedEntries =
        (data.entries ?? [])
          .map(mapPublicEntry)
          .sort(compareEntries);

      setSchedule(mappedEntries);
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudo cargar el horario."
      );

      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }

  const dayOptions: DayOption[] =
    Array.from(
      new Map(
        schedule.map((entry) => [
          entry.dayDate,
          {
            dayDate: entry.dayDate,
            label: entry.dayLabel,
            shortLabel: entry.shortDayLabel,
          },
        ])
      ).values()
    ).sort(
      (a, b) =>
        parseLocalDate(a.dayDate).getTime() -
        parseLocalDate(b.dayDate).getTime()
    );

  const games =
    Array.from(
      new Set(
        schedule
          .map((entry) => entry.game)
          .filter(Boolean)
      )
    ).sort();

  const platforms =
    Array.from(
      new Set(
        schedule
          .map((entry) => entry.platform)
          .filter(Boolean)
      )
    ).sort();

  const filteredSchedule =
    schedule.filter((entry) => {
      if (
        selectedDay !== "todos" &&
        entry.dayDate !== selectedDay
      ) {
        return false;
      }

      if (
        selectedGame !== "todos" &&
        entry.game !== selectedGame
      ) {
        return false;
      }

      if (
        selectedPlatform !== "todos" &&
        entry.platform !== selectedPlatform
      ) {
        return false;
      }

      return true;
    });

  const displayDayOptions =
    dayOptions.filter((day) => {
      if (
        selectedDay !== "todos" &&
        day.dayDate !== selectedDay
      ) {
        return false;
      }

      if (selectedDay === "todos") {
        return filteredSchedule.some(
          (entry) =>
            entry.dayDate === day.dayDate
        );
      }

      return true;
    });

  const hasActiveFilters =
    selectedDay !== "todos" ||
    selectedGame !== "todos" ||
    selectedPlatform !== "todos";

  function clearFilters() {
    setSelectedDay("todos");
    setSelectedGame("todos");
    setSelectedPlatform("todos");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070817] py-12">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-2xl border-violet-500/20 bg-[#10182b]/80">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500" />

              <p className="text-slate-300">
                Cargando horario oficial...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34rem),radial-gradient(circle_at_top_right,rgba(236,72,153,0.16),transparent_34rem),#070817] py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <Badge className="mb-4 border border-yellow-400/30 bg-yellow-400/10 text-yellow-300">
              Horario pendiente
            </Badge>

            <h1 className="mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
              Horario Oficial
            </h1>

            <p className="mx-auto max-w-2xl text-slate-400">
              El staff está preparando el programa oficial del evento.
            </p>
          </div>

          <Card className="mx-auto max-w-2xl border-yellow-500/40 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.08)]">
            <CardContent className="p-10 text-center">
              <Calendar className="mx-auto mb-4 h-14 w-14 text-yellow-300" />

              <h2 className="mb-3 text-2xl font-black text-white">
                Horario aún no publicado
              </h2>

              <p className="mx-auto mb-6 max-w-xl text-slate-300">
                {message ||
                  "El equipo de SGames todavía está organizando el horario oficial."}
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/postulacion">
                  <Button className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white hover:from-cyan-300 hover:via-violet-400 hover:to-pink-400">
                    <ClipboardEdit className="mr-2 h-4 w-4" />
                    Enviar postulación
                  </Button>
                </Link>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="border-violet-500/30 bg-white/5 text-slate-200 hover:bg-white/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34rem),radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_34rem),linear-gradient(180deg,#0b1022_0%,#070817_48%,#070817_100%)] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <Badge className="border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <CalendarDays className="mr-2 h-4 w-4" />
              31 julio - 2 agosto 2026
            </Badge>

            <Badge className="border border-pink-400/30 bg-pink-400/10 text-pink-300">
              <Sparkles className="mr-2 h-4 w-4" />
              Horario sujeto a cambios
            </Badge>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            Horario Oficial
          </h1>

          <p className="mx-auto max-w-2xl text-slate-400">
            Programa publicado de{" "}
            <span className="font-semibold text-slate-200">
              {eventName}
            </span>
            . Revisa horarios, runners, juegos, categorías,
            plataformas y duración estimada.
          </p>
        </div>

        {/* Notice */}
        <Card className="mb-8 border-cyan-400/20 bg-cyan-400/5">
          <CardContent className="flex flex-col gap-3 p-5 text-sm text-slate-300 md:flex-row md:items-center">
            <Info className="h-5 w-5 shrink-0 text-cyan-300" />

            <p>
              El horario puede recibir ajustes por organización,
              disponibilidad de runners o necesidades del evento.
              Te recomendamos revisarlo de nuevo antes del evento.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 border-violet-500/20 bg-[#10182b]/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-300" />

                <span className="font-semibold text-white">
                  Filtros:
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <Select
                  value={selectedDay}
                  onValueChange={setSelectedDay}
                >
                  <SelectTrigger className="border-violet-500/20 bg-[#0b1022] text-white">
                    <SelectValue placeholder="Todos los días" />
                  </SelectTrigger>

                  <SelectContent className="border-violet-500/20 bg-[#10182b]">
                    <SelectItem value="todos">
                      Todos los días
                    </SelectItem>

                    {dayOptions.map((day) => (
                      <SelectItem
                        key={day.dayDate}
                        value={day.dayDate}
                      >
                        {capitalize(day.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedGame}
                  onValueChange={setSelectedGame}
                >
                  <SelectTrigger className="border-violet-500/20 bg-[#0b1022] text-white">
                    <SelectValue placeholder="Todos los juegos" />
                  </SelectTrigger>

                  <SelectContent className="border-violet-500/20 bg-[#10182b]">
                    <SelectItem value="todos">
                      Todos los juegos
                    </SelectItem>

                    {games.map((game) => (
                      <SelectItem
                        key={game}
                        value={game}
                      >
                        {game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger className="border-violet-500/20 bg-[#0b1022] text-white">
                    <SelectValue placeholder="Todas las plataformas" />
                  </SelectTrigger>

                  <SelectContent className="border-violet-500/20 bg-[#10182b]">
                    <SelectItem value="todos">
                      Todas las plataformas
                    </SelectItem>

                    {platforms.map((platform) => (
                      <SelectItem
                        key={platform}
                        value={platform}
                      >
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="border-violet-500/30 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No entries after filters */}
        {filteredSchedule.length === 0 &&
          schedule.length > 0 && (
            <Card className="border-violet-500/20 bg-[#10182b]/70">
              <CardContent className="p-10 text-center">
                <SearchX className="mx-auto mb-4 h-12 w-12 text-slate-500" />

                <h2 className="mb-2 text-2xl font-black text-white">
                  No hay resultados con esos filtros
                </h2>

                <p className="mb-6 text-slate-400">
                  Prueba cambiando el día, juego o plataforma.
                </p>

                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white"
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Schedule by Day */}
        <div className="space-y-10">
          {displayDayOptions.map((day) => {
            const dayEntries =
              filteredSchedule.filter(
                (entry) =>
                  entry.dayDate === day.dayDate
              );

            if (
              dayEntries.length === 0 &&
              selectedDay === "todos"
            ) {
              return null;
            }

            return (
              <section key={day.dayDate}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_25px_rgba(217,70,239,0.18)]">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>

                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                          {day.shortLabel}
                        </p>

                        <h2 className="text-2xl font-black capitalize text-white md:text-3xl">
                          {day.label}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="w-fit border-violet-500/30 bg-white/5 text-slate-300"
                  >
                    {dayEntries.length}{" "}
                    {dayEntries.length === 1
                      ? "run"
                      : "runs"}
                  </Badge>
                </div>

                {dayEntries.length === 0 ? (
                  <Card className="border-dashed border-violet-500/20 bg-[#10182b]/40">
                    <CardContent className="p-8 text-center text-slate-500">
                      No hay runs programadas para este día con
                      los filtros seleccionados.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {dayEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className={`group border-violet-500/20 bg-[#10182b]/75 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)] ${
                          entry.status === "current"
                            ? "border-green-500/50 shadow-lg shadow-green-500/20"
                            : entry.status === "next"
                              ? "border-cyan-500/50"
                              : ""
                        }`}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="grid gap-5 lg:grid-cols-[120px_1fr_160px] lg:items-center">
                            {/* Time */}
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                                <Clock className="h-5 w-5 text-cyan-300" />
                              </div>

                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                  Hora
                                </p>

                                <p className="font-mono text-xl font-black text-cyan-300">
                                  {entry.time}
                                </p>
                              </div>
                            </div>

                            {/* Main Info */}
                            <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-pink-300" />

                                <div>
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                    Runner
                                  </p>

                                  <p className="break-words font-bold text-white">
                                    {entry.runner}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <Gamepad2 className="mt-1 h-5 w-5 shrink-0 text-violet-300" />

                                <div>
                                  <p className="break-words text-lg font-black text-white">
                                    {entry.game}
                                  </p>

                                  <p className="break-words text-sm text-slate-400">
                                    {entry.category}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge
                                      variant="outline"
                                      className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                                    >
                                      <Monitor className="mr-1.5 h-3.5 w-3.5" />
                                      {entry.platform}
                                    </Badge>

                                    <Badge
                                      variant="outline"
                                      className="border-pink-400/30 bg-pink-400/10 text-pink-200"
                                    >
                                      <Timer className="mr-1.5 h-3.5 w-3.5" />
                                      {entry.duration}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex justify-start lg:justify-end">
                              {getStatusBadge(entry.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Empty Schedule */}
        {schedule.length === 0 && (
          <Card className="mt-8 border-violet-500/20 bg-[#10182b]/70">
            <CardContent className="p-10 text-center">
              <CalendarDays className="mx-auto mb-4 h-14 w-14 text-cyan-300" />

              <h2 className="mb-3 text-2xl font-black text-white">
                Horario publicado próximamente
              </h2>

              <p className="mx-auto mb-6 max-w-xl text-slate-400">
                El horario ya fue habilitado, pero todavía no hay
                runs agregadas. Vuelve pronto para consultar el
                programa completo.
              </p>

              <Link to="/postulacion">
                <Button className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white">
                  <ClipboardEdit className="mr-2 h-4 w-4" />
                  Enviar postulación
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        {schedule.length > 0 && (
          <Card className="mt-12 border-violet-500/20 bg-gradient-to-r from-cyan-400/10 via-violet-500/10 to-pink-500/10">
            <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-white">
                  ¿Quieres formar parte del evento?
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Las postulaciones pueden seguir abiertas según
                  la organización del evento.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/postulacion">
                  <Button className="w-full bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white sm:w-auto">
                    <ClipboardEdit className="mr-2 h-4 w-4" />
                    Ir a postulaciones
                  </Button>
                </Link>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full border-violet-500/30 bg-white/5 text-slate-200 hover:bg-white/10 sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
