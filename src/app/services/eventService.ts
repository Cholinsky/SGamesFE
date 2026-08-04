import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getActiveEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/admin-current`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading active event"
    );
  }

  return await response.json();
}

export async function getActivePublicEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/active-public`
    );

  if (
    response.status === 204 ||
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "Error loading active public event"
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
    const error =
      await response.text();

    throw new Error(
      error || "Error updating event"
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
    const error =
      await response.text();

    throw new Error(
      error || "Error updating event active status"
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
    const error =
      await response.text();

    throw new Error(
      error ||
        "Error updating public runs visibility"
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
    const error =
      await response.text();

    throw new Error(
      error || "Error updating event season"
    );
  }

  return await response.json();
}