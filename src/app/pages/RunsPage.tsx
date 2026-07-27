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

type PublicApprovedRun = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  youtubeUrl?: string | null;
  socialNetworks: {
    socialNetworkId: string;
    name: string;
    url: string;
  }[];
};

function getRunShareText(
  run: PublicApprovedRun
) {
  return encodeURIComponent(
    `${run.runnerName} participará en SGames con ${run.game} - ${run.category}.`
  );
}

export default function RunsPage() {
  const [runs, setRuns] =
    useState<PublicApprovedRun[]>([]);

  const [loading, setLoading] =
    useState(true);

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
            runners, juegos, categorías, plataformas, tiempos estimados y
            redes para compartir con la comunidad.
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
            <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_0.8fr_0.8fr_1.4fr] gap-4 border-b border-violet-500/20 bg-white/5 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 lg:grid">
              <span>Runner</span>
              <span>Juego</span>
              <span>Categoría</span>
              <span>Plataforma</span>
              <span>Estimado</span>
              <span>Redes</span>
            </div>

            <div className="divide-y divide-violet-500/15">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="grid gap-4 px-5 py-5 transition-colors hover:bg-cyan-500/5 lg:grid-cols-[1.2fr_1.4fr_1fr_0.8fr_0.8fr_1.4fr] lg:items-center"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Runner
                    </p>

                    <p className="flex items-center gap-2 font-black text-white">
                      <Users className="h-4 w-4 text-cyan-300" />
                      {run.runnerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Juego
                    </p>

                    <p className="flex items-center gap-2 font-semibold text-white">
                      <Gamepad2 className="h-4 w-4 text-violet-300" />
                      {run.game}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Categoría
                    </p>

                    <p className="text-slate-300">
                      {run.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Plataforma
                    </p>

                    <Badge
                      variant="outline"
                      className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                    >
                      <Monitor className="mr-1.5 h-3.5 w-3.5" />
                      {run.platform}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Estimado
                    </p>

                    <p className="flex items-center gap-2 font-mono text-sm text-pink-200">
                      <Timer className="h-4 w-4" />
                      {run.estimatedTime}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300 lg:hidden">
                      Redes
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {run.socialNetworks?.length ? (
                        run.socialNetworks.map((social) => (
                          <a
                            key={`${run.id}-${social.socialNetworkId}-${social.url}`}
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

                      {run.youtubeUrl && (
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
                        href={`https://twitter.com/intent/tweet?text=${getRunShareText(run)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-200 hover:bg-pink-500/20"
                      >
                        Compartir
                        <Share2 className="h-3 w-3" />
                      </a>
                    </div>
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
                  "Ya hay runs aprobadas para SGames. Revisa el lineup confirmado."
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