import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

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

export async function getActiveEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/admin-current?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading current admin event"
      )
    );
  }

  return await response.json();
}

export async function getActivePublicEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/active-public?t=${Date.now()}`,
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
        "Error loading active public event"
      )
    );
  }

  return await response.json();
}

export async function getEvents() {
  const response =
    await fetch(
      `${API_URL}/Events`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading events"
      )
    );
  }

  return await response.json();
}

export async function getEventById(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Events/${id}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading event"
      )
    );
  }

  return await response.json();
}

export async function updateEvent(
  id: string,
  data: any
) {
  const response =
    await fetch(
      `${API_URL}/Events/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error updating event"
      )
    );
  }

  return true;
}

export async function updateEventActiveStatus(
  id: string,
  isActive: boolean
) {
  const action =
    isActive
      ? "activate"
      : "deactivate";

  const response =
    await fetch(
      `${API_URL}/Events/${id}/${action}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error updating event active status"
      )
    );
  }

  return true;
}

export async function updatePublicRunsVisibility(
  id: string,
  visible: boolean
) {
  const response =
    await fetch(
      `${API_URL}/Events/${id}/public-runs/${visible}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error updating public runs visibility"
      )
    );
  }

  return await response.json();
}

export async function updateEventSeason(
  id: string,
  seasonKey: string
) {
  const response =
    await fetch(
      `${API_URL}/Events/${id}/season/${seasonKey}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error updating event season"
      )
    );
  }

  return await response.json();
}