import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link } from "react-router";
import { getActivePublicEvent } from "../services/eventService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  Plus,
  Trash2,
  Send,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Star,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { createApplication } from "../services/applicationService";
import { getSocialNetworks } from "../services/socialNetworkService";

type SocialNetworkCatalog = {
  id: string;
  name: string;
  iconName?: string;
  baseUrl?: string;
};

type SocialNetwork = {
  id: string;
  socialNetworkId: string;
  url: string;
};

type Availability = {
  dayDate: string;
  label: string;
  selected: boolean;
  availableFrom: string;
  availableTo: string;
  isPreferred: boolean;
  notes: string;
};

type FormData = {
  runnerName: string;
  email: string;
  discordUser: string;
  game: string;
  category: string;
  hours: string;
  minutes: string;
  seconds: string;
  platform: string;
  aspectRatio: string;
  videoUrl: string;
  notes?: string;
  organizerComments?: string;
};

const eventDays: Availability[] = [
  {
    dayDate: "2026-07-31",
    label: "Viernes 31 de julio",
    selected: false,
    availableFrom: "10:00",
    availableTo: "23:59",
    isPreferred: false,
    notes: "",
  },
  {
    dayDate: "2026-08-01",
    label: "Sábado 1 de agosto",
    selected: false,
    availableFrom: "10:00",
    availableTo: "23:59",
    isPreferred: false,
    notes: "",
  },
  {
    dayDate: "2026-08-02",
    label: "Domingo 2 de agosto",
    selected: false,
    availableFrom: "10:00",
    availableTo: "23:59",
    isPreferred: false,
    notes: "",
  },
];

const platformOptions = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "PlayStation 2",
  "PlayStation 1",
  "Xbox Series X/S",
  "Xbox One",
  "Xbox 360",
  "Nintendo Switch",
  "Nintendo Wii U",
  "Nintendo Wii",
  "Nintendo 64",
  "GameCube",
  "SNES",
  "NES",
  "Game Boy",
  "Game Boy Advance",
  "Nintendo DS",
  "Nintendo 3DS",
  "Sega Genesis",
  "Dreamcast",
  "Móvil",
  "Otro",
];

const aspectRatioOptions = [
  "16:9",
  "4:3",
  "21:9",
  "Vertical",
];

export default function PostulacionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  const [socialNetworks, setSocialNetworks] =
    useState<SocialNetwork[]>([]);

  const [catalog, setCatalog] =
    useState<SocialNetworkCatalog[]>([]);

  const [availabilities, setAvailabilities] =
    useState<Availability[]>(eventDays);

  const [platform, setPlatform] =
    useState("");

  const [aspectRatio, setAspectRatio] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);
    const [loadingEventStatus, setLoadingEventStatus] =
  useState(true);

const [applicationsOpen, setApplicationsOpen] =
  useState(true);

  useEffect(() => {
  loadInitialData();
}, []);

async function loadInitialData() {
  await loadSocialNetworks();
  await loadActiveEventStatus();
}

async function loadActiveEventStatus() {
  try {
    setLoadingEventStatus(true);

    const activeEvent =
      await getActivePublicEvent();

    setApplicationsOpen(
      activeEvent.applicationsOpen ?? true
    );
  } catch (error) {
    console.error(error);

    setApplicationsOpen(false);

    toast.error(
      "No fue posible validar si las postulaciones están abiertas"
    );
  } finally {
    setLoadingEventStatus(false);
  }
}

  async function loadSocialNetworks() {
    try {
      const data =
        await getSocialNetworks();

      setCatalog(data);
    } catch (error) {
      console.error(error);

      toast.error(
        "No fue posible cargar las redes sociales"
      );
    }
  }

  const addSocialNetwork = () => {
    setSocialNetworks([
      ...socialNetworks,
      {
        id: crypto.randomUUID(),
        socialNetworkId: "",
        url: "",
      },
    ]);
  };

  const removeSocialNetwork = (
    id: string
  ) => {
    setSocialNetworks(
      socialNetworks.filter(
        (sn) => sn.id !== id
      )
    );
  };

  const updateSocialNetwork = (
    id: string,
    field: "socialNetworkId" | "url",
    value: string
  ) => {
    setSocialNetworks(
      socialNetworks.map((sn) =>
        sn.id === id
          ? {
              ...sn,
              [field]: value,
            }
          : sn
      )
    );
  };

  const updateAvailability = (
    dayDate: string,
    field: keyof Availability,
    value: string | boolean
  ) => {
    setAvailabilities((current) =>
      current.map((item) =>
        item.dayDate === dayDate
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const resetAvailability = () => {
    setAvailabilities(eventDays);
  };

  const onSubmit = async (
    data: FormData
  ) => {
    try {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      if (!applicationsOpen) {
        toast.error(
          "Las postulaciones están cerradas"
        );
      
        setIsSubmitting(false);
        return;
      }
      
      const totalSeconds =
        Number(data.hours || 0) * 3600 +
        Number(data.minutes || 0) * 60 +
        Number(data.seconds || 0);

      if (totalSeconds <= 0) {
        toast.error(
          "El tiempo estimado debe ser mayor a 0"
        );

        setIsSubmitting(false);
        return;
      }

      const selectedAvailabilities =
        availabilities.filter(
          (item) => item.selected
        );

      if (selectedAvailabilities.length === 0) {
        toast.error(
          "Selecciona al menos un día disponible para correr"
        );

        setIsSubmitting(false);
        return;
      }

      const invalidAvailability =
        selectedAvailabilities.some(
          (item) =>
            !item.availableFrom ||
            !item.availableTo ||
            item.availableFrom >= item.availableTo
        );

      if (invalidAvailability) {
        toast.error(
          "Revisa tus horarios disponibles. La hora inicial debe ser menor que la hora final"
        );

        setIsSubmitting(false);
        return;
      }

      const validSocialNetworks =
        socialNetworks.filter(
          (x) =>
            x.socialNetworkId.trim() !== "" &&
            x.url.trim() !== ""
        );

      const invalidSocialNetwork =
        socialNetworks.some(
          (x) =>
            (x.socialNetworkId.trim() !== "" &&
              x.url.trim() === "") ||
            (x.socialNetworkId.trim() === "" &&
              x.url.trim() !== "")
        );

      if (invalidSocialNetwork) {
        toast.error(
          "Completa o elimina las redes sociales incompletas"
        );

        setIsSubmitting(false);
        return;
      }

      const combinedNotes =
        [
          data.notes,
          data.organizerComments
            ? `Comentarios para organizadores: ${data.organizerComments}`
            : null,
        ]
          .filter(Boolean)
          .join("\n\n");

      const payload = {
        runnerName: data.runnerName.trim(),
        email: data.email.trim(),
        discordUser:
          data.discordUser?.trim() || null,
        gameName: data.game.trim(),
        categoryName: data.category.trim(),
        platformName: data.platform,
        estimatedTimeMinutes:
          Math.ceil(totalSeconds / 60),
        aspectRatio: data.aspectRatio,
        youtubeUrl: data.videoUrl.trim(),
        notes: combinedNotes || null,
        socialNetworks:
          validSocialNetworks.map((x) => ({
            socialNetworkId:
              x.socialNetworkId,
            url: x.url.trim(),
          })),
        availabilities:
          selectedAvailabilities.map((item) => ({
            dayDate: item.dayDate,
            availableFrom:
              `${item.availableFrom}:00`,
            availableTo:
              `${item.availableTo}:00`,
            isPreferred:
              item.isPreferred,
            notes:
              item.notes.trim() || null,
          })),
      };

      await createApplication(payload);

      toast.success(
        "¡Postulación enviada con éxito!"
      );

      setSubmitSuccess(true);

      reset();

      setPlatform("");
      setAspectRatio("");
      setSocialNetworks([]);
      resetAvailability();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo enviar la postulación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
if (loadingEventStatus) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-8 text-center text-gray-400">
              Verificando estado de postulaciones...
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

if (!applicationsOpen) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-8 text-center">
              <Lock className="mx-auto mb-5 h-14 w-14 text-yellow-300" />

              <h1 className="mb-3 text-3xl font-bold text-white">
                Postulaciones cerradas
              </h1>

              <p className="mx-auto mb-6 max-w-xl text-gray-300">
                Las postulaciones para esta edición de SGames ya fueron cerradas.
                El staff está revisando las propuestas recibidas y preparando el
                horario oficial.
              </p>

              <Link to="/">
                <Button
                  variant="outline"
                  className="border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
                >
                  Volver al inicio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent">
              Enviar Postulación
            </h1>

            <p className="text-gray-400">
              Completa el formulario para postular tu speedrun a SGames
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
              <CheckCircle className="h-6 w-6 text-green-400" />

              <div>
                <p className="font-semibold text-green-400">
                  ¡Postulación enviada con éxito!
                </p>

                <p className="text-sm text-green-400/80">
                  Revisaremos tu solicitud y te contactaremos pronto.
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Información Personal */}
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-cyan-400">
                    Información Personal
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="runnerName"
                        className="text-gray-300"
                      >
                        Nombre del runner{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </Label>

                      <Input
                        id="runnerName"
                        {...register("runnerName", {
                          required:
                            "Este campo es requerido",
                        })}
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                        placeholder="Tu nombre o alias"
                      />

                      {errors.runnerName && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {errors.runnerName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-300"
                      >
                        Correo electrónico{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </Label>

                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required:
                            "Este campo es requerido",
                          pattern: {
                            value:
                              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message:
                              "Correo electrónico inválido",
                          },
                        })}
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                        placeholder="correo@ejemplo.com"
                      />

                      {errors.email && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="discordUser"
                        className="text-gray-300"
                      >
                        Usuario de Discord
                      </Label>

                      <Input
                        id="discordUser"
                        {...register("discordUser")}
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                        placeholder="Ej: Ch0linsky#1234 o ch0linsky"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Opcional. Nos ayuda a contactarte más fácilmente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Speedrun */}
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-cyan-400">
                    Información del Speedrun
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="game"
                        className="text-gray-300"
                      >
                        Juego{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </Label>

                      <Input
                        id="game"
                        {...register("game", {
                          required:
                            "Este campo es requerido",
                        })}
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                        placeholder="Nombre del juego"
                      />

                      {errors.game && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {errors.game.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="category"
                        className="text-gray-300"
                      >
                        Categoría{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </Label>

                      <Input
                        id="category"
                        {...register("category", {
                          required:
                            "Este campo es requerido",
                        })}
                        className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                        placeholder="Ej: Any%, 100%, Glitchless"
                      />

                      {errors.category && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-300">
                        Tiempo estimado{" "}
                        <span className="text-red-400">
                          *
                        </span>
                      </Label>

                      <div className="mt-1.5 grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          placeholder="HH"
                          className="border-gray-700 bg-gray-800 text-white"
                          {...register("hours", {
                            required:
                              "Horas requeridas",
                          })}
                        />

                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          className="border-gray-700 bg-gray-800 text-white"
                          {...register("minutes", {
                            required:
                              "Minutos requeridos",
                          })}
                        />

                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="SS"
                          className="border-gray-700 bg-gray-800 text-white"
                          {...register("seconds", {
                            required:
                              "Segundos requeridos",
                          })}
                        />
                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        Formato HH:MM:SS
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="platform"
                          className="text-gray-300"
                        >
                          Plataforma{" "}
                          <span className="text-red-400">
                            *
                          </span>
                        </Label>

                        <Select
                          value={platform}
                          onValueChange={(value) => {
                            setPlatform(value);
                            setValue(
                              "platform",
                              value,
                              {
                                shouldValidate: true,
                              }
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1.5 border-gray-700 bg-gray-800 text-white">
                            <SelectValue placeholder="Selecciona plataforma" />
                          </SelectTrigger>

                          <SelectContent className="border-gray-700 bg-gray-800">
                            {platformOptions.map(
                              (option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>

                        <input
                          type="hidden"
                          {...register("platform", {
                            required:
                              "Este campo es requerido",
                          })}
                        />

                        {errors.platform && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            {errors.platform.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="aspectRatio"
                          className="text-gray-300"
                        >
                          Relación de pantalla{" "}
                          <span className="text-red-400">
                            *
                          </span>
                        </Label>

                        <Select
                          value={aspectRatio}
                          onValueChange={(value) => {
                            setAspectRatio(value);
                            setValue(
                              "aspectRatio",
                              value,
                              {
                                shouldValidate: true,
                              }
                            );
                          }}
                        >
                          <SelectTrigger className="mt-1.5 border-gray-700 bg-gray-800 text-white">
                            <SelectValue placeholder="Selecciona ratio" />
                          </SelectTrigger>

                          <SelectContent className="border-gray-700 bg-gray-800">
                            {aspectRatioOptions.map(
                              (option) => (
                                <SelectItem
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>

                        <input
                          type="hidden"
                          {...register("aspectRatio", {
                            required:
                              "Este campo es requerido",
                          })}
                        />

                        {errors.aspectRatio && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            {errors.aspectRatio.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disponibilidad */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-cyan-400" />

                    <h3 className="text-xl font-semibold text-cyan-400">
                      Disponibilidad para el evento
                    </h3>
                  </div>

                  <p className="mb-4 text-sm text-gray-400">
                    Selecciona los días en los que puedes correr y el rango
                    de horario aproximado. Esto ayuda al staff a organizar
                    mejor el horario.
                  </p>

                  <div className="space-y-4">
                    {availabilities.map((item) => (
                      <div
                        key={item.dayDate}
                        className={`rounded-lg border p-4 transition-colors ${
                          item.selected
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-gray-800 bg-gray-800/40"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(event) =>
                                updateAvailability(
                                  item.dayDate,
                                  "selected",
                                  event.target.checked
                                )
                              }
                              className="h-4 w-4 accent-cyan-500"
                            />

                            <span className="font-semibold text-white">
                              {item.label}
                            </span>
                          </label>

                          {item.selected && (
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-yellow-300">
                              <input
                                type="checkbox"
                                checked={item.isPreferred}
                                onChange={(event) =>
                                  updateAvailability(
                                    item.dayDate,
                                    "isPreferred",
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4 accent-yellow-400"
                              />

                              <Star className="h-4 w-4" />
                              Día preferido
                            </label>
                          )}
                        </div>

                        {item.selected && (
                          <div className="mt-4 space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-gray-300">
                                  Disponible desde
                                </Label>

                                <Input
                                  type="time"
                                  value={item.availableFrom}
                                  onChange={(event) =>
                                    updateAvailability(
                                      item.dayDate,
                                      "availableFrom",
                                      event.target.value
                                    )
                                  }
                                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                                />
                              </div>

                              <div>
                                <Label className="text-gray-300">
                                  Disponible hasta
                                </Label>

                                <Input
                                  type="time"
                                  value={item.availableTo}
                                  onChange={(event) =>
                                    updateAvailability(
                                      item.dayDate,
                                      "availableTo",
                                      event.target.value
                                    )
                                  }
                                  className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-300">
                                Nota para este día (opcional)
                              </Label>

                              <Input
                                value={item.notes}
                                onChange={(event) =>
                                  updateAvailability(
                                    item.dayDate,
                                    "notes",
                                    event.target.value
                                  )
                                }
                                className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                                placeholder="Ej. Prefiero correr después de las 6 PM"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Demostrativo */}
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-cyan-400">
                    Video Demostrativo
                  </h3>

                  <div>
                    <Label
                      htmlFor="videoUrl"
                      className="text-gray-300"
                    >
                      URL de YouTube{" "}
                      <span className="text-red-400">
                        *
                      </span>
                    </Label>

                    <Input
                      id="videoUrl"
                      {...register("videoUrl", {
                        required:
                          "Este campo es requerido",
                        pattern: {
                          value:
                            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                          message:
                            "URL de YouTube inválida",
                        },
                      })}
                      className="mt-1.5 border-gray-700 bg-gray-800 text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />

                    {errors.videoUrl && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {errors.videoUrl.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Redes Sociales */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-cyan-400">
                      Redes Sociales
                    </h3>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialNetwork}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Red Social
                    </Button>
                  </div>

                  <p className="mb-4 text-sm text-gray-400">
                    Las redes sociales son opcionales pero recomendadas para que la
                    comunidad pueda conocer tu contenido.
                  </p>

                  {socialNetworks.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No has agregado ninguna red social
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {socialNetworks.map((sn) => (
                        <div
                          key={sn.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4 sm:flex-row"
                        >
                          <div className="flex-1">
                            <Select
                              value={sn.socialNetworkId}
                              onValueChange={(value) =>
                                updateSocialNetwork(
                                  sn.id,
                                  "socialNetworkId",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                                <SelectValue placeholder="Tipo de red" />
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
                              value={sn.url}
                              onChange={(event) =>
                                updateSocialNetwork(
                                  sn.id,
                                  "url",
                                  event.target.value
                                )
                              }
                              className="border-gray-700 bg-gray-800 text-white"
                              placeholder="https://..."
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeSocialNetwork(sn.id)
                            }
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notas adicionales */}
                <div>
                  <Label
                    htmlFor="notes"
                    className="text-gray-300"
                  >
                    Notas adicionales (opcional)
                  </Label>

                  <Textarea
                    id="notes"
                    {...register("notes")}
                    className="mt-1.5 min-h-[100px] border-gray-700 bg-gray-800 text-white"
                    placeholder="Información adicional que quieras compartir..."
                  />
                </div>

                {/* Comentarios para organizadores */}
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-cyan-400">
                    Comentarios para Organizadores
                  </h3>

                  <Label
                    htmlFor="organizerComments"
                    className="text-gray-300"
                  >
                    Comentarios (opcional)
                  </Label>

                  <Textarea
                    id="organizerComments"
                    {...register("organizerComments")}
                    className="mt-1.5 min-h-[120px] border-gray-700 bg-gray-800 text-white"
                    placeholder="Información adicional que quieras compartir con el equipo organizador..."
                  />

                  <p className="mt-2 text-sm text-gray-500">
                    Usa este espacio para compartir información relevante para el equipo
                    organizador, como restricciones de horario, necesidades especiales, o
                    cualquier detalle técnico importante.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-lg hover:from-cyan-600 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Postulación
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
