import { API_URL } from "../config/api";

function getHeaders() {
  const token = localStorage.getItem("sgames_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getPublicHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

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

export type EventGroupedApplication = {
  id: string;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  status: string;
  runType?: string | null;
  estimatedTimeMinutes?: number | null;
  estimatedTime?: string | null;
  submittedAt: string;
  eventId: string;
  eventName: string;
  eventIsActive: boolean;
};

export type ApplicationEventGroup = {
  eventId: string;
  eventName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  seasonKey?: string | null;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  applications: EventGroupedApplication[];
};

export type AdminRunnerHistoryRun = {
  applicationId: string;
  runnerName: string;
  email?: string | null;
  discordUser?: string | null;
  country?: string | null;
  runnerTimezone?: string | null;
  game: string;
  category: string;
  platform: string;
  runType?: string | null;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  aspectRatio?: string | null;
  youtubeUrl?: string | null;
  notes?: string | null;
  status: string;
  event: string;
  submittedAt: string;
};

export type AdminRunnerHistory = {
  runnerKey: string;
  runnerName: string;
  email?: string | null;
  discordUser?: string | null;
  country?: string | null;
  totalRuns: number;
  lastSubmittedAt: string;
  runs: AdminRunnerHistoryRun[];
};

export type CreateApplicationFromHistoryPayload = {
  sourceApplicationId: string;
  status: "Pending" | "Approved";
  estimatedTimeMinutes?: number;
  youtubeUrl?: string | null;
  aspectRatio?: string | null;
  notes?: string | null;
};

export async function getApplications(
  scope: "active" | "history" | "all" = "active"
) {
  const response = await fetch(
    `${API_URL}/Applications?scope=${scope}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading applications"
      )
    );
  }

  return await response.json();
}

export async function getApplicationById(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading application"
      )
    );
  }

  return await response.json();
}

export async function approveApplication(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}/approve`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error approving application"
      )
    );
  }
}

export async function rejectApplication(
  id: string
) {
  const response = await fetch(
    `${API_URL}/Applications/${id}/reject`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error rejecting application"
      )
    );
  }
}

export async function createApplication(
  data: any
) {
  const response = await fetch(
    `${API_URL}/Applications`,
    {
      method: "POST",
      headers: getPublicHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error creating application"
      )
    );
  }

  return await readJsonResponse(response);
}

export async function deleteApplication(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/Applications/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error deleting application"
      )
    );
  }

  return true;
}

export async function getPublicApprovedApplications() {
  const response =
    await fetch(
      `${API_URL}/Applications/public-approved`
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading approved applications"
      )
    );
  }

  return await response.json();
}

export async function getApplicationGroupsByEvent() {
  const response =
    await fetch(
      `${API_URL}/Applications/admin-by-events`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading applications by event"
      )
    );
  }

  return await response.json() as ApplicationEventGroup[];
}

export async function getRunnerApplicationHistory() {
  const response =
    await fetch(
      `${API_URL}/Applications/admin-runner-history`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Error loading runner history"
      )
    );
  }

  return await response.json() as AdminRunnerHistory[];
}

export async function createApplicationFromHistory(
  payload: CreateApplicationFromHistoryPayload
) {
  const response =
    await fetch(
      `${API_URL}/Applications/admin-create-from-history`,
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
        "Error creating application from history"
      )
    );
  }

  return await readJsonResponse(response);
}