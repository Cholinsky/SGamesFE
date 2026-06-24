import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
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
  Save,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  createRunnerProfile,
  deleteRunnerProfile,
  getRunnerProfiles,
  hideRunnerProfile,
  showRunnerProfile,
  updateRunnerProfile,
  type RunnerSocialLinkPayload,
} from "../../services/runnerProfileService";
import { getSocialNetworks } from "../../services/socialNetworkService";

type SocialNetworkCatalog = {
  id: string;
  name: string;
  iconName?: string;
  baseUrl?: string;
};

type RunnerSocialLink = {
  id?: string;
  socialNetworkId: string;
  name?: string;
  url: string;
};

type RunnerProfile = {
  id: string;
  displayName: string;
  country?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  presentationVideoUrl?: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
  socialLinks: RunnerSocialLink[];
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

function formatDate(value?: string | null) {
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

export default function AdminRunners() {
  const [runners, setRunners] =
    useState<RunnerProfile[]>([]);

  const [catalog, setCatalog] =
    useState<SocialNetworkCatalog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [dialogOpen, setDialogOpen] =
    useState(false);

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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [runnerData, socialNetworkData] =
        await Promise.all([
          getRunnerProfiles(),
          getSocialNetworks(),
        ]);

      setRunners(
        Array.isArray(runnerData)
          ? runnerData
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
        runner.isVisible,
      sortOrder:
        String(runner.sortOrder ?? 999),
    });

    setSocialLinks(
      (runner.socialLinks ?? []).map(
        (link) => ({
          socialNetworkId:
            link.socialNetworkId,
          url:
            link.url,
        })
      )
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
        (_link, currentIndex) =>
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
          "Runner creado correctamente"
        );
      }

      setDialogOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar el runner"
      );
    } finally {
      setSaving(false);
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
      <div className="text-white">
        Cargando runners...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Runners
          </h1>

          <p className="text-gray-400">
            Administra las tarjetas públicas de runners participantes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>

          <Button
            onClick={openCreateDialog}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Runner
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-gray-400">
                Total runners
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {runners.length}
              </p>
            </div>

            <Users className="h-9 w-9 text-cyan-400" />
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-gray-400">
                Visibles
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {runners.filter((runner) => runner.isVisible).length}
              </p>
            </div>

            <Eye className="h-9 w-9 text-green-400" />
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-gray-400">
                Ocultos
              </p>
              <p className="mt-1 text-3xl font-bold text-white">
                {runners.filter((runner) => !runner.isVisible).length}
              </p>
            </div>

            <EyeOff className="h-9 w-9 text-yellow-400" />
          </CardContent>
        </Card>
      </div>

      {runners.length === 0 ? (
        <Card className="border-dashed border-gray-800 bg-gray-900/40">
          <CardContent className="p-10 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-600" />

            <h2 className="text-xl font-bold text-white">
              Aún no hay runners cargados
            </h2>

            <p className="mt-2 text-gray-400">
              Crea el primer perfil para mostrarlo en la página principal.
            </p>

            <Button
              onClick={openCreateDialog}
              className="mt-5 bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear runner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {runners.map((runner) => (
            <Card
              key={runner.id}
              className="overflow-hidden border-gray-800 bg-gray-900/50"
            >
              <div className="relative aspect-square bg-gray-950">
                {runner.photoUrl ? (
                  <img
                      src={runner.photoUrl}
                      alt={runner.displayName}
                      className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-700" />
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
              </div>

              <CardContent className="space-y-4 p-5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {runner.displayName}
                      </h3>

                      {runner.country && (
                        <p className="text-sm text-gray-400">
                          {runner.country}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300">
                      #{runner.sortOrder}
                    </span>
                  </div>

                  {runner.bio && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">
                      {runner.bio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {runner.presentationVideoUrl && (
                    <a
                      href={runner.presentationVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200"
                    >
                      <Video className="h-4 w-4" />
                      Ver video de presentación
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {runner.socialLinks?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {runner.socialLinks.map((link) => (
                        <a
                          key={link.id ?? `${link.socialNetworkId}-${link.url}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10"
                        >
                          {link.name ?? "Red social"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-between gap-2 border-t border-gray-800 pt-4">
                  <span className="text-xs text-gray-500">
                    Creado: {formatDate(runner.createdAt)}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleVisibility(runner)}
                      className="text-yellow-300 hover:bg-yellow-500/10"
                      title={runner.isVisible ? "Ocultar" : "Mostrar"}
                    >
                      {runner.isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(runner)}
                      className="text-cyan-300 hover:bg-cyan-500/10"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(runner)}
                      className="text-red-400 hover:bg-red-500/10"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
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
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-3xl flex-col overflow-hidden border-gray-800 bg-gray-900 p-0 text-white">
          <DialogHeader className="shrink-0 border-b border-gray-800 px-6 py-4">
            <DialogTitle className="text-2xl">
              {editingRunner ? "Editar Runner" : "Nuevo Runner"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-gray-300">
                  Nombre público <span className="text-red-400">*</span>
                </Label>

                <Input
                  value={form.displayName}
                  onChange={(event) => updateForm("displayName", event.target.value)}
                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                  placeholder="Nombre o alias del runner"
                />
              </div>

              <div>
                <Label className="text-gray-300">
                  País / región
                </Label>

                <Input
                  value={form.country}
                  onChange={(event) => updateForm("country", event.target.value)}
                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                  placeholder="Ej. México, Chile, España"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">
                Bio / presentación
              </Label>

              <Textarea
                value={form.bio}
                onChange={(event) => updateForm("bio", event.target.value)}
                className="mt-1.5 min-h-[120px] border-gray-700 bg-gray-800 text-white"
                placeholder="Pequeña descripción del runner..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-gray-300">
                  Orden
                </Label>

                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => updateForm("sortOrder", event.target.value)}
                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                  placeholder="999"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Menor número aparece primero.
                </p>
              </div>

              <div>
                <Label className="text-gray-300">
                  Visibilidad
                </Label>

                <Select
                  value={form.isVisible ? "visible" : "hidden"}
                  onValueChange={(value) => updateForm("isVisible", value === "visible")}
                >
                  <SelectTrigger className="mt-1.5 border-gray-700 bg-gray-800 text-white">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="visible">
                      Visible en Home
                    </SelectItem>

                    <SelectItem value="hidden">
                      Oculto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-gray-300">
                  Imagen del runner
                </Label>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                />

                {editingRunner?.photoUrl && !photoFile && (
                  <a
                    href={editingRunner.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs text-cyan-300 hover:text-cyan-200"
                  >
                    Imagen actual
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div>
                <Label className="text-gray-300">
                  Video de presentación
                </Label>

                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                />

                {editingRunner?.presentationVideoUrl && !videoFile && (
                  <a
                    href={editingRunner.presentationVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs text-purple-300 hover:text-purple-200"
                  >
                    Video actual
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-cyan-400">
                    Redes sociales
                  </h3>

                  <p className="text-sm text-gray-500">
                    Opcionales. Se mostrarán en la tarjeta pública.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {socialLinks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-800 p-4 text-center text-sm text-gray-500">
                  No hay redes sociales agregadas.
                </p>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-3 md:flex-row"
                    >
                      <div className="flex-1">
                        <Select
                          value={link.socialNetworkId}
                          onValueChange={(value) => updateSocialLink(index, "socialNetworkId", value)}
                        >
                          <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                            <SelectValue placeholder="Red social" />
                          </SelectTrigger>

                          <SelectContent className="border-gray-700 bg-gray-800">
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
                      </div>

                      <div className="flex-[2]">
                        <Input
                          value={link.url}
                          onChange={(event) => updateSocialLink(index, "url", event.target.value)}
                          className="border-gray-700 bg-gray-800 text-white"
                          placeholder="https://..."
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-gray-800 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-700"
              disabled={saving}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
