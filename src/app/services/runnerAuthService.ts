import { API_URL } from "../config/api";

export const RUNNER_TOKEN_KEY =
  "sgames_runner_token";

export type RunnerAccountMe = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  country?: string | null;
  timezone?: string | null;
  discordUser?: string | null;
  twitchUrl?: string | null;
  youTubeUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  favoriteGame?: string | null;
  profileColor?: string | null;
  isPublicProfile: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string | null;
};

export type RunnerAuthResponse = {
  token: string;
  runner: RunnerAccountMe;
};

export type RunnerRegisterRequest = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  country?: string;
  timezone?: string;
  twitchUrl?: string;
};

export type RunnerLoginRequest = {
  emailOrUsername: string;
  password: string;
};

export type RunnerUpdateProfileRequest = {
  displayName: string;
  country?: string | null;
  timezone?: string | null;
  discordUser?: string | null;
  twitchUrl?: string | null;
  youTubeUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  favoriteGame?: string | null;
  profileColor?: string | null;
  isPublicProfile: boolean;
};

function getRunnerToken() {
  return localStorage.getItem(
    RUNNER_TOKEN_KEY
  );
}

export function setRunnerToken(
  token: string
) {
  localStorage.setItem(
    RUNNER_TOKEN_KEY,
    token
  );
}

export function clearRunnerToken() {
  localStorage.removeItem(
    RUNNER_TOKEN_KEY
  );
}

function getRunnerHeaders() {
  const token =
    getRunnerToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

function getRunnerUploadHeaders() {
  const token =
    getRunnerToken();

  return {
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

export async function registerRunner(
  payload: RunnerRegisterRequest
) {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

  const data =
    await parseResponse<RunnerAuthResponse>(
      response
    );

  setRunnerToken(data.token);

  return data;
}

export async function loginRunner(
  payload: RunnerLoginRequest
) {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

  const data =
    await parseResponse<RunnerAuthResponse>(
      response
    );

  setRunnerToken(data.token);

  return data;
}

export async function getRunnerMe() {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/me?t=${Date.now()}`,
      {
        headers: getRunnerHeaders(),
      }
    );

  return await parseResponse<RunnerAccountMe>(
    response
  );
}

export async function updateRunnerMe(
  payload: RunnerUpdateProfileRequest
) {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/me`,
      {
        method: "PUT",
        headers: getRunnerHeaders(),
        body: JSON.stringify(payload),
      }
    );

  return await parseResponse<RunnerAccountMe>(
    response
  );
}

export async function uploadRunnerProfileImage(
  file: File
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await fetch(
      `${API_URL}/RunnerAuth/me/profile-image`,
      {
        method: "POST",
        headers: getRunnerUploadHeaders(),
        body: formData,
      }
    );

  return await parseResponse<RunnerAccountMe>(
    response
  );
}

export async function uploadRunnerBannerImage(
  file: File
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await fetch(
      `${API_URL}/RunnerAuth/me/banner-image`,
      {
        method: "POST",
        headers: getRunnerUploadHeaders(),
        body: formData,
      }
    );

  return await parseResponse<RunnerAccountMe>(
    response
  );
}

export async function changeRunnerPassword(
  currentPassword: string,
  newPassword: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/change-password`,
      {
        method: "PUT",
        headers: getRunnerHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

  return await parseResponse<{
    message: string;
  }>(response);
}

export async function deleteRunnerAccount() {
  const response =
    await fetch(
      `${API_URL}/RunnerAuth/me`,
      {
        method: "DELETE",
        headers: getRunnerHeaders(),
      }
    );

  const data =
    await parseResponse<{
      message: string;
    }>(response);

  clearRunnerToken();

  return data;
}
