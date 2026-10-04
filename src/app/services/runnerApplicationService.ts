import { API_URL } from "../config/api";
import { RUNNER_TOKEN_KEY } from "./runnerAuthService";

export type RunnerActiveEvent = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  applicationsOpen: boolean;
};

export type RunnerApplicationAvailability = {
  dayDate: string;
  availableFrom: string;
  availableToDayDate?: string | null;
  availableTo: string;
  localDayDate?: string | null;
  localAvailableFrom?: string | null;
  localAvailableTo?: string | null;
  isPreferred: boolean;
  notes?: string | null;
};

export type RunnerRacePartner = {
  runnerRunId: string;
  runnerName: string;
  email: string;
  discordUser?: string | null;
  country?: string | null;
  videoUrl: string;
};

export type SubmitRunnerRunsPayload = {
  runnerRunIds: string[];
  notes?: string | null;
  aspectRatio?: string | null;
  runnerTimezone?: string | null;
  availabilities: RunnerApplicationAvailability[];
  racePartners: RunnerRacePartner[];
};

export type SubmitRunnerRunsResponse = {
  eventId: string;
  eventName: string;
  createdApplications: number;
  applicationIds: string[];
  message: string;
};

export type RunnerApplicationListItem = {
  id: string;
  eventId: string;
  eventName: string;
  runnerRunId?: string | null;
  runnerName: string;
  game: string;
  category: string;
  platform: string;
  runType: string;
  status: string;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  submittedAt: string;
};

function getRunnerHeaders() {
  const token =
    localStorage.getItem(
      RUNNER_TOKEN_KEY
    );

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message || "No se pudo completar la acción."
    );
  }

  const text =
    await response.text();

  return text
    ? JSON.parse(text) as T
    : null as T;
}

export async function getRunnerActiveEvent() {
  const response =
    await fetch(
      `${API_URL}/RunnerApplications/active-event?t=${Date.now()}`,
      {
        headers: getRunnerHeaders(),
        cache: "no-store",
      }
    );

  return await parseResponse<RunnerActiveEvent | null>(
    response
  );
}

export async function getMyRunnerApplications() {
  const response =
    await fetch(
      `${API_URL}/RunnerApplications/my-applications?t=${Date.now()}`,
      {
        headers: getRunnerHeaders(),
        cache: "no-store",
      }
    );

  return await parseResponse<RunnerApplicationListItem[]>(
    response
  );
}

export async function submitRunnerRuns(
  payload: SubmitRunnerRunsPayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerApplications/submit`,
      {
        method: "POST",
        headers: getRunnerHeaders(),
        body: JSON.stringify(payload),
      }
    );

  return await parseResponse<SubmitRunnerRunsResponse>(
    response
  );
}
