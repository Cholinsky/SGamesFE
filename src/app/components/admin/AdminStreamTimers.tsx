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
import { Badge } from "../ui/badge";
import {
  Copy,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Save,
  Square,
  Timer,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateVisibleElapsedMs,
  formatTimerMs,
  getStreamTimerOverlayUrl,
  getStreamTimers,
  getStreamTimersOverlayUrl,
  runRaceTimerAction,
  runStreamTimerAction,
  updateStreamTimer,
  type StreamTimer,
  type TimerAction,
} from "../../services/streamTimerService";

function statusLabel(
  status: string
) {
  switch (status) {
    case "Running":
      return "Corriendo";
    case "Paused":
      return "Pausado";
    case "Stopped":
      return "Detenido";
    default:
      return "Listo";
  }
}

function statusClass(
  status: string
) {
  switch (status) {
    case "Running":
      return "bg-green-500/15 text-green-300";
    case "Paused":
      return "bg-yellow-500/15 text-yellow-300";
    case "Stopped":
      return "bg-red-500/15 text-red-300";
    default:
      return "bg-slate-500/15 text-slate-300";
  }
}

function getSlotDescription(
  slot: number
) {
  switch (slot) {
    case 2:
      return "Race · Jugador 1";
    case 3:
      return "Race · Jugador 2";
    default:
      return "Run individual";
  }
}

function getPrimaryAction(
  timer: StreamTimer
): {
  label: string;
  action: TimerAction;
  icon: "play" | "pause";
} {
  if (timer.status === "Running") {
    return {
      label: "Pausar",
      action: "pause",
      icon: "pause",
    };
  }

  if (timer.status === "Paused") {
    return {
      label: "Reanudar",
      action: "resume",
      icon: "play",
    };
  }

  return {
    label: "Iniciar",
    action: "start",
    icon: "play",
  };
}

type TimerCardProps = {
  timer: StreamTimer;
  nowMs: number;
  onAction: (
    slot: number,
    action: TimerAction
  ) => void;
  onSave: (
    slot: number,
    label: string,
    finishAnimationText: string
  ) => void;
  onCopyUrl: (
    slot: 1 | 2 | 3
  ) => void;
};

function TimerCard({
  timer,
  nowMs,
  onAction,
  onSave,
  onCopyUrl,
}: TimerCardProps) {
  const [label, setLabel] =
    useState(timer.label);

  const [finishText, setFinishText] =
    useState(timer.finishAnimationText || "GG");

  useEffect(() => {
    setLabel(timer.label);
    setFinishText(
      timer.finishAnimationText || "GG"
    );
  }, [
    timer.label,
    timer.finishAnimationText,
  ]);

  const primaryAction =
    getPrimaryAction(timer);

  const elapsed =
    calculateVisibleElapsedMs(
      timer,
      nowMs
    );

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-[var(--sg-admin-primary-soft)] text-[var(--sg-primary)]">
                Slot {timer.slot}
              </Badge>

              <Badge className={statusClass(timer.status)}>
                {statusLabel(timer.status)}
              </Badge>

              {timer.shouldShowFinishAnimation && (
                <Badge className="bg-yellow-500/15 text-yellow-300">
                  GG activo
                </Badge>
              )}
            </div>

            <CardTitle className="text-[var(--sg-text)]">
              {timer.label}
            </CardTitle>

            <p className="text-sm text-[var(--sg-muted-text)]">
              {getSlotDescription(timer.slot)}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onCopyUrl(
                timer.slot as 1 | 2 | 3
              )
            }
            className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
          >
            <Copy className="mr-2 h-4 w-4" />
            URL OBS
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-black/50 p-5 text-center">
          <div className="font-mono text-4xl font-black tracking-tight text-yellow-300 drop-shadow md:text-5xl">
            {formatTimerMs(elapsed)}
          </div>

          {timer.status === "Stopped" && (
            <p className="mt-2 text-sm font-semibold text-[var(--sg-muted-text)]">
              Tiempo final
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            onClick={() =>
              onAction(
                timer.slot,
                primaryAction.action
              )
            }
            className="sgames-admin-primary-button"
          >
            {primaryAction.icon === "pause" ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {primaryAction.label}
          </Button>

          <Button
            onClick={() =>
              onAction(timer.slot, "stop")
            }
            variant="outline"
            className="border-red-500/30 text-red-300"
          >
            <Square className="mr-2 h-4 w-4" />
            Detener / GG
          </Button>

          <Button
            onClick={() =>
              onAction(timer.slot, "reset")
            }
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reiniciar
          </Button>

          <Button
            onClick={() =>
              window.open(
                getStreamTimerOverlayUrl(
                  timer.slot as 1 | 2 | 3
                ),
                "_blank"
              )
            }
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_90px_auto]">
          <Input
            value={label}
            onChange={(event) =>
              setLabel(event.target.value)
            }
            className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
            placeholder="Nombre del timer"
          />

          <Input
            value={finishText}
            onChange={(event) =>
              setFinishText(event.target.value)
            }
            className="border-[var(--sg-admin-border)] bg-[var(--sg-admin-input-bg)] text-[var(--sg-text)]"
            placeholder="GG"
          />

          <Button
            onClick={() =>
              onSave(
                timer.slot,
                label,
                finishText
              )
            }
            variant="outline"
            className="border-[var(--sg-admin-border)] text-[var(--sg-primary)]"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminStreamTimers() {
  const [timers, setTimers] =
    useState<StreamTimer[]>([]);

  const [eventName, setEventName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [nowMs, setNowMs] =
    useState(Date.now());

  const raceTimers =
    useMemo(
      () =>
        timers.filter((timer) =>
          [2, 3].includes(timer.slot)
        ),
      [
        timers,
      ]
    );

  async function loadTimers(
    silent = false
  ) {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data =
        await getStreamTimers();

      setTimers(data.timers);
      setEventName(data.eventName);
    } catch (error) {
      console.error(error);

      if (!silent) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los timers"
        );
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadTimers();

    const refresh =
      window.setInterval(() => {
        loadTimers(true);
      }, 3000);

    return () =>
      window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    const tick =
      window.setInterval(() => {
        setNowMs(Date.now());
      }, 50);

    return () =>
      window.clearInterval(tick);
  }, []);

  async function handleAction(
    slot: number,
    action: TimerAction
  ) {
    try {
      await runStreamTimerAction(
        slot,
        action
      );

      await loadTimers(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar la acción"
      );
    }
  }

  async function handleRaceAction(
    action: TimerAction
  ) {
    try {
      await runRaceTimerAction(
        action
      );

      await loadTimers(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo controlar la race"
      );
    }
  }

  async function handleSave(
    slot: number,
    label: string,
    finishAnimationText: string
  ) {
    try {
      await updateStreamTimer(slot, {
        label:
          label.trim(),
        finishAnimationText:
          finishAnimationText.trim() || "GG",
      });

      toast.success(
        "Timer actualizado"
      );

      await loadTimers(true);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el timer"
      );
    }
  }

  async function handleCopyUrl(
    slot: 1 | 2 | 3
  ) {
    await navigator.clipboard.writeText(
      getStreamTimerOverlayUrl(slot)
    );

    toast.success(
      "URL del timer copiada"
    );
  }

  async function handleCopyAllUrl() {
    await navigator.clipboard.writeText(
      getStreamTimersOverlayUrl()
    );

    toast.success(
      "URL de los 3 timers copiada"
    );
  }

  return (
    <Card className="sgames-admin-card border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg)]">
      <CardHeader>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[var(--sg-primary)]">
              <Timer className="h-5 w-5" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">
                Timers nativos
              </span>
            </div>

            <CardTitle className="text-[var(--sg-text)]">
              Timers para OBS
            </CardTitle>

            <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
              1 timer individual y 2 timers para race. Se pueden usar como Browser Source en OBS.
              {eventName ? ` Evento: ${eventName}.` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCopyAllUrl}
              variant="outline"
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              <Copy className="mr-2 h-4 w-4" />
              URL 3 timers
            </Button>

            <Button
              onClick={() =>
                window.open(
                  getStreamTimersOverlayUrl(),
                  "_blank"
                )
              }
              variant="outline"
              className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview 3 timers
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-[var(--sg-admin-border)] bg-[var(--sg-admin-card-bg-soft)] p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--sg-text)]">
                <Trophy className="h-5 w-5 text-yellow-300" />
                <p className="font-bold">
                  Controles rápidos de Race
                </p>
              </div>

              <p className="mt-1 text-sm text-[var(--sg-muted-text)]">
                Controla al mismo tiempo los timers de Race P1 y Race P2.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  handleRaceAction("start")
                }
                className="sgames-admin-primary-button"
                disabled={raceTimers.length < 2}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar Race
              </Button>

              <Button
                onClick={() =>
                  handleRaceAction("pause")
                }
                variant="outline"
                className="border-yellow-500/30 text-yellow-300"
                disabled={raceTimers.length < 2}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pausar Race
              </Button>

              <Button
                onClick={() =>
                  handleRaceAction("stop")
                }
                variant="outline"
                className="border-red-500/30 text-red-300"
                disabled={raceTimers.length < 2}
              >
                <Square className="mr-2 h-4 w-4" />
                Detener Race
              </Button>

              <Button
                onClick={() =>
                  handleRaceAction("reset")
                }
                variant="outline"
                className="border-[var(--sg-admin-border)] text-[var(--sg-muted-text)]"
                disabled={raceTimers.length < 2}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar Race
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-[var(--sg-admin-border)] p-10 text-center text-[var(--sg-muted-text)]">
            Cargando timers...
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {timers.map((timer) => (
              <TimerCard
                key={timer.id}
                timer={timer}
                nowMs={nowMs}
                onAction={handleAction}
                onSave={handleSave}
                onCopyUrl={handleCopyUrl}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}