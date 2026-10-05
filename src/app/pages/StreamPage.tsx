import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ExternalLink,
  Radio,
  RefreshCw,
  Twitch,
  WifiOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  getPublicSettings,
  type PublicSettings,
} from "../services/publicSettingsService";
import {
  getLiveRunnerStreams,
  type RunnerLiveStream,
  type RunnerLiveStreamsResponse,
} from "../services/runnerStreamService";

function getTwitchLogin(
  twitchUrl?: string | null
) {
  if (!twitchUrl) {
    return null;
  }

  try {
    const normalized =
      twitchUrl.startsWith("http://") ||
      twitchUrl.startsWith("https://")
        ? twitchUrl
        : `https://${twitchUrl}`;

    const url =
      new URL(normalized);

    if (
      url.hostname !== "twitch.tv" &&
      url.hostname !== "www.twitch.tv"
    ) {
      return null;
    }

    return url.pathname
      .split("/")
      .filter(Boolean)[0] ?? null;
  } catch {
    return null;
  }
}

function buildTwitchEmbedUrl(
  twitchLogin: string,
  muted = true
) {
  const parent =
    typeof window !== "undefined"
      ? window.location.hostname
      : "localhost";

  const params =
    new URLSearchParams({
      channel: twitchLogin,
      parent,
      muted: muted ? "true" : "false",
      autoplay: "true",
    });

  return `https://player.twitch.tv/?${params.toString()}`;
}

function TwitchPlayer({
  twitchLogin,
  title,
  muted = true,
}: {
  twitchLogin: string;
  title: string;
  muted?: boolean;
}) {
  return (
    <div className="aspect-video overflow-hidden bg-black">
      <iframe
        src={buildTwitchEmbedUrl(
          twitchLogin,
          muted
        )}
        title={title}
        allowFullScreen
        scrolling="no"
        frameBorder="0"
        allow="autoplay; fullscreen"
        className="h-full w-full"
      />
    </div>
  );
}

function RunnerLiveCard({
  stream,
}: {
  stream: RunnerLiveStream;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-red-500/25 bg-[#090d18]/90 shadow-[0_0_28px_rgba(239,68,68,0.08)]">
      <div className="flex flex-col gap-3 border-b border-red-500/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Twitch className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black text-white">
                {stream.twitchDisplayName || stream.twitchLogin}
              </h2>

              <Badge className="border border-red-400/25 bg-red-500/15 text-red-300">
                <Radio className="mr-1 h-3.5 w-3.5" />
                EN VIVO
              </Badge>
            </div>

            <p className="truncate text-sm text-slate-400">
              twitch.tv/{stream.twitchLogin}
            </p>
          </div>
        </div>

        <a
          href={stream.twitchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            variant="outline"
            className="border-violet-400/30 bg-violet-500/5 text-violet-200 hover:bg-violet-500/15"
          >
            Abrir Twitch
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>

      <TwitchPlayer
        twitchLogin={stream.twitchLogin}
        title={`Twitch de ${stream.twitchDisplayName || stream.twitchLogin}`}
        muted
      />
    </article>
  );
}

export default function StreamPage() {
  const [publicSettings, setPublicSettings] =
    useState<PublicSettings | null>(null);

  const [liveData, setLiveData] =
    useState<RunnerLiveStreamsResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const officialTwitchLogin =
    useMemo(
      () =>
        getTwitchLogin(
          publicSettings?.twitchUrl
        ),
      [publicSettings?.twitchUrl]
    );

  async function loadData(
    showRefreshing = false
  ) {
    if (showRefreshing) {
      setRefreshing(true);
    }

    try {
      const [settingsResult, streamsResult] =
        await Promise.all([
          getPublicSettings().catch(() => null),
          getLiveRunnerStreams(),
        ]);

      setPublicSettings(settingsResult);
      setLiveData(streamsResult);
      setError(null);
    } catch (loadError) {
      console.error(loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron consultar los streams."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled =
      false;

    async function firstLoad() {
      if (cancelled) {
        return;
      }

      await loadData();
    }

    firstLoad();

    const interval =
      window.setInterval(
        () => {
          if (!cancelled) {
            loadData();
          }
        },
        60_000
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const streams =
    liveData?.streams ?? [];

  return (
    <div className="min-h-screen py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 text-center">
            <Badge className="mb-4 border border-red-400/25 bg-red-500/10 text-red-300">
              <Radio className="mr-2 h-4 w-4" />
              SGames Live
            </Badge>

            <h1 className="sgames-neon-text text-4xl font-black md:text-5xl">
              Streams en vivo
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-base text-[var(--sg-muted-text)] md:text-lg">
              Mira el canal oficial y los canales de runners registrados en SGames que están transmitiendo ahora mismo.
            </p>
          </div>

          {officialTwitchLogin && (
            <section className="mb-10 overflow-hidden rounded-3xl border border-[var(--sg-border)] bg-[#090d18]/90 shadow-[0_0_35px_rgba(239,68,68,0.08)]">
              <div className="flex flex-col gap-3 border-b border-[var(--sg-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Twitch className="h-5 w-5 text-violet-300" />
                    <h2 className="text-xl font-black text-[var(--sg-text)]">
                      Canal oficial de SGames
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                    twitch.tv/{officialTwitchLogin}
                  </p>
                </div>

                {publicSettings?.twitchUrl && (
                  <a
                    href={publicSettings.twitchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="border-[var(--sg-border)] text-[var(--sg-primary)]"
                    >
                      Abrir Twitch
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>

              <TwitchPlayer
                twitchLogin={officialTwitchLogin}
                title="Twitch oficial de SGames"
                muted={false}
              />
            </section>
          )}

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-[var(--sg-text)]">
                    Runners en vivo
                  </h2>

                  {!loading && liveData && (
                    <Badge className="border border-red-400/25 bg-red-500/10 text-red-300">
                      {liveData.liveCount}
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  Se detectan automáticamente desde los canales de Twitch guardados en las cuentas runner.
                </p>
              </div>

              <Button
                onClick={() =>
                  loadData(true)
                }
                variant="outline"
                disabled={refreshing}
                className="border-[var(--sg-border)] text-[var(--sg-primary)]"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Actualizar
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="aspect-video animate-pulse rounded-3xl border border-[var(--sg-border)] bg-white/5"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <WifiOff className="mx-auto mb-4 h-10 w-10 text-red-300" />
                <h3 className="text-xl font-black text-white">
                  No se pudo consultar Twitch
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-red-100/80">
                  {error}
                </p>
              </div>
            ) : !liveData?.isConfigured ? (
              <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
                <Twitch className="mx-auto mb-4 h-10 w-10 text-yellow-300" />
                <h3 className="text-xl font-black text-white">
                  Twitch no está configurado
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-yellow-100/80">
                  {liveData?.message ??
                    "Falta configurar la integración de Twitch en el backend."}
                </p>
              </div>
            ) : streams.length === 0 ? (
              <div className="rounded-3xl border border-[var(--sg-border)] bg-white/[0.03] p-10 text-center">
                <Twitch className="mx-auto mb-4 h-12 w-12 text-violet-300" />

                <h3 className="text-2xl font-black text-[var(--sg-text)]">
                  Ningún runner está en vivo ahora
                </h3>

                <p className="mx-auto mt-3 max-w-2xl text-[var(--sg-muted-text)]">
                  Cuando un runner registrado con un canal de Twitch público comience a transmitir, aparecerá automáticamente aquí.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {streams.map((stream) => (
                  <RunnerLiveCard
                    key={`${stream.runnerAccountId}-${stream.streamId ?? stream.twitchLogin}`}
                    stream={stream}
                  />
                ))}
              </div>
            )}

            {liveData?.message &&
              liveData.isConfigured &&
              !error && (
                <p className="mt-4 text-center text-xs text-[var(--sg-muted-text)]">
                  {liveData.message}
                </p>
              )}
          </section>
        </div>
      </div>
    </div>
  );
}
