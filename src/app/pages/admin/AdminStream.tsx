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
  CalendarPlus,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  MonitorPlay,
  Plus,
  Link2,
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
import AdminStreamDynamicOverlayTools from "../../components/admin/AdminStreamDynamicOverlayTools";
import AdminStreamTimers from "../../components/admin/AdminStreamTimers";
import {
  createStreamQueueItem,
  deleteStreamQueueItem,
  getStreamPanelAdmin,
  getStreamOverlayUrl,
  getStreamScheduleCandidates,
  importScheduleEntryToStream,
  importScheduleEntriesBulkToStream,
  syncAllStreamQueueItems,
  clearActiveStreamQueue,
  syncStreamQueueItemNow,
  markStreamQueueItemDone,
  moveStreamQueueItem,
  restoreStreamQueueItem,
  updateStreamSettings,
  type StreamPanelData,
  type StreamQueueItem,
  type StreamQueuePayload,
  type StreamScheduleCandidate,
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
  runnerName: string;
  runner2Name: string;
  gameName: string;
  categoryName: string;
  platformName: string;
  estimate: string;
  commentators: string;
  language: string;
  note: string;
};

const emptyQueueForm: QueueForm = {
  itemType: "Run",
  title: "",
  subtitle: "",
  detailText: "",
  sourceLabel: "",
  runnerName: "",
  runner2Name: "",
  gameName: "",
  categoryName: "",
  platformName: "",
  estimate: "",
  commentators: "",
  language: "ES",
  note: "",
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

function normalizeScheduleDate(
  value?: string | null
) {
  return value
    ? String(value).slice(0, 10)
    : "";
}

function formatScheduleDate(
  value?: string | null
) {
  const clean =
    normalizeScheduleDate(value);

  if (!clean) {
    return "Fecha pendiente";
  }

  const [year, month, day] =
    clean.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function formatScheduleDayLong(
  value?: string | null
) {
  const clean =
    normalizeScheduleDate(value);

  if (!clean) {
    return "Día pendiente";
  }

  const [year, month, day] =
    clean.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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

  const [scheduleDialogOpen, setScheduleDialogOpen] =
    useState(false);

  const [scheduleCandidates, setScheduleCandidates] =
    useState<StreamScheduleCandidate[]>([]);

  const [scheduleSearch, setScheduleSearch] =
    useState("");

  const [importingScheduleId, setImportingScheduleId] =
    useState("");

  const [bulkImportingMode, setBulkImportingMode] =
    useState("");

  const [importSyncWithSchedule, setImportSyncWithSchedule] =
    useState(true);

  const [importCommentators, setImportCommentators] =
    useState("");

  const [importLanguage, setImportLanguage] =
    useState("ES");

  const [importNote, setImportNote] =
    useState("");

  const [loadingSchedule, setLoadingSchedule] =
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

  const filteredScheduleCandidates =
    useMemo(() => {
      const cleanSearch =
        scheduleSearch
          .trim()
          .toLowerCase();

      if (!cleanSearch) {
        return scheduleCandidates;
      }

      return scheduleCandidates.filter((run) => {
        const haystack =
          [
            run.runnerName,
            run.runner2Name,
            run.gameName,
            run.categoryName,
            run.platformName,
            run.estimate,
            run.runType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(cleanSearch);
      });
    }, [
      scheduleCandidates,
      scheduleSearch,
    ]);

  const availableFilteredScheduleCandidates =
    useMemo(
      () =>
        filteredScheduleCandidates.filter(
          (run) => !run.isAlreadyInQueue
        ),
      [
        filteredScheduleCandidates,
      ]
    );

  const scheduleDaysForImport =
    useMemo(() => {
      const map =
        new Map<string, number>();

      scheduleCandidates.forEach((run) => {
        const day =
          normalizeScheduleDate(
            run.dayDate
          );

        if (!day) {
          return;
        }

        if (run.isAlreadyInQueue) {
          return;
        }

        map.set(
          day,
          (map.get(day) ?? 0) + 1
        );
      });

      return Array.from(map.entries())
        .map(([dayDate, count]) => ({
          dayDate,
          count,
        }))
        .sort((a, b) =>
          a.dayDate.localeCompare(b.dayDate)
        );
    }, [
      scheduleCandidates,
    ]);

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

  function buildDisplayDataJson() {
    const displayData = {
      runnerName:
        queueForm.runnerName.trim(),
      runner2Name:
        queueForm.runner2Name.trim(),
      gameName:
        queueForm.gameName.trim(),
      categoryName:
        queueForm.categoryName.trim(),
      platformName:
        queueForm.platformName.trim(),
      estimate:
        queueForm.estimate.trim(),
      commentators:
        queueForm.commentators.trim(),
      language:
        queueForm.language.trim() || "ES",
      note:
        queueForm.note.trim(),
    };

    const cleanData =
      Object.fromEntries(
        Object.entries(displayData)
          .filter(([, value]) => Boolean(value))
      );

    return Object.keys(cleanData).length > 0
      ? JSON.stringify(cleanData)
      : null;
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

  async function openScheduleImportDialog() {
    try {
      setLoadingSchedule(true);
      setScheduleDialogOpen(true);

      const runs =
        await getStreamScheduleCandidates();

      setScheduleCandidates(runs);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las runs del horario"
      );
    } finally {
      setLoadingSchedule(false);
    }
  }

  async function handleImportScheduleRun(
    run: StreamScheduleCandidate
  ) {
    try {
      setImportingScheduleId(
        run.scheduleEntryId
      );

      await importScheduleEntryToStream({
        scheduleEntryId:
          run.scheduleEntryId,
        sourceLabel:
          "Horario",
        commentators:
          importCommentators.trim() || null,
        language:
          importLanguage.trim() || "ES",
        note:
          importNote.trim() || null,
        syncWithSchedule:
          importSyncWithSchedule,
      });

      toast.success(
        importSyncWithSchedule
          ? "Run importada y sincronizada con horario"
          : "Run importada como snapshot"
      );

      await openScheduleImportDialog();
      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo importar la run"
      );
    } finally {
      setImportingScheduleId("");
    }
  }

  async function handleImportAllScheduleRuns() {
    try {
      setBulkImportingMode("all");

      const result =
        await importScheduleEntriesBulkToStream({
          importAll: true,
          sourceLabel: "Horario",
          commentators:
            importCommentators.trim() || null,
          language:
            importLanguage.trim() || "ES",
          note:
            importNote.trim() || null,
          syncWithSchedule:
            importSyncWithSchedule,
        });

      toast.success(
        `Importadas: ${result.imported}. Ya estaban en cola: ${result.skippedExisting}.`
      );

      await openScheduleImportDialog();
      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo importar todo el horario"
      );
    } finally {
      setBulkImportingMode("");
    }
  }

  async function handleImportVisibleScheduleRuns() {
    const ids =
      availableFilteredScheduleCandidates.map(
        (run) => run.scheduleEntryId
      );

    if (ids.length === 0) {
      toast.info(
        "No hay runs disponibles para importar con estos filtros"
      );
      return;
    }

    try {
      setBulkImportingMode("visible");

      const result =
        await importScheduleEntriesBulkToStream({
          scheduleEntryIds: ids,
          importAll: false,
          sourceLabel: "Horario",
          commentators:
            importCommentators.trim() || null,
          language:
            importLanguage.trim() || "ES",
          note:
            importNote.trim() || null,
          syncWithSchedule:
            importSyncWithSchedule,
        });

      toast.success(
        `Importadas: ${result.imported}. Ya estaban en cola: ${result.skippedExisting}.`
      );

      await openScheduleImportDialog();
      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron importar las runs filtradas"
      );
    } finally {
      setBulkImportingMode("");
    }
  }

  async function handleImportScheduleDay(
    dayDate: string
  ) {
    try {
      setBulkImportingMode(
        `day-${dayDate}`
      );

      const result =
        await importScheduleEntriesBulkToStream({
          dayDate,
          importAll: false,
          sourceLabel: "Horario",
          commentators:
            importCommentators.trim() || null,
          language:
            importLanguage.trim() || "ES",
          note:
            importNote.trim() || null,
          syncWithSchedule:
            importSyncWithSchedule,
        });

      toast.success(
        `${formatScheduleDayLong(dayDate)}: ${result.imported} importadas, ${result.skippedExisting} ya estaban en cola.`
      );

      await openScheduleImportDialog();
      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo importar el día"
      );
    } finally {
      setBulkImportingMode("");
    }
  }

  async function handleSyncAllQueueItems() {
    try {
      const result =
        await syncAllStreamQueueItems();

      toast.success(
        result.message || "Cola sincronizada"
      );

      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo sincronizar la cola"
      );
    }
  }

  async function handleClearActiveQueue() {
    const confirmed =
      window.confirm(
        "¿Mover todos los items activos de la cola al historial? No se borran, pero dejarán de aparecer como cola activa."
      );

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await clearActiveStreamQueue();

      toast.success(
        result.message || "Cola limpia"
      );

      await loadPanel();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo limpiar la cola"
      );
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
        displayDataJson:
          buildDisplayDataJson(),
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

      <AdminStreamDynamicOverlayTools />

      <AdminStreamTimers />

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

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSyncAllQueueItems}
                  variant="outline"
                  className="border-blue-500/30 text-blue-300"
                  disabled={!panelData || panelData.queue.length === 0}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar cola
                </Button>

                <Button
                  onClick={handleClearActiveQueue}
                  variant="outline"
                  className="border-red-500/30 text-red-300"
                  disabled={!panelData || panelData.queue.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpiar cola
                </Button>

                <Button
                  onClick={openScheduleImportDialog}
                  variant="outline"
                  className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Importar desde horario
                </Button>

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

                          {item.sourceScheduleEntryId && (
                            <Badge className={
                              item.syncWithSchedule
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-slate-500/20 text-slate-300"
                            }>
                              <Link2 className="mr-1 h-3 w-3" />
                              {item.syncWithSchedule
                                ? "Sync horario"
                                : "Snapshot"}
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

                        {item.sourceScheduleEntryId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleQueueAction(
                                () =>
                                  syncStreamQueueItemNow(
                                    item.id
                                  ),
                                "Item sincronizado con horario"
                              )
                            }
                            className="border-blue-500/30 text-blue-300"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}

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
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] text-[var(--sg-text)]">
          <DialogHeader>
            <DialogTitle>
              Importar run desde horario
            </DialogTitle>

            <p className="text-sm text-[var(--sg-muted-text)]">
              Selecciona una run del horario activo. Si activas sincronización, los cambios futuros del horario actualizarán automáticamente el item y los overlays.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_1fr]">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Buscar
                </Label>

                <Input
                  value={scheduleSearch}
                  onChange={(event) =>
                    setScheduleSearch(
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Runner, juego, categoría o plataforma"
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Idioma
                </Label>

                <Input
                  value={importLanguage}
                  onChange={(event) =>
                    setImportLanguage(
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="ES"
                />
              </div>

              <label className="mt-7 flex items-center gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-4 py-3 text-sm text-[var(--sg-muted-text)]">
                <input
                  type="checkbox"
                  checked={importSyncWithSchedule}
                  onChange={(event) =>
                    setImportSyncWithSchedule(
                      event.target.checked
                    )
                  }
                />
                Sincronizar con cambios del horario
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Comentaristas / staff opcional
                </Label>

                <Input
                  value={importCommentators}
                  onChange={(event) =>
                    setImportCommentators(
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Ej. N6 + SweetX"
                />
              </div>

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Nota para Info Bar opcional
                </Label>

                <Input
                  value={importNote}
                  onChange={(event) =>
                    setImportNote(
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="Ej. Preparando setup / entrevista rápida"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="font-semibold text-[var(--sg-text)]">
                    Importación rápida
                  </p>

                  <p className="text-sm text-[var(--sg-muted-text)]">
                    Las runs que ya estén activas en cola se saltan automáticamente para evitar duplicados.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleImportAllScheduleRuns}
                    disabled={
                      loadingSchedule ||
                      bulkImportingMode === "all" ||
                      scheduleCandidates.length === 0
                    }
                    className="sgames-admin-primary-button"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {bulkImportingMode === "all"
                      ? "Importando..."
                      : "Importar todo"}
                  </Button>

                  <Button
                    onClick={handleImportVisibleScheduleRuns}
                    disabled={
                      loadingSchedule ||
                      bulkImportingMode === "visible" ||
                      availableFilteredScheduleCandidates.length === 0
                    }
                    variant="outline"
                    className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Importar filtradas
                  </Button>
                </div>
              </div>

              {scheduleDaysForImport.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {scheduleDaysForImport.map((day) => (
                    <Button
                      key={day.dayDate}
                      onClick={() =>
                        handleImportScheduleDay(
                          day.dayDate
                        )
                      }
                      disabled={
                        bulkImportingMode === `day-${day.dayDate}`
                      }
                      variant="outline"
                      className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      {formatScheduleDayLong(day.dayDate)}
                      <Badge className="ml-2 bg-black/30 text-current">
                        {day.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {loadingSchedule ? (
              <div className="rounded-2xl border border-dashed border-[var(--sg-admin-border)] p-10 text-center text-[var(--sg-muted-text)]">
                Cargando runs del horario...
              </div>
            ) : filteredScheduleCandidates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--sg-admin-border)] p-10 text-center">
                <p className="font-semibold text-[var(--sg-text)]">
                  No hay runs en el horario activo
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  Agrega runs desde Admin &gt; Horarios y vuelve a intentar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScheduleCandidates.map((run) => (
                  <div
                    key={run.scheduleEntryId}
                    className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                            {formatScheduleDate(run.dayDate)}
                          </Badge>

                          <Badge className="bg-black/30 text-[var(--sg-muted-text)]">
                            {String(run.startTime).slice(0, 5)}
                          </Badge>

                          <Badge className="bg-green-500/15 text-green-300">
                            {run.runType || "Solo"}
                          </Badge>

                          {run.isAlreadyInQueue && (
                            <Badge className="bg-blue-500/20 text-blue-300">
                              Ya en cola
                            </Badge>
                          )}

                          {!run.isAlreadyInQueue && run.isDoneInQueue && (
                            <Badge className="bg-slate-500/20 text-slate-300">
                              Ya estuvo en historial
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[var(--sg-text)]">
                          {run.gameName || run.title}
                        </h3>

                        <p className="text-sm text-[var(--sg-muted-text)]">
                          {run.runnerName}
                          {run.runner2Name
                            ? ` vs ${run.runner2Name}`
                            : ""}
                          {" · "}
                          {run.categoryName}
                          {" · "}
                          {run.platformName}
                          {" · "}
                          {run.estimate}
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          handleImportScheduleRun(run)
                        }
                        disabled={
                          run.isAlreadyInQueue ||
                          importingScheduleId === run.scheduleEntryId
                        }
                        className={
                          run.isAlreadyInQueue
                            ? "border-blue-500/30 text-blue-300"
                            : "sgames-admin-primary-button"
                        }
                        variant={
                          run.isAlreadyInQueue
                            ? "outline"
                            : "default"
                        }
                      >
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        {run.isAlreadyInQueue
                          ? "Ya en cola"
                          : importingScheduleId === run.scheduleEntryId
                            ? "Importando..."
                            : "Importar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setScheduleDialogOpen(false)
              }
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

            <div className="md:col-span-2 rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <div className="mb-4">
                <p className="font-bold text-[var(--sg-text)]">
                  Datos para overlays dinámicos
                </p>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  Estos campos alimentan Current Run, Next Run, Runner Tag e Info Bar en OBS. Si los dejas vacíos, el overlay usa título/subtítulo/detalle.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Runner principal
                  </Label>

                  <Input
                    value={queueForm.runnerName}
                    onChange={(event) =>
                      updateQueueForm(
                        "runnerName",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. FedzMX"
                  />
                </div>

                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Runner 2 / Race opcional
                  </Label>

                  <Input
                    value={queueForm.runner2Name}
                    onChange={(event) =>
                      updateQueueForm(
                        "runner2Name",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Sólo si aplica"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[var(--sg-muted-text)]">
                    Juego
                  </Label>

                  <Input
                    value={queueForm.gameName}
                    onChange={(event) =>
                      updateQueueForm(
                        "gameName",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. No More Halos"
                  />
                </div>

                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Categoría
                  </Label>

                  <Input
                    value={queueForm.categoryName}
                    onChange={(event) =>
                      updateQueueForm(
                        "categoryName",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. Switch 2020"
                  />
                </div>

                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Plataforma
                  </Label>

                  <Input
                    value={queueForm.platformName}
                    onChange={(event) =>
                      updateQueueForm(
                        "platformName",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. PC / Switch"
                  />
                </div>

                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Estimado
                  </Label>

                  <Input
                    value={queueForm.estimate}
                    onChange={(event) =>
                      updateQueueForm(
                        "estimate",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. 01:30:00"
                  />
                </div>

                <div>
                  <Label className="text-[var(--sg-muted-text)]">
                    Idioma
                  </Label>

                  <Input
                    value={queueForm.language}
                    onChange={(event) =>
                      updateQueueForm(
                        "language",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="ES"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[var(--sg-muted-text)]">
                    Comentaristas / staff
                  </Label>

                  <Input
                    value={queueForm.commentators}
                    onChange={(event) =>
                      updateQueueForm(
                        "commentators",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Ej. N6+SweetX"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[var(--sg-muted-text)]">
                    Nota para Info Bar
                  </Label>

                  <Input
                    value={queueForm.note}
                    onChange={(event) =>
                      updateQueueForm(
                        "note",
                        event.target.value
                      )
                    }
                    className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    placeholder="Mensaje corto opcional"
                  />
                </div>
              </div>
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