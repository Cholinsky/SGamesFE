import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const responseText =
    await response.text();

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const parsed =
      JSON.parse(responseText);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return parsed.message;
    }

    if (parsed?.title) {
      return parsed.title;
    }

    if (parsed?.errors) {
      const messages =
        Object.values(parsed.errors)
          .flat()
          .filter(Boolean);

      if (messages.length > 0) {
        return messages.join("\n");
      }
    }
  } catch {
    // Si no es JSON, se usa el texto directo del backend.
  }

  return responseText;
}

async function readJsonResponse(
  response: Response
) {
  const responseText =
    await response.text();

  return responseText
    ? JSON.parse(responseText)
    : null;
}

export async function getScheduleDays() {
  const response = await fetch(
    `${API_URL}/Schedule/days`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading schedule days"
      )
    );
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
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading schedule entries"
      )
    );
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
    throw new Error(
      await getErrorMessage(
        response,
        "Error creating schedule entry"
      )
    );
  }

  return await readJsonResponse(response);
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
      await getErrorMessage(
        response,
        "Error updating schedule entry"
      )
    );
  }

  return await readJsonResponse(response);
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
      await getErrorMessage(
        response,
        "Error publishing schedule"
      )
    );
  }

  return await readJsonResponse(response);
}

export async function getPublicSchedule(
  eventId: string
) {
  const response = await fetch(
    `${API_URL}/Schedule/public/${eventId}`
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading public schedule"
      )
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
      await getErrorMessage(
        response,
        "Error loading event"
      )
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
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading active event"
      )
    );
  }

  return await response.json();
}

export async function deleteScheduleEntry(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Schedule/entries/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error deleting schedule entry"
      )
    );
  }

  return await readJsonResponse(response);
}

export async function unpublishSchedule(
  eventId: string
) {
  const response = await fetch(
    `${API_URL}/Schedule/unpublish/${eventId}`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error unpublishing schedule"
      )
    );
  }

  return await readJsonResponse(response);
}

export type ScheduleEntryManualStatus =
  | "preparing"
  | "live"
  | "completed"
  | "scheduled"
  | "auto";

export async function updateScheduleEntryStatus(
  id: string,
  status: ScheduleEntryManualStatus
) {
  const response =
    await fetch(
      `${API_URL}/Schedule/entries/${id}/status/${status}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error updating schedule entry status"
      )
    );
  }

  return await response.json();
}