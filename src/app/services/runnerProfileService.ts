import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type RunnerSocialLinkPayload = {
  id?: string;
  socialNetworkId: string;
  url: string;
};

export type RunnerProfilePayload = {
  displayName: string;
  country?: string | null;
  bio?: string | null;
  isVisible: boolean;
  sortOrder: number;
  socialLinks: RunnerSocialLinkPayload[];
  photo?: File | null;
  presentationVideo?: File | null;
};

export type RunnerProfile = {
  id: string;
  eventId?: string | null;
  eventName?: string | null;
  eventIsActive?: boolean | null;
  sourceRunnerProfileId?: string | null;
  displayName: string;
  country?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  presentationVideoUrl?: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string | null;
  socialLinks: {
    id?: string;
    socialNetworkId: string;
    name?: string;
    url: string;
  }[];
};

export type RunnerProfileEventGroup = {
  eventId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  seasonKey?: string | null;
  total: number;
  visible: number;
  hidden: number;
  runners: RunnerProfile[];
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

function buildRunnerProfileFormData(
  payload: RunnerProfilePayload
) {
  const formData =
    new FormData();

  formData.append(
    "DisplayName",
    payload.displayName
  );

  formData.append(
    "Country",
    payload.country ?? ""
  );

  formData.append(
    "Bio",
    payload.bio ?? ""
  );

  formData.append(
    "IsVisible",
    String(payload.isVisible)
  );

  formData.append(
    "SortOrder",
    String(payload.sortOrder)
  );

  formData.append(
    "SocialLinksJson",
    JSON.stringify(
      payload.socialLinks ?? []
    )
  );

  if (payload.photo) {
    formData.append(
      "Photo",
      payload.photo
    );
  }

  if (payload.presentationVideo) {
    formData.append(
      "PresentationVideo",
      payload.presentationVideo
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

export async function getPublicRunnerProfiles() {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/public`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los runners públicos"
      )
    );
  }

  return await response.json();
}

export async function getRunnerProfiles() {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron cargar los runners"
      )
    );
  }

  return await response.json() as RunnerProfile[];
}

export async function getRunnerProfileEventGroups() {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/by-events`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar el historial de runners"
      )
    );
  }

  return await response.json() as RunnerProfileEventGroup[];
}

export async function createRunnerProfile(
  payload: RunnerProfilePayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles`,
      {
        method: "POST",
        headers: getMultipartHeaders(),
        body: buildRunnerProfileFormData(
          payload
        ),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear el runner"
      )
    );
  }

  return await response.json();
}

export async function updateRunnerProfile(
  id: string,
  payload: RunnerProfilePayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}`,
      {
        method: "PUT",
        headers: getMultipartHeaders(),
        body: buildRunnerProfileFormData(
          payload
        ),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el runner"
      )
    );
  }

  return await response.json();
}

export async function copyRunnerProfileBasicToActive(
  sourceRunnerProfileId: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${sourceRunnerProfileId}/copy-basic-to-active`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo copiar el runner al evento activo"
      )
    );
  }

  return await response.json();
}

export async function showRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}/show`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo mostrar el runner"
      )
    );
  }
}

export async function hideRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}/hide`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo ocultar el runner"
      )
    );
  }
}

export async function deleteRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo eliminar el runner"
      )
    );
  }

  return await response.json();
}