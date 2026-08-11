import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
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
  Film,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Star,
  Upload,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  buildClipPlayerUrl,
  createClip,
  deleteClip,
  getClipEvents,
  getClipGroups,
  hideClip,
  showClip,
  updateClip,
  type ClipEventGroup,
  type ClipEventOption,
  type ClipItem,
  type ClipSourceType,
} from "../../services/clipService";
import { useAdminSeasonTheme } from "../../hooks/useAdminSeasonTheme";

type ClipFormState = {
  eventId: string;
  title: string;
  description: string;
  sourceType: ClipSourceType;
  externalUrl: string;
  thumbnailUrl: string;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

function emptyForm(): ClipFormState {
  return {
    eventId: "",
    title: "",
    description: "",
    sourceType: "YouTube",
    externalUrl: "",
    thumbnailUrl: "",
    isVisible: true,
    isFeatured: false,
    sortOrder: "999",
  };
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  return new Date(value)
    .toLocaleDateString(
      "es-MX",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
}

function sourceLabel(
  sourceType: string
) {
  switch (sourceType) {
    case "YouTube":
      return "YouTube";

    case "TwitchClip":
      return "Twitch Clip";

    case "TwitchVideo":
      return "Twitch VOD";

    case "Local":
      return "Archivo local";

    default:
      return sourceType;
  }
}

export default function AdminClips() {
  useAdminSeasonTheme();

  const [groups, setGroups] =
    useState<ClipEventGroup[]>([]);

  const [events, setEvents] =
    useState<ClipEventOption[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingClip, setEditingClip] =
    useState<ClipItem | null>(null);

  const [form, setForm] =
    useState<ClipFormState>(
      emptyForm()
    );

  const [localVideoFile, setLocalVideoFile] =
    useState<File | null>(null);

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        groupData,
        eventData,
      ] = await Promise.all([
        getClipGroups(),
        getClipEvents(),
      ]);

      setGroups(
        Array.isArray(groupData)
          ? groupData
          : []
      );

      setEvents(
        Array.isArray(eventData)
          ? eventData
          : []
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudieron cargar los clips"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredGroups =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return groups;
      }

      return groups
        .map((group) => ({
          ...group,
          clips:
            group.clips.filter((clip) =>
              [
                clip.title,
                clip.description ?? "",
                clip.sourceType,
                group.eventName,
              ]
                .join(" ")
                .toLowerCase()
                .includes(term)
            ),
        }))
        .filter((group) =>
          group.clips.length > 0
        );
    }, [
      groups,
      searchTerm,
    ]);

  const totalClips =
    groups.reduce(
      (total, group) =>
        total + group.total,
      0
    );

  const visibleClips =
    groups.reduce(
      (total, group) =>
        total + group.visible,
      0
    );

  function updateForm(
    field: keyof ClipFormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(
      emptyForm()
    );

    setEditingClip(null);
    setLocalVideoFile(null);
    setThumbnailFile(null);
  }

  function openCreateDialog() {
    const activeEvent =
      events.find((event) => event.isActive);

    resetForm();

    setForm({
      ...emptyForm(),
      eventId:
        activeEvent?.id ?? events[0]?.id ?? "",
    });

    setDialogOpen(true);
  }

  function openEditDialog(
    clip: ClipItem
  ) {
    setEditingClip(clip);

    setForm({
      eventId:
        clip.eventId,
      title:
        clip.title,
      description:
        clip.description ?? "",
      sourceType:
        clip.sourceType as ClipSourceType,
      externalUrl:
        clip.externalUrl ?? "",
      thumbnailUrl:
        clip.thumbnailUrl ?? "",
      isVisible:
        clip.isVisible,
      isFeatured:
        clip.isFeatured,
      sortOrder:
        String(clip.sortOrder ?? 999),
    });

    setLocalVideoFile(null);
    setThumbnailFile(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error(
        "El título es obligatorio"
      );
      return;
    }

    if (!form.eventId) {
      toast.error(
        "Selecciona una edición"
      );
      return;
    }

    if (
      form.sourceType !== "Local" &&
      !form.externalUrl.trim()
    ) {
      toast.error(
        "Pega una URL de YouTube o Twitch"
      );
      return;
    }

    if (
      form.sourceType === "Local" &&
      !editingClip &&
      !localVideoFile
    ) {
      toast.error(
        "Sube un video local"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        eventId:
          form.eventId,
        title:
          form.title.trim(),
        description:
          form.description.trim(),
        sourceType:
          form.sourceType,
        externalUrl:
          form.externalUrl.trim(),
        thumbnailUrl:
          form.thumbnailUrl.trim(),
        isVisible:
          form.isVisible,
        isFeatured:
          form.isFeatured,
        sortOrder:
          Number(form.sortOrder || 999),
        localVideoFile,
        thumbnailFile,
      };

      if (editingClip) {
        await updateClip(
          editingClip.id,
          payload
        );

        toast.success(
          "Clip actualizado"
        );
      } else {
        await createClip(
          payload
        );

        toast.success(
          "Clip creado"
        );
      }

      setDialogOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el clip"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleVisible(
    clip: ClipItem
  ) {
    try {
      if (clip.isVisible) {
        await hideClip(clip.id);
        toast.success("Clip ocultado");
      } else {
        await showClip(clip.id);
        toast.success("Clip visible");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo actualizar la visibilidad"
      );
    }
  }

  async function handleDelete(
    clip: ClipItem
  ) {
    const confirmed =
      window.confirm(
        `¿Seguro que quieres eliminar el clip "${clip.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteClip(
        clip.id
      );

      toast.success(
        "Clip eliminado"
      );

      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo eliminar el clip"
      );
    }
  }

  if (loading) {
    return (
      <div className="sgames-admin-page text-[var(--sg-text)]">
        Cargando clips...
      </div>
    );
  }

  return (
    <div className="sgames-admin-page space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--sg-text)]">
            Clips
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            Administra videos externos y locales por edición de SGames.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>

          <Button
            onClick={openCreateDialog}
            className="sgames-admin-primary-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo clip
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Total clips
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--sg-text)]">
                {totalClips}
              </p>
            </div>

            <Film className="h-9 w-9 text-[var(--sg-primary)]" />
          </CardContent>
        </Card>

        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Visibles
              </p>

              <p className="mt-1 text-3xl font-bold text-green-400">
                {visibleClips}
              </p>
            </div>

            <Eye className="h-9 w-9 text-green-400" />
          </CardContent>
        </Card>

        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Ediciones con clips
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--sg-text)]">
                {groups.length}
              </p>
            </div>

            <Star className="h-9 w-9 text-yellow-400" />
          </CardContent>
        </Card>
      </div>

      <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
        <CardContent className="p-4">
          <Input
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Buscar por título, descripción, fuente o edición..."
            className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
          />
        </CardContent>
      </Card>

      {filteredGroups.length === 0 ? (
        <Card className="border-dashed border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]/40">
          <CardContent className="p-10 text-center">
            <Film className="mx-auto mb-4 h-12 w-12 text-[var(--sg-primary)]" />

            <h2 className="text-xl font-bold text-[var(--sg-text)]">
              Aún no hay clips
            </h2>

            <p className="mt-2 text-[var(--sg-muted-text)]">
              Agrega clips de YouTube, Twitch o videos locales.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <Card
              key={group.eventId}
              className="overflow-hidden border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]"
            >
              <div className="flex flex-col gap-3 border-b border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--sg-text)]">
                      {group.eventName}
                    </h2>

                    {group.isActive ? (
                      <Badge className="bg-green-500/20 text-green-300">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                        Historial
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                    {formatDate(group.startDate)} - {formatDate(group.endDate)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                    {group.clips.length} clips
                  </Badge>

                  <Badge className="bg-green-500/15 text-green-300">
                    {group.visible} visibles
                  </Badge>

                  <Badge className="bg-yellow-500/15 text-yellow-300">
                    {group.hidden} ocultos
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {group.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="overflow-hidden rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-background)]/35"
                  >
                    <div className="relative aspect-video bg-black">
                      {clip.thumbnailUrl ? (
                        <img
                          src={clip.thumbnailUrl}
                          alt={clip.title}
                          className="h-full w-full object-cover"
                        />
                      ) : clip.sourceType === "Local" && clip.localVideoUrl ? (
                        <video
                          src={clip.localVideoUrl}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Film className="h-10 w-10 text-[var(--sg-primary)]" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <Badge className="bg-black/70 text-white">
                          {sourceLabel(clip.sourceType)}
                        </Badge>

                        {clip.isFeatured && (
                          <Badge className="bg-yellow-500/80 text-black">
                            Destacado
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div>
                        <h3 className="line-clamp-2 font-bold text-[var(--sg-text)]">
                          {clip.title}
                        </h3>

                        {clip.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-[var(--sg-muted-text)]">
                            {clip.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={
                          clip.isVisible
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }>
                          {clip.isVisible ? "Visible" : "Oculto"}
                        </Badge>

                        <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                          Orden {clip.sortOrder}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {clip.sourceType !== "Local" && clip.externalUrl ? (
                          <a
                            href={clip.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="contents"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="border-[var(--sg-admin-border)]"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openEditDialog(clip)
                          }
                          className="border-[var(--sg-admin-border)] text-[var(--sg-secondary)]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleToggleVisible(clip)
                          }
                          className="border-[var(--sg-admin-border)] text-yellow-300"
                        >
                          {clip.isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDelete(clip)
                          }
                          className="border-red-500/30 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="hidden">
                        {buildClipPlayerUrl(clip)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] text-[var(--sg-text)]">
          <DialogHeader>
            <DialogTitle>
              {editingClip ? "Editar clip" : "Nuevo clip"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Edición / evento
              </Label>

              <Select
                value={form.eventId}
                onValueChange={(value) =>
                  updateForm(
                    "eventId",
                    value
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue placeholder="Selecciona edición" />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  {events.map((event) => (
                    <SelectItem
                      key={event.id}
                      value={event.id}
                    >
                      {event.name}{event.isActive ? " · Activo" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Fuente
              </Label>

              <Select
                value={form.sourceType}
                onValueChange={(value) =>
                  updateForm(
                    "sourceType",
                    value as ClipSourceType
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="YouTube">
                    YouTube
                  </SelectItem>

                  <SelectItem value="TwitchClip">
                    Twitch Clip
                  </SelectItem>

                  <SelectItem value="TwitchVideo">
                    Twitch VOD
                  </SelectItem>

                  <SelectItem value="Local">
                    Video local
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Título
              </Label>

              <Input
                value={form.title}
                onChange={(event) =>
                  updateForm(
                    "title",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Descripción
              </Label>

              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            {form.sourceType !== "Local" ? (
              <div className="md:col-span-2">
                <Label className="text-[var(--sg-muted-text)]">
                  URL de YouTube o Twitch
                </Label>

                <Input
                  value={form.externalUrl}
                  onChange={(event) =>
                    updateForm(
                      "externalUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://youtube.com/watch?v=... o https://clips.twitch.tv/..."
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                />
              </div>
            ) : (
              <div className="md:col-span-2">
                <Label className="text-[var(--sg-muted-text)]">
                  Video local
                </Label>

                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) =>
                    setLocalVideoFile(
                      event.target.files?.[0] ?? null
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                />

                {editingClip?.localVideoUrl && (
                  <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                    Si no subes otro video, se conserva el actual.
                  </p>
                )}
              </div>
            )}

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                URL de thumbnail opcional
              </Label>

              <Input
                value={form.thumbnailUrl}
                onChange={(event) =>
                  updateForm(
                    "thumbnailUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Thumbnail local opcional
              </Label>

              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  setThumbnailFile(
                    event.target.files?.[0] ?? null
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Orden
              </Label>

              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateForm(
                    "sortOrder",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <label className="flex items-center gap-3 text-sm text-[var(--sg-muted-text)]">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(event) =>
                    updateForm(
                      "isVisible",
                      event.target.checked
                    )
                  }
                />
                Visible en página pública
              </label>

              <label className="flex items-center gap-3 text-sm text-[var(--sg-muted-text)]">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateForm(
                      "isFeatured",
                      event.target.checked
                    )
                  }
                />
                Destacado
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialogOpen(false)
              }
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="sgames-admin-primary-button"
            >
              {saving
                ? "Guardando..."
                : "Guardar clip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}