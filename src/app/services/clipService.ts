import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type ClipSourceType =
  | "YouTube"
  | "TwitchClip"
  | "TwitchVideo"
  | "Local";

export type ClipItem = {
  id: string;
  eventId: string;
  eventName: string;
  eventStartDate: string;
  eventEndDate: string;
  eventIsActive: boolean;
  seasonKey?: string | null;
  title: string;
  description?: string | null;
  sourceType: ClipSourceType | string;
  externalUrl?: string | null;
  embedUrl?: string | null;
  thumbnailUrl?: string | null;
  localVideoUrl?: string | null;
  externalId?: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
};

export type ClipEventGroup = {
  eventId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  seasonKey?: string | null;
  total: number;
  visible: number;
  hidden: number;
  clips: ClipItem[];
};

export type ClipEventOption = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  seasonKey?: string | null;
};

export type ClipPayload = {
  eventId?: string;
  title: string;
  description?: string;
  sourceType: ClipSourceType;
  externalUrl?: string;
  thumbnailUrl?: string;
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;
  localVideoFile?: File | null;
  thumbnailFile?: File | null;
};

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const text =
    await response.text();

  if (!text) {
    return fallbackMessage;
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
    // texto plano
  }

  return text;
}

function buildFormData(
  payload: ClipPayload
) {
  const formData =
    new FormData();

  if (payload.eventId) {
    formData.append(
      "EventId",
      payload.eventId
    );
  }

  formData.append(
    "Title",
    payload.title
  );

  formData.append(
    "Description",
    payload.description ?? ""
  );

  formData.append(
    "SourceType",
    payload.sourceType
  );

  formData.append(
    "ExternalUrl",
    payload.externalUrl ?? ""
  );

  formData.append(
    "ThumbnailUrl",
    payload.thumbnailUrl ?? ""
  );

  formData.append(
    "IsVisible",
    String(payload.isVisible)
  );

  formData.append(
    "IsFeatured",
    String(payload.isFeatured)
  );

  formData.append(
    "SortOrder",
    String(payload.sortOrder)
  );

  if (payload.localVideoFile) {
    formData.append(
      "LocalVideoFile",
      payload.localVideoFile
    );
  }

  if (payload.thumbnailFile) {
    formData.append(
      "ThumbnailFile",
      payload.thumbnailFile
    );
  }

  return formData;
}

function getMultipartHeaders() {
  const token =
    localStorage.getItem("sgames_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function buildClipPlayerUrl(
  clip: ClipItem
) {
  if (clip.sourceType === "Local") {
    return clip.localVideoUrl ?? "";
  }

  if (clip.sourceType === "YouTube") {
    return clip.embedUrl ?? "";
  }

  const parent =
    window.location.hostname;

  if (clip.sourceType === "TwitchVideo") {
    return `https://player.twitch.tv/?video=${clip.externalId}&parent=${parent}&autoplay=false`;
  }

  if (clip.sourceType === "TwitchClip") {
    return `https://clips.twitch.tv/embed?clip=${clip.externalId}&parent=${parent}&autoplay=false`;
  }

  return clip.embedUrl ?? clip.externalUrl ?? "";
}

export async function getClipEvents() {
  const response =
    await fetch(
      `${API_URL}/Clips/events`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los eventos"
      )
    );
  }

  return await response.json() as ClipEventOption[];
}

export async function getClipGroups() {
  const response =
    await fetch(
      `${API_URL}/Clips/by-events`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los clips"
      )
    );
  }

  return await response.json() as ClipEventGroup[];
}

export async function getPublicClipGroups() {
  const response =
    await fetch(
      `${API_URL}/Clips/public-by-events?t=${Date.now()}`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los clips públicos"
      )
    );
  }

  return await response.json() as ClipEventGroup[];
}

export async function createClip(
  payload: ClipPayload
) {
  const response =
    await fetch(
      `${API_URL}/Clips`,
      {
        method: "POST",
        headers: getMultipartHeaders(),
        body: buildFormData(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear el clip"
      )
    );
  }

  return await response.json();
}

export async function updateClip(
  id: string,
  payload: ClipPayload
) {
  const response =
    await fetch(
      `${API_URL}/Clips/${id}`,
      {
        method: "PUT",
        headers: getMultipartHeaders(),
        body: buildFormData(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el clip"
      )
    );
  }

  return await response.json();
}

export async function showClip(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Clips/${id}/show`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo mostrar el clip"
      )
    );
  }
}

export async function hideClip(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Clips/${id}/hide`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo ocultar el clip"
      )
    );
  }
}

export async function deleteClip(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Clips/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo eliminar el clip"
      )
    );
  }

  return await response.json();
}