import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getSettings() {
  const response =
    await fetch(
      `${API_URL}/Settings`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading settings"
    );
  }

  return await response.json();
}

export async function createSettings(
  data: any
) {
  const response =
    await fetch(
      `${API_URL}/Settings`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error creating settings"
    );
  }

  return await response.json();
}

export async function updateSettings(
  id: number,
  data: any
) {
  const response =
    await fetch(
      `${API_URL}/Settings/${id}`,
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
      error || "Error updating settings"
    );
  }

  return await response.json();
}

