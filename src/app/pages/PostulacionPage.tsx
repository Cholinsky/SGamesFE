import { useState, useEffect } from "react";
import { DateTime } from "luxon";
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
  Globe2,
  Gamepad2,
  Users,
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

type RunForm = {
  id: string;
  game: string;
  category: string;
  hours: string;
  minutes: string;
  seconds: string;
  platform: string;
  aspectRatio: string;
  videoUrl: string;
  runType: string;
  raceRunnerName: string;
  raceEmail: string;
  raceDiscordUser: string;
  raceCountry: string;
  raceVideoUrl: string;
  notes: string;
};

type FormData = {
  runnerName: string;
  email: string;
  discordUser: string;
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

const MEXICO_TIMEZONE = "America/Mexico_City";

const timezoneOptions = [
  {
    value: "America/Mexico_City",
    label: "México Centro",
  },
  {
    value: "America/Tijuana",
    label: "México Pacífico / Tijuana",
  },
  {
    value: "America/New_York",
    label: "Estados Unidos Este",
  },
  {
    value: "America/Chicago",
    label: "Estados Unidos Centro",
  },
  {
    value: "America/Denver",
    label: "Estados Unidos Montaña",
  },
  {
    value: "America/Los_Angeles",
    label: "Estados Unidos Pacífico",
  },
  {
    value: "America/Bogota",
    label: "Colombia / Perú / Ecuador",
  },
  {
    value: "America/Santiago",
    label: "Chile",
  },
  {
    value: "America/Argentina/Buenos_Aires",
    label: "Argentina",
  },
  {
    value: "Europe/Madrid",
    label: "España",
  },
  {
    value: "Europe/London",
    label: "Reino Unido",
  },
  {
    value: "Europe/Paris",
    label: "Francia / Europa Central",
  },
  {
    value: "Asia/Tokyo",
    label: "Japón",
  },
];

function getTimezoneLabel(value: string) {
  return (
    timezoneOptions.find(
      (timezone) =>
        timezone.value === value
    )?.label ?? value
  );
}

function createId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function createEmptyRun(): RunForm {
  return {
    id: createId(),
    game: "",
    category: "",
    hours: "",
    minutes: "",
    seconds: "",
    platform: "",
    aspectRatio: "",
    videoUrl: "",
    runType: "Solo",
    raceRunnerName: "",
    raceEmail: "",
    raceDiscordUser: "",
    raceCountry: "",
    raceVideoUrl: "",
    notes: "",
  };
}

function toApiTime(value: string) {
  return `${value}:00`;
}

function getRunTotalSeconds(run: RunForm) {
  return (
    Number(run.hours || 0) * 3600 +
    Number(run.minutes || 0) * 60 +
    Number(run.seconds || 0)
  );
}

function getRunEstimatedMinutes(run: RunForm) {
  const totalSeconds =
    getRunTotalSeconds(run);

  return Math.ceil(
    totalSeconds / 60
  );
}

function isValidVideoUrl(value: string) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|twitch\.tv)\/.+$/i.test(
    value
  );
}

function convertAvailabilityToMexico(
  availability: Availability,
  runnerTimezone: string
) {
  const localStart =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableFrom}:00`,
      { zone: runnerTimezone }
    );

  const localEnd =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableTo}:00`,
      { zone: runnerTimezone }
    );

  const mexicoStart =
    localStart.setZone(
      MEXICO_TIMEZONE
    );

  const mexicoEnd =
    localEnd.setZone(
      MEXICO_TIMEZONE
    );

  return {
    dayDate:
      mexicoStart.toFormat(
        "yyyy-MM-dd"
      ),
    availableFrom:
      mexicoStart.toFormat(
        "HH:mm:ss"
      ),
    availableToDayDate:
      mexicoEnd.toFormat(
        "yyyy-MM-dd"
      ),
    availableTo:
      mexicoEnd.toFormat(
        "HH:mm:ss"
      ),
    localDayDate:
      availability.dayDate,
    localAvailableFrom:
      toApiTime(
        availability.availableFrom
      ),
    localAvailableTo:
      toApiTime(
        availability.availableTo
      ),
    isPreferred:
      availability.isPreferred,
    notes:
      availability.notes.trim() || null,
  };
}

function isAvailabilityConversionValid(
  availability: Availability,
  runnerTimezone: string
) {
  const localStart =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableFrom}:00`,
      { zone: runnerTimezone }
    );

  const localEnd =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableTo}:00`,
      { zone: runnerTimezone }
    );

  return (
    localStart.isValid &&
    localEnd.isValid
  );
}

function formatConvertedAvailability(
  availability: Availability,
  runnerTimezone: string
) {
  const localStart =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableFrom}:00`,
      { zone: runnerTimezone }
    );

  const localEnd =
    DateTime.fromISO(
      `${availability.dayDate}T${availability.availableTo}:00`,
      { zone: runnerTimezone }
    );

  if (!localStart.isValid ||
      !localEnd.isValid) {
    return "Horario inválido";
  }

  const mexicoStart =
    localStart.setZone(
      MEXICO_TIMEZONE
    );

  const mexicoEnd =
    localEnd.setZone(
      MEXICO_TIMEZONE
    );

  const sameDay =
    mexicoStart.toFormat(
      "yyyy-MM-dd"
    ) ===
    mexicoEnd.toFormat(
      "yyyy-MM-dd"
    );

  if (sameDay) {
    return `${mexicoStart.setLocale(
      "es-MX"
    ).toFormat(
      "cccc d 'de' LLLL"
    )}, ${mexicoStart.toFormat(
      "HH:mm"
    )} - ${mexicoEnd.toFormat(
      "HH:mm"
    )}`;
  }

  return `${mexicoStart.setLocale(
    "es-MX"
  ).toFormat(
    "cccc d 'de' LLLL HH:mm"
  )} - ${mexicoEnd.setLocale(
    "es-MX"
  ).toFormat(
    "cccc d 'de' LLLL HH:mm"
  )}`;
}


const postulacionThemeCss = `
  .sgames-postulation-page {
    background:
      radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--sg-primary) 14%, transparent), transparent 30rem),
      radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--sg-accent) 13%, transparent), transparent 32rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 62%, var(--sg-background) 38%) 0%, var(--sg-background) 46%, var(--sg-background) 100%);
    color: var(--sg-text);
  }

  .sgames-postulation-title {
    background:
      linear-gradient(
        90deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .sgames-postulation-card {
    border: 1px solid var(--sg-border);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--sg-surface) 72%, transparent),
        color-mix(in srgb, var(--sg-background) 84%, transparent)
      );
    box-shadow:
      0 0 35px rgba(15, 23, 42, 0.25);
    backdrop-filter: blur(14px);
  }

  .sgames-postulation-run-card {
    border: 1px solid color-mix(in srgb, var(--sg-primary) 24%, transparent);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--sg-surface) 58%, transparent),
        color-mix(in srgb, var(--sg-background) 76%, transparent)
      );
  }

  .sgames-postulation-input {
    border-color: var(--sg-border) !important;
    background: color-mix(in srgb, var(--sg-background) 82%, #000000 18%) !important;
    color: var(--sg-text) !important;
  }

  .sgames-postulation-input::placeholder {
    color: color-mix(in srgb, var(--sg-muted-text) 52%, transparent);
  }

  .sgames-postulation-select-content {
    border-color: var(--sg-border) !important;
    background: color-mix(in srgb, var(--sg-surface) 88%, #000000 12%) !important;
    color: var(--sg-text) !important;
  }

  .sgames-postulation-muted {
    color: var(--sg-muted-text);
  }

  .sgames-postulation-muted-soft {
    color: color-mix(in srgb, var(--sg-muted-text) 70%, transparent);
  }

  .sgames-postulation-heading {
    color: var(--sg-primary);
  }

  .sgames-postulation-icon-primary {
    color: var(--sg-primary);
  }

  .sgames-postulation-icon-secondary {
    color: var(--sg-secondary);
  }

  .sgames-postulation-icon-accent {
    color: var(--sg-accent);
  }

  .sgames-postulation-info-box {
    border: 1px solid color-mix(in srgb, var(--sg-secondary) 24%, transparent);
    background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
  }

  .sgames-postulation-race-box {
    border: 1px solid color-mix(in srgb, var(--sg-secondary) 32%, transparent);
    background: color-mix(in srgb, var(--sg-secondary) 10%, transparent);
  }

  .sgames-postulation-race-player-box {
    border: 1px solid color-mix(in srgb, var(--sg-primary) 24%, transparent);
    background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
  }

  .sgames-postulation-availability-selected {
    border-color: color-mix(in srgb, var(--sg-primary) 52%, transparent);
    background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
  }

  .sgames-postulation-availability-idle {
    border-color: var(--sg-border);
    background: color-mix(in srgb, var(--sg-surface) 42%, transparent);
  }

  .sgames-postulation-converted-box {
    border: 1px solid color-mix(in srgb, var(--sg-primary) 24%, transparent);
    background: color-mix(in srgb, var(--sg-primary) 10%, transparent);
  }

  .sgames-postulation-social-row {
    border: 1px solid var(--sg-border);
    background: color-mix(in srgb, var(--sg-surface) 50%, transparent);
  }

  .sgames-postulation-primary-button {
    border: 0;
    background:
      linear-gradient(
        90deg,
        var(--sg-primary),
        var(--sg-secondary),
        var(--sg-accent)
      );
    color: #ffffff;
    box-shadow:
      0 0 28px color-mix(in srgb, var(--sg-accent) 26%, transparent);
  }

  .sgames-postulation-primary-button:hover {
    filter: brightness(1.12);
  }

  .sgames-postulation-outline-button {
    border-color: color-mix(in srgb, var(--sg-primary) 46%, transparent) !important;
    background: color-mix(in srgb, var(--sg-primary) 8%, transparent) !important;
    color: var(--sg-primary) !important;
  }

  .sgames-postulation-outline-button:hover {
    border-color: color-mix(in srgb, var(--sg-accent) 58%, transparent) !important;
    background: color-mix(in srgb, var(--sg-accent) 12%, transparent) !important;
    color: var(--sg-accent) !important;
  }

  .sgames-postulation-warning-card {
    border: 1px solid color-mix(in srgb, #facc15 40%, transparent);
    background: color-mix(in srgb, #facc15 10%, transparent);
  }

  [data-season-theme="Winter"] .sgames-postulation-page {
    background:
      radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.16), transparent 30rem),
      radial-gradient(circle at 88% 12%, rgba(59, 130, 246, 0.16), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(196, 181, 253, 0.08), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
  }

  [data-season-theme="Winter"] .sgames-postulation-card,
  [data-season-theme="Winter"] .sgames-postulation-run-card {
    box-shadow:
      0 0 0 1px rgba(103, 232, 249, 0.08),
      0 0 34px rgba(59, 130, 246, 0.14);
  }

  [data-season-theme="Autumn"] .sgames-postulation-page {
    background:
      radial-gradient(circle at 12% 8%, rgba(249, 115, 22, 0.17), transparent 30rem),
      radial-gradient(circle at 88% 12%, rgba(185, 28, 28, 0.14), transparent 32rem),
      radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.08), transparent 34rem),
      linear-gradient(180deg, color-mix(in srgb, var(--sg-surface) 66%, var(--sg-background) 34%) 0%, var(--sg-background) 48%, var(--sg-background) 100%);
  }
`;

export default function PostulacionPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const [socialNetworks, setSocialNetworks] =
    useState<SocialNetwork[]>([]);

  const [catalog, setCatalog] =
    useState<SocialNetworkCatalog[]>([]);

  const [runs, setRuns] =
    useState<RunForm[]>([
      createEmptyRun(),
    ]);

  const [availabilities, setAvailabilities] =
    useState<Availability[]>(eventDays);

  const [runnerTimezone, setRunnerTimezone] =
    useState(MEXICO_TIMEZONE);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  const [loadingEventStatus, setLoadingEventStatus] =
    useState(true);

  const [applicationsOpen, setApplicationsOpen] =
    useState(false);

  const [hasActivePublicEvent, setHasActivePublicEvent] =
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

      if (!activeEvent) {
        setHasActivePublicEvent(false);
        setApplicationsOpen(false);
        return;
      }

      setHasActivePublicEvent(true);
      setApplicationsOpen(
        activeEvent.applicationsOpen ?? false
      );
    } catch (error) {
      console.error(error);

      setHasActivePublicEvent(false);
      setApplicationsOpen(false);
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

  const addRun = () => {
    setRuns((current) => [
      ...current,
      createEmptyRun(),
    ]);
  };

  const removeRun = (
    id: string
  ) => {
    setRuns((current) => {
      if (current.length === 1) {
        toast.error(
          "Debe existir al menos una run"
        );

        return current;
      }

      return current.filter(
        (run) => run.id !== id
      );
    });
  };

  const updateRun = (
    id: string,
    field: keyof RunForm,
    value: string
  ) => {
    setRuns((current) =>
      current.map((run) =>
        run.id === id
          ? {
              ...run,
              [field]: value,
            }
          : run
      )
    );
  };

  const addSocialNetwork = () => {
    setSocialNetworks([
      ...socialNetworks,
      {
        id: createId(),
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

  const resetRuns = () => {
    setRuns([
      createEmptyRun(),
    ]);
  };

  const validateRuns = () => {
    if (!runs.length) {
      toast.error(
        "Agrega al menos una run"
      );

      return false;
    }

    for (let index = 0; index < runs.length; index++) {
      const run =
        runs[index];

      const runNumber =
        index + 1;

      if (!run.game.trim()) {
        toast.error(
          `La run #${runNumber} necesita juego`
        );

        return false;
      }

      if (!run.category.trim()) {
        toast.error(
          `La run #${runNumber} necesita categoría`
        );

        return false;
      }

      if (!run.platform.trim()) {
        toast.error(
          `La run #${runNumber} necesita plataforma`
        );

        return false;
      }

      if (!run.aspectRatio.trim()) {
        toast.error(
          `La run #${runNumber} necesita relación de pantalla`
        );

        return false;
      }

      if (getRunTotalSeconds(run) <= 0) {
        toast.error(
          `La run #${runNumber} necesita un tiempo estimado mayor a 0`
        );

        return false;
      }

      if (!run.videoUrl.trim()) {
        toast.error(
          `La run #${runNumber} necesita video demostrativo del jugador principal`
        );

        return false;
      }

      if (!isValidVideoUrl(
          run.videoUrl.trim()
      )) {
        toast.error(
          `La run #${runNumber} tiene una URL inválida. Usa un video de YouTube o Twitch`
        );

        return false;
      }

      if (run.runType === "Race") {
        if (!run.raceRunnerName.trim()) {
          toast.error(
            `La run #${runNumber} necesita el nombre del jugador 2`
          );

          return false;
        }

        if (!run.raceVideoUrl.trim()) {
          toast.error(
            `La run #${runNumber} necesita el VOD del jugador 2`
          );

          return false;
        }

        if (!isValidVideoUrl(
            run.raceVideoUrl.trim()
        )) {
          toast.error(
            `La run #${runNumber} tiene una URL inválida en el jugador 2. Usa YouTube o Twitch`
          );

          return false;
        }
      }
    }

    return true;
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

      if (!validateRuns()) {
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

      const invalidTimezoneConversion =
        selectedAvailabilities.some(
          (item) =>
            !isAvailabilityConversionValid(
              item,
              runnerTimezone
            )
        );

      if (invalidTimezoneConversion) {
        toast.error(
          "No se pudo convertir correctamente la disponibilidad a México Centro"
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

      const convertedAvailabilities =
        selectedAvailabilities.map((item) =>
          convertAvailabilityToMexico(
            item,
            runnerTimezone
          )
        );

      const applicationRuns =
        runs.map((run) => {
          const participants =
            run.runType === "Race"
              ? [
                  {
                    runnerName:
                      data.runnerName.trim(),

                    email:
                      data.email.trim(),

                    discordUser:
                      data.discordUser?.trim() || null,

                    country:
                      null,

                    videoUrl:
                      run.videoUrl.trim(),
                  },
                  {
                    runnerName:
                      run.raceRunnerName.trim(),

                    email:
                      run.raceEmail.trim() || null,

                    discordUser:
                      run.raceDiscordUser.trim() || null,

                    country:
                      run.raceCountry.trim() || null,

                    videoUrl:
                      run.raceVideoUrl.trim(),
                  },
                ]
              : [];

          return {
            gameName:
              run.game.trim(),

            categoryName:
              run.category.trim(),

            platformName:
              run.platform,

            estimatedTimeMinutes:
              getRunEstimatedMinutes(run),

            aspectRatio:
              run.aspectRatio,

            youtubeUrl:
              run.videoUrl.trim(),

            notes:
              run.notes.trim() || null,

            runType:
              run.runType,

            participants,
          };
        });

      const firstRun =
        applicationRuns[0];

      const payload = {
        runnerName:
          data.runnerName.trim(),

        email:
          data.email.trim(),

        discordUser:
          data.discordUser?.trim() || null,

        runnerTimezone,

        notes:
          combinedNotes || null,

        socialNetworks:
          validSocialNetworks.map((x) => ({
            socialNetworkId:
              x.socialNetworkId,
            url: x.url.trim(),
          })),

        availabilities:
          convertedAvailabilities,

        runs:
          applicationRuns,

        // Compatibilidad con backend anterior
        gameName:
          firstRun.gameName,

        categoryName:
          firstRun.categoryName,

        platformName:
          firstRun.platformName,

        estimatedTimeMinutes:
          firstRun.estimatedTimeMinutes,

        aspectRatio:
          firstRun.aspectRatio,

        youtubeUrl:
          firstRun.youtubeUrl,
      };

      const result =
        await createApplication(payload);

      const totalApplications =
        result?.totalApplications ??
        applicationRuns.length;

      toast.success(
        totalApplications > 1
          ? `¡${totalApplications} postulaciones enviadas con éxito!`
          : "¡Postulación enviada con éxito!"
      );

      setSubmitSuccess(true);

      reset();
      resetRuns();
      setRunnerTimezone(MEXICO_TIMEZONE);
      setSocialNetworks([]);
      resetAvailability();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "No se pudo enviar la postulación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEventStatus) {
    return (
      <div className="sgames-postulation-page min-h-screen py-12">
        <style>{postulacionThemeCss}</style>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="sgames-postulation-card">
              <CardContent className="p-8 text-center text-[var(--sg-muted-text)]">
                Verificando estado de postulaciones...
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!hasActivePublicEvent) {
    return (
      <div className="sgames-postulation-page min-h-screen py-12">
        <style>{postulacionThemeCss}</style>
      </div>
    );
  }

  if (!applicationsOpen) {
    return (
      <div className="sgames-postulation-page min-h-screen py-12">
        <style>{postulacionThemeCss}</style>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Card className="sgames-postulation-warning-card">
              <CardContent className="p-8 text-center">
                <Lock className="mx-auto mb-5 h-14 w-14 text-yellow-300" />

                <h1 className="mb-3 text-3xl font-bold text-[var(--sg-text)]">
                  Postulaciones cerradas
                </h1>

                <p className="mx-auto mb-6 max-w-xl text-[var(--sg-muted-text)]">
                  Las postulaciones para esta edición de SGames ya fueron cerradas.
                  El staff está revisando las propuestas recibidas y preparando el
                  horario oficial.
                </p>

                <Link to="/">
                  <Button
                    variant="outline"
                    className="sgames-postulation-outline-button"
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
    <div className="sgames-postulation-page min-h-screen py-12">
      <style>{postulacionThemeCss}</style>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="sgames-postulation-title mb-4 text-4xl font-bold">
              Enviar Postulación
            </h1>

            <p className="text-[var(--sg-muted-text)]">
              Completa el formulario para postular una o varias runs a SGames
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
                  Revisaremos tus propuestas y te contactaremos pronto.
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="sgames-postulation-card">
            <CardContent className="p-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Información Personal */}
                <div>
                  <h3 className="sgames-postulation-heading mb-4 text-xl font-semibold">
                    Información Personal
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="runnerName"
                        className="text-[var(--sg-muted-text)]"
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
                        className="sgames-postulation-input mt-1.5"
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
                        className="text-[var(--sg-muted-text)]"
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
                        className="sgames-postulation-input mt-1.5"
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
                        className="text-[var(--sg-muted-text)]"
                      >
                        Usuario de Discord
                      </Label>

                      <Input
                        id="discordUser"
                        {...register("discordUser")}
                        className="sgames-postulation-input mt-1.5"
                        placeholder="Ej: Ch0linsky#1234 o ch0linsky"
                      />

                      <p className="sgames-postulation-muted-soft mt-1 text-xs">
                        Opcional. Nos ayuda a contactarte más fácilmente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Runs */}
                <div>
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="sgames-postulation-heading flex items-center gap-2 text-xl font-semibold">
                        <Gamepad2 className="h-5 w-5" />
                        Runs a postular
                      </h3>

                      <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                        Puedes agregar varios juegos. El staff recibirá cada run como una postulación separada.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRun}
                      className="sgames-postulation-outline-button w-fit"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar otra run
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {runs.map((run, index) => (
                      <div
                        key={run.id}
                        className="sgames-postulation-run-card rounded-xl p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                              Run #{index + 1}
                            </p>

                            <h4 className="font-semibold text-[var(--sg-text)]">
                              {run.game.trim()
                                ? run.game
                                : "Nueva run"}
                            </h4>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={runs.length === 1}
                            onClick={() =>
                              removeRun(run.id)
                            }
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Eliminar run"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
                              Formato de run{" "}
                              <span className="text-red-400">
                                *
                              </span>
                            </Label>

                            <Select
                              value={run.runType}
                              onValueChange={(value) =>
                                updateRun(
                                  run.id,
                                  "runType",
                                  value
                                )
                              }
                            >
                              <SelectTrigger className="sgames-postulation-input mt-1.5">
                                <SelectValue placeholder="Selecciona formato" />
                              </SelectTrigger>

                              <SelectContent className="sgames-postulation-select-content">
                                <SelectItem value="Solo">
                                  Individual
                                </SelectItem>

                                <SelectItem value="Race">
                                  Race / Carrera
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <p className="sgames-postulation-muted-soft mt-2 text-sm">
                              En Race, el runner principal será el jugador 1 y podrás agregar el jugador 2.
                            </p>
                          </div>

                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
                              Juego{" "}
                              <span className="text-red-400">
                                *
                              </span>
                            </Label>

                            <Input
                              value={run.game}
                              onChange={(event) =>
                                updateRun(
                                  run.id,
                                  "game",
                                  event.target.value
                                )
                              }
                              className="sgames-postulation-input mt-1.5"
                              placeholder="Nombre del juego"
                            />
                          </div>

                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
                              Categoría{" "}
                              <span className="text-red-400">
                                *
                              </span>
                            </Label>

                            <Input
                              value={run.category}
                              onChange={(event) =>
                                updateRun(
                                  run.id,
                                  "category",
                                  event.target.value
                                )
                              }
                              className="sgames-postulation-input mt-1.5"
                              placeholder="Ej: Any%, 100%, Glitchless"
                            />
                          </div>

                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
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
                                value={run.hours}
                                onChange={(event) =>
                                  updateRun(
                                    run.id,
                                    "hours",
                                    event.target.value
                                  )
                                }
                                className="sgames-postulation-input"
                              />

                              <Input
                                type="number"
                                min="0"
                                max="59"
                                placeholder="MM"
                                value={run.minutes}
                                onChange={(event) =>
                                  updateRun(
                                    run.id,
                                    "minutes",
                                    event.target.value
                                  )
                                }
                                className="sgames-postulation-input"
                              />

                              <Input
                                type="number"
                                min="0"
                                max="59"
                                placeholder="SS"
                                value={run.seconds}
                                onChange={(event) =>
                                  updateRun(
                                    run.id,
                                    "seconds",
                                    event.target.value
                                  )
                                }
                                className="sgames-postulation-input"
                              />
                            </div>

                            <p className="sgames-postulation-muted-soft mt-2 text-sm">
                              Formato HH:MM:SS
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label className="text-[var(--sg-muted-text)]">
                                Plataforma{" "}
                                <span className="text-red-400">
                                  *
                                </span>
                              </Label>

                              <Select
                                value={run.platform}
                                onValueChange={(value) =>
                                  updateRun(
                                    run.id,
                                    "platform",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="sgames-postulation-input mt-1.5">
                                  <SelectValue placeholder="Selecciona plataforma" />
                                </SelectTrigger>

                                <SelectContent className="sgames-postulation-select-content">
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
                            </div>

                            <div>
                              <Label className="text-[var(--sg-muted-text)]">
                                Relación de pantalla{" "}
                                <span className="text-red-400">
                                  *
                                </span>
                              </Label>

                              <Select
                                value={run.aspectRatio}
                                onValueChange={(value) =>
                                  updateRun(
                                    run.id,
                                    "aspectRatio",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="sgames-postulation-input mt-1.5">
                                  <SelectValue placeholder="Selecciona ratio" />
                                </SelectTrigger>

                                <SelectContent className="sgames-postulation-select-content">
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
                            </div>
                          </div>

                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
                              URL de YouTube o Twitch / VOD del jugador principal{" "}
                              <span className="text-red-400">
                                *
                              </span>
                            </Label>

                            <Input
                              value={run.videoUrl}
                              onChange={(event) =>
                                updateRun(
                                  run.id,
                                  "videoUrl",
                                  event.target.value
                                )
                              }
                              className="sgames-postulation-input mt-1.5"
                              placeholder="https://youtube.com/watch?v=... o https://www.twitch.tv/videos/..."
                            />
                          </div>

                          {run.runType === "Race" && (
                            <div className="sgames-postulation-race-box rounded-xl p-4">
                              <div className="mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-[var(--sg-secondary)]" />

                                <div>
                                  <h5 className="font-semibold text-[var(--sg-secondary)]">
                                    Participantes de la Race
                                  </h5>

                                  <p className="text-sm text-[var(--sg-muted-text)]">
                                    El runner principal del formulario será el jugador 1.
                                    Agrega aquí los datos del jugador 2.
                                  </p>
                                </div>
                              </div>

                              <div className="sgames-postulation-race-player-box mb-4 rounded-lg p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                                  Jugador 1
                                </p>

                                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                                  Se usará el nombre, correo y Discord de la sección
                                  Información Personal.
                                </p>

                                <p className="sgames-postulation-muted-soft mt-2 text-xs">
                                  El video principal de esta run será el VOD del jugador 1.
                                </p>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label className="text-[var(--sg-muted-text)]">
                                    Nombre del jugador 2{" "}
                                    <span className="text-red-400">
                                      *
                                    </span>
                                  </Label>

                                  <Input
                                    value={run.raceRunnerName}
                                    onChange={(event) =>
                                      updateRun(
                                        run.id,
                                        "raceRunnerName",
                                        event.target.value
                                      )
                                    }
                                    className="sgames-postulation-input mt-1.5"
                                    placeholder="Alias o nombre del jugador 2"
                                  />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <Label className="text-[var(--sg-muted-text)]">
                                      Correo del jugador 2 (opcional)
                                    </Label>

                                    <Input
                                      type="email"
                                      value={run.raceEmail}
                                      onChange={(event) =>
                                        updateRun(
                                          run.id,
                                          "raceEmail",
                                          event.target.value
                                        )
                                      }
                                      className="sgames-postulation-input mt-1.5"
                                      placeholder="correo@ejemplo.com"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-[var(--sg-muted-text)]">
                                      Discord del jugador 2 (opcional)
                                    </Label>

                                    <Input
                                      value={run.raceDiscordUser}
                                      onChange={(event) =>
                                        updateRun(
                                          run.id,
                                          "raceDiscordUser",
                                          event.target.value
                                        )
                                      }
                                      className="sgames-postulation-input mt-1.5"
                                      placeholder="Ej: runner2#1234 o runner2"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-[var(--sg-muted-text)]">
                                    País del jugador 2 (opcional)
                                  </Label>

                                  <Input
                                    value={run.raceCountry}
                                    onChange={(event) =>
                                      updateRun(
                                        run.id,
                                        "raceCountry",
                                        event.target.value
                                      )
                                    }
                                    className="sgames-postulation-input mt-1.5"
                                    placeholder="País del jugador 2"
                                  />
                                </div>

                                <div>
                                  <Label className="text-[var(--sg-muted-text)]">
                                    VOD del jugador 2{" "}
                                    <span className="text-red-400">
                                      *
                                    </span>
                                  </Label>

                                  <Input
                                    value={run.raceVideoUrl}
                                    onChange={(event) =>
                                      updateRun(
                                        run.id,
                                        "raceVideoUrl",
                                        event.target.value
                                      )
                                    }
                                    className="sgames-postulation-input mt-1.5"
                                    placeholder="https://youtube.com/watch?v=... o https://www.twitch.tv/videos/..."
                                  />

                                  <p className="sgames-postulation-muted-soft mt-2 text-sm">
                                    Sólo se aceptan videos de YouTube o Twitch.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <Label className="text-[var(--sg-muted-text)]">
                              Notas de esta run (opcional)
                            </Label>

                            <Textarea
                              value={run.notes}
                              onChange={(event) =>
                                updateRun(
                                  run.id,
                                  "notes",
                                  event.target.value
                                )
                              }
                              className="sgames-postulation-input mt-1.5 min-h-[90px]"
                              placeholder="Información específica de esta run..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disponibilidad */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-[var(--sg-primary)]" />

                    <h3 className="sgames-postulation-heading text-xl font-semibold">
                      Disponibilidad para el evento
                    </h3>
                  </div>

                  <div className="sgames-postulation-info-box mb-5 rounded-lg p-4">
                    <Label className="flex items-center gap-2 text-[var(--sg-muted-text)]">
                      <Globe2 className="h-4 w-4 text-[var(--sg-secondary)]" />
                      Zona horaria donde estás capturando tu disponibilidad
                    </Label>

                    <Select
                      value={runnerTimezone}
                      onValueChange={setRunnerTimezone}
                    >
                      <SelectTrigger className="sgames-postulation-input mt-1.5">
                        <SelectValue placeholder="Selecciona tu zona horaria" />
                      </SelectTrigger>

                      <SelectContent className="sgames-postulation-select-content">
                        {timezoneOptions.map((timezone) => (
                          <SelectItem
                            key={timezone.value}
                            value={timezone.value}
                          >
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <p className="mt-2 text-sm text-[var(--sg-muted-text)]">
                      Escribe tus horas en tu horario local. El sistema las convertirá
                      automáticamente a México Centro para el staff.
                    </p>
                  </div>

                  <p className="mb-4 text-sm text-[var(--sg-muted-text)]">
                    Selecciona los días en los que puedes correr y el rango
                    de horario aproximado. Actualmente estás capturando en zona:
                    <span className="font-semibold text-[var(--sg-primary)]">
                      {" "}
                      {getTimezoneLabel(runnerTimezone)}
                    </span>
                    .
                  </p>

                  <div className="space-y-4">
                    {availabilities.map((item) => (
                      <div
                        key={item.dayDate}
                        className={`rounded-lg border p-4 transition-colors ${
                          item.selected
                            ? "border-cyan-500/50 bg-cyan-500/10"
                            : "border-[var(--sg-border)] bg-[color-mix(in_srgb,var(--sg-background)_82%,#000000_18%)]/40"
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
                              className="h-4 w-4 accent-[var(--sg-primary)]"
                            />

                            <span className="font-semibold text-[var(--sg-text)]">
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
                                <Label className="text-[var(--sg-muted-text)]">
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
                                  className="sgames-postulation-input mt-1.5"
                                />
                              </div>

                              <div>
                                <Label className="text-[var(--sg-muted-text)]">
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
                                  className="sgames-postulation-input mt-1.5"
                                />
                              </div>
                            </div>

                            <div className="sgames-postulation-converted-box rounded-lg p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                                Convertido a México Centro
                              </p>

                              <p className="mt-1 text-sm text-[var(--sg-text)]">
                                {formatConvertedAvailability(
                                  item,
                                  runnerTimezone
                                )}
                              </p>
                            </div>

                            <div>
                              <Label className="text-[var(--sg-muted-text)]">
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
                                className="sgames-postulation-input mt-1.5"
                                placeholder="Ej. Prefiero correr después de las 6 PM"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redes Sociales */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="sgames-postulation-heading text-xl font-semibold">
                      Redes Sociales
                    </h3>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocialNetwork}
                      className="sgames-postulation-outline-button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Red Social
                    </Button>
                  </div>

                  <p className="mb-4 text-sm text-[var(--sg-muted-text)]">
                    Las redes sociales son opcionales pero recomendadas para que la
                    comunidad pueda conocer tu contenido.
                  </p>

                  {socialNetworks.length === 0 ? (
                    <p className="text-center text-[color-mix(in_srgb,var(--sg-muted-text)_70%,transparent)]">
                      No has agregado ninguna red social
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {socialNetworks.map((sn) => (
                        <div
                          key={sn.id}
                          className="sgames-postulation-social-row flex flex-col gap-3 rounded-lg p-4 sm:flex-row"
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
                              <SelectTrigger className="sgames-postulation-input">
                                <SelectValue placeholder="Tipo de red" />
                              </SelectTrigger>

                              <SelectContent className="sgames-postulation-select-content">
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
                              className="sgames-postulation-input"
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
                    className="text-[var(--sg-muted-text)]"
                  >
                    Notas generales (opcional)
                  </Label>

                  <Textarea
                    id="notes"
                    {...register("notes")}
                    className="sgames-postulation-input mt-1.5 min-h-[100px]"
                    placeholder="Información general que aplique a todas tus runs..."
                  />
                </div>

                {/* Comentarios para organizadores */}
                <div>
                  <h3 className="sgames-postulation-heading mb-4 text-xl font-semibold">
                    Comentarios para Organizadores
                  </h3>

                  <Label
                    htmlFor="organizerComments"
                    className="text-[var(--sg-muted-text)]"
                  >
                    Comentarios (opcional)
                  </Label>

                  <Textarea
                    id="organizerComments"
                    {...register("organizerComments")}
                    className="sgames-postulation-input mt-1.5 min-h-[120px]"
                    placeholder="Información adicional que quieras compartir con el equipo organizador..."
                  />

                  <p className="sgames-postulation-muted-soft mt-2 text-sm">
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
                  className="sgames-postulation-primary-button w-full text-lg"
                >
                  {isSubmitting ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar{" "}
                      {runs.length > 1
                        ? `${runs.length} postulaciones`
                        : "Postulación"}
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