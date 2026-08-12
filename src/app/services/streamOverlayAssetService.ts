import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type StreamOverlaySeasonKey =
  | "Summer"
  | "Autumn"
  | "Winter";

export type StreamOverlayAssetType =
  | "Video"
  | "Image"
  | "Json"
  | "External";

export type StreamOverlayAsset = {
  id: string;
  seasonKey: StreamOverlaySeasonKey | string;
  eventId?: string | null;
  eventName?: string | null;
  title: string;
  description?: string | null;
  assetType: StreamOverlayAssetType | string;
  overlayType: string;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  originalFileName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type StreamOverlayAssetGroup = {
  seasonKey: StreamOverlaySeasonKey;
  seasonLabel: string;
  total: number;
  active: number;
  hidden: number;
  assets: StreamOverlayAsset[];
};

export type StreamOverlayAssetPayload = {
  seasonKey: StreamOverlaySeasonKey;
  title: string;
  description?: string;
  assetType: StreamOverlayAssetType;
  overlayType: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  sortOrder: number;
  isActive: boolean;
  file?: File | null;
  thumbnailFile?: File | null;
};

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
) {
  const text =
    await response.text();

  if (!text) {
    return `${fallbackMessage} (${response.status})`;
  }

  try {
    const parsed =
      JSON.parse(text);

    if (typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.message) {
      return parsed.message;
    }

    if (parsed?.title) {
      return parsed.title;
    }
  } catch {
    // texto plano
  }

  return text;
}

function getMultipartHeaders() {
  const token =
    localStorage.getItem("sgames_token");

  return {
    Authorization: `Bearer ${token}`,
  };
}

function buildFormData(
  payload: StreamOverlayAssetPayload
) {
  const formData =
    new FormData();

  formData.append(
    "SeasonKey",
    payload.seasonKey
  );

  formData.append(
    "Title",
    payload.title
  );

  formData.append(
    "Description",
    payload.description ?? ""
  );

  formData.append(
    "AssetType",
    payload.assetType
  );

  formData.append(
    "OverlayType",
    payload.overlayType
  );

  formData.append(
    "ThumbnailUrl",
    payload.thumbnailUrl ?? ""
  );

  formData.append(
    "ExternalUrl",
    payload.externalUrl ?? ""
  );

  formData.append(
    "SortOrder",
    String(payload.sortOrder)
  );

  formData.append(
    "IsActive",
    String(payload.isActive)
  );

  if (payload.file) {
    formData.append(
      "File",
      payload.file
    );
  }

  if (payload.thumbnailFile) {
    formData.append(
      "ThumbnailFile",
      payload.thumbnailFile
    );
  }

  return formData;
}

export async function getStreamOverlayAssetsGrouped() {
  const response =
    await fetch(
      `${API_URL}/StreamOverlayAssets/grouped?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cargar la biblioteca de overlays"
      )
    );
  }

  return await response.json() as StreamOverlayAssetGroup[];
}

export async function createStreamOverlayAsset(
  payload: StreamOverlayAssetPayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamOverlayAssets`,
      {
        method: "POST",
        headers: getMultipartHeaders(),
        body: buildFormData(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo subir el asset"
      )
    );
  }

  return await response.json() as StreamOverlayAsset;
}

export async function updateStreamOverlayAsset(
  id: string,
  payload: StreamOverlayAssetPayload
) {
  const response =
    await fetch(
      `${API_URL}/StreamOverlayAssets/${id}`,
      {
        method: "PUT",
        headers: getMultipartHeaders(),
        body: buildFormData(payload),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo actualizar el asset"
      )
    );
  }

  return await response.json() as StreamOverlayAsset;
}

export async function toggleStreamOverlayAsset(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamOverlayAssets/${id}/toggle`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo cambiar la visibilidad"
      )
    );
  }

  return await response.json() as StreamOverlayAsset;
}

export async function deleteStreamOverlayAsset(
  id: string
) {
  const response =
    await fetch(
      `${API_URL}/StreamOverlayAssets/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo eliminar el asset"
      )
    );
  }

  return await response.json();
}