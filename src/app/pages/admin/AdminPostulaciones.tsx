import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  getScheduleDays,
  createScheduleEntry,
} from "../../services/scheduleService";
import {
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  deleteApplication,
  getRunnerApplicationHistory,
  createApplicationFromHistory,
  type AdminRunnerHistory,
} from "../../services/applicationService";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  CalendarDays,
  Clock3,
  Star,
  Trash2,
  Globe2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminSeasonTheme } from "../../hooks/useAdminSeasonTheme";

type ScheduleDay = {
  id: string;
  event: string;
  dayDate: string;
};

type Postulacion = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  status: string;
  runType?: string | null;
  estimatedTimeMinutes?: number | null;
  estimatedTime?: string | null;
  submittedAt: string;
};

type SocialNetworkDetail = {
  socialNetworkId: string;
  name: string;
  url: string;
};

type AvailabilityDetail = {
  id: string;
  dayDate: string;
  availableFrom: string;
  availableToDayDate?: string | null;
  availableTo: string;
  localDayDate?: string | null;
  localAvailableFrom?: string | null;
  localAvailableTo?: string | null;
  isPreferred: boolean;
  notes?: string | null;
};

type ApplicationParticipantDetail = {
  id: string;
  runnerName: string;
  email?: string | null;
  discordUser?: string | null;
  country?: string | null;
  videoUrl: string;
  sortOrder: number;
};

type ApplicationDetail = {
  id: string;
  runnerName: string;
  email: string;
  discordUser: string;
  country: string;
  runnerTimezone?: string | null;
  game: string;
  category: string;
  platform: string;
  runType?: string | null;
  estimatedTimeMinutes: number;
  aspectRatio: string;
  youtubeUrl: string;
  notes: string;
  status: string;
  priority: string;
  event: string;
  submittedAt: string;
  socialNetworks: SocialNetworkDetail[];
  availabilities: AvailabilityDetail[];
  participants?: ApplicationParticipantDetail[];
};

type PostulacionesPanel =
  | "recibidas"
  | "historial";

type CreateFromHistoryForm = {
  status: "Pending" | "Approved";
  estimatedTimeMinutes: string;
  youtubeUrl: string;
  aspectRatio: string;
  notes: string;
};

function parseLocalDate(dayDate: string) {
  const cleanDate =
    dayDate.split("T")[0];

  const [year, month, day] =
    cleanDate.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatScheduleDate(dayDate: string) {
  const date =
    parseLocalDate(dayDate);

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatSubmittedDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(
    "es-MX",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatEstimatedTime(totalMinutes: number) {
  const hours =
    Math.floor(totalMinutes / 60);

  const minutes =
    totalMinutes % 60;

  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
}

function getEstimatedDisplay(
  postulacion: Postulacion
) {
  if (
    typeof postulacion.estimatedTimeMinutes === "number" &&
    postulacion.estimatedTimeMinutes > 0
  ) {
    return formatEstimatedTime(
      postulacion.estimatedTimeMinutes
    );
  }

  if (postulacion.estimatedTime) {
    return postulacion.estimatedTime;
  }

  return "--:--:--";
}

function getRunTypeLabel(
  runType?: string | null
) {
  return runType === "Race"
    ? "Race"
    : "Individual";
}

function getRunTypeBadge(
  runType?: string | null
) {
  if (runType === "Race") {
    return (
      <Badge className="bg-[var(--sg-admin-accent-soft)] text-[var(--sg-accent)]">
        Race
      </Badge>
    );
  }

  return (
    <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
      Individual
    </Badge>
  );
}

function formatTimeValue(value: string) {
  if (!value) {
    return "--:--";
  }

  return value.substring(0, 5);
}

const timezoneOptions = [
  { value: "America/Mexico_City", label: "México Centro" },
  { value: "America/Tijuana", label: "México Pacífico / Tijuana" },
  { value: "America/New_York", label: "Estados Unidos Este" },
  { value: "America/Chicago", label: "Estados Unidos Centro" },
  { value: "America/Denver", label: "Estados Unidos Montaña" },
  { value: "America/Los_Angeles", label: "Estados Unidos Pacífico" },
  { value: "America/Bogota", label: "Colombia / Perú / Ecuador" },
  { value: "America/Santiago", label: "Chile" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina" },
  { value: "Europe/Madrid", label: "España" },
  { value: "Europe/London", label: "Reino Unido" },
  { value: "Europe/Paris", label: "Francia / Europa Central" },
  { value: "Asia/Tokyo", label: "Japón" },
];

function getTimezoneLabel(
  value?: string | null
) {
  if (!value) {
    return "México Centro";
  }

  return (
    timezoneOptions.find(
      (timezone) =>
        timezone.value === value
    )?.label ?? value
  );
}

function sameDate(
  left?: string | null,
  right?: string | null
) {
  if (!left || !right) {
    return true;
  }

  return left.split("T")[0] ===
    right.split("T")[0];
}

function formatAvailabilityRange(
  dayDate?: string | null,
  availableFrom?: string | null,
  availableToDayDate?: string | null,
  availableTo?: string | null
) {
  if (!dayDate) {
    return "Sin fecha";
  }

  const startLabel =
    formatScheduleDate(dayDate);

  const startTime =
    formatTimeValue(
      availableFrom ?? ""
    );

  const endDate =
    availableToDayDate ?? dayDate;

  const endTime =
    formatTimeValue(
      availableTo ?? ""
    );

  if (sameDate(dayDate, endDate)) {
    return `${startLabel}, ${startTime} - ${endTime}`;
  }

  return `${startLabel}, ${startTime} → ${formatScheduleDate(endDate)}, ${endTime}`;
}

export default function AdminPostulaciones() {
  useAdminSeasonTheme();
  const [scheduleDays, setScheduleDays] =
    useState<ScheduleDay[]>([]);

  const [scheduleDialogOpen, setScheduleDialogOpen] =
    useState(false);

  const [scheduleApplication, setScheduleApplication] =
    useState<ApplicationDetail | null>(null);

  const [selectedScheduleDayId, setSelectedScheduleDayId] =
    useState("");

  const [scheduleStartTime, setScheduleStartTime] =
    useState("");

  const [postulaciones, setPostulaciones] =
    useState<Postulacion[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("todos");

  const [platformFilter, setPlatformFilter] =
    useState("todos");

  const [selectedPostulacion, setSelectedPostulacion] =
    useState<ApplicationDetail | null>(null);

  const [detailDialogOpen, setDetailDialogOpen] =
    useState(false);

  const [deletingApplicationId, setDeletingApplicationId] =
    useState<string | null>(null);

  const [activePanel, setActivePanel] =
    useState<PostulacionesPanel>("recibidas");

  const [runnerHistory, setRunnerHistory] =
    useState<AdminRunnerHistory[]>([]);

  const [runnerHistoryLoading, setRunnerHistoryLoading] =
    useState(false);

  const [runnerHistorySearch, setRunnerHistorySearch] =
    useState("");

  const [selectedHistoryRunnerKey, setSelectedHistoryRunnerKey] =
    useState("");

  const [selectedHistoryApplicationId, setSelectedHistoryApplicationId] =
    useState("");

  const [creatingFromHistory, setCreatingFromHistory] =
    useState(false);

  const [historyForm, setHistoryForm] =
    useState<CreateFromHistoryForm>({
      status: "Pending",
      estimatedTimeMinutes: "",
      youtubeUrl: "",
      aspectRatio: "",
      notes: "",
    });

  useEffect(() => {
    loadApplications();
    loadRunnerHistory();
  }, []);

  async function loadApplications() {
    try {
      const data =
        await getApplications();

      setPostulaciones(data);
    } catch {
      toast.error(
        "No se pudieron cargar las postulaciones"
      );
    }
  }

  async function loadRunnerHistory() {
    try {
      setRunnerHistoryLoading(true);

      const data =
        await getRunnerApplicationHistory();

      setRunnerHistory(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo cargar el historial de runners"
      );
    } finally {
      setRunnerHistoryLoading(false);
    }
  }

  function updateHistoryForm(
    field: keyof CreateFromHistoryForm,
    value: string
  ) {
    setHistoryForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetHistoryForm() {
    setHistoryForm({
      status: "Pending",
      estimatedTimeMinutes: "",
      youtubeUrl: "",
      aspectRatio: "",
      notes: "",
    });
  }

  function handleSelectHistoryRunner(
    runnerKey: string
  ) {
    setSelectedHistoryRunnerKey(
      runnerKey
    );

    setSelectedHistoryApplicationId(
      ""
    );

    resetHistoryForm();
  }

  function handleSelectHistoryRun(
    applicationId: string
  ) {
    setSelectedHistoryApplicationId(
      applicationId
    );

    const selectedRunner =
      runnerHistory.find(
        (runner) =>
          runner.runnerKey ===
          selectedHistoryRunnerKey
      );

    const selectedRun =
      selectedRunner?.runs.find(
        (run) =>
          run.applicationId ===
          applicationId
      );

    if (!selectedRun) {
      resetHistoryForm();
      return;
    }

    setHistoryForm({
      status: "Pending",
      estimatedTimeMinutes:
        String(
          selectedRun.estimatedTimeMinutes ??
          ""
        ),
      youtubeUrl:
        selectedRun.youtubeUrl ?? "",
      aspectRatio:
        selectedRun.aspectRatio ?? "",
      notes: "",
    });
  }

  async function handleCreateFromHistory() {
    const selectedRun =
      selectedHistoryRun;

    if (!selectedRun) {
      toast.error(
        "Selecciona una run del historial"
      );
      return;
    }

    const estimatedMinutes =
      Number(
        historyForm.estimatedTimeMinutes
      );

    if (
      !Number.isFinite(
        estimatedMinutes
      ) ||
      estimatedMinutes <= 0
    ) {
      toast.error(
        "El tiempo estimado debe ser mayor a 0"
      );
      return;
    }

    if (
      selectedRun.runType !== "Race" &&
      !historyForm.youtubeUrl.trim()
    ) {
      toast.error(
        "La postulación necesita video demostrativo"
      );
      return;
    }

    try {
      setCreatingFromHistory(true);

      await createApplicationFromHistory({
        sourceApplicationId:
          selectedRun.applicationId,
        status:
          historyForm.status,
        estimatedTimeMinutes:
          estimatedMinutes,
        youtubeUrl:
          historyForm.youtubeUrl.trim() ||
          null,
        aspectRatio:
          historyForm.aspectRatio.trim() ||
          null,
        notes:
          historyForm.notes.trim() ||
          null,
      });

      toast.success(
        historyForm.status === "Approved"
          ? "Postulación creada y aprobada"
          : "Postulación creada como pendiente"
      );

      await Promise.all([
        loadApplications(),
        loadRunnerHistory(),
      ]);

      setActivePanel(
        "recibidas"
      );

      setSelectedHistoryRunnerKey(
        ""
      );

      setSelectedHistoryApplicationId(
        ""
      );

      resetHistoryForm();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo crear la postulación"
      );
    } finally {
      setCreatingFromHistory(false);
    }
  }

  const filteredPostulaciones =
    postulaciones.filter((p) => {
      const matchesSearch =
        p.runnerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.game
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.category
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" ||
        p.status === statusFilter;

      const matchesPlatform =
        platformFilter === "todos" ||
        p.platform === platformFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlatform
      );
    });

  const filteredRunnerHistory =
    runnerHistory.filter((runner) => {
      const term =
        runnerHistorySearch.trim().toLowerCase();

      if (!term) {
        return true;
      }

      const haystack =
        [
          runner.runnerName,
          runner.email ?? "",
          runner.discordUser ?? "",
          runner.country ?? "",
          ...runner.runs.map((run) =>
            `${run.game} ${run.category} ${run.platform}`
          ),
        ]
          .join(" ")
          .toLowerCase();

      return haystack.includes(term);
    });

  const selectedHistoryRunner =
    runnerHistory.find(
      (runner) =>
        runner.runnerKey === selectedHistoryRunnerKey
    ) ?? null;

  const selectedHistoryRun =
    selectedHistoryRunner?.runs.find(
      (run) =>
        run.applicationId === selectedHistoryApplicationId
    ) ?? null;

  const handleStatusChange = async (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      if (newStatus === "approved") {
        await approveApplication(id);
      } else {
        await rejectApplication(id);
      }

      await loadApplications();

      toast.success(
        `Postulación ${
          newStatus === "approved"
            ? "aprobada"
            : "rechazada"
        }`
      );
    } catch {
      toast.error(
        "No se pudo actualizar"
      );
    }
  };

  const handleDeleteApplication = async (
    postulacion: Postulacion
  ) => {
    const confirmDelete =
      window.confirm(
        `¿Seguro que quieres eliminar la postulación de ${postulacion.runnerName}?\n\nEsta acción eliminará la postulación sin importar su estado. También puede eliminar sus redes sociales, notas, disponibilidad y entradas relacionadas en el horario.`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingApplicationId(
        postulacion.id
      );

      await deleteApplication(
        postulacion.id
      );

      await loadApplications();

      if (
        selectedPostulacion?.id ===
        postulacion.id
      ) {
        setSelectedPostulacion(null);
        setDetailDialogOpen(false);
      }

      if (
        scheduleApplication?.id ===
        postulacion.id
      ) {
        setScheduleApplication(null);
        setScheduleDialogOpen(false);
        setSelectedScheduleDayId("");
        setScheduleStartTime("");
      }

      toast.success(
        "Postulación eliminada correctamente"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo eliminar la postulación"
      );
    } finally {
      setDeletingApplicationId(null);
    }
  };

  const handleViewDetail = async (
    postulacion: Postulacion
  ) => {
    try {
      const detail =
        await getApplicationById(
          postulacion.id
        );

      setSelectedPostulacion(detail);
      setDetailDialogOpen(true);
    } catch {
      toast.error(
        "No se pudo cargar el detalle"
      );
    }
  };

  const handleOpenScheduleDialog = async (
    postulacion: Postulacion
  ) => {
    try {
      const detail =
        await getApplicationById(
          postulacion.id
        );

      const days =
        await getScheduleDays();

      setScheduleApplication(detail);
      setScheduleDays(days);
      setSelectedScheduleDayId("");
      setScheduleStartTime("");
      setScheduleDialogOpen(true);
    } catch {
      toast.error(
        "No se pudo abrir el programador"
      );
    }
  };

  const handleAddToSchedule = async () => {
    if (!scheduleApplication) {
      return;
    }

    if (
      !selectedScheduleDayId ||
      !scheduleStartTime
    ) {
      toast.error(
        "Selecciona un día y una hora de inicio"
      );
      return;
    }

    try {
      await createScheduleEntry({
        scheduleDayId: selectedScheduleDayId,
        applicationId: scheduleApplication.id,
        entryType: "Run",
        startTime: `${scheduleStartTime}:00`,
        durationMinutes:
          scheduleApplication.estimatedTimeMinutes,
        positionOrder: 999,
      });

      toast.success(
        "Run agregado al horario"
      );

      setScheduleDialogOpen(false);
      setScheduleApplication(null);
      setSelectedScheduleDayId("");
      setScheduleStartTime("");
    } catch {
      toast.error(
        "No se pudo agregar al horario"
      );
    }
  };

  const getStatusBadge = (
    status: string
  ) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">
            Pendiente
          </Badge>
        );

      case "Approved":
        return (
          <Badge className="bg-green-500/20 text-green-400">
            Aprobada
          </Badge>
        );

      case "Rejected":
        return (
          <Badge className="bg-red-500/20 text-red-400">
            Rechazada
          </Badge>
        );

      default:
        return null;
    }
  };

  const platforms =
    Array.from(
      new Set(
        postulaciones
          .map((p) => p.platform)
          .filter(Boolean)
      )
    ).sort();

  return (
    <div className="sgames-admin-page space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--sg-text)]">
            Gestión de Postulaciones
          </h1>

          <p className="text-[var(--sg-muted-text)]">
            Administra las postulaciones recibidas y crea nuevas desde el historial de runners.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() =>
              setActivePanel("recibidas")
            }
            className={
              activePanel === "recibidas"
                ? "sgames-admin-primary-button"
                : "border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] text-[var(--sg-muted-text)] hover:bg-[var(--sg-admin-hover-bg)]"
            }
          >
            Postulaciones recibidas
          </Button>

          <Button
            type="button"
            onClick={() =>
              setActivePanel("historial")
            }
            className={
              activePanel === "historial"
                ? "sgames-admin-primary-button"
                : "border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] text-[var(--sg-muted-text)] hover:bg-[var(--sg-admin-hover-bg)]"
            }
          >
            Postular runner existente
          </Button>
        </div>
      </div>

      {activePanel === "historial" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] backdrop-blur-sm">
            <CardContent className="space-y-4 p-6">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--sg-text)]">
                  <Users className="h-5 w-5 text-[var(--sg-primary)]" />
                  Runners con historial
                </h2>

                <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                  Selecciona un runner para ver los juegos que ya presentó.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sg-admin-muted-soft)]" />

                <Input
                  placeholder="Buscar runner, correo o juego..."
                  value={runnerHistorySearch}
                  onChange={(event) =>
                    setRunnerHistorySearch(event.target.value)
                  }
                  className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] pl-10 text-[var(--sg-text)]"
                />
              </div>

              <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {runnerHistoryLoading ? (
                  <p className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4 text-sm text-[var(--sg-muted-text)]">
                    Cargando historial...
                  </p>
                ) : filteredRunnerHistory.length === 0 ? (
                  <p className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4 text-sm text-[var(--sg-muted-text)]">
                    No hay runners con postulaciones previas.
                  </p>
                ) : (
                  filteredRunnerHistory.map((runner) => (
                    <button
                      key={runner.runnerKey}
                      type="button"
                      onClick={() =>
                        handleSelectHistoryRunner(runner.runnerKey)
                      }
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedHistoryRunnerKey === runner.runnerKey
                          ? "border-[var(--sg-primary)] bg-[var(--sg-admin-primary-soft)]"
                          : "border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] hover:bg-[var(--sg-admin-hover-bg)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--sg-text)]">
                            {runner.runnerName}
                          </p>

                          <p className="truncate text-xs text-[var(--sg-muted-text)]">
                            {runner.email || "Sin correo registrado"}
                          </p>
                        </div>

                        <Badge className="shrink-0 bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                          {runner.totalRuns} runs
                        </Badge>
                      </div>

                      <p className="mt-2 text-xs text-[var(--sg-muted-text)]">
                        Última postulación: {formatSubmittedDate(runner.lastSubmittedAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] backdrop-blur-sm">
            <CardContent className="space-y-5 p-6">
              {!selectedHistoryRunner ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-8 text-center">
                  <div>
                    <CalendarDays className="mx-auto mb-3 h-10 w-10 text-[var(--sg-primary)]" />

                    <h2 className="text-xl font-bold text-[var(--sg-text)]">
                      Selecciona un runner
                    </h2>

                    <p className="mt-2 max-w-md text-sm text-[var(--sg-muted-text)]">
                      Aquí podrás elegir una run previa y crear una nueva postulación para el evento activo.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--sg-text)]">
                      {selectedHistoryRunner.runnerName}
                    </h2>

                    <p className="text-sm text-[var(--sg-muted-text)]">
                      {selectedHistoryRunner.email || "Sin correo"} · {selectedHistoryRunner.country || "Sin país"}
                    </p>
                  </div>

                  <div>
                    <Label className="text-[var(--sg-muted-text)]">
                      Juego / categoría presentada
                    </Label>

                    <Select
                      value={selectedHistoryApplicationId}
                      onValueChange={handleSelectHistoryRun}
                    >
                      <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                        <SelectValue placeholder="Selecciona una run previa" />
                      </SelectTrigger>

                      <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                        {selectedHistoryRunner.runs.map((run) => (
                          <SelectItem
                            key={run.applicationId}
                            value={run.applicationId}
                          >
                            {run.game} · {run.category} · {run.platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedHistoryRun && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--sg-muted-text)]">
                            Juego base
                          </p>

                          <p className="mt-2 font-semibold text-[var(--sg-text)]">
                            {selectedHistoryRun.game}
                          </p>

                          <p className="text-sm text-[var(--sg-muted-text)]">
                            {selectedHistoryRun.category} · {selectedHistoryRun.platform}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--sg-muted-text)]">
                            Origen
                          </p>

                          <p className="mt-2 font-semibold text-[var(--sg-text)]">
                            {selectedHistoryRun.event}
                          </p>

                          <p className="text-sm text-[var(--sg-muted-text)]">
                            {formatSubmittedDate(selectedHistoryRun.submittedAt)} · {getRunTypeLabel(selectedHistoryRun.runType)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-[var(--sg-muted-text)]">
                            Estado inicial
                          </Label>

                          <Select
                            value={historyForm.status}
                            onValueChange={(value) =>
                              updateHistoryForm(
                                "status",
                                value as "Pending" | "Approved"
                              )
                            }
                          >
                            <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                              <SelectItem value="Pending">
                                Pendiente
                              </SelectItem>

                              <SelectItem value="Approved">
                                Aprobada
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-[var(--sg-muted-text)]">
                            Tiempo estimado en minutos
                          </Label>

                          <Input
                            type="number"
                            min={1}
                            value={historyForm.estimatedTimeMinutes}
                            onChange={(event) =>
                              updateHistoryForm(
                                "estimatedTimeMinutes",
                                event.target.value
                              )
                            }
                            className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                          />
                        </div>

                        <div>
                          <Label className="text-[var(--sg-muted-text)]">
                            Relación de pantalla
                          </Label>

                          <Input
                            value={historyForm.aspectRatio}
                            onChange={(event) =>
                              updateHistoryForm(
                                "aspectRatio",
                                event.target.value
                              )
                            }
                            placeholder="16:9, 4:3, etc."
                            className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                          />
                        </div>

                        <div>
                          <Label className="text-[var(--sg-muted-text)]">
                            Video demostrativo
                          </Label>

                          <Input
                            value={historyForm.youtubeUrl}
                            onChange={(event) =>
                              updateHistoryForm(
                                "youtubeUrl",
                                event.target.value
                              )
                            }
                            placeholder="YouTube o Twitch"
                            className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[var(--sg-muted-text)]">
                          Notas para esta nueva postulación
                        </Label>

                        <textarea
                          value={historyForm.notes}
                          onChange={(event) =>
                            updateHistoryForm(
                              "notes",
                              event.target.value
                            )
                          }
                          rows={4}
                          placeholder="Opcional. Si se deja vacío se conservan las notas anteriores."
                          className="mt-1.5 w-full rounded-md border border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] px-3 py-2 text-sm text-[var(--sg-text)] outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                        Esta acción crea una nueva postulación para el evento activo usando el runner, juego, categoría, plataforma, participantes y redes de la postulación base. No copia disponibilidad porque las fechas del evento pueden ser distintas.
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedHistoryApplicationId("");
                            resetHistoryForm();
                          }}
                          className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
                        >
                          Limpiar selección
                        </Button>

                        <Button
                          type="button"
                          onClick={handleCreateFromHistory}
                          disabled={creatingFromHistory}
                          className="sgames-admin-primary-button"
                        >
                          {creatingFromHistory
                            ? "Creando..."
                            : "Crear postulación"}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activePanel === "recibidas" && (
        <>

      {/* Filters */}
      <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[var(--sg-primary)]" />

              <span className="font-semibold text-[var(--sg-text)]">
                Filtros y búsqueda:
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sg-admin-muted-soft)]" />

                <Input
                  placeholder="Buscar por runner, juego o categoría..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] pl-10 text-[var(--sg-text)]"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="todos">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="Pending">
                    Pendiente
                  </SelectItem>
                  <SelectItem value="Approved">
                    Aprobada
                  </SelectItem>
                  <SelectItem value="Rejected">
                    Rechazada
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={platformFilter}
                onValueChange={setPlatformFilter}
              >
                <SelectTrigger className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>

                <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                  <SelectItem value="todos">
                    Todas las plataformas
                  </SelectItem>

                  {platforms.map((platform) => (
                    <SelectItem
                      key={platform}
                      value={platform}
                    >
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--sg-admin-border)] hover:bg-[var(--sg-admin-card-bg-soft)]">
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Runner
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Juego
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Categoría
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Plataforma
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Estimado
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Formato
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Estado
                  </TableHead>
                  <TableHead className="text-[var(--sg-muted-text)]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-right text-[var(--sg-muted-text)]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPostulaciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-[var(--sg-admin-muted-soft)]"
                    >
                      No se encontraron postulaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPostulaciones.map(
                    (postulacion) => (
                      <TableRow
                        key={postulacion.id}
                        className="border-[var(--sg-admin-border)] hover:bg-[var(--sg-admin-card-bg-soft)]"
                      >
                        <TableCell className="font-medium text-[var(--sg-text)]">
                          {postulacion.runnerName}
                        </TableCell>

                        <TableCell className="text-[var(--sg-muted-text)]">
                          {postulacion.game}
                        </TableCell>

                        <TableCell className="text-[var(--sg-muted-text)]">
                          {postulacion.category}
                        </TableCell>

                        <TableCell className="text-[var(--sg-muted-text)]">
                          {postulacion.platform || "-"}
                        </TableCell>

                        <TableCell className="font-mono text-sm text-[var(--sg-primary)]">
                          {getEstimatedDisplay(postulacion)}
                        </TableCell>

                        <TableCell>
                          {getRunTypeBadge(postulacion.runType)}
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(
                            postulacion.status
                          )}
                        </TableCell>

                        <TableCell className="text-[var(--sg-muted-text)]">
                          {formatSubmittedDate(
                            postulacion.submittedAt
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleViewDetail(
                                  postulacion
                                )
                              }
                              className="text-[var(--sg-primary)] hover:bg-[var(--sg-admin-primary-softer)]"
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={
                                deletingApplicationId ===
                                postulacion.id
                              }
                              onClick={() =>
                                handleDeleteApplication(
                                  postulacion
                                )
                              }
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Eliminar postulación"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            {postulacion.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleStatusChange(
                                      postulacion.id,
                                      "approved"
                                    )
                                  }
                                  className="text-green-400 hover:bg-green-500/10"
                                  title="Aprobar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleStatusChange(
                                      postulacion.id,
                                      "rejected"
                                    )
                                  }
                                  className="text-red-400 hover:bg-red-500/10"
                                  title="Rechazar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {postulacion.status === "Approved" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleOpenScheduleDialog(
                                    postulacion
                                  )
                                }
                                className="text-[var(--sg-secondary)] hover:bg-[var(--sg-admin-secondary-soft)]"
                                title="Agregar al horario"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-3xl flex-col overflow-hidden border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] p-0 text-[var(--sg-text)]">
          <DialogHeader className="shrink-0 border-b border-[var(--sg-admin-border)] px-6 py-4">
            <DialogTitle className="text-2xl">
              Detalle de Postulación
            </DialogTitle>
          </DialogHeader>

          {selectedPostulacion && (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {getStatusBadge(
                  selectedPostulacion.status
                )}

                <span className="text-sm text-[var(--sg-muted-text)]">
                  {formatSubmittedDate(
                    selectedPostulacion.submittedAt
                  )}
                </span>
              </div>

              <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                <h3 className="mb-3 font-semibold text-[var(--sg-primary)]">
                  Información del Runner
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Nombre:
                    </span>
                    <p className="break-words text-[var(--sg-text)]">
                      {selectedPostulacion.runnerName}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Correo:
                    </span>
                    <p className="break-all text-[var(--sg-text)]">
                      {selectedPostulacion.email}
                    </p>
                  </div>

                  {selectedPostulacion.discordUser && (
                    <div>
                      <span className="text-sm text-[var(--sg-muted-text)]">
                        Discord:
                      </span>
                      <p className="break-words text-[var(--sg-text)]">
                        {selectedPostulacion.discordUser}
                      </p>
                    </div>
                  )}

                  {selectedPostulacion.country && (
                    <div>
                      <span className="text-sm text-[var(--sg-muted-text)]">
                        País:
                      </span>
                      <p className="break-words text-[var(--sg-text)]">
                        {selectedPostulacion.country}
                      </p>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Zona horaria del runner:
                    </span>

                    <p className="mt-1 flex items-center gap-2 break-words text-[var(--sg-text)]">
                      <Globe2 className="h-4 w-4 text-[var(--sg-secondary)]" />
                      {getTimezoneLabel(
                        selectedPostulacion.runnerTimezone
                      )}
                      <span className="text-sm text-[var(--sg-admin-muted-soft)]">
                        ({selectedPostulacion.runnerTimezone ?? "America/Mexico_City"})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                <h3 className="mb-3 font-semibold text-[var(--sg-primary)]">
                  Información del Speedrun
                </h3>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Evento:
                    </span>
                    <p className="break-words text-[var(--sg-text)]">
                      {selectedPostulacion.event}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Juego:
                    </span>
                    <p className="break-words text-[var(--sg-text)]">
                      {selectedPostulacion.game}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Categoría:
                    </span>
                    <p className="break-words text-[var(--sg-text)]">
                      {selectedPostulacion.category}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Plataforma:
                    </span>
                    <p className="break-words text-[var(--sg-text)]">
                      {selectedPostulacion.platform}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Formato:
                    </span>
                    <div className="mt-1">
                      {getRunTypeBadge(selectedPostulacion.runType)}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Tiempo estimado:
                    </span>
                    <p className="text-[var(--sg-text)]">
                      {formatEstimatedTime(
                        selectedPostulacion.estimatedTimeMinutes
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-[var(--sg-muted-text)]">
                      Relación de pantalla:
                    </span>
                    <p className="text-[var(--sg-text)]">
                      {selectedPostulacion.aspectRatio}
                    </p>
                  </div>
                </div>
              </div>

              {(selectedPostulacion.runType === "Race" ||
                (selectedPostulacion.participants?.length ?? 0) > 0) && (
                <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--sg-primary)]">
                    <Users className="h-5 w-5" />
                    Participantes
                  </h3>

                  {selectedPostulacion.participants?.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedPostulacion.participants.map(
                        (participant, index) => (
                          <div
                            key={participant.id}
                            className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]/60 p-4"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sg-accent)]">
                                  Jugador {index + 1}
                                </p>

                                <p className="mt-1 break-words text-lg font-bold text-[var(--sg-text)]">
                                  {participant.runnerName}
                                </p>
                              </div>

                              <Badge className="bg-[var(--sg-admin-accent-soft)] text-[var(--sg-accent)]">
                                Race
                              </Badge>
                            </div>

                            {participant.email && (
                              <p className="break-all text-sm text-[var(--sg-muted-text)]">
                                <span className="text-[var(--sg-admin-muted-soft)]">Correo:</span>{" "}
                                {participant.email}
                              </p>
                            )}

                            {participant.discordUser && (
                              <p className="break-words text-sm text-[var(--sg-muted-text)]">
                                <span className="text-[var(--sg-admin-muted-soft)]">Discord:</span>{" "}
                                {participant.discordUser}
                              </p>
                            )}

                            {participant.country && (
                              <p className="break-words text-sm text-[var(--sg-muted-text)]">
                                <span className="text-[var(--sg-admin-muted-soft)]">País:</span>{" "}
                                {participant.country}
                              </p>
                            )}

                            <a
                              href={participant.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm text-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                            >
                              <ExternalLink className="h-4 w-4 shrink-0" />
                              <span className="break-all">
                                Ver VOD del jugador
                              </span>
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--sg-admin-muted-soft)]">
                      Esta race no tiene participantes registrados.
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--sg-primary)]">
                  <CalendarDays className="h-5 w-5" />
                  Disponibilidad del Runner
                </h3>

                {selectedPostulacion.availabilities?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPostulacion.availabilities.map(
                      (availability) => (
                        <div
                          key={availability.id}
                          className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]/60 p-3"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sg-primary)]">
                                Convertido a México Centro
                              </p>

                              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--sg-text)]">
                                <Clock3 className="h-4 w-4 text-[var(--sg-primary)]" />
                                {formatAvailabilityRange(
                                  availability.dayDate,
                                  availability.availableFrom,
                                  availability.availableToDayDate,
                                  availability.availableTo
                                )}
                              </p>

                              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sg-secondary)]">
                                Horario original del runner
                              </p>

                              <p className="mt-1 flex items-center gap-2 text-sm text-[var(--sg-muted-text)]">
                                <Globe2 className="h-4 w-4 text-[var(--sg-secondary)]" />
                                {formatAvailabilityRange(
                                  availability.localDayDate ??
                                    availability.dayDate,
                                  availability.localAvailableFrom ??
                                    availability.availableFrom,
                                  availability.localDayDate ??
                                    availability.dayDate,
                                  availability.localAvailableTo ??
                                    availability.availableTo
                                )}
                              </p>
                            </div>

                            {availability.isPreferred && (
                              <Badge className="w-fit bg-yellow-500/20 text-yellow-300">
                                <Star className="mr-1 h-3.5 w-3.5" />
                                Preferido
                              </Badge>
                            )}
                          </div>

                          {availability.notes && (
                            <p className="mt-3 text-sm text-[var(--sg-muted-text)]">
                              {availability.notes}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--sg-admin-muted-soft)]">
                    Esta postulación no tiene disponibilidad registrada.
                  </p>
                )}
              </div>

              {selectedPostulacion.youtubeUrl && (
                <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                  <h3 className="mb-3 font-semibold text-[var(--sg-primary)]">
                    Video demostrativo
                  </h3>

                  <a
                    href={selectedPostulacion.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 break-all text-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    <span className="break-all">
                      Ver video
                    </span>
                  </a>
                </div>
              )}

              {selectedPostulacion.socialNetworks?.length > 0 && (
                <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                  <h3 className="mb-3 font-semibold text-[var(--sg-primary)]">
                    Redes Sociales
                  </h3>

                  <div className="space-y-3">
                    {selectedPostulacion.socialNetworks.map(
                      (sn) => (
                        <div
                          key={sn.socialNetworkId}
                          className="space-y-1"
                        >
                          <span className="text-sm text-[var(--sg-muted-text)]">
                            {sn.name}
                          </span>

                          <a
                            href={sn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-sm text-[var(--sg-primary)] hover:text-[var(--sg-primary)]"
                          >
                            {sn.url}
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedPostulacion.notes && (
                <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                  <h3 className="mb-3 font-semibold text-[var(--sg-primary)]">
                    Notas
                  </h3>

                  <p className="whitespace-pre-wrap break-words text-[var(--sg-muted-text)]">
                    {selectedPostulacion.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="shrink-0 border-t border-[var(--sg-admin-border)] px-6 py-4">
            <Button
              variant="outline"
              onClick={() =>
                setDetailDialogOpen(false)
              }
              className="border-[var(--sg-admin-border)]"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-xl flex-col overflow-hidden border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)] p-0 text-[var(--sg-text)]">
          <DialogHeader className="shrink-0 border-b border-[var(--sg-admin-border)] px-6 py-4">
            <DialogTitle>
              Agregar al Horario
            </DialogTitle>
          </DialogHeader>

          {scheduleApplication && (
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              <div className="rounded-lg border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
                <p className="text-sm text-[var(--sg-muted-text)]">
                  Run
                </p>

                <p className="font-medium text-[var(--sg-text)]">
                  {scheduleApplication.game} -{" "}
                  {scheduleApplication.category}
                </p>

                <p className="text-sm text-[var(--sg-muted-text)]">
                  Runner:{" "}
                  {scheduleApplication.runnerName}
                </p>
              </div>

              {scheduleApplication.availabilities?.length > 0 && (
                <div className="rounded-lg border border-cyan-500/30 bg-[var(--sg-admin-primary-softer)] p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-[var(--sg-primary)]">
                    <CalendarDays className="h-5 w-5" />
                    Disponibilidad declarada
                  </h3>

                  <p className="mb-3 text-xs text-[var(--sg-muted-text)]">
                    Programa usando el horario convertido a México Centro.
                  </p>

                  <div className="space-y-2">
                    {scheduleApplication.availabilities.map(
                      (availability) => (
                        <div
                          key={availability.id}
                          className="rounded-md border border-cyan-500/20 bg-[var(--sg-admin-card-bg)] p-3"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--sg-primary)]">
                                México Centro
                              </p>

                              <p className="mt-1 text-sm text-[var(--sg-text)]">
                                {formatAvailabilityRange(
                                  availability.dayDate,
                                  availability.availableFrom,
                                  availability.availableToDayDate,
                                  availability.availableTo
                                )}
                              </p>

                              <p className="mt-2 text-xs text-[var(--sg-muted-text)]">
                                Runner ({getTimezoneLabel(
                                  scheduleApplication.runnerTimezone
                                )}): {formatAvailabilityRange(
                                  availability.localDayDate ??
                                    availability.dayDate,
                                  availability.localAvailableFrom ??
                                    availability.availableFrom,
                                  availability.localDayDate ??
                                    availability.dayDate,
                                  availability.localAvailableTo ??
                                    availability.availableTo
                                )}
                              </p>
                            </div>

                            {availability.isPreferred && (
                              <Badge className="w-fit bg-yellow-500/20 text-yellow-300">
                                <Star className="mr-1 h-3.5 w-3.5" />
                                Preferido
                              </Badge>
                            )}
                          </div>

                          {availability.notes && (
                            <p className="mt-2 text-xs text-[var(--sg-muted-text)]">
                              {availability.notes}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-[var(--sg-muted-text)]">
                  Día del horario
                </Label>

                <Select
                  value={selectedScheduleDayId}
                  onValueChange={setSelectedScheduleDayId}
                >
                  <SelectTrigger className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]">
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>

                  <SelectContent className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)]">
                    {scheduleDays.map((day) => (
                      <SelectItem
                        key={day.id}
                        value={day.id}
                      >
                        {formatScheduleDate(
                          day.dayDate
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="scheduleStartTime"
                  className="text-[var(--sg-muted-text)]"
                >
                  Hora de inicio
                </Label>

                <Input
                  id="scheduleStartTime"
                  type="time"
                  value={scheduleStartTime}
                  onChange={(e) =>
                    setScheduleStartTime(
                      e.target.value
                    )
                  }
                  className="mt-1.5 border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0 border-t border-[var(--sg-admin-border)] px-6 py-4">
            <Button
              variant="outline"
              onClick={() =>
                setScheduleDialogOpen(false)
              }
              className="border-[var(--sg-admin-border)]"
            >
              Cancelar
            </Button>

            <Button
              onClick={handleAddToSchedule}
              className="sgames-admin-primary-button"
            >
              Agregar al Horario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}