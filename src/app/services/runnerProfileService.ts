import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type RunnerSocialLinkPayload = {
  socialNetworkId: string;
  url: string;
};

export type RunnerProfilePayload = {
  displayName: string;
  country?: string | null;
  bio?: string | null;
  isVisible: boolean;
  sortOrder: number;
  socialLinks: RunnerSocialLinkPayload[];
  photo?: File | null;
  presentationVideo?: File | null;
};

export async function getRunnerProfiles() {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading runner profiles"
    );
  }

  return await response.json();
}

export async function getPublicRunnerProfiles() {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/public`
    );

  if (!response.ok) {
    throw new Error(
      "Error loading public runner profiles"
    );
  }

  return await response.json();
}

export async function getRunnerProfileById(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading runner profile"
    );
  }

  return await response.json();
}

function buildRunnerFormData(
  data: RunnerProfilePayload
) {
  const formData =
    new FormData();

  formData.append(
    "displayName",
    data.displayName
  );

  formData.append(
    "country",
    data.country ?? ""
  );

  formData.append(
    "bio",
    data.bio ?? ""
  );

  formData.append(
    "isVisible",
    String(data.isVisible)
  );

  formData.append(
    "sortOrder",
    String(data.sortOrder)
  );

  formData.append(
    "socialLinksJson",
    JSON.stringify(data.socialLinks)
  );

  if (data.photo) {
    formData.append(
      "photo",
      data.photo
    );
  }

  if (data.presentationVideo) {
    formData.append(
      "presentationVideo",
      data.presentationVideo
    );
  }

  return formData;
}

function getMultipartHeaders() {
  const token =
    localStorage.getItem("sgames_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function createRunnerProfile(
  data: RunnerProfilePayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles`,
      {
        method: "POST",
        headers: getMultipartHeaders(),
        body: buildRunnerFormData(data),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error creating runner profile"
    );
  }

  return await response.json();
}

export async function updateRunnerProfile(
  id: string,
  data: RunnerProfilePayload
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}`,
      {
        method: "PUT",
        headers: getMultipartHeaders(),
        body: buildRunnerFormData(data),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error updating runner profile"
    );
  }

  return await response.json();
}

export async function showRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}/show`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error showing runner profile"
    );
  }

  return true;
}

export async function hideRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}/hide`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error hiding runner profile"
    );
  }

  return true;
}

export async function deleteRunnerProfile(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/RunnerProfiles/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error deleting runner profile"
    );
  }

  return true;
}