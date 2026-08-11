import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Play,
  Film,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  getPublicClipGroups,
  buildClipPlayerUrl,
  type ClipEventGroup,
  type ClipItem,
} from "../services/clipService";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

function parseDate(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("T")[0]
    .split("-")
    .map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatEventRange(
  startDate?: string | null,
  endDate?: string | null
) {
  const start =
    parseDate(startDate);

  const end =
    parseDate(endDate);

  if (!start || !end) {
    return "Fechas por confirmar";
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const month =
    end.toLocaleDateString(
      "es-MX",
      {
        month: "long",
      }
    );

  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()} ${month} ${end.getFullYear()}`;
  }

  return `${start.toLocaleDateString("es-MX")} - ${end.toLocaleDateString("es-MX")}`;
}

function getSourceLabel(
  clip: ClipItem
) {
  switch (clip.sourceType) {
    case "YouTube":
      return "YouTube";

    case "TwitchClip":
      return "Twitch Clip";

    case "TwitchVideo":
      return "Twitch VOD";

    case "Local":
      return "Archivo local";

    default:
      return clip.sourceType;
  }
}

function ClipPlayer({
  clip,
}: {
  clip: ClipItem;
}) {
  const playerUrl =
    buildClipPlayerUrl(clip);

  if (clip.sourceType === "Local") {
    return (
      <video
        controls
        poster={clip.thumbnailUrl ?? undefined}
        className="h-full w-full rounded-2xl bg-black object-contain"
        src={playerUrl}
      />
    );
  }

  return (
    <iframe
      title={clip.title}
      src={playerUrl}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      className="h-full w-full rounded-2xl bg-black"
    />
  );
}

export default function ClipsPage() {
  const [groups, setGroups] =
    useState<ClipEventGroup[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedGroupId, setSelectedGroupId] =
    useState<string>("all");

  const [selectedClip, setSelectedClip] =
    useState<ClipItem | null>(null);

  useEffect(() => {
    loadClips();
  }, []);

  async function loadClips() {
    try {
      setLoading(true);

      const data =
        await getPublicClipGroups();

      setGroups(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  const visibleClips =
    useMemo(() => {
      const clips =
        groups.flatMap((group) =>
          group.clips.map((clip) => ({
            ...clip,
            eventName:
              group.eventName,
            eventStartDate:
              group.startDate,
            eventEndDate:
              group.endDate,
            eventIsActive:
              group.isActive,
            seasonKey:
              group.seasonKey,
          }))
        );

      if (selectedGroupId === "all") {
        return clips;
      }

      return clips.filter(
        (clip) =>
          clip.eventId === selectedGroupId
      );
    }, [
      groups,
      selectedGroupId,
    ]);

  useEffect(() => {
    if (!selectedClip && visibleClips.length > 0) {
      setSelectedClip(visibleClips[0]);
    }
  }, [
    selectedClip,
    visibleClips,
  ]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[var(--sg-background)] px-4 py-24 text-center text-[var(--sg-text)]">
        Cargando clips...
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--sg-background)] px-4 py-16 text-[var(--sg-text)]">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 border border-[var(--sg-border)] bg-[var(--sg-card-gradient)] text-[var(--sg-primary)]">
            Archivo de momentos
          </Badge>

          <h1 className="bg-gradient-to-r from-[var(--sg-primary)] via-[var(--sg-secondary)] to-[var(--sg-accent)] bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            Clips
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--sg-muted-text)]">
            Revive los mejores momentos de SGames por edición: clips de Twitch, videos de YouTube y archivos locales curados por el staff.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--sg-border)] bg-[var(--sg-surface)]/50 p-12 text-center">
            <Film className="mx-auto mb-4 h-12 w-12 text-[var(--sg-primary)]" />

            <h2 className="text-2xl font-bold">
              Aún no hay clips publicados
            </h2>

            <p className="mt-2 text-[var(--sg-muted-text)]">
              Cuando el staff publique clips, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedGroupId === "all" ? "default" : "outline"}
                onClick={() =>
                  setSelectedGroupId("all")
                }
                className={
                  selectedGroupId === "all"
                    ? "bg-gradient-to-r from-[var(--sg-primary)] to-[var(--sg-secondary)] text-white"
                    : "sgames-outline-button"
                }
              >
                Todas las ediciones
              </Button>

              {groups.map((group) => (
                <Button
                  key={group.eventId}
                  variant={selectedGroupId === group.eventId ? "default" : "outline"}
                  onClick={() =>
                    setSelectedGroupId(group.eventId)
                  }
                  className={
                    selectedGroupId === group.eventId
                      ? "bg-gradient-to-r from-[var(--sg-primary)] to-[var(--sg-secondary)] text-white"
                      : "sgames-outline-button"
                  }
                >
                  {group.eventName}
                </Button>
              ))}
            </div>

            {selectedClip && (
              <div className="mb-10 rounded-3xl border border-[var(--sg-border)] bg-[var(--sg-surface)]/65 p-4 shadow-2xl shadow-black/25">
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <ClipPlayer clip={selectedClip} />
                </div>

                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[var(--sg-primary)]/15 text-[var(--sg-primary)]">
                        {getSourceLabel(selectedClip)}
                      </Badge>

                      {selectedClip.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          <Star className="mr-1 h-3 w-3" />
                          Destacado
                        </Badge>
                      )}

                      <Badge className="bg-[var(--sg-secondary)]/15 text-[var(--sg-secondary)]">
                        {selectedClip.eventName}
                      </Badge>
                    </div>

                    <h2 className="mt-3 text-2xl font-black">
                      {selectedClip.title}
                    </h2>

                    {selectedClip.description && (
                      <p className="mt-2 max-w-3xl text-[var(--sg-muted-text)]">
                        {selectedClip.description}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-[var(--sg-muted-text)]">
                      {formatEventRange(
                        selectedClip.eventStartDate,
                        selectedClip.eventEndDate
                      )}
                    </p>
                  </div>

                  {selectedClip.externalUrl && (
                    <a
                      href={selectedClip.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="sgames-outline-button"
                      >
                        Ver fuente
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleClips.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() =>
                    setSelectedClip(clip)
                  }
                  className={`group overflow-hidden rounded-3xl border text-left transition hover:-translate-y-1 hover:shadow-2xl ${
                    selectedClip?.id === clip.id
                      ? "border-[var(--sg-primary)] bg-[var(--sg-card-gradient)]"
                      : "border-[var(--sg-border)] bg-[var(--sg-surface)]/55"
                  }`}
                >
                  <div className="relative aspect-video bg-black">
                    {clip.thumbnailUrl ? (
                      <img
                        src={clip.thumbnailUrl}
                        alt={clip.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--sg-background)]">
                        <Film className="h-10 w-10 text-[var(--sg-primary)]" />
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-90">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
                        <Play className="ml-1 h-7 w-7" />
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge className="bg-[var(--sg-primary)]/15 text-[var(--sg-primary)]">
                        {getSourceLabel(clip)}
                      </Badge>

                      {clip.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          Destacado
                        </Badge>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-lg font-bold">
                      {clip.title}
                    </h3>

                    <p className="mt-2 text-sm text-[var(--sg-muted-text)]">
                      {clip.eventName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}