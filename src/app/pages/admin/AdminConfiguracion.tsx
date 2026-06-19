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
  ShieldCheck,
  Twitch,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import {
  getActiveEvent,
  updateEvent,
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
};

type SettingsConfig = {
  id: number | null;
  eventName: string;
  contactEmail: string;
  twitchUrl: string;
  youtubeUrl: string;
  discordUrl: string;
  twitterUrl: string;
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
    value: string
  ) {
    setEventConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSettingsField(
    field: keyof SettingsConfig,
    value: string
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
        "Contacto y redes guardados"
      );

      await loadConfiguration();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo guardar contacto y redes"
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
      <div className="grid gap-4 md:grid-cols-3">
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
                : "Guardar Contacto y Redes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
