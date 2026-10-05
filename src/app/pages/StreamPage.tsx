import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock3,
  ExternalLink,
  Gamepad2,
  Radio,
  Twitch,
  UserRound,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  getPublicSettings,
  type PublicSettings,
} from "../services/publicSettingsService";
import {
  getStreamPanelPublic,
  type StreamPanelData,
  type StreamQueueItem,
} from "../services/streamPanelService";

type CurrentRunDisplayData = {
  runnerName?: string;
  runner2Name?: string;
  runnerAccountId?: string;
  runnerHasAccount?: string;
  runnerPublicProfile?: string;
  runnerDisplayName?: string;
  runnerTwitchUrl?: string;
  runnerTwitchLogin?: string;
  runnerProfileImageUrl?: string;
  gameName?: string;
  categoryName?: string;
  platformName?: string;
  estimate?: string;
  runType?: string;
};

function parseDisplayData(
  item?: StreamQueueItem | null
): CurrentRunDisplayData {
  if (!item?.displayDataJson) {
    return {};
  }

  try {
    return JSON.parse(
      item.displayDataJson
    ) as CurrentRunDisplayData;
  } catch {
    return {};
  }
}

function isTrue(
  value?: string | null
) {
  return String(value ?? "")
    .trim()
    .toLowerCase() === "true";
}

function extractTwitchChannel(
  url?: string | null
) {
  const clean =
    url?.trim();

  if (!clean) {
    return "";
  }

  try {
    const normalized =
      clean.startsWith("http://") ||
      clean.startsWith("https://")
        ? clean
        : `https://${clean}`;

    const parsed =
      new URL(normalized);

    return parsed.pathname
      .split("/")
      .filter(Boolean)[0] ?? "";
  } catch {
    return clean
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/^twitch\.tv\//i, "")
      .split("/")[0]
      .trim();
  }
}

function getTwitchEmbedUrl(
  twitchUrl?: string | null
) {
  const channel =
    extractTwitchChannel(
      twitchUrl
    );

  if (!channel) {
    return "";
  }

  const parent =
    window.location.hostname ||
    "localhost";

  return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}&muted=false&autoplay=false`;
}

function getRunnerLine(
  data: CurrentRunDisplayData,
  item?: StreamQueueItem | null
) {
  const runner1 =
    data.runnerDisplayName?.trim() ||
    data.runnerName?.trim() ||
    item?.subtitle?.trim() ||
    "Runner por confirmar";

  const runner2 =
    data.runner2Name?.trim();

  return runner2
    ? `${runner1} vs ${runner2}`
    : runner1;
}

export default function StreamPage() {
  const [panelData, setPanelData] =
    useState<StreamPanelData | null>(null);

  const [publicSettings, setPublicSettings] =
    useState<PublicSettings | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled =
      false;

    async function loadInitial() {
      try {
        const [panel, settings] =
          await Promise.all([
            getStreamPanelPublic(),
            getPublicSettings(),
          ]);

        if (cancelled) {
          return;
        }

        setPanelData(panel);
        setPublicSettings(settings);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled =
      false;

    async function refreshPanel() {
      try {
        const panel =
          await getStreamPanelPublic();

        if (!cancelled) {
          setPanelData(panel);
        }
      } catch (error) {
        console.error(error);
      }
    }

    const interval =
      window.setInterval(
        refreshPanel,
        5000
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const currentItem =
    panelData?.currentItem ?? null;

  const displayData =
    useMemo(
      () =>
        parseDisplayData(
          currentItem
        ),
      [currentItem]
    );

  const officialTwitchUrl =
    panelData?.settings?.twitchChannelUrl?.trim() ||
    publicSettings?.twitchUrl?.trim() ||
    "";

  const officialTwitchEmbedUrl =
    useMemo(
      () =>
        getTwitchEmbedUrl(
          officialTwitchUrl
        ),
      [officialTwitchUrl]
    );

  const hasRunnerAccount =
    isTrue(
      displayData.runnerHasAccount
    );

  const runnerPublicProfile =
    isTrue(
      displayData.runnerPublicProfile
    );

  const runnerTwitchUrl =
    runnerPublicProfile
      ? displayData.runnerTwitchUrl?.trim() || ""
      : "";

  const runnerTwitchLogin =
    runnerPublicProfile
      ? displayData.runnerTwitchLogin?.trim() ||
        extractTwitchChannel(
          runnerTwitchUrl
        )
      : "";

  const runnerProfileImageUrl =
    runnerPublicProfile
      ? displayData.runnerProfileImageUrl?.trim() || ""
      : "";

  const runnerLine =
    getRunnerLine(
      displayData,
      currentItem
    );

  if (loading) {
    return (
      <div className="min-h-[70vh] py-16">
        <div className="container mx-auto px-4">
          <Card className="sgames-glass sgames-neon-border mx-auto max-w-3xl">
            <CardContent className="p-10 text-center text-[var(--sg-muted-text)]">
              Cargando transmisión de Super Games...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-5xl text-center">
          <Badge className="mb-4 border border-red-400/30 bg-red-500/10 text-red-200">
            <Radio className="mr-2 h-4 w-4" />
            Stream
          </Badge>

          <h1 className="sgames-neon-text text-4xl font-black md:text-5xl">
            Super Games en vivo
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[var(--sg-muted-text)]">
            Sigue la transmisión oficial y descubre quién está corriendo en este momento.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <Card className="sgames-glass sgames-neon-border overflow-hidden">
            <CardHeader className="border-b border-[var(--sg-border)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-[var(--sg-text)]">
                    <Twitch className="h-5 w-5 text-violet-300" />
                    Transmisión oficial
                  </CardTitle>

                  <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                    {panelData?.eventName ||
                      publicSettings?.eventName ||
                      "Super Games"}
                  </p>
                </div>

                {officialTwitchUrl && (
                  <a
                    href={officialTwitchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="sgames-outline-button"
                    >
                      Abrir Twitch
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {officialTwitchEmbedUrl ? (
                <div className="aspect-video bg-black">
                  <iframe
                    title="Super Games Twitch"
                    src={officialTwitchEmbedUrl}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center bg-black/35 p-8 text-center">
                  <Twitch className="mb-4 h-12 w-12 text-violet-300" />

                  <h2 className="text-xl font-bold text-[var(--sg-text)]">
                    Canal oficial por configurar
                  </h2>

                  <p className="mt-2 max-w-lg text-sm text-[var(--sg-muted-text)]">
                    Cuando el canal oficial de Twitch esté configurado, el reproductor aparecerá aquí automáticamente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="sgames-glass sgames-neon-border h-fit">
            <CardHeader className="border-b border-[var(--sg-border)]">
              <CardTitle className="flex items-center gap-2 text-[var(--sg-text)]">
                <UserRound className="h-5 w-5 text-[var(--sg-primary)]" />
                Ahora en stream
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {currentItem ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    {runnerProfileImageUrl ? (
                      <img
                        src={runnerProfileImageUrl}
                        alt={runnerLine}
                        className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--sg-border)] object-cover shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[var(--sg-border)] bg-white/5">
                        <UserRound className="h-9 w-9 text-[var(--sg-primary)]" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--sg-muted-text)]">
                        Runner actual
                      </p>

                      <h2 className="mt-1 truncate text-2xl font-black text-[var(--sg-text)]">
                        {runnerLine}
                      </h2>

                      {hasRunnerAccount && runnerPublicProfile && (
                        <Badge className="mt-2 border border-violet-400/25 bg-violet-500/10 text-violet-200">
                          Runner de SGames
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[var(--sg-border)] bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--sg-primary)]" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--sg-muted-text)]">
                          Run
                        </p>
                        <p className="font-bold text-[var(--sg-text)]">
                          {displayData.gameName || currentItem.title}
                        </p>
                        {(displayData.categoryName || displayData.platformName) && (
                          <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                            {[
                              displayData.categoryName,
                              displayData.platformName,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {displayData.estimate && (
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-5 w-5 shrink-0 text-[var(--sg-accent)]" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--sg-muted-text)]">
                            Estimado
                          </p>
                          <p className="font-bold text-[var(--sg-text)]">
                            {displayData.estimate}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {runnerTwitchUrl ? (
                    <a
                      href={runnerTwitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="sgames-primary-button w-full">
                        <Twitch className="mr-2 h-5 w-5" />
                        {runnerTwitchLogin
                          ? `Seguir a ${runnerTwitchLogin} en Twitch`
                          : "Ver Twitch del runner"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--sg-border)] p-4 text-center text-sm text-[var(--sg-muted-text)]">
                      {hasRunnerAccount
                        ? "Este runner no tiene un Twitch público vinculado a su perfil de SGames."
                        : "Esta run no está vinculada a una cuenta runner de SGames."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Radio className="mx-auto mb-4 h-12 w-12 text-[var(--sg-primary)]" />

                  <h2 className="text-xl font-bold text-[var(--sg-text)]">
                    Esperando la siguiente run
                  </h2>

                  <p className="mt-2 text-sm text-[var(--sg-muted-text)]">
                    Cuando producción active una run, aquí aparecerán automáticamente el runner y sus datos públicos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
