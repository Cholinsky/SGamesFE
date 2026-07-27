import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ExternalLink,
  Gamepad2,
  Share2,
  Timer,
  Trophy,
  Users,
  Monitor,
  SearchX,
} from "lucide-react";
import { getPublicApprovedApplications } from "../services/applicationService";

type PublicApprovedRunSocialNetwork = {
  socialNetworkId: string;
  name: string;
  url: string;
};

type PublicApprovedRunParticipant = {
  id?: string;
  runnerName?: string | null;
  email?: string | null;
  discordUser?: string | null;
  country?: string | null;
  videoUrl?: string | null;
  sortOrder?: number | null;
};

type PublicApprovedRun = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  runType?: string | null;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  youtubeUrl?: string | null;
  socialNetworks?: PublicApprovedRunSocialNetwork[] | null;
  participants?: PublicApprovedRunParticipant[] | null;
};

type PublicApprovedRunnerGroup = {
  runnerName: string;
  socialNetworks: PublicApprovedRunSocialNetwork[];
  runs: PublicApprovedRun[];
};

function getNormalizedRunType(run?: PublicApprovedRun | null) {
  const value = run?.runType?.trim();

  if (!value) {
    return "Solo";
  }

  return value;
}

function isRaceRun(run: PublicApprovedRun) {
  return getNormalizedRunType(run).toLowerCase() === "race";
}

function getRunFormatLabel(run: PublicApprovedRun) {
  return isRaceRun(run) ? "Race" : "Individual";
}

function getRunFormatBadgeClass(run: PublicApprovedRun) {
  return isRaceRun(run)
    ? "border-pink-400/30 bg-pink-500/10 text-pink-200"
    : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200";
}

function getSortedParticipants(run: PublicApprovedRun) {
  const participants =
    run.participants?.filter(
      (participant) =>
        participant.runnerName?.trim()
    ) ?? [];

  if (!participants.length) {
    return [
      {
        runnerName: run.runnerName,
        videoUrl: run.youtubeUrl,
        sortOrder: 1,
      },
    ];
  }

  return participants.sort(
    (a, b) =>
      (a.sortOrder ?? 999) -
      (b.sortOrder ?? 999)
  );
}

function getRaceParticipants(run: PublicApprovedRun) {
  if (!isRaceRun(run)) {
    return [];
  }

  return getSortedParticipants(run);
}

function getRunParticipantNames(run: PublicApprovedRun) {
  if (!isRaceRun(run)) {
    return run.runnerName;
  }

  const names =
    getSortedParticipants(run)
      .map((participant) =>
        participant.runnerName?.trim()
      )
      .filter(Boolean);

  if (!names.length) {
    return run.runnerName;
  }

  return names.join(" vs ");
}

function getRunShareText(run: PublicApprovedRun) {
  if (isRaceRun(run)) {
    return encodeURIComponent(
      `${getRunParticipantNames(run)} participarán en SGames con ${run.game} - ${run.category} en formato Race.`
    );
  }

  return encodeURIComponent(
    `${run.runnerName} participará en SGames con ${run.game} - ${run.category}.`
  );
}

function getRunnerShareText(group: PublicApprovedRunnerGroup) {
  const runNames =
    group.runs
      .map((run) => {
        const format =
          isRaceRun(run)
            ? "Race"
            : "Individual";

        return `${run.game} - ${run.category} (${format})`;
      })
      .join(", ");

  return encodeURIComponent(
    `${group.runnerName} participará en SGames con: ${runNames}.`
  );
}

function groupRunsByRunner(
  runs: PublicApprovedRun[]
): PublicApprovedRunnerGroup[] {
  const groups =
    new Map<string, PublicApprovedRunnerGroup>();

  runs.forEach((run) => {
    const cleanRunnerName =
      run.runnerName?.trim() || "Runner sin nombre";

    const key =
      cleanRunnerName.toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        runnerName: cleanRunnerName,
        socialNetworks: [],
        runs: [],
      });
    }

    const group =
      groups.get(key)!;

    group.runs.push(run);

    run.socialNetworks?.forEach((social) => {
      const alreadyExists =
        group.socialNetworks.some(
          (item) =>
            item.socialNetworkId === social.socialNetworkId &&
            item.url === social.url
        );

      if (!alreadyExists) {
        group.socialNetworks.push(social);
      }
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      runs: group.runs.sort((a, b) =>
        a.game.localeCompare(b.game)
      ),
    }))
    .sort((a, b) =>
      a.runnerName.localeCompare(b.runnerName)
    );
}

export default function RunsPage() {
  const [runs, setRuns] =
    useState<PublicApprovedRun[]>([]);

  const [loading, setLoading] =
    useState(true);

  const runnerGroups =
    groupRunsByRunner(runs);

  useEffect(() => {
    loadRuns();
  }, []);

  async function loadRuns() {
    try {
      setLoading(true);

      const data =
        await getPublicApprovedApplications();

      setRuns(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070817] py-12">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-2xl border-violet-500/20 bg-[#10182b]/80">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500" />

              <p className="text-slate-300">
                Cargando runs aprobadas...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34rem),radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_34rem),linear-gradient(180deg,#0b1022_0%,#070817_48%,#070817_100%)] py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-[0_0_35px_rgba(217,70,239,0.35)]">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>

          <Badge className="mb-4 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            Lineup confirmado
          </Badge>

          <h1 className="mb-4 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            Runs aprobadas
          </h1>

          <p className="mx-auto max-w-3xl text-slate-400">
            Conoce las runs confirmadas para SGames. Aquí podrás ver
            runners, juegos, categorías, plataformas, tiempos estimados,
            formato individual o race, VODs y redes para compartir con la
            comunidad.
          </p>
        </div>

        {runs.length === 0 ? (
          <Card className="mx-auto max-w-2xl border-violet-500/20 bg-[#10182b]/70">
            <CardContent className="p-10 text-center">
              <SearchX className="mx-auto mb-4 h-14 w-14 text-slate-500" />

              <h2 className="mb-3 text-2xl font-black text-white">
                Aún no hay runs aprobadas visibles
              </h2>

              <p className="text-slate-400">
                Cuando el staff apruebe postulaciones, aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-violet-500/20 bg-[#10182b]/70 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
            <div className="hidden grid-cols-[1fr_2.4fr_1.2fr_0.8fr] gap-4 border-b border-violet-500/20 bg-white/5 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 lg:grid">
              <span>Jugador</span>
              <span>Runs aprobadas</span>
              <span>Redes</span>
              <span>Compartir</span>
            </div>

            <div className="divide-y divide-violet-500/15">
              {runnerGroups.map((group) => (
                <div
                  key={group.runnerName}
                  className="grid gap-5 px-5 py-6 transition-colors hover:bg-cyan-500/5 lg:grid-cols-[1fr_2.4fr_1.2fr_0.8fr] lg:items-start"
                >
                  {/* Jugador */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Jugador
                    </p>

                    <p className="flex items-center gap-2 text-xl font-black text-white">
                      <Users className="h-5 w-5 text-cyan-300" />
                      {group.runnerName}
                    </p>

                    <Badge className="mt-3 bg-violet-500/20 text-violet-300">
                      {group.runs.length}{" "}
                      {group.runs.length === 1
                        ? "run aprobada"
                        : "runs aprobadas"}
                    </Badge>
                  </div>

                  {/* Runs */}
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Runs aprobadas
                    </p>

                    <div className="space-y-3">
                      {group.runs.map((run) => {
                        const raceParticipants =
                          getRaceParticipants(run);

                        return (
                          <div
                            key={run.id}
                            className="rounded-2xl border border-violet-500/20 bg-[#070817]/60 p-4"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={getRunFormatBadgeClass(run)}
                                  >
                                    {getRunFormatLabel(run)}
                                  </Badge>

                                  {isRaceRun(run) && (
                                    <Badge
                                      variant="outline"
                                      className="border-violet-400/30 bg-violet-500/10 text-violet-200"
                                    >
                                      <Users className="mr-1.5 h-3.5 w-3.5" />
                                      {raceParticipants.length} jugadores
                                    </Badge>
                                  )}
                                </div>

                                <p className="flex items-center gap-2 font-black text-white">
                                  <Gamepad2 className="h-4 w-4 text-violet-300" />
                                  {run.game}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {run.category}
                                </p>

                                {isRaceRun(run) && (
                                  <p className="mt-2 text-sm font-semibold text-pink-200">
                                    {getRunParticipantNames(run)}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                                >
                                  <Monitor className="mr-1.5 h-3.5 w-3.5" />
                                  {run.platform}
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className="border-pink-400/30 bg-pink-400/10 text-pink-200"
                                >
                                  <Timer className="mr-1.5 h-3.5 w-3.5" />
                                  {run.estimatedTime}
                                </Badge>

                                {!isRaceRun(run) && run.youtubeUrl && (
                                  <a
                                    href={run.youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200 hover:bg-violet-500/20"
                                  >
                                    VOD
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}

                                <a
                                  href={`https://twitter.com/intent/tweet?text=${getRunShareText(
                                    run
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-200 hover:bg-pink-500/20"
                                >
                                  Compartir run
                                  <Share2 className="h-3 w-3" />
                                </a>
                              </div>
                            </div>

                            {isRaceRun(run) && (
                              <div className="mt-4 rounded-2xl border border-pink-400/20 bg-pink-500/5 p-3">
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-pink-200">
                                  Participantes de la race
                                </p>

                                <div className="grid gap-3 md:grid-cols-2">
                                  {raceParticipants.map(
                                    (participant, participantIndex) => (
                                      <div
                                        key={`${run.id}-${participant.sortOrder ?? participantIndex}-${participant.runnerName}`}
                                        className="rounded-xl border border-violet-500/20 bg-[#10182b]/70 p-3"
                                      >
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                          Jugador {participantIndex + 1}
                                        </p>

                                        <p className="mt-1 font-black text-white">
                                          {participant.runnerName}
                                        </p>

                                        {participant.country && (
                                          <p className="mt-1 text-xs text-slate-400">
                                            {participant.country}
                                          </p>
                                        )}

                                        {participant.videoUrl && (
                                          <a
                                            href={participant.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200 hover:bg-violet-500/20"
                                          >
                                            VOD jugador {participantIndex + 1}
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Redes */}
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Redes
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {group.socialNetworks.length > 0 ? (
                        group.socialNetworks.map((social) => (
                          <a
                            key={`${group.runnerName}-${social.socialNetworkId}-${social.url}`}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                          >
                            {social.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          Sin redes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compartir jugador */}
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Compartir
                    </p>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${getRunnerShareText(
                        group
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-200 hover:bg-pink-500/20"
                    >
                      Compartir jugador
                      <Share2 className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {runs.length > 0 && (
          <div className="mt-10 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white hover:from-cyan-300 hover:via-violet-400 hover:to-pink-400"
            >
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  "Ya hay jugadores con runs aprobadas para SGames. Revisa el lineup confirmado."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir lineup
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}