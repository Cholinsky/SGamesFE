import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type StreamTimerStatus =
  | "Idle"
  | "Running"
  | "Paused"
  | "Stopped"
  | string;

export type StreamTimer = {
  id: string;
  eventId: string;
  slot: number;
  timerType: string;
  label: string;
  status: StreamTimerStatus;
  baseElapsedMs: number;
  currentElapsedMs: number;
  startedAtUtc?: string | null;
  pausedAtUtc?: string | null;
  stoppedAtUtc?: string | null;
  finishAnimationText: string;
  finishAnimationEndsAtUtc?: string | null;
  shouldShowFinishAnimation: boolean;
  serverNowUtc: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type StreamTimersResponse = {
  eventId: string;
  eventName: string;
  seasonKey?: string | null;
  serverNowUtc: string;
  timers: StreamTimer[];
};

export type TimerAction =
  | "start"
  | "pause"
  | "resume"
  | "reset"
  | "stop";

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const text =
    await response.text();

  if (!text) {
    return `${fallbackMessage} (${response.status})`;
  }

  try {
    const parsed =
      JSON.parse(text);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return parsed.message;
    }

    if (parsed?.title) {
      return parsed.title;
    }
  } catch {
    // Texto plano.
  }

  return text;
}

export async function getStreamTimers() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/timers?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los timers"
      )
    );
  }

  return await response.json() as StreamTimersResponse;
}

export async function getPublicStreamTimers() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/timers/public?t=${Date.now()}`,
      {
        cache: "no-store",
      }
    );

  if (
    response.status === 204 ||
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los timers públicos"
      )
    );
  }

  return await response.json() as StreamTimersResponse;
}

export async function updateStreamTimer(
  slot: number,
  payload: {
    label?: string | null;
    finishAnimationText?: string | null;
  }
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/timers/${slot}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el timer"
      )
    );
  }

  return await response.json() as StreamTimer;
}

export async function runStreamTimerAction(
  slot: number,
  action: TimerAction
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/timers/${slot}/${action}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo ejecutar la acción del timer"
      )
    );
  }

  return await response.json();
}

export async function runRaceTimerAction(
  action: TimerAction
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/timers/race/${action}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo ejecutar la acción de race"
      )
    );
  }

  return await response.json();
}

export function getStreamTimerOverlayUrl(
  slot: 1 | 2 | 3
) {
  return `${window.location.origin}/overlay/stream/timer?slot=${slot}`;
}

export function getStreamTimersOverlayUrl() {
  return `${window.location.origin}/overlay/stream/timers`;
}

export function calculateVisibleElapsedMs(
  timer: StreamTimer,
  nowMs: number = Date.now()
) {
  const base =
    Number(timer.baseElapsedMs ?? 0);

  if (
    timer.status !== "Running" ||
    !timer.startedAtUtc
  ) {
    return Math.max(
      0,
      Number(timer.currentElapsedMs ?? base)
    );
  }

  const startedAt =
    new Date(timer.startedAtUtc).getTime();

  if (Number.isNaN(startedAt)) {
    return Math.max(
      0,
      Number(timer.currentElapsedMs ?? base)
    );
  }

  return Math.max(
    0,
    base + (nowMs - startedAt)
  );
}

export function formatTimerMs(
  valueMs: number,
  includeCentiseconds = true
) {
  const safeMs =
    Math.max(
      0,
      Math.floor(valueMs)
    );

  const totalCentiseconds =
    Math.floor(safeMs / 10);

  const centiseconds =
    totalCentiseconds % 100;

  const totalSeconds =
    Math.floor(safeMs / 1000);

  const seconds =
    totalSeconds % 60;

  const totalMinutes =
    Math.floor(totalSeconds / 60);

  const minutes =
    totalMinutes % 60;

  const hours =
    Math.floor(totalMinutes / 60);

  const hh =
    String(hours).padStart(2, "0");

  const mm =
    String(minutes).padStart(2, "0");

  const ss =
    String(seconds).padStart(2, "0");

  if (!includeCentiseconds) {
    return `${hh}:${mm}:${ss}`;
  }

  const cc =
    String(centiseconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}.${cc}`;
}