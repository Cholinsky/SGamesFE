import { useEffect, useState } from "react";
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
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  Radio,
  Save,
  Settings,
  Eye,
  EyeOff,
  ShieldCheck,
  Twitch,
  Youtube,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getActiveEvent,
  updateEvent,
  updatePublicRunsVisibility,
} from "../../services/eventService";
import {
  createSettings,
  getSettings,
  updateSettings,
} from "../../services/settingsService";

type EventConfig = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  streamUrl: string;
  discordUrl: string;
  isActive: boolean;
  isPublished: boolean;
  applicationsOpen: boolean;
  publicRunsVisible: boolean;
};

type SettingsConfig = {
  id: number | null;
  eventName: string;
  contactEmail: string;
  twitchUrl: string;
  youtubeUrl: string;
  discordUrl: string;
  twitterUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

function toDateInputValue(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  return value.split("T")[0];
}

function toApiDate(
  value: string
) {
  if (!value) {
    return null;
  }

  return `${value}T00:00:00`;
}

function normalizeText(
  value: string
) {
  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

export default function AdminConfiguracion() {
  const [eventConfig, setEventConfig] =
    useState<EventConfig>({
      id: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      streamUrl: "",
      discordUrl: "",
      isActive: false,
      isPublished: false,
      applicationsOpen: true,
      publicRunsVisible: true,
    });

  const [settingsConfig, setSettingsConfig] =
    useState<SettingsConfig>({
      id: null,
      eventName: "",
      contactEmail: "",
      twitchUrl: "",
      youtubeUrl: "",
      discordUrl: "",
      twitterUrl: "",
      maintenanceMode: false,
      maintenanceMessage:
        "Estamos trabajando en mejoras. Vuelve más tarde.",
    });

  const [loading, setLoading] =
    useState(true);

  const [savingEvent, setSavingEvent] =
    useState(false);

  const [savingSettings, setSavingSettings] =
    useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  async function loadConfiguration() {
    try {
      setLoading(true);

      const activeEvent =
        await getActiveEvent();

      setEventConfig({
        id: activeEvent.id,
        name: activeEvent.name ?? "",
        description: activeEvent.description ?? "",
        startDate: toDateInputValue(
          activeEvent.startDate
        ),
        endDate: toDateInputValue(
          activeEvent.endDate
        ),
        streamUrl: activeEvent.streamUrl ?? "",
        discordUrl: activeEvent.discordUrl ?? "",
        isActive: Boolean(
          activeEvent.isActive
        ),
        isPublished: Boolean(
          activeEvent.isPublished
        ),
        applicationsOpen:
          activeEvent.applicationsOpen ?? true,
        publicRunsVisible:
          activeEvent.publicRunsVisible ?? true,
      });

      const settings =
        await getSettings();

      const currentSettings =
        Array.isArray(settings) &&
        settings.length > 0
          ? settings[0]
          : null;

      if (currentSettings) {
        setSettingsConfig({
          id: currentSettings.id,
          eventName:
            currentSettings.eventName ??
            activeEvent.name ??
            "",
          contactEmail:
            currentSettings.contactEmail ?? "",
          twitchUrl:
            currentSettings.twitchUrl ?? "",
          youtubeUrl:
            currentSettings.youtubeUrl ?? "",
          discordUrl:
            currentSettings.discordUrl ??
            activeEvent.discordUrl ??
            "",
          twitterUrl:
            currentSettings.twitterUrl ?? "",
          maintenanceMode:
            Boolean(currentSettings.maintenanceMode),
          maintenanceMessage:
            currentSettings.maintenanceMessage ??
            "Estamos trabajando en mejoras. Vuelve más tarde.",
        });
      } else {
        setSettingsConfig({
          id: null,
          eventName:
            activeEvent.name ?? "",
          contactEmail: "",
          twitchUrl:
            activeEvent.streamUrl ?? "",
          youtubeUrl: "",
          discordUrl:
            activeEvent.discordUrl ?? "",
          twitterUrl: "",
          maintenanceMode: false,
          maintenanceMessage:
            "Estamos trabajando en mejoras. Vuelve más tarde.",
        });
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cargar la configuración"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateEventField(
    field: keyof EventConfig,
    value: string | boolean
  ) {
    setEventConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSettingsField(
    field: keyof SettingsConfig,
    value: string | boolean
  ) {
    setSettingsConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveEventConfig() {
    if (!eventConfig.name.trim()) {
      toast.error(
        "El nombre del evento es obligatorio"
      );
      return;
    }

    if (!eventConfig.startDate) {
      toast.error(
        "La fecha de inicio es obligatoria"
      );
      return;
    }

    if (!eventConfig.endDate) {
      toast.error(
        "La fecha de fin es obligatoria"
      );
      return;
    }

    try {
      setSavingEvent(true);

      await updateEvent(
        eventConfig.id,
        {
          name:
            eventConfig.name.trim(),

          description:
            normalizeText(
              eventConfig.description
            ),

          startDate:
            toApiDate(
              eventConfig.startDate
            ),

          endDate:
            toApiDate(
              eventConfig.endDate
            ),

          streamUrl:
            normalizeText(
              eventConfig.streamUrl
            ),

          discordUrl:
            normalizeText(
              eventConfig.discordUrl
            ),
            applicationsOpen:
              eventConfig.applicationsOpen,
        }
      );

      toast.success(
        "Configuración del evento guardada"
      );

      await loadConfiguration();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar el evento"
      );
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleTogglePublicRunsVisible() {
    if (!eventConfig.id) {
      toast.error("No hay evento activo");
      return;
    }

    try {
      setSavingEvent(true);

      await updatePublicRunsVisibility(
        eventConfig.id,
        !eventConfig.publicRunsVisible
      );

      toast.success(
        eventConfig.publicRunsVisible
          ? "Runs públicas ocultas"
          : "Runs públicas visibles"
      );

      await loadConfiguration();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo actualizar la visibilidad de las runs"
      );
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleSaveSettingsConfig() {
    try {
      setSavingSettings(true);

      const payload = {
        eventName:
          normalizeText(
            settingsConfig.eventName
          ),

        contactEmail:
          normalizeText(
            settingsConfig.contactEmail
          ),

        twitchUrl:
          normalizeText(
            settingsConfig.twitchUrl
          ),

        youtubeUrl:
          normalizeText(
            settingsConfig.youtubeUrl
          ),

        discordUrl:
          normalizeText(
            settingsConfig.discordUrl
          ),

        twitterUrl:
          normalizeText(
            settingsConfig.twitterUrl
          ),

        maintenanceMode:
          settingsConfig.maintenanceMode,

        maintenanceMessage:
          normalizeText(
            settingsConfig.maintenanceMessage
          ) ??
          "Estamos trabajando en mejoras. Vuelve más tarde.",
      };

      if (settingsConfig.id === null) {
        await createSettings(payload);
      } else {
        await updateSettings(
          settingsConfig.id,
          payload
        );
      }

      toast.success(
        "Contacto, redes y mantenimiento guardados"
      );

      await loadConfiguration();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar contacto, redes y mantenimiento"
      );
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Configuración
          </h1>

          <p className="text-gray-400">
            Cargando configuración real del evento...
          </p>
        </div>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="p-8 text-center text-gray-400">
            Cargando...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Configuración
          </h1>

          <p className="text-gray-400">
            Administra los datos reales del evento, contacto y redes oficiales
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadConfiguration}
          className="w-fit border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
        >
          <Settings className="mr-2 h-4 w-4" />
          Recargar
        </Button>
      </div>

      {/* Estado Operativo */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Evento activo
              </p>

              <div className="mt-2">
                {eventConfig.isActive ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    Activo
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>

            <ShieldCheck className="h-8 w-8 text-green-400" />
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Horario público
              </p>

              <div className="mt-2">
                {eventConfig.isPublished ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    Publicado
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Borrador
                  </Badge>
                )}
              </div>
            </div>

            {eventConfig.isPublished ? (
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            ) : (
              <Clock className="h-8 w-8 text-yellow-400" />
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-gray-400">
                  Postulaciones
                </p>

                <div className="mt-2">
                  {eventConfig.applicationsOpen ? (
                    <Badge className="bg-green-500/20 text-green-400">
                      Abiertas
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400">
                      Cerradas
                    </Badge>
                  )}
                </div>
              </div>
                
              <Users
                className={`h-8 w-8 ${
                  eventConfig.applicationsOpen
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              />
            </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Runs públicas
              </p>

              <div className="mt-2">
                {eventConfig.publicRunsVisible ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    Visibles
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">
                    Ocultas
                  </Badge>
                )}
              </div>
            </div>

            {eventConfig.publicRunsVisible ? (
              <Eye className="h-8 w-8 text-green-400" />
            ) : (
              <EyeOff className="h-8 w-8 text-red-400" />
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-gray-400">
                Fechas del evento
              </p>

              <p className="mt-2 text-sm font-semibold text-white">
                {eventConfig.startDate || "Sin inicio"} →{" "}
                {eventConfig.endDate || "Sin fin"}
              </p>
            </div>

            <Calendar className="h-8 w-8 text-cyan-400" />
          </CardContent>
        </Card>
      </div>

      {/* Event Configuration */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Configuración del Evento Activo
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="eventName"
                className="text-gray-300"
              >
                Nombre del evento
              </Label>

              <Input
                id="eventName"
                value={eventConfig.name}
                onChange={(event) =>
                  updateEventField(
                    "name",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="Ej. SGames Julio 2026"
              />
            </div>

            <div>
              <Label
                htmlFor="streamUrl"
                className="text-gray-300"
              >
                <Radio className="mr-1 inline h-4 w-4" />
                URL del stream
              </Label>

              <Input
                id="streamUrl"
                type="url"
                value={eventConfig.streamUrl}
                onChange={(event) =>
                  updateEventField(
                    "streamUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://twitch.tv/..."
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-gray-300"
            >
              Descripción
            </Label>

            <Textarea
              id="description"
              value={eventConfig.description}
              onChange={(event) =>
                updateEventField(
                  "description",
                  event.target.value
                )
              }
              className="mt-1.5 min-h-[100px] border-gray-700 bg-gray-800 text-white"
              placeholder="Descripción pública del evento"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label
                htmlFor="startDate"
                className="text-gray-300"
              >
                Fecha de inicio
              </Label>

              <Input
                id="startDate"
                type="date"
                value={eventConfig.startDate}
                onChange={(event) =>
                  updateEventField(
                    "startDate",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label
                htmlFor="endDate"
                className="text-gray-300"
              >
                Fecha de fin
              </Label>

              <Input
                id="endDate"
                type="date"
                value={eventConfig.endDate}
                onChange={(event) =>
                  updateEventField(
                    "endDate",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div>
              <Label
                htmlFor="eventDiscordUrl"
                className="text-gray-300"
              >
                Discord del evento
              </Label>

              <Input
                id="eventDiscordUrl"
                type="url"
                value={eventConfig.discordUrl}
                onChange={(event) =>
                  updateEventField(
                    "discordUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://discord.gg/..."
              />
              </div>
            </div>

                      <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Postulaciones públicas
                  </p>

                  <p className="mt-1 text-sm text-purple-100/80">
                    Controla si los runners pueden enviar nuevas postulaciones desde el formulario público.
                  </p>

                  <div className="mt-3">
                    {eventConfig.applicationsOpen ? (
                      <Badge className="bg-green-500/20 text-green-400">
                        Abiertas
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">
                        Cerradas
                      </Badge>
                    )}
                  </div>
                </div>
                  
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    updateEventField(
                      "applicationsOpen",
                      !eventConfig.applicationsOpen
                    )
                  }
                  className={
                    eventConfig.applicationsOpen
                      ? "border-red-400/50 text-red-300 hover:bg-red-500/10"
                      : "border-green-400/50 text-green-300 hover:bg-green-500/10"
                  }
                >
                  {eventConfig.applicationsOpen
                    ? "Cerrar postulaciones"
                    : "Abrir postulaciones"}
                </Button>
              </div>
            </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-white">
                  Runs públicas
                </p>

                <p className="mt-1 text-sm text-cyan-100/80">
                  Controla si la página /runs muestra las runs aprobadas del
                  evento activo. Útil para limpiar el lineup al cerrar el
                  evento sin borrar historial.
                </p>

                <div className="mt-3">
                  {eventConfig.publicRunsVisible ? (
                    <Badge className="bg-green-500/20 text-green-400">
                      Visibles
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400">
                      Ocultas
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleTogglePublicRunsVisible}
                disabled={savingEvent}
                className={
                  eventConfig.publicRunsVisible
                    ? "border-red-400/50 text-red-300 hover:bg-red-500/10"
                    : "border-green-400/50 text-green-300 hover:bg-green-500/10"
                }
              >
                {eventConfig.publicRunsVisible ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}

                {eventConfig.publicRunsVisible
                  ? "Ocultar runs públicas"
                  : "Mostrar runs públicas"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            El estado de publicación del horario se controla desde{" "}
            <span className="font-semibold">
              Horarios
            </span>
            . Aquí sólo se editan los datos generales del evento.
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveEventConfig}
              disabled={savingEvent}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingEvent
                ? "Guardando..."
                : "Guardar Evento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact and Social Settings */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5 text-purple-400" />
            Contacto y Redes Oficiales
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <p className="font-semibold text-white">
                  Modo mantenimiento
                </p>

                <p className="mt-1 text-sm text-yellow-100/80">
                  Cuando esté activo, el sitio público mostrará una pantalla de
                  mantenimiento. El panel admin seguirá disponible.
                </p>

                <div className="mt-3">
                  {settingsConfig.maintenanceMode ? (
                    <Badge className="bg-red-500/20 text-red-400">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateSettingsField(
                    "maintenanceMode",
                    !settingsConfig.maintenanceMode
                  )
                }
                className={
                  settingsConfig.maintenanceMode
                    ? "border-green-400/50 text-green-300 hover:bg-green-500/10"
                    : "border-red-400/50 text-red-300 hover:bg-red-500/10"
                }
              >
                {settingsConfig.maintenanceMode
                  ? "Desactivar mantenimiento"
                  : "Activar mantenimiento"}
              </Button>
            </div>

            <div className="mt-4">
              <Label
                htmlFor="maintenanceMessage"
                className="text-gray-300"
              >
                Mensaje público
              </Label>

              <Textarea
                id="maintenanceMessage"
                value={settingsConfig.maintenanceMessage}
                onChange={(event) =>
                  updateSettingsField(
                    "maintenanceMessage",
                    event.target.value
                  )
                }
                className="mt-1.5 min-h-[90px] border-gray-700 bg-gray-800 text-white"
                placeholder="Estamos trabajando en mejoras. Vuelve más tarde."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="publicEventName"
                className="text-gray-300"
              >
                Nombre público del evento
              </Label>

              <Input
                id="publicEventName"
                value={settingsConfig.eventName}
                onChange={(event) =>
                  updateSettingsField(
                    "eventName",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="Ej. SGames Julio 2026"
              />
            </div>

            <div>
              <Label
                htmlFor="contactEmail"
                className="text-gray-300"
              >
                <Mail className="mr-1 inline h-4 w-4" />
                Email de contacto
              </Label>

              <Input
                id="contactEmail"
                type="email"
                value={settingsConfig.contactEmail}
                onChange={(event) =>
                  updateSettingsField(
                    "contactEmail",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="twitchUrl"
                className="text-gray-300"
              >
                <Twitch className="mr-1 inline h-4 w-4" />
                Twitch
              </Label>

              <Input
                id="twitchUrl"
                type="url"
                value={settingsConfig.twitchUrl}
                onChange={(event) =>
                  updateSettingsField(
                    "twitchUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://twitch.tv/..."
              />
            </div>

            <div>
              <Label
                htmlFor="youtubeUrl"
                className="text-gray-300"
              >
                <Youtube className="mr-1 inline h-4 w-4" />
                YouTube
              </Label>

              <Input
                id="youtubeUrl"
                type="url"
                value={settingsConfig.youtubeUrl}
                onChange={(event) =>
                  updateSettingsField(
                    "youtubeUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <Label
                htmlFor="discordUrl"
                className="text-gray-300"
              >
                Discord
              </Label>

              <Input
                id="discordUrl"
                type="url"
                value={settingsConfig.discordUrl}
                onChange={(event) =>
                  updateSettingsField(
                    "discordUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://discord.gg/..."
              />
            </div>

            <div>
              <Label
                htmlFor="twitterUrl"
                className="text-gray-300"
              >
                <ExternalLink className="mr-1 inline h-4 w-4" />
                Twitter / X
              </Label>

              <Input
                id="twitterUrl"
                type="url"
                value={settingsConfig.twitterUrl}
                onChange={(event) =>
                  updateSettingsField(
                    "twitterUrl",
                    event.target.value
                  )
                }
                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                placeholder="https://x.com/..."
              />
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-100">
            Estos datos se guardan en la tabla{" "}
            <span className="font-semibold">
              Settings
            </span>
            . Después podemos usarlos para pintar el footer público y enlaces oficiales.
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettingsConfig}
              disabled={savingSettings}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingSettings
                ? "Guardando..."
                : "Guardar Contacto, Redes y Mantenimiento"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}