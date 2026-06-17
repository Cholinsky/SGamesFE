import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getScheduleDays() {
  const response = await fetch(
    `${API_URL}/Schedule/days`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error loading schedule days");
  }

  return await response.json();
}

export async function getScheduleEntries() {
  const response = await fetch(
    `${API_URL}/Schedule/entries`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error loading schedule entries");
  }

  return await response.json();
}

export async function createScheduleEntry(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Schedule/entries`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Error creating schedule entry");
  }

  return await response.json();
}

export async function updateScheduleEntry(
  id: string,
  data: any
) {
  const response = await fetch(
    `${API_URL}/Schedule/entries/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error updating schedule entry"
    );
  }

  return await response.json();
}

export async function publishSchedule(
  eventId: string
) {
  const response = await fetch(
    `${API_URL}/Schedule/publish/${eventId}`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error publishing schedule"
    );
  }

  return await response.json();
}

export async function getPublicSchedule(
  eventId: string
) {
  const response = await fetch(
    `${API_URL}/Schedule/public/${eventId}`
  );

  if (!response.ok) {
    throw new Error(
      "Error loading public schedule"
    );
  }

  return await response.json();
}

export async function getEventById(
  eventId: string
) {
  const response = await fetch(
    `${API_URL}/Events/${eventId}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error loading event"
    );
  }

  return await response.json();
}

export async function getActiveEvent() {
  const response = await fetch(
    `${API_URL}/Events/active`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error loading active event");
  }

  return await response.json();
}