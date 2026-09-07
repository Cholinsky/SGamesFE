import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Radio,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings2,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTwitchAuthorizationUrl,
  disconnectTwitch,
  getTwitchStatus,
  searchTwitchCategories,
  updateTwitchChannel,
  updateTwitchFromStreamSettings,
  type TwitchCategory,
  type TwitchIntegrationStatus,
} from "../../services/twitchStreamService";
import type { StreamPanelData } from "../../services/streamPanelService";

type StreamSettingsForm = {
  streamTitle: string;
  streamDescription: string;
  streamStatus: string;
  twitchChannelUrl: string;
  youtubeLiveUrl: string;
  tiktokLiveUrl: string;
  overlayHeadline: string;
  overlaySubheadline: string;
  currentSceneNotes: string;
  isMonitorEnabled: boolean;
};

type Props = {
  form: StreamSettingsForm;
  panelData: StreamPanelData | null;
  saving: boolean;
  updateFormField: (
    field: keyof StreamSettingsForm,
    value: string | boolean
  ) => void;
  onSaveSettings: () => Promise<void> | void;
};

function parseGameNameFromDisplayData(
  displayDataJson?: string | null
) {
  if (!displayDataJson) {
    return "";
  }

  try {
    const parsed =
      JSON.parse(displayDataJson);

    return String(
      parsed?.gameName ??
      ""
    );
  } catch {
    return "";
  }
}

function splitTags(
  value: string
) {
  return value
    .split(",")
    .map((item) =>
      item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function getTwitchChannelFromUrl(
  value: string
) {
  const clean =
    value.trim();

  if (!clean) {
    return "";
  }

  const match =
    clean.match(/twitch\.tv\/([^/?#]+)/i);

  if (match?.[1]) {
    return match[1].replace("@", "");
  }

  return clean.replace("@", "");
}

export default function AdminStreamBroadcastPanel({
  form,
  panelData,
  saving,
  updateFormField,
  onSaveSettings,
}: Props) {
  const [status, setStatus] =
    useState<TwitchIntegrationStatus | null>(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [language, setLanguage] =
    useState("es");

  const [tags, setTags] =
    useState("speedrun, SGames");

  const [categories, setCategories] =
    useState<TwitchCategory[]>([]);

  const [loadingStatus, setLoadingStatus] =
    useState(true);

  const [savingTwitch, setSavingTwitch] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const currentRunGame =
    useMemo(
      () =>
        parseGameNameFromDisplayData(
          panelData?.currentItem?.displayDataJson
        ),
      [
        panelData?.currentItem?.displayDataJson,
      ]
    );

  const connectedLabel =
    useMemo(() => {
      if (!status?.isConnected) {
        return "No conectado";
      }

      return status.broadcasterDisplayName ||
        status.broadcasterLogin ||
        "Twitch conectado";
    }, [
      status,
    ]);

  async function loadStatus(
    silent = false
  ) {
    try {
      if (!silent) {
        setLoadingStatus(true);
      }

      const data =
        await getTwitchStatus();

      setStatus(data);
    } catch (error) {
      console.error(error);

      if (!silent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar Twitch"
        );
      }
    } finally {
      if (!silent) {
        setLoadingStatus(false);
      }
    }
  }

  function applyCurrentRunData() {
    const currentItem =
      panelData?.currentItem;

    if (currentItem?.title) {
      updateFormField(
        "streamTitle",
        currentItem.title
      );
    }

    if (currentItem?.subtitle) {
      updateFormField(
        "streamStatus",
        currentItem.subtitle
      );
    }

    if (currentItem?.title) {
      updateFormField(
        "overlayHeadline",
        currentItem.title
      );
    }

    if (currentItem?.subtitle) {
      updateFormField(
        "overlaySubheadline",
        currentItem.subtitle
      );
    }

    if (currentRunGame) {
      setCategoryName(
        currentRunGame
      );

      setCategoryId("");
    }

    toast.success(
      "Datos de la run actual cargados"
    );
  }

  function applyEventData() {
    if (panelData?.eventName) {
      updateFormField(
        "streamTitle",
        panelData.eventName
      );

      updateFormField(
        "overlayHeadline",
        panelData.eventName
      );
    }

    if (!form.streamStatus) {
      updateFormField(
        "streamStatus",
        "Preparando"
      );
    }

    if (!form.overlaySubheadline) {
      updateFormField(
        "overlaySubheadline",
        "Speedrun Event"
      );
    }

    toast.success(
      "Datos del evento cargados"
    );
  }

  async function handleConnect() {
    try {
      const data =
        await createTwitchAuthorizationUrl();

      window.location.href =
        data.authorizationUrl;
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar conexión con Twitch"
      );
    }
  }

  async function handleDisconnect() {
    try {
      const data =
        await disconnectTwitch();

      setStatus(data);

      toast.success(
        "Twitch desconectado"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo desconectar Twitch"
      );
    }
  }

  async function handleSearchCategory() {
    if (categoryName.trim().length < 2) {
      toast.error(
        "Escribe al menos 2 caracteres para buscar categoría"
      );

      return;
    }

    try {
      setSearching(true);

      const results =
        await searchTwitchCategories(
          categoryName.trim()
        );

      setCategories(results);

      if (!results.length) {
        toast.message(
          "No se encontraron categorías"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo buscar la categoría"
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleSaveOnly() {
    await onSaveSettings();
  }

  async function handleSaveAndUpdateTwitch() {
    try {
      setSavingTwitch(true);

      await onSaveSettings();

      const result =
        await updateTwitchFromStreamSettings({
          useCurrentRunCategory:
            true,
          categoryName:
            categoryName.trim() || null,
          broadcasterLanguage:
            language.trim() || null,
          tags:
            splitTags(tags),
        });

      toast.success(
        result.message ||
        "SGames guardado y Twitch actualizado"
      );

      if (result.categoryName) {
        setCategoryName(result.categoryName);
      }

      if (result.categoryId) {
        setCategoryId(result.categoryId);
      }

      await loadStatus(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar y actualizar Twitch"
      );
    } finally {
      setSavingTwitch(false);
    }
  }

  async function handleUpdateTwitchManual() {
    try {
      setSavingTwitch(true);

      const result =
        await updateTwitchChannel({
          title:
            form.streamTitle.trim(),
          categoryId:
            categoryId || null,
          categoryName:
            categoryName.trim() || null,
          broadcasterLanguage:
            language.trim() || null,
          tags:
            splitTags(tags),
        });

      toast.success(
        result.message ||
        "Twitch actualizado"
      );

      if (result.categoryName) {
        setCategoryName(result.categoryName);
      }

      if (result.categoryId) {
        setCategoryId(result.categoryId);
      }

      await loadStatus(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar Twitch"
      );
    } finally {
      setSavingTwitch(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (params.get("twitch") === "connected") {
      toast.success(
        "Twitch conectado correctamente"
      );
    }

    const twitchError =
      params.get("twitch_error");

    if (twitchError) {
      toast.error(
        twitchError
      );
    }
  }, []);

  useEffect(() => {
    if (!categoryName && currentRunGame) {
      setCategoryName(
        currentRunGame
      );
    }
  }, [
    categoryName,
    currentRunGame,
  ]);

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-[var(--sg-primary)]">
                <Radio className="h-5 w-5" />

                <span className="text-sm font-black uppercase tracking-[0.2em]">
                  Control de transmisión
                </span>
              </div>

              <Badge
                className={
                  status?.isConnected
                    ? "bg-green-500/15 text-green-300"
                    : "bg-red-500/15 text-red-300"
                }
              >
                {loadingStatus
                  ? "Cargando Twitch..."
                  : connectedLabel}
              </Badge>
            </div>

            <CardTitle className="text-[var(--sg-text)]">
              Info de stream, overlays y Twitch
            </CardTitle>

            <p className="mt-1 max-w-3xl text-sm text-[var(--sg-muted-text)]">
              Guarda datos internos de SGames, alimenta overlays y sincroniza título, categoría,
              idioma y tags del canal de Twitch desde un solo lugar.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {status?.isConnected ? (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="border-red-500/30 text-red-300 hover:border-red-400/60 hover:bg-red-500/10"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Desconectar Twitch
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="sgames-admin-primary-button"
                disabled={
                  loadingStatus ||
                  status?.isConfigured === false
                }
              >
                <Link2 className="mr-2 h-4 w-4" />
                Conectar Twitch
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {status?.isConfigured === false && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Falta configurar Twitch en backend: Twitch:ClientId,
            Twitch:ClientSecret y Twitch:RedirectUri.
          </div>
        )}

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.65fr)]">
          <section className="space-y-5 rounded-2xl border border-[var(--sg-admin-border)] bg-black/15 p-4 md:p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                Datos del directo
              </p>

              <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                Estos campos alimentan SGames, overlays y también pueden mandarse a Twitch.
              </p>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Título del directo
              </Label>

              <Input
                value={form.streamTitle}
                onChange={(event) =>
                  updateFormField(
                    "streamTitle",
                    event.target.value
                  )
                }
                className="mt-1.5 h-12 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-base text-[var(--sg-text)]"
                placeholder="SGames Fall 2026"
                maxLength={140}
              />

              <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                {form.streamTitle.length}/140 caracteres.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Estado corto
                </Label>

                <Input
                  value={form.streamStatus}
                  onChange={(event) =>
                    updateFormField(
                      "streamStatus",
                      event.target.value
                    )
                  }
                  className="mt-1.5 h-12 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Preparando / En vivo"
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Categoría / juego de Twitch
                </Label>

                <div className="mt-1.5 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={categoryName}
                    onChange={(event) => {
                      setCategoryName(event.target.value);
                      setCategoryId("");
                    }}
                    className="h-12 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Hollow Knight: Silksong"
                  />

                  <Button
                    onClick={handleSearchCategory}
                    variant="outline"
                    disabled={
                      searching ||
                      !status?.isConnected
                    }
                    className="h-12 border-[var(--sg-admin-border)] px-5 text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </Button>
                </div>

                {categoryId && (
                  <p className="mt-1 text-xs text-green-300">
                    Categoría seleccionada para Twitch.
                  </p>
                )}
              </div>
            </div>

            {categories.length > 0 && (
              <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-3">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--sg-muted-text)]">
                  Resultados de Twitch
                </p>

                <div className="grid gap-2 md:grid-cols-2">
                  {categories.slice(0, 4).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(category.id);
                        setCategoryName(category.name);
                        toast.success(
                          `Categoría seleccionada: ${category.name}`
                        );
                      }}
                      className={`rounded-xl border p-3 text-left text-sm transition ${
                        category.id === categoryId
                          ? "border-[var(--sg-primary)] bg-[var(--sg-admin-primary-soft)] text-[var(--sg-text)]"
                          : "border-[var(--sg-admin-border)] bg-black/20 text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)]"
                      }`}
                    >
                      <p className="font-bold">
                        {category.name}
                      </p>

                      <p className="mt-1 text-xs opacity-70">
                        ID: {category.id}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Descripción / nota de producción
              </Label>

              <Textarea
                value={form.streamDescription}
                onChange={(event) =>
                  updateFormField(
                    "streamDescription",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[112px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Descripción visible para staff, Twitch u overlays"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[110px_1fr]">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Idioma
                </Label>

                <Input
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                  className="mt-1.5 h-12 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="es"
                  maxLength={10}
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Tags separados por coma
                </Label>

                <Input
                  value={tags}
                  onChange={(event) =>
                    setTags(event.target.value)
                  }
                  className="mt-1.5 h-12 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="speedrun, SGames"
                />

                <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                  Se enviarán máximo 10 tags.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                Estado de Twitch
              </p>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  <span className="text-[var(--sg-muted-text)]">
                    Conexión
                  </span>

                  <span className="font-bold text-[var(--sg-text)]">
                    {loadingStatus
                      ? "Revisando..."
                      : connectedLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  <span className="text-[var(--sg-muted-text)]">
                    Canal
                  </span>

                  <span className="font-bold text-[var(--sg-text)]">
                    {getTwitchChannelFromUrl(form.twitchChannelUrl) ||
                      status?.broadcasterLogin ||
                      "sin canal"}
                  </span>
                </div>

                <div className="rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  <p className="text-[var(--sg-muted-text)]">
                    Scope requerido
                  </p>

                  <p className="mt-1 break-words font-mono text-xs text-[var(--sg-text)]">
                    channel:manage:broadcast
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                Acciones rápidas
              </p>

              <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                Primero rellena datos; luego guarda localmente o sincroniza con Twitch.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                <Button
                  onClick={applyCurrentRunData}
                  variant="outline"
                  className="justify-start border-[var(--sg-admin-border)] text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                  disabled={!panelData?.currentItem}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Usar run actual
                </Button>

                <Button
                  onClick={applyEventData}
                  variant="outline"
                  className="justify-start border-[var(--sg-admin-border)] text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                  disabled={!panelData}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Usar datos del evento
                </Button>

                <Button
                  onClick={handleSaveOnly}
                  disabled={saving}
                  variant="outline"
                  className="justify-start border-[var(--sg-admin-border)] text-[var(--sg-primary)] hover:bg-[var(--sg-admin-primary-soft)]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving
                    ? "Guardando..."
                    : "Guardar en SGames"}
                </Button>

                <Button
                  onClick={handleUpdateTwitchManual}
                  disabled={
                    savingTwitch ||
                    !status?.isConnected
                  }
                  variant="outline"
                  className="justify-start border-[var(--sg-admin-border)] text-[var(--sg-muted-text)] hover:border-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sólo actualizar Twitch
                </Button>
              </div>

              <Button
                onClick={handleSaveAndUpdateTwitch}
                disabled={
                  saving ||
                  savingTwitch ||
                  !status?.isConnected
                }
                className="sgames-admin-primary-button mt-3 w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Guardar y actualizar Twitch
              </Button>
            </div>

            <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-black/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                Qué se sincroniza
              </p>

              <div className="mt-3 grid gap-2 text-xs text-[var(--sg-muted-text)]">
                <div className="rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  Título del directo
                </div>

                <div className="rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  Categoría / juego de Twitch
                </div>

                <div className="rounded-xl border border-[var(--sg-admin-border)] bg-black/20 px-3 py-2">
                  Idioma y tags
                </div>
              </div>
            </div>
          </aside>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowAdvanced((current) => !current)
          }
          className="flex w-full items-center justify-between rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-4 py-3 text-left text-sm font-bold text-[var(--sg-text)] transition hover:border-[var(--sg-primary)]"
        >
          <span>
            Avanzado: URLs, textos de overlay y monitoreo
          </span>

          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-[var(--sg-primary)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--sg-primary)]" />
          )}
        </button>

        {showAdvanced && (
          <div className="space-y-4 rounded-2xl border border-[var(--sg-admin-border)] bg-black/20 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Twitch URL
                </Label>

                <Input
                  value={form.twitchChannelUrl}
                  onChange={(event) =>
                    updateFormField(
                      "twitchChannelUrl",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="https://www.twitch.tv/sprgames_"
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  YouTube
                </Label>

                <Input
                  value={form.youtubeLiveUrl}
                  onChange={(event) =>
                    updateFormField(
                      "youtubeLiveUrl",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  TikTok
                </Label>

                <Input
                  value={form.tiktokLiveUrl}
                  onChange={(event) =>
                    updateFormField(
                      "tiktokLiveUrl",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="https://www.tiktok.com/@..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Headline overlay
                </Label>

                <Input
                  value={form.overlayHeadline}
                  onChange={(event) =>
                    updateFormField(
                      "overlayHeadline",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Ahora en stream"
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Subheadline overlay
                </Label>

                <Input
                  value={form.overlaySubheadline}
                  onChange={(event) =>
                    updateFormField(
                      "overlaySubheadline",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Próximo run / categoría / mensaje"
                />
              </div>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Notas de escena
              </Label>

              <Textarea
                value={form.currentSceneNotes}
                onChange={(event) =>
                  updateFormField(
                    "currentSceneNotes",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[72px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Notas internas para producción"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-4 py-3 text-sm text-[var(--sg-muted-text)]">
              <input
                type="checkbox"
                checked={form.isMonitorEnabled}
                onChange={(event) =>
                  updateFormField(
                    "isMonitorEnabled",
                    event.target.checked
                  )
                }
              />

              Panel de monitoreo habilitado
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}