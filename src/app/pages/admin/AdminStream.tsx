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
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  MonitorPlay,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminSeasonTheme } from "../../hooks/useAdminSeasonTheme";
import AdminStreamOverlayLibrary from "../../components/admin/AdminStreamOverlayLibrary";
import {
  createStreamQueueItem,
  deleteStreamQueueItem,
  getStreamPanelAdmin,
  getStreamOverlayUrl,
  markStreamQueueItemDone,
  moveStreamQueueItem,
  restoreStreamQueueItem,
  updateStreamSettings,
  type StreamPanelData,
  type StreamQueueItem,
  type StreamQueuePayload,
} from "../../services/streamPanelService";

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

type QueueForm = {
  itemType: "Run" | "Category" | "Break" | "Message" | "Custom";
  title: string;
  subtitle: string;
  detailText: string;
  sourceLabel: string;
};

const emptyQueueForm: QueueForm = {
  itemType: "Run",
  title: "",
  subtitle: "",
  detailText: "",
  sourceLabel: "",
};

function toSafeString(
  value?: string | null
) {
  return value ?? "";
}

function getTikTokUrl(
  settings?: StreamPanelData["settings"]
) {
  return (
    settings?.tikTokLiveUrl ??
    settings?.tiktokLiveUrl ??
    ""
  );
}

function formatDateRange(
  startDate?: string,
  endDate?: string
) {
  if (!startDate || !endDate) {
    return "Fechas por confirmar";
  }

  return `${new Date(startDate).toLocaleDateString("es-MX")} - ${new Date(endDate).toLocaleDateString("es-MX")}`;
}

function extractTwitchChannel(
  url: string
) {
  if (!url.trim()) {
    return "";
  }

  const clean =
    url.trim();

  try {
    const parsed =
      new URL(clean);

    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean);

    return parts[0] ?? "";
  } catch {
    return clean
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.twitch.tv/", "")
      .replace("twitch.tv/", "")
      .split("/")[0]
      .trim();
  }
}

function extractYouTubeId(
  url: string
) {
  if (!url.trim()) {
    return "";
  }

  try {
    const parsed =
      new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname
        .split("/")
        .filter(Boolean)[0] ?? "";
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname
        .split("/")
        .filter(Boolean)[1] ?? "";
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname
        .split("/")
        .filter(Boolean)[1] ?? "";
    }

    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

function getTwitchEmbedUrl(
  twitchUrl: string
) {
  const channel =
    extractTwitchChannel(twitchUrl);

  if (!channel) {
    return "";
  }

  const parent =
    window.location.hostname || "localhost";

  return `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true&autoplay=false`;
}

function getYoutubeEmbedUrl(
  youtubeUrl: string
) {
  const videoId =
    extractYouTubeId(youtubeUrl);

  if (!videoId) {
    return "";
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

function getItemTypeLabel(
  type: string
) {
  switch (type) {
    case "Category":
      return "Categoría";

    case "Break":
      return "Break";

    case "Message":
      return "Mensaje";

    case "Custom":
      return "Custom";

    default:
      return "Run";
  }
}

function itemTypeBadgeClass(
  type: string
) {
  switch (type) {
    case "Category":
      return "bg-purple-500/20 text-purple-300";

    case "Break":
      return "bg-yellow-500/20 text-yellow-300";

    case "Message":
      return "bg-blue-500/20 text-blue-300";

    case "Custom":
      return "bg-slate-500/20 text-slate-300";

    default:
      return "bg-green-500/20 text-green-300";
  }
}

function MonitorCard({
  title,
  subtitle,
  url,
  embedUrl,
  children,
}: {
  title: string;
  subtitle: string;
  url?: string;
  embedUrl?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="sgames-admin-card overflow-hidden border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader className="border-b border-[var(--sg-admin-border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-[var(--sg-text)]">
              {title}
            </CardTitle>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              {subtitle}
            </p>
          </div>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
              >
                Abrir
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {embedUrl ? (
          <div className="aspect-video overflow-hidden rounded-2xl border border-[var(--sg-admin-border)] bg-black">
            <iframe
              title={title}
              src={embedUrl}
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              className="h-full w-full"
            />
          </div>
        ) : (
          children ?? (
            <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--sg-admin-border)] bg-black/30 text-center">
              <Tv className="mb-3 h-10 w-10 text-[var(--sg-admin-muted-soft)]" />

              <p className="text-sm text-[var(--sg-muted-text)]">
                Configura la URL para ver la previsualización.
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminStream() {
  useAdminSeasonTheme();

  const [panelData, setPanelData] =
    useState<StreamPanelData | null>(null);

  const [form, setForm] =
    useState<StreamSettingsForm>({
      streamTitle: "",
      streamDescription: "",
      streamStatus: "",
      twitchChannelUrl: "",
      youtubeLiveUrl: "",
      tiktokLiveUrl: "",
      overlayHeadline: "",
      overlaySubheadline: "",
      currentSceneNotes: "",
      isMonitorEnabled: true,
    });

  const [queueDialogOpen, setQueueDialogOpen] =
    useState(false);

  const [queueForm, setQueueForm] =
    useState<QueueForm>(
      emptyQueueForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [queueSaving, setQueueSaving] =
    useState(false);

  useEffect(() => {
    loadPanel();
  }, []);

  async function loadPanel() {
    try {
      setLoading(true);

      const data =
        await getStreamPanelAdmin();

      setPanelData(data);

      setForm({
        streamTitle:
          toSafeString(
            data.settings.streamTitle
          ),
        streamDescription:
          toSafeString(
            data.settings.streamDescription
          ),
        streamStatus:
          toSafeString(
            data.settings.streamStatus
          ),
        twitchChannelUrl:
          toSafeString(
            data.settings.twitchChannelUrl
          ),
        youtubeLiveUrl:
          toSafeString(
            data.settings.youtubeLiveUrl
          ),
        tiktokLiveUrl:
          toSafeString(
            getTikTokUrl(data.settings)
          ),
        overlayHeadline:
          toSafeString(
            data.settings.overlayHeadline
          ),
        overlaySubheadline:
          toSafeString(
            data.settings.overlaySubheadline
          ),
        currentSceneNotes:
          toSafeString(
            data.settings.currentSceneNotes
          ),
        isMonitorEnabled:
          Boolean(
            data.settings.isMonitorEnabled
          ),
      });
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar Stream"
      );
    } finally {
      setLoading(false);
    }
  }

  const twitchEmbedUrl =
    useMemo(
      () =>
        getTwitchEmbedUrl(
          form.twitchChannelUrl
        ),
      [
        form.twitchChannelUrl,
      ]
    );

  const youtubeEmbedUrl =
    useMemo(
      () =>
        getYoutubeEmbedUrl(
          form.youtubeLiveUrl
        ),
      [
        form.youtubeLiveUrl,
      ]
    );

  const currentItem =
    panelData?.currentItem ?? null;

  function updateFormField(
    field: keyof StreamSettingsForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateQueueForm(
    field: keyof QueueForm,
    value: string
  ) {
    setQueueForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveSettings() {
    try {
      setSaving(true);

      await updateStreamSettings({
        ...form,
        tikTokLiveUrl:
          form.tiktokLiveUrl,
      });

      toast.success(
        "Configuración del stream guardada"
      );

      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateQueueItem() {
    if (!queueForm.title.trim()) {
      toast.error(
        "El título del item es obligatorio"
      );
      return;
    }

    try {
      setQueueSaving(true);

      const payload: StreamQueuePayload = {
        itemType:
          queueForm.itemType,
        title:
          queueForm.title.trim(),
        subtitle:
          queueForm.subtitle.trim() || null,
        detailText:
          queueForm.detailText.trim() || null,
        sourceLabel:
          queueForm.sourceLabel.trim() || null,
      };

      await createStreamQueueItem(
        payload
      );

      toast.success(
        "Item agregado a la cola"
      );

      setQueueDialogOpen(false);
      setQueueForm(emptyQueueForm);

      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el item"
      );
    } finally {
      setQueueSaving(false);
    }
  }

  async function handleQueueAction(
    action: () => Promise<unknown>,
    successMessage: string
  ) {
    try {
      await action();
      toast.success(successMessage);
      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la cola"
      );
    }
  }

  async function handleCopyOverlayUrl() {
    const url =
      getStreamOverlayUrl();

    await navigator.clipboard.writeText(
      url
    );

    toast.success(
      "URL visual del overlay copiada"
    );
  }

  if (loading) {
    return (
      <div className="sgames-admin-page text-[var(--sg-text)]">
        Cargando panel de stream...
      </div>
    );
  }

  return (
    <div className="sgames-admin-page space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-[var(--sg-text)]">
            <Radio className="h-8 w-8 text-[var(--sg-primary)]" />
            Stream
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            Monitorea el directo y administra la información que se usará en overlays o paneles de stream.
          </p>

          {panelData && (
            <p className="mt-2 text-sm text-[var(--sg-admin-muted-soft)]">
              Evento activo: {panelData.eventName} · {formatDateRange(panelData.eventStartDate, panelData.eventEndDate)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCopyOverlayUrl}
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar URL overlay OBS
          </Button>

          <Button
            onClick={loadPanel}
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--sg-text)]">
              Item actual en stream
            </h2>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              La cola funciona de arriba hacia abajo. El primer item activo es lo que debe mostrarse en stream.
            </p>
          </div>

          {currentItem ? (
            <div className="rounded-2xl border border-[var(--sg-admin-border-strong)] bg-[var(--sg-admin-primary-soft)] px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={itemTypeBadgeClass(currentItem.itemType)}>
                  {getItemTypeLabel(currentItem.itemType)}
                </Badge>

                <span className="font-bold text-[var(--sg-text)]">
                  {currentItem.title}
                </span>
              </div>

              {currentItem.subtitle && (
                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  {currentItem.subtitle}
                </p>
              )}
            </div>
          ) : (
            <Badge className="w-fit bg-yellow-500/15 text-yellow-300">
              Sin item actual
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <MonitorCard
          title="Twitch"
          subtitle="Vista previa del canal principal"
          url={form.twitchChannelUrl}
          embedUrl={twitchEmbedUrl}
        />

        <MonitorCard
          title="YouTube"
          subtitle="Vista previa de live, VOD o video"
          url={form.youtubeLiveUrl}
          embedUrl={youtubeEmbedUrl}
        />

        <MonitorCard
          title="TikTok"
          subtitle="Monitoreo externo del directo o perfil"
          url={form.tiktokLiveUrl}
        >
          <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--sg-admin-border)] bg-black/30 text-center">
            <MonitorPlay className="mb-3 h-10 w-10 text-[var(--sg-primary)]" />

            <p className="max-w-sm text-sm text-[var(--sg-muted-text)]">
              TikTok se deja como acceso externo. Para directo, abre la URL en una pestaña separada y úsala como apoyo de monitoreo.
            </p>

            {form.tiktokLiveUrl && (
              <a
                href={form.tiktokLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4"
              >
                <Button className="sgames-admin-primary-button">
                  Abrir TikTok
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </MonitorCard>
      </div>

      <AdminStreamOverlayLibrary
        activeSeasonKey={panelData?.seasonKey}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardHeader>
            <CardTitle className="text-[var(--sg-text)]">
              Información del stream
            </CardTitle>

            <p className="text-sm text-[var(--sg-muted-text)]">
              Estos textos pueden alimentar paneles, overlays o referencias para el staff.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
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
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="SGames Fall 2026"
              />
            </div>

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
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="En vivo / Intermedio / Próximamente"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Descripción del stream
              </Label>

              <Textarea
                value={form.streamDescription}
                onChange={(event) =>
                  updateFormField(
                    "streamDescription",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[90px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Descripción visible para staff u overlay"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Twitch
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

            <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <h3 className="mb-3 font-bold text-[var(--sg-text)]">
                Texto para overlay / OBS
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Headline
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
                    Subheadline
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
                    className="mt-1.5 min-h-[80px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Notas internas para producción"
                  />
                </div>
              </div>
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

            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full sgames-admin-primary-button"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving
                ? "Guardando..."
                : "Guardar información del stream"}
            </Button>
          </CardContent>
        </Card>

        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-[var(--sg-text)]">
                  Cola de stream
                </CardTitle>

                <p className="text-sm text-[var(--sg-muted-text)]">
                  Lo de hasta arriba es lo que debe mostrarse. Al finalizar, márcalo como listo y sube el siguiente.
                </p>
              </div>

              <Button
                onClick={() =>
                  setQueueDialogOpen(true)
                }
                className="sgames-admin-primary-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar item
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {!panelData || panelData.queue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--sg-admin-border)] p-10 text-center">
                <MonitorPlay className="mx-auto mb-3 h-10 w-10 text-[var(--sg-admin-muted-soft)]" />

                <p className="font-semibold text-[var(--sg-text)]">
                  No hay items activos en cola
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  Agrega runs, categorías, breaks o mensajes para el stream.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {panelData.queue.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 ${
                      index === 0
                        ? "border-[var(--sg-primary)] bg-[var(--sg-admin-primary-soft)]"
                        : "border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-[var(--sg-primary)] text-black">
                              EN STREAM
                            </Badge>
                          )}

                          <Badge className={itemTypeBadgeClass(item.itemType)}>
                            {getItemTypeLabel(item.itemType)}
                          </Badge>

                          {item.sourceLabel && (
                            <Badge className="bg-[var(--sg-admin-card-bg)] text-[var(--sg-muted-text)]">
                              {item.sourceLabel}
                            </Badge>
                          )}
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-[var(--sg-text)]">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-sm text-[var(--sg-muted-text)]">
                            {item.subtitle}
                          </p>
                        )}

                        {item.detailText && (
                          <p className="mt-2 whitespace-pre-line text-sm text-[var(--sg-admin-muted-soft)]">
                            {item.detailText}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQueueAction(
                              () =>
                                moveStreamQueueItem(
                                  item.id,
                                  "up"
                                ),
                              "Item movido"
                            )
                          }
                          className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQueueAction(
                              () =>
                                moveStreamQueueItem(
                                  item.id,
                                  "down"
                                ),
                              "Item movido"
                            )
                          }
                          className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                          disabled={index === panelData.queue.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQueueAction(
                              () =>
                                markStreamQueueItemDone(
                                  item.id
                                ),
                              "Item finalizado"
                            )
                          }
                          className="border-green-500/30 text-green-300"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQueueAction(
                              () =>
                                deleteStreamQueueItem(
                                  item.id
                                ),
                              "Item eliminado"
                            )
                          }
                          className="border-red-500/30 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {panelData && panelData.doneItems.length > 0 && (
              <div className="mt-6 border-t border-[var(--sg-admin-border)] pt-5">
                <h3 className="mb-3 font-bold text-[var(--sg-text)]">
                  Finalizados recientes
                </h3>

                <div className="space-y-2">
                  {panelData.doneItems.slice(0, 5).map((item: StreamQueueItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--sg-text)]">
                          {item.title}
                        </p>

                        <p className="text-xs text-[var(--sg-muted-text)]">
                          {getItemTypeLabel(item.itemType)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleQueueAction(
                            () =>
                              restoreStreamQueueItem(
                                item.id
                              ),
                            "Item restaurado"
                          )
                        }
                        className="text-[var(--sg-primary)]"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={queueDialogOpen}
        onOpenChange={setQueueDialogOpen}
      >
        <DialogContent className="max-w-2xl border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] text-[var(--sg-text)]">
          <DialogHeader>
            <DialogTitle>
              Agregar item a la cola de stream
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Tipo
              </Label>

              <Select
                value={queueForm.itemType}
                onValueChange={(value) =>
                  updateQueueForm(
                    "itemType",
                    value
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="Run">
                    Run
                  </SelectItem>

                  <SelectItem value="Category">
                    Categoría
                  </SelectItem>

                  <SelectItem value="Break">
                    Break
                  </SelectItem>

                  <SelectItem value="Message">
                    Mensaje
                  </SelectItem>

                  <SelectItem value="Custom">
                    Custom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Etiqueta
              </Label>

              <Input
                value={queueForm.sourceLabel}
                onChange={(event) =>
                  updateQueueForm(
                    "sourceLabel",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Ej. Próximo, Categoría, Intermedio"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Título
              </Label>

              <Input
                value={queueForm.title}
                onChange={(event) =>
                  updateQueueForm(
                    "title",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Nombre de run, categoría o mensaje"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Subtítulo
              </Label>

              <Input
                value={queueForm.subtitle}
                onChange={(event) =>
                  updateQueueForm(
                    "subtitle",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Runner, plataforma, estimado o contexto"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Detalle
              </Label>

              <Textarea
                value={queueForm.detailText}
                onChange={(event) =>
                  updateQueueForm(
                    "detailText",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[100px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Texto extra para producción o overlay"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setQueueDialogOpen(false)
              }
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleCreateQueueItem}
              disabled={queueSaving}
              className="sgames-admin-primary-button"
            >
              {queueSaving
                ? "Agregando..."
                : "Agregar a cola"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}