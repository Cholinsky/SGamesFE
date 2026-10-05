import { API_URL } from "../config/api";
import { RUNNER_TOKEN_KEY } from "./runnerAuthService";

export type RunnerRun = {
  id: string;
  runnerAccountId: string;
  gameName: string;
  categoryName: string;
  platformName: string;
  estimatedTime: string;
  gameReleaseYear?: number | null;  runType: string;
  isRace: boolean;
  maxPlayers: number;
  videoUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

export type RunnerRunPayload = {
  gameName: string;
  categoryName: string;
  platformName: string;
  estimatedTime: string;
  gameReleaseYear?: number | null;
  runType: string;
  isRace: boolean;
  maxPlayers: number;
  videoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
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

  return await response.json() as T;
}

export async function getMyRunnerRuns() {
  const response =
    await fetch(
      `${API_URL}/RunnerRuns?t=${Date.now()}`,
      {
        headers: getRunnerHeaders(),
      }
    );

  return await parseResponse<RunnerRun[]>(
    response
  );
}

export async function createRunnerRun(
  payload: RunnerRunPayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerRuns`,
      {
        method: "POST",
        headers: getRunnerHeaders(),
        body: JSON.stringify(payload),
      }
    );

  return await parseResponse<RunnerRun>(
    response
  );
}

export async function updateRunnerRun(
  id: string,
  payload: RunnerRunPayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerRuns/${id}`,
      {
        method: "PUT",
        headers: getRunnerHeaders(),
        body: JSON.stringify(payload),
      }
    );

  return await parseResponse<RunnerRun>(
    response
  );
}

export async function deleteRunnerRun(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerRuns/${id}`,
      {
        method: "DELETE",
        headers: getRunnerHeaders(),
      }
    );

  return await parseResponse<{
    message: string;
  }>(response);
}
