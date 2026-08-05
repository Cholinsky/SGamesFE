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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  Video,
  ExternalLink,
  Users,
  RefreshCw,
  Archive,
  Copy,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  copyRunnerProfileBasicToActive,
  createRunnerProfile,
  deleteRunnerProfile,
  getRunnerProfileEventGroups,
  getRunnerProfiles,
  hideRunnerProfile,
  showRunnerProfile,
  updateRunnerProfile,
  type RunnerProfile,
  type RunnerProfileEventGroup,
  type RunnerSocialLinkPayload,
} from "../../services/runnerProfileService";
import { getSocialNetworks } from "../../services/socialNetworkService";
import { useAdminSeasonTheme } from "../../hooks/useAdminSeasonTheme";

type SocialNetworkCatalog = {
  id: string;
  name: string;
  iconName?: string;
  baseUrl?: string;
};

type RunnerFormState = {
  displayName: string;
  country: string;
  bio: string;
  isVisible: boolean;
  sortOrder: string;
};

function createEmptyForm(): RunnerFormState {
  return {
    displayName: "",
    country: "",
    bio: "",
    isVisible: true,
    sortOrder: "999",
  };
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString(
    "es-MX",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function parseEventDate(
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
    parseEventDate(startDate);

  const end =
    parseEventDate(endDate);

  if (!start || !end) {
    return "Fechas por confirmar";
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  const monthName =
    end.toLocaleDateString(
      "es-MX",
      {
        month: "long",
      }
    );

  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()} ${monthName} ${end.getFullYear()}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getSeasonLabel(
  seasonKey?: string | null
) {
  switch (seasonKey) {
    case "Winter":
      return "Invierno";

    case "Autumn":
    case "Fall":
      return "Otoño";

    default:
      return "Verano";
  }
}

export default function AdminRunners() {
  useAdminSeasonTheme();

  const [runners, setRunners] =
    useState<RunnerProfile[]>([]);

  const [eventGroups, setEventGroups] =
    useState<RunnerProfileEventGroup[]>([]);

  const [catalog, setCatalog] =
    useState<SocialNetworkCatalog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [historyDialogOpen, setHistoryDialogOpen] =
    useState(false);

  const [historySearch, setHistorySearch] =
    useState("");

  const [editingRunner, setEditingRunner] =
    useState<RunnerProfile | null>(null);

  const [form, setForm] =
    useState<RunnerFormState>(
      createEmptyForm()
    );

  const [socialLinks, setSocialLinks] =
    useState<RunnerSocialLinkPayload[]>([]);

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [copyingRunnerId, setCopyingRunnerId] =
    useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        runnerData,
        eventGroupData,
        socialNetworkData,
      ] = await Promise.all([
        getRunnerProfiles(),
        getRunnerProfileEventGroups(),
        getSocialNetworks(),
      ]);

      setRunners(
        Array.isArray(runnerData)
          ? runnerData
          : []
      );

      setEventGroups(
        Array.isArray(eventGroupData)
          ? eventGroupData
          : []
      );

      setCatalog(
        Array.isArray(socialNetworkData)
          ? socialNetworkData
          : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cargar el módulo de runners"
      );
    } finally {
      setLoading(false);
    }
  }

  const historicalGroups =
    useMemo(
      () =>
        eventGroups
          .filter((group) => !group.isActive)
          .map((group) => ({
            ...group,
            runners:
              group.runners.filter((runner) => {
                const term =
                  historySearch
                    .trim()
                    .toLowerCase();

                if (!term) {
                  return true;
                }

                return [
                  runner.displayName,
                  runner.country ?? "",
                  runner.bio ?? "",
                  group.eventName,
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(term);
              }),
          }))
          .filter((group) =>
            group.runners.length > 0
          ),
      [
        eventGroups,
        historySearch,
      ]
    );

  function resetForm() {
    setForm(
      createEmptyForm()
    );

    setSocialLinks([]);
    setPhotoFile(null);
    setVideoFile(null);
    setEditingRunner(null);
  }

  function openCreateDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function openEditDialog(
    runner: RunnerProfile
  ) {
    setEditingRunner(runner);

    setForm({
      displayName:
        runner.displayName ?? "",
      country:
        runner.country ?? "",
      bio:
        runner.bio ?? "",
      isVisible:
        Boolean(runner.isVisible),
      sortOrder:
        String(runner.sortOrder ?? 999),
    });

    setSocialLinks(
      (runner.socialLinks ?? []).map((link) => ({
        socialNetworkId:
          link.socialNetworkId,
        url:
          link.url,
      }))
    );

    setPhotoFile(null);
    setVideoFile(null);
    setDialogOpen(true);
  }

  function updateForm(
    field: keyof RunnerFormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addSocialLink() {
    setSocialLinks((current) => [
      ...current,
      {
        socialNetworkId: "",
        url: "",
      },
    ]);
  }

  function updateSocialLink(
    index: number,
    field: keyof RunnerSocialLinkPayload,
    value: string
  ) {
    setSocialLinks((current) =>
      current.map((link, currentIndex) =>
        currentIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link
      )
    );
  }

  function removeSocialLink(
    index: number
  ) {
    setSocialLinks((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
    );
  }

  async function handleSave() {
    if (!form.displayName.trim()) {
      toast.error(
        "El nombre del runner es obligatorio"
      );
      return;
    }

    const invalidSocialLink =
      socialLinks.some(
        (link) =>
          (link.socialNetworkId &&
            !link.url.trim()) ||
          (!link.socialNetworkId &&
            link.url.trim())
      );

    if (invalidSocialLink) {
      toast.error(
        "Completa o elimina las redes sociales incompletas"
      );
      return;
    }

    try {
      setSaving(true);

      const cleanSocialLinks =
        socialLinks.filter(
          (link) =>
            link.socialNetworkId &&
            link.url.trim()
        );

      const payload = {
        displayName:
          form.displayName.trim(),
        country:
          form.country.trim() || null,
        bio:
          form.bio.trim() || null,
        isVisible:
          form.isVisible,
        sortOrder:
          Number(form.sortOrder || 999),
        socialLinks:
          cleanSocialLinks,
        photo:
          photoFile,
        presentationVideo:
          videoFile,
      };

      if (editingRunner) {
        await updateRunnerProfile(
          editingRunner.id,
          payload
        );

        toast.success(
          "Runner actualizado correctamente"
        );
      } else {
        await createRunnerProfile(
          payload
        );

        toast.success(
          "Runner creado en el evento activo"
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
          : "No se pudo guardar el runner"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyBasicToActive(
    runner: RunnerProfile
  ) {
    try {
      setCopyingRunnerId(
        runner.id
      );

      await copyRunnerProfileBasicToActive(
        runner.id
      );

      toast.success(
        "Runner copiado al evento activo sin multimedia"
      );

      setHistoryDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo reutilizar el runner"
      );
    } finally {
      setCopyingRunnerId(null);
    }
  }

  async function handleToggleVisibility(
    runner: RunnerProfile
  ) {
    try {
      if (runner.isVisible) {
        await hideRunnerProfile(
          runner.id
        );

        toast.success(
          "Runner ocultado"
        );
      } else {
        await showRunnerProfile(
          runner.id
        );

        toast.success(
          "Runner visible"
        );
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
    runner: RunnerProfile
  ) {
    const confirmDelete =
      window.confirm(
        `¿Seguro que quieres eliminar el perfil de ${runner.displayName}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteRunnerProfile(
        runner.id
      );

      toast.success(
        "Runner eliminado correctamente"
      );

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo eliminar el runner"
      );
    }
  }

  if (loading) {
    return (
      <div className="sgames-admin-page text-[var(--sg-text)]">
        Cargando runners...
      </div>
    );
  }

  return (
    <div className="sgames-admin-page space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--sg-text)]">
            Runners
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            Administra los runners del evento activo. El historial queda separado por edición.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)] hover:bg-[var(--sg-admin-input-bg)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>

          <Button
            onClick={() =>
              setHistoryDialogOpen(true)
            }
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)] hover:bg-[var(--sg-admin-primary-soft)]"
          >
            <Archive className="mr-2 h-4 w-4" />
            Historial / reutilizar
          </Button>

          <Button
            onClick={openCreateDialog}
            className="sgames-admin-primary-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Runner
          </Button>
        </div>
      </div>

      <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--sg-text)]">
              Runners del evento activo
            </h2>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              El carrusel público sólo toma esta lista. Los runners de Summer 2026 y otras ediciones quedan archivados y no aparecen al público.
            </p>
          </div>

          <Badge className="w-fit bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
            {runners.length} actuales
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Total actuales
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--sg-text)]">
                {runners.length}
              </p>
            </div>

            <Users className="h-9 w-9 text-[var(--sg-primary)]" />
          </CardContent>
        </Card>

        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Visibles
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--sg-text)]">
                {runners.filter((runner) => runner.isVisible).length}
              </p>
            </div>

            <Eye className="h-9 w-9 text-green-400" />
          </CardContent>
        </Card>

        <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-[var(--sg-muted-text)]">
                Ocultos
              </p>

              <p className="mt-1 text-3xl font-bold text-[var(--sg-text)]">
                {runners.filter((runner) => !runner.isVisible).length}
              </p>
            </div>

            <EyeOff className="h-9 w-9 text-yellow-400" />
          </CardContent>
        </Card>
      </div>

      {runners.length === 0 ? (
        <Card className="border-dashed border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]/40">
          <CardContent className="p-10 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-[var(--sg-admin-muted-soft)]" />

            <h2 className="text-xl font-bold text-[var(--sg-text)]">
              Aún no hay runners en el evento activo
            </h2>

            <p className="mt-2 text-[var(--sg-muted-text)]">
              Crea uno nuevo o reutiliza información básica desde el historial.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() =>
                  setHistoryDialogOpen(true)
                }
                variant="outline"
                className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
              >
                <Archive className="mr-2 h-4 w-4" />
                Reutilizar runner
              </Button>

              <Button
                onClick={openCreateDialog}
                className="sgames-admin-primary-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear runner
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {runners.map((runner) => (
            <Card
              key={runner.id}
              className="overflow-hidden border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--sg-background)]">
                {runner.photoUrl ? (
                  <img
                    src={runner.photoUrl}
                    alt={runner.displayName}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-[var(--sg-admin-muted-soft)]" />
                  </div>
                )}

                <div className="absolute left-3 top-3">
                  {runner.isVisible ? (
                    <Badge className="bg-green-500/20 text-green-300">
                      Visible
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      Oculto
                    </Badge>
                  )}
                </div>

                {runner.sourceRunnerProfileId && (
                  <div className="absolute right-3 top-3">
                    <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                      Reutilizado
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="space-y-3 p-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--sg-text)]">
                        {runner.displayName}
                      </h3>

                      {runner.country && (
                        <p className="text-sm text-[var(--sg-muted-text)]">
                          {runner.country}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full border border-[var(--sg-admin-border-strong)] px-3 py-1 text-xs text-[var(--sg-primary)]">
                      #{runner.sortOrder}
                    </span>
                  </div>

                  {runner.bio && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--sg-muted-text)]">
                      {runner.bio}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {runner.socialLinks?.map((link) => (
                    <a
                      key={`${runner.id}-${link.socialNetworkId}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[var(--sg-admin-border)] px-3 py-1 text-xs text-[var(--sg-primary)] hover:bg-[var(--sg-admin-primary-soft)]"
                    >
                      {link.name ?? "Red"}
                    </a>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--sg-muted-text)]">
                  <span>
                    Creado: {formatDate(runner.createdAt)}
                  </span>

                  {runner.presentationVideoUrl && (
                    <a
                      href={runner.presentationVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto flex items-center gap-1 text-[var(--sg-secondary)]"
                    >
                      <Video className="h-3 w-3" />
                      Video
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openEditDialog(runner)
                    }
                    className="border-[var(--sg-admin-border)] text-[var(--sg-primary)] hover:bg-[var(--sg-admin-primary-soft)]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleVisibility(runner)
                    }
                    className="border-[var(--sg-admin-border)] text-[var(--sg-secondary)] hover:bg-[var(--sg-admin-secondary-soft)]"
                  >
                    {runner.isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDelete(runner)
                    }
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
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
              {editingRunner
                ? "Editar runner del evento activo"
                : "Nuevo runner para el evento activo"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Nombre visible
              </Label>

              <Input
                value={form.displayName}
                onChange={(event) =>
                  updateForm(
                    "displayName",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                País
              </Label>

              <Input
                value={form.country}
                onChange={(event) =>
                  updateForm(
                    "country",
                    event.target.value
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

            <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-4 py-3 text-sm text-[var(--sg-muted-text)]">
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
              Visible en carrusel público
            </label>

            <div className="md:col-span-2">
              <Label className="text-[var(--sg-muted-text)]">
                Bio
              </Label>

              <Textarea
                rows={4}
                value={form.bio}
                onChange={(event) =>
                  updateForm(
                    "bio",
                    event.target.value
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Foto del runner
              </Label>

              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  setPhotoFile(
                    event.target.files?.[0] ?? null
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />

              {editingRunner?.photoUrl && (
                <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                  Si no subes foto nueva, se conserva la actual.
                </p>
              )}
            </div>

            <div>
              <Label className="text-[var(--sg-muted-text)]">
                Video de presentación
              </Label>

              <Input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(event) =>
                  setVideoFile(
                    event.target.files?.[0] ?? null
                  )
                }
                className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
              />

              {editingRunner?.presentationVideoUrl && (
                <p className="mt-1 text-xs text-[var(--sg-muted-text)]">
                  Si no subes video nuevo, se conserva el actual.
                </p>
              )}
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-[var(--sg-muted-text)]">
                  Redes sociales
                </Label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar red
                </Button>
              </div>

              {socialLinks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--sg-admin-border)] p-4 text-sm text-[var(--sg-muted-text)]">
                  Sin redes sociales.
                </p>
              ) : (
                socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-[var(--sg-admin-border)] p-3 md:grid-cols-[220px_1fr_auto]"
                  >
                    <Select
                      value={link.socialNetworkId}
                      onValueChange={(value) =>
                        updateSocialLink(
                          index,
                          "socialNetworkId",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                        <SelectValue placeholder="Red social" />
                      </SelectTrigger>

                      <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                        {catalog.map((network) => (
                          <SelectItem
                            key={network.id}
                            value={network.id}
                          >
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      value={link.url}
                      onChange={(event) =>
                        updateSocialLink(
                          index,
                          "url",
                          event.target.value
                        )
                      }
                      placeholder="URL"
                      className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        removeSocialLink(index)
                      }
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {editingRunner?.sourceRunnerProfileId && (
            <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Este runner fue reutilizado desde una edición anterior. La foto y el video se cargan de forma independiente para esta temporada.
            </div>
          )}

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
                : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History / Reuse Dialog */}
      <Dialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] text-[var(--sg-text)]">
          <DialogHeader>
            <DialogTitle>
              Historial de runners por temporada
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
              <p className="text-sm text-[var(--sg-muted-text)]">
                Usa esta vista para reutilizar un runner que ya participó antes. Se copia sólo información básica y redes; la foto y el video quedan vacíos para cargarlos manualmente en la nueva temporada.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sg-admin-muted-soft)]" />

              <Input
                value={historySearch}
                onChange={(event) =>
                  setHistorySearch(event.target.value)
                }
                placeholder="Buscar runner histórico..."
                className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] pl-10 text-[var(--sg-text)]"
              />
            </div>

            {historicalGroups.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--sg-admin-border)] p-8 text-center text-[var(--sg-muted-text)]">
                No hay runners históricos disponibles.
              </div>
            ) : (
              historicalGroups.map((group) => (
                <div
                  key={group.eventId}
                  className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)]"
                >
                  <div className="flex flex-col gap-2 border-b border-[var(--sg-admin-border)] p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--sg-text)]">
                        {group.eventName}
                      </h3>

                      <p className="text-sm text-[var(--sg-muted-text)]">
                        {formatEventRange(
                          group.startDate,
                          group.endDate
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[var(--sg-admin-secondary-soft)] text-[var(--sg-secondary)]">
                        {getSeasonLabel(
                          group.seasonKey
                        )}
                      </Badge>

                      <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                        {group.runners.length} runners
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.runners.map((runner) => (
                      <div
                        key={runner.id}
                        className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-background)]/45 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[var(--sg-text)]">
                              {runner.displayName}
                            </p>

                            <p className="truncate text-sm text-[var(--sg-muted-text)]">
                              {runner.country || "Sin país"}
                            </p>
                          </div>

                          {runner.photoUrl ? (
                            <ImageIcon className="h-5 w-5 shrink-0 text-[var(--sg-primary)]" />
                          ) : (
                            <ImageIcon className="h-5 w-5 shrink-0 text-[var(--sg-admin-muted-soft)]" />
                          )}
                        </div>

                        {runner.bio && (
                          <p className="mt-2 line-clamp-2 text-xs text-[var(--sg-muted-text)]">
                            {runner.bio}
                          </p>
                        )}

                        <Button
                          type="button"
                          onClick={() =>
                            handleCopyBasicToActive(runner)
                          }
                          disabled={
                            copyingRunnerId === runner.id
                          }
                          className="mt-4 w-full sgames-admin-primary-button"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copyingRunnerId === runner.id
                            ? "Copiando..."
                            : "Usar info básica"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}