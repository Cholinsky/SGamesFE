import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getActiveEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/active`,
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

export async function getActivePublicEvent() {
  const response =
    await fetch(
      `${API_URL}/Events/active`
    );

  if (!response.ok) {
    throw new Error(
      "Error loading active public event"
    );
  }

  return await response.json();
}
