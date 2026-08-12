import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type StreamSettings = {
  id: string;
  eventId: string;
  streamTitle?: string | null;
  streamDescription?: string | null;
  streamStatus?: string | null;
  twitchChannelUrl?: string | null;
  youtubeLiveUrl?: string | null;
  tikTokLiveUrl?: string | null;
  tiktokLiveUrl?: string | null;
  overlayHeadline?: string | null;
  overlaySubheadline?: string | null;
  currentSceneNotes?: string | null;
  isMonitorEnabled: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type StreamQueueItem = {
  id: string;
  eventId: string;
  itemType: "Run" | "Category" | "Break" | "Message" | "Custom" | string;
  title: string;
  subtitle?: string | null;
  detailText?: string | null;
  sourceLabel?: string | null;
  displayDataJson?: string | null;
  sourceScheduleEntryId?: string | null;
  syncWithSchedule?: boolean;
  lastSyncedAt?: string | null;
  sortOrder: number;
  isActive: boolean;
  isDone: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type StreamPanelData = {
  eventId: string;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  seasonKey?: string | null;
  eventIsActive: boolean;
  settings: StreamSettings;
  currentItem?: StreamQueueItem | null;
  queue: StreamQueueItem[];
  doneItems: StreamQueueItem[];
};

export type StreamScheduleCandidate = {
  scheduleEntryId: string;
  applicationId?: string | null;
  dayDate: string;
  startTime: string;
  durationMinutes: number;
  positionOrder: number;
  runStatus?: string | null;
  runnerName: string;
  runner2Name?: string | null;
  gameName: string;
  categoryName: string;
  platformName: string;
  estimate: string;
  runType: string;
  videoUrl?: string | null;
  title: string;
  subtitle: string;
  displayDataJson: string;
  isAlreadyInQueue: boolean;
  isDoneInQueue: boolean;
  streamQueueItemId?: string | null;
};

export type ImportScheduleEntryToStreamPayload = {
  scheduleEntryId: string;
  sourceLabel?: string | null;
  commentators?: string | null;
  language?: string | null;
  note?: string | null;
  syncWithSchedule: boolean;
  sortOrder?: number;
};

export type BulkImportScheduleEntriesToStreamPayload = {
  scheduleEntryIds?: string[];
  dayDate?: string | null;
  importAll: boolean;
  sourceLabel?: string | null;
  commentators?: string | null;
  language?: string | null;
  note?: string | null;
  syncWithSchedule: boolean;
};

export type BulkImportScheduleEntriesResult = {
  totalRequested: number;
  imported: number;
  skippedExisting: number;
  skippedMissing: number;
  items: StreamQueueItem[];
};

export type StreamQueueMaintenanceResult = {
  affected: number;
  message: string;
};

export type UpdateStreamSettingsPayload = {
  streamTitle?: string | null;
  streamDescription?: string | null;
  streamStatus?: string | null;
  twitchChannelUrl?: string | null;
  youtubeLiveUrl?: string | null;
  tikTokLiveUrl?: string | null;
  tiktokLiveUrl?: string | null;
  overlayHeadline?: string | null;
  overlaySubheadline?: string | null;
  currentSceneNotes?: string | null;
  isMonitorEnabled: boolean;
};

export type StreamQueuePayload = {
  itemType: "Run" | "Category" | "Break" | "Message" | "Custom";
  title: string;
  subtitle?: string | null;
  detailText?: string | null;
  sourceLabel?: string | null;
  displayDataJson?: string | null;
  sortOrder?: number;
};

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

export function getStreamPanelPublicUrl() {
  return `${API_URL}/StreamPanel/public`;
}

export function getStreamOverlayUrl() {
  return `${window.location.origin}/overlay/stream`;
}

export function getStreamDynamicOverlayUrl(
  view: "current-run" | "next-run" | "runner-tag" | "info-bar" | "intermission" = "current-run"
) {
  return `${window.location.origin}/overlay/stream/dynamic?view=${view}`;
}

export async function getStreamPanelPublic() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/public?t=${Date.now()}`,
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
        "No se pudo cargar el overlay de stream"
      )
    );
  }

  return await response.json() as StreamPanelData;
}

export async function getStreamPanelAdmin() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/admin?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar el panel de stream"
      )
    );
  }

  return await response.json() as StreamPanelData;
}

export async function updateStreamSettings(
  payload: UpdateStreamSettingsPayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/settings`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          streamTitle:
            payload.streamTitle ?? null,
          streamDescription:
            payload.streamDescription ?? null,
          streamStatus:
            payload.streamStatus ?? null,
          twitchChannelUrl:
            payload.twitchChannelUrl ?? null,
          youtubeLiveUrl:
            payload.youtubeLiveUrl ?? null,
          tikTokLiveUrl:
            payload.tikTokLiveUrl ??
            payload.tiktokLiveUrl ??
            null,
          overlayHeadline:
            payload.overlayHeadline ?? null,
          overlaySubheadline:
            payload.overlaySubheadline ?? null,
          currentSceneNotes:
            payload.currentSceneNotes ?? null,
          isMonitorEnabled:
            payload.isMonitorEnabled,
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo guardar la configuración del stream"
      )
    );
  }

  return await response.json() as StreamSettings;
}

export async function createStreamQueueItem(
  payload: StreamQueuePayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear el item del stream"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}

export async function updateStreamQueueItem(
  id: string,
  payload: StreamQueueItem
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}`,
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
        "No se pudo actualizar el item del stream"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}

export async function markStreamQueueItemDone(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}/done`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo finalizar el item"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}

export async function restoreStreamQueueItem(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}/restore`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo restaurar el item"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}

export async function moveStreamQueueItem(
  id: string,
  direction: "up" | "down"
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}/move-${direction}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo mover el item"
      )
    );
  }
}

export async function deleteStreamQueueItem(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo eliminar el item"
      )
    );
  }

  return await response.json();
}


export async function getStreamScheduleCandidates() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/schedule-candidates?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar las runs del horario"
      )
    );
  }

  return await response.json() as StreamScheduleCandidate[];
}

export async function importScheduleEntryToStream(
  payload: ImportScheduleEntryToStreamPayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/import-schedule-entry`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo importar la run del horario"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}

export async function syncStreamQueueItemNow(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/${id}/sync-now`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo sincronizar el item con horario"
      )
    );
  }

  return await response.json() as StreamQueueItem;
}


export async function importScheduleEntriesBulkToStream(
  payload: BulkImportScheduleEntriesToStreamPayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/import-schedule-bulk`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron importar las runs del horario"
      )
    );
  }

  return await response.json() as BulkImportScheduleEntriesResult;
}

export async function syncAllStreamQueueItems() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/sync-all`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo sincronizar toda la cola"
      )
    );
  }

  return await response.json() as StreamQueueMaintenanceResult;
}

export async function clearActiveStreamQueue() {
  const response =
    await fetch(
      `${API_URL}/StreamPanel/queue/clear-active`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo limpiar la cola activa"
      )
    );
  }

  return await response.json() as StreamQueueMaintenanceResult;
}