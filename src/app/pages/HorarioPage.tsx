import { useEffect, useState } from "react";
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
} from "lucide-react";
import { getPublicSchedule } from "../services/scheduleService";

type ScheduleEntry = {
  id: string;
  day: string;
  dayDate: string;
  time: string;
  runner: string;
  game: string;
  category: string;
  platform: string;
  duration: string;
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

const EVENT_ID =
  "04337355-98CA-4836-A1C1-5A8F84869F6D";

function getDayKey(dayDate: string) {
  const date =
    new Date(`${dayDate}T00:00:00`);

  const rawDay =
    date.toLocaleDateString("es-MX", {
      weekday: "long",
    });

  return (
    rawDay.charAt(0).toUpperCase() +
    rawDay.slice(1)
  );
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

function mapPublicEntry(
  entry: PublicScheduleEntryDto
): ScheduleEntry {
  return {
    id: entry.id,

    day:
      getDayKey(entry.dayDate),

    dayDate:
      entry.dayDate,

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
  };
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
        (data.entries ?? []).map(mapPublicEntry);

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

  const days =
    Array.from(
      new Set(schedule.map((entry) => entry.day))
    );

  const games =
    Array.from(
      new Set(schedule.map((entry) => entry.game))
    ).sort();

  const platforms =
    Array.from(
      new Set(schedule.map((entry) => entry.platform))
    ).sort();

  const filteredSchedule =
    schedule.filter((entry) => {
      if (
        selectedDay !== "todos" &&
        entry.day !== selectedDay
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

  const groupedByDay =
    days.reduce(
      (acc, day) => {
        acc[day] =
          filteredSchedule.filter(
            (entry) => entry.day === day
          );

        return acc;
      },
      {} as Record<string, ScheduleEntry[]>
    );

  const getStatusBadge = (
    status?: string
  ) => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-10 text-center">
              <p className="text-gray-400">
                Cargando horario...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
              Horario Oficial
            </h1>

            <p className="text-gray-400">
              Conoce el programa completo del evento SGames
            </p>
          </div>

          <Card className="mx-auto max-w-2xl border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-10 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-yellow-400" />

              <h2 className="mb-3 text-2xl font-bold text-white">
                Horario aún no publicado
              </h2>

              <p className="text-gray-300">
                {message ||
                  "El equipo de SGames todavía está organizando el horario oficial."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
            Horario Oficial
          </h1>

          <p className="text-gray-400">
            Programa completo de {eventName}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-400" />

                <span className="font-semibold text-white">
                  Filtros:
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={selectedDay}
                  onValueChange={setSelectedDay}
                >
                  <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-white sm:w-[200px]">
                    <SelectValue placeholder="Todos los días" />
                  </SelectTrigger>

                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="todos">
                      Todos los días
                    </SelectItem>

                    {days.map((day) => (
                      <SelectItem
                        key={day}
                        value={day}
                      >
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedGame}
                  onValueChange={setSelectedGame}
                >
                  <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-white sm:w-[250px]">
                    <SelectValue placeholder="Todos los juegos" />
                  </SelectTrigger>

                  <SelectContent className="border-gray-700 bg-gray-800">
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
                  <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-white sm:w-[200px]">
                    <SelectValue placeholder="Todas las plataformas" />
                  </SelectTrigger>

                  <SelectContent className="border-gray-700 bg-gray-800">
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

                {(selectedDay !== "todos" ||
                  selectedGame !== "todos" ||
                  selectedPlatform !== "todos") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDay("todos");
                      setSelectedGame("todos");
                      setSelectedPlatform("todos");
                    }}
                    className="border-gray-700 text-gray-400 hover:text-white"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule by Day */}
        <div className="space-y-8">
          {days.map((day) => {
            const dayEntries =
              groupedByDay[day] ?? [];

            if (
              dayEntries.length === 0 &&
              selectedDay !== "todos"
            ) {
              return null;
            }

            return (
              <div key={day}>
                <div className="mb-4 flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-cyan-400" />

                  <h2 className="text-2xl font-bold text-white">
                    {day}
                  </h2>

                  <Badge
                    variant="outline"
                    className="border-gray-700 text-gray-400"
                  >
                    {dayEntries.length}{" "}
                    {dayEntries.length === 1
                      ? "run"
                      : "runs"}
                  </Badge>
                </div>

                {dayEntries.length === 0 ? (
                  <Card className="border-gray-800 bg-gray-900/30">
                    <CardContent className="p-8 text-center text-gray-500">
                      No hay runs programados para este día con los filtros
                      seleccionados.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {dayEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className={`border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all hover:border-cyan-500/50 ${
                          entry.status === "current"
                            ? "border-green-500/50 shadow-lg shadow-green-500/20"
                            : entry.status === "next"
                              ? "border-cyan-500/50"
                              : ""
                        }`}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
                              {/* Time */}
                              <div className="flex items-center gap-2 text-cyan-400 md:w-24">
                                <Clock className="h-4 w-4" />

                                <span className="font-mono text-lg font-bold">
                                  {entry.time}
                                </span>
                              </div>

                              {/* Runner */}
                              <div className="flex items-center gap-2 text-gray-300 md:w-40">
                                <User className="h-4 w-4 text-gray-500" />

                                <span className="font-medium">
                                  {entry.runner}
                                </span>
                              </div>

                              {/* Game Info */}
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <Gamepad2 className="mt-1 h-4 w-4 text-purple-400" />

                                  <div>
                                    <p className="font-semibold text-white">
                                      {entry.game}
                                    </p>

                                    <p className="text-sm text-gray-400">
                                      {entry.category} • {entry.platform}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Duration */}
                              <div className="text-gray-400 md:w-24">
                                <span className="text-sm">
                                  Duración:
                                </span>

                                <p className="font-semibold text-white">
                                  {entry.duration}
                                </p>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-start md:justify-end">
                              {getStatusBadge(entry.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty Schedule */}
        {schedule.length === 0 && (
          <Card className="mt-8 border-gray-800 bg-gray-900/30">
            <CardContent className="p-10 text-center text-gray-500">
              El horario fue publicado, pero todavía no hay runs agregadas.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}