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
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Archive,
  Clapperboard,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import {
  createStreamOverlayAsset,
  deleteStreamOverlayAsset,
  getStreamOverlayAssetsGrouped,
  toggleStreamOverlayAsset,
  updateStreamOverlayAsset,
  type StreamOverlayAsset,
  type StreamOverlayAssetGroup,
  type StreamOverlayAssetPayload,
  type StreamOverlayAssetType,
  type StreamOverlaySeasonKey,
} from "../../services/streamOverlayAssetService";

type Props = {
  activeSeasonKey?: string | null;
};

type AssetFormState = {
  seasonKey: StreamOverlaySeasonKey;
  title: string;
  description: string;
  assetType: StreamOverlayAssetType;
  overlayType: string;
  thumbnailUrl: string;
  externalUrl: string;
  sortOrder: string;
  isActive: boolean;
};

const seasonOptions: Array<{
  key: StreamOverlaySeasonKey;
  label: string;
  description: string;
}> = [
  {
    key: "Summer",
    label: "Verano",
    description: "Overlays cálidos, playeras, playa, arcade y cierre de stream.",
  },
  {
    key: "Autumn",
    label: "Otoño",
    description: "Overlays oscuros, terror, gris azulado, negro y rojo.",
  },
  {
    key: "Winter",
    label: "Invierno",
    description: "Overlays fríos, nieve, azul hielo y escenas de febrero.",
  },
];

const overlayTypes = [
  "Comenzando directo",
  "Siguiente run",
  "Días SGames",
  "Regresando",
  "Terminando stream",
  "Horario",
  "BRB",
  "Race",
  "Mesa de trabajo",
  "OBS config",
  "Otro",
];

function normalizeSeasonKey(
  seasonKey?: string | null
): StreamOverlaySeasonKey {
  if (seasonKey === "Winter") {
    return "Winter";
  }

  if (
    seasonKey === "Autumn" ||
    seasonKey === "Fall"
  ) {
    return "Autumn";
  }

  return "Summer";
}

function emptyForm(
  seasonKey: StreamOverlaySeasonKey
): AssetFormState {
  return {
    seasonKey,
    title: "",
    description: "",
    assetType: "Video",
    overlayType: "Otro",
    thumbnailUrl: "",
    externalUrl: "",
    sortOrder: "999",
    isActive: true,
  };
}

function getAssetIcon(
  assetType: string
) {
  switch (assetType) {
    case "Image":
      return ImageIcon;

    case "Json":
      return FileJson;

    case "External":
      return LinkIcon;

    default:
      return Video;
  }
}

function getAssetTypeLabel(
  assetType: string
) {
  switch (assetType) {
    case "Image":
      return "Imagen";

    case "Json":
      return "JSON / OBS";

    case "External":
      return "Enlace";

    default:
      return "Video";
  }
}

function formatBytes(
  bytes?: number | null
) {
  if (!bytes) {
    return "-";
  }

  const mb =
    bytes / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function getAssetUrl(
  asset: StreamOverlayAsset
) {
  return asset.fileUrl ||
    asset.externalUrl ||
    asset.thumbnailUrl ||
    "";
}

export default function AdminStreamOverlayLibrary({
  activeSeasonKey,
}: Props) {
  const initialSeason =
    normalizeSeasonKey(
      activeSeasonKey
    );

  const [groups, setGroups] =
    useState<StreamOverlayAssetGroup[]>([]);

  const [selectedSeason, setSelectedSeason] =
    useState<StreamOverlaySeasonKey>(
      initialSeason
    );

  const [loading, setLoading] =
    useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [editingAsset, setEditingAsset] =
    useState<StreamOverlayAsset | null>(null);

  const [form, setForm] =
    useState<AssetFormState>(
      emptyForm(initialSeason)
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const normalized =
      normalizeSeasonKey(
        activeSeasonKey
      );

    setSelectedSeason(normalized);
  }, [
    activeSeasonKey,
  ]);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    try {
      setLoading(true);

      const data =
        await getStreamOverlayAssetsGrouped();

      setGroups(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la biblioteca de overlays"
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedGroup =
    useMemo(() => {
      return groups.find(
        (group) =>
          group.seasonKey === selectedSeason
      );
    }, [
      groups,
      selectedSeason,
    ]);

  const assets =
    selectedGroup?.assets ?? [];

  const currentSeasonOption =
    seasonOptions.find(
      (season) =>
        season.key === selectedSeason
    ) ?? seasonOptions[0];

  function updateFormField(
    field: keyof AssetFormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateDialog() {
    setEditingAsset(null);
    setFile(null);
    setThumbnailFile(null);
    setForm(
      emptyForm(selectedSeason)
    );
    setDialogOpen(true);
  }

  function openEditDialog(
    asset: StreamOverlayAsset
  ) {
    setEditingAsset(asset);
    setFile(null);
    setThumbnailFile(null);
    setForm({
      seasonKey:
        normalizeSeasonKey(asset.seasonKey),
      title:
        asset.title,
      description:
        asset.description ?? "",
      assetType:
        asset.assetType as StreamOverlayAssetType,
      overlayType:
        asset.overlayType,
      thumbnailUrl:
        asset.thumbnailUrl ?? "",
      externalUrl:
        asset.externalUrl ?? "",
      sortOrder:
        String(asset.sortOrder ?? 999),
      isActive:
        asset.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error(
        "El título es obligatorio"
      );
      return;
    }

    if (
      !editingAsset &&
      form.assetType !== "External" &&
      !file
    ) {
      toast.error(
        "Sube un archivo o cambia el tipo a enlace externo"
      );
      return;
    }

    if (
      form.assetType === "External" &&
      !form.externalUrl.trim()
    ) {
      toast.error(
        "Agrega una URL para el asset externo"
      );
      return;
    }

    try {
      setSaving(true);

      const payload: StreamOverlayAssetPayload = {
        seasonKey:
          form.seasonKey,
        title:
          form.title.trim(),
        description:
          form.description.trim(),
        assetType:
          form.assetType,
        overlayType:
          form.overlayType,
        thumbnailUrl:
          form.thumbnailUrl.trim(),
        externalUrl:
          form.externalUrl.trim(),
        sortOrder:
          Number(form.sortOrder || 999),
        isActive:
          form.isActive,
        file,
        thumbnailFile,
      };

      if (editingAsset) {
        await updateStreamOverlayAsset(
          editingAsset.id,
          payload
        );

        toast.success(
          "Asset actualizado"
        );
      } else {
        await createStreamOverlayAsset(
          payload
        );

        toast.success(
          "Asset guardado en la biblioteca"
        );
      }

      setDialogOpen(false);
      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el asset"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyUrl(
    asset: StreamOverlayAsset
  ) {
    const url =
      getAssetUrl(asset);

    if (!url) {
      toast.error(
        "Este asset no tiene URL"
      );
      return;
    }

    await navigator.clipboard.writeText(
      url
    );

    toast.success(
      "URL copiada"
    );
  }

  async function handleToggle(
    asset: StreamOverlayAsset
  ) {
    try {
      await toggleStreamOverlayAsset(
        asset.id
      );

      toast.success(
        asset.isActive
          ? "Asset oculto"
          : "Asset activo"
      );

      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cambiar la visibilidad"
      );
    }
  }

  async function handleDelete(
    asset: StreamOverlayAsset
  ) {
    const confirmed =
      window.confirm(
        `¿Eliminar "${asset.title}" de la biblioteca?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStreamOverlayAsset(
        asset.id
      );

      toast.success(
        "Asset eliminado"
      );

      await loadAssets();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo eliminar el asset"
      );
    }
  }

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader className="border-b border-[var(--sg-admin-border)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[var(--sg-text)]">
              <Archive className="h-5 w-5 text-[var(--sg-primary)]" />
              Biblioteca de overlays por temporada
            </CardTitle>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              Guarda aquí tus MP4, PNG, JSON de OBS o enlaces por temporada para reutilizarlos en futuras ediciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={loadAssets}
              variant="outline"
              className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>

            <Button
              onClick={openCreateDialog}
              className="sgames-admin-primary-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Subir overlay
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {seasonOptions.map((season) => {
            const group =
              groups.find(
                (item) =>
                  item.seasonKey === season.key
              );

            return (
              <Button
                key={season.key}
                variant={selectedSeason === season.key ? "default" : "outline"}
                onClick={() =>
                  setSelectedSeason(season.key)
                }
                className={
                  selectedSeason === season.key
                    ? "sgames-admin-primary-button"
                    : "border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
                }
              >
                {season.label}

                <Badge className="ml-2 bg-black/30 text-current">
                  {group?.total ?? 0}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-[var(--sg-text)]">
                {currentSeasonOption.label}
              </h3>

              <p className="text-sm text-[var(--sg-muted-text)]">
                {currentSeasonOption.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                {selectedGroup?.active ?? 0} activos
              </Badge>

              <Badge className="bg-yellow-500/15 text-yellow-300">
                {selectedGroup?.hidden ?? 0} ocultos
              </Badge>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--sg-muted-text)]">
            Cargando biblioteca...
          </p>
        ) : assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--sg-admin-border)] p-10 text-center">
            <Clapperboard className="mx-auto mb-3 h-10 w-10 text-[var(--sg-admin-muted-soft)]" />

            <p className="font-semibold text-[var(--sg-text)]">
              No hay overlays guardados para {currentSeasonOption.label}
            </p>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              Sube tus escenas de stream para tenerlas listas por temporada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => {
              const Icon =
                getAssetIcon(asset.assetType);

              const assetUrl =
                getAssetUrl(asset);

              return (
                <div
                  key={asset.id}
                  className="overflow-hidden rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-background)]/35"
                >
                  <div className="relative aspect-video bg-black">
                    {asset.assetType === "Image" && asset.fileUrl ? (
                      <img
                        src={asset.fileUrl}
                        alt={asset.title}
                        className="h-full w-full object-cover"
                      />
                    ) : asset.assetType === "Video" && asset.fileUrl ? (
                      <video
                        src={asset.fileUrl}
                        poster={asset.thumbnailUrl ?? undefined}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : asset.thumbnailUrl ? (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon className="h-12 w-12 text-[var(--sg-primary)]" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <Badge className="bg-black/75 text-white">
                        {getAssetTypeLabel(asset.assetType)}
                      </Badge>

                      <Badge className="bg-black/75 text-white">
                        {asset.overlayType}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h4 className="line-clamp-2 font-bold text-[var(--sg-text)]">
                        {asset.title}
                      </h4>

                      {asset.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--sg-muted-text)]">
                          {asset.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={
                        asset.isActive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }>
                        {asset.isActive ? "Activo" : "Oculto"}
                      </Badge>

                      <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                        {formatBytes(asset.fileSizeBytes)}
                      </Badge>
                    </div>

                    {asset.originalFileName && (
                      <p className="truncate text-xs text-[var(--sg-admin-muted-soft)]">
                        {asset.originalFileName}
                      </p>
                    )}

                    <div className="grid grid-cols-5 gap-2">
                      {assetUrl ? (
                        <a
                          href={assetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="contents"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="border-[var(--sg-admin-border)]"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCopyUrl(asset)
                        }
                        className="border-[var(--sg-admin-border)] text-[var(--sg-secondary)]"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          openEditDialog(asset)
                        }
                        className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleToggle(asset)
                        }
                        className="border-yellow-500/30 text-yellow-300"
                      >
                        {asset.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDelete(asset)
                        }
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);

          if (!open) {
            setEditingAsset(null);
            setFile(null);
            setThumbnailFile(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] text-[var(--sg-text)]">
          <DialogHeader>
            <DialogTitle>
              {editingAsset
                ? "Editar overlay"
                : "Subir overlay"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Temporada
              </Label>

              <Select
                value={form.seasonKey}
                onValueChange={(value) =>
                  updateFormField(
                    "seasonKey",
                    value
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="Summer">
                    Verano
                  </SelectItem>

                  <SelectItem value="Autumn">
                    Otoño
                  </SelectItem>

                  <SelectItem value="Winter">
                    Invierno
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Tipo de archivo
              </Label>

              <Select
                value={form.assetType}
                onValueChange={(value) =>
                  updateFormField(
                    "assetType",
                    value
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="Video">
                    Video MP4 / WebM / MOV
                  </SelectItem>

                  <SelectItem value="Image">
                    Imagen PNG / JPG / WebP
                  </SelectItem>

                  <SelectItem value="Json">
                    JSON / OBS
                  </SelectItem>

                  <SelectItem value="External">
                    Enlace externo
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
                  updateFormField(
                    "title",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Ej. COMENZANDO DIRECTO"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Clasificación
              </Label>

              <Select
                value={form.overlayType}
                onValueChange={(value) =>
                  updateFormField(
                    "overlayType",
                    value
                  )
                }
              >
                <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  {overlayTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Orden
              </Label>

              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateFormField(
                    "sortOrder",
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
                value={form.description}
                onChange={(event) =>
                  updateFormField(
                    "description",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[90px] border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                placeholder="Notas de uso, escena OBS o contexto del asset"
              />
            </div>

            {form.assetType !== "External" ? (
              <div className="md:col-span-2">
                <Label className="text-[var(--sg-muted-text)]">
                  Archivo
                </Label>

                <Input
                  type="file"
                  accept={
                    form.assetType === "Video"
                      ? "video/mp4,video/webm,video/quicktime"
                      : form.assetType === "Image"
                        ? "image/jpeg,image/png,image/webp,image/gif"
                        : "application/json,text/plain,.json"
                  }
                  onChange={(event) =>
                    setFile(
                      event.target.files?.[0] ?? null
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                />

                {editingAsset && (
                  <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                    Si no subes otro archivo, se conserva el actual.
                  </p>
                )}
              </div>
            ) : (
              <div className="md:col-span-2">
                <Label className="text-[var(--sg-muted-text)]">
                  URL externa
                </Label>

                <Input
                  value={form.externalUrl}
                  onChange={(event) =>
                    updateFormField(
                      "externalUrl",
                      event.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                  placeholder="https://..."
                />
              </div>
            )}

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Thumbnail URL opcional
              </Label>

              <Input
                value={form.thumbnailUrl}
                onChange={(event) =>
                  updateFormField(
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

            <label className="flex items-center gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-4 py-3 text-sm text-[var(--sg-muted-text)] md:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateFormField(
                    "isActive",
                    event.target.checked
                  )
                }
              />
              Activo en la biblioteca
            </label>
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
                : "Guardar overlay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}