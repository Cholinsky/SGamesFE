import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type TwitchIntegrationStatus = {
  isConfigured: boolean;
  isConnected: boolean;
  broadcasterId?: string | null;
  broadcasterLogin?: string | null;
  broadcasterDisplayName?: string | null;
  scopes: string[];
  expiresAtUtc?: string | null;
  lastValidatedAtUtc?: string | null;
  requiredScope: string;
  message?: string | null;
};

export type TwitchAuthorizationUrl = {
  authorizationUrl: string;
  state: string;
  expiresAtUtc: string;
};

export type TwitchCategory = {
  id: string;
  name: string;
  boxArtUrl?: string | null;
};

export type UpdateTwitchChannelPayload = {
  title?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  broadcasterLanguage?: string | null;
  tags?: string[];
};

export type UpdateTwitchFromStreamSettingsPayload = {
  useCurrentRunCategory: boolean;
  categoryName?: string | null;
  broadcasterLanguage?: string | null;
  tags?: string[];
};

export type TwitchChannelUpdateResult = {
  success: boolean;
  message: string;
  title?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  broadcasterLanguage?: string | null;
  tags: string[];
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
    // Texto plano.
  }

  return text;
}

export async function getTwitchStatus() {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/status?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo leer el estado de Twitch"
      )
    );
  }

  return await response.json() as TwitchIntegrationStatus;
}

export async function createTwitchAuthorizationUrl() {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/auth-url`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear la URL de Twitch"
      )
    );
  }

  return await response.json() as TwitchAuthorizationUrl;
}

export async function disconnectTwitch() {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/disconnect`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo desconectar Twitch"
      )
    );
  }

  return await response.json() as TwitchIntegrationStatus;
}

export async function searchTwitchCategories(
  query: string
) {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/categories/search?query=${encodeURIComponent(query)}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron buscar categorías de Twitch"
      )
    );
  }

  return await response.json() as TwitchCategory[];
}

export async function updateTwitchChannel(
  payload: UpdateTwitchChannelPayload
) {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/channel/update`,
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
        "No se pudo actualizar Twitch"
      )
    );
  }

  return await response.json() as TwitchChannelUpdateResult;
}

export async function updateTwitchFromStreamSettings(
  payload: UpdateTwitchFromStreamSettingsPayload
) {
  const response =
    await fetch(
      `${API_URL}/TwitchStream/channel/update-from-stream-settings`,
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
        "No se pudo actualizar Twitch desde SGames"
      )
    );
  }

  return await response.json() as TwitchChannelUpdateResult;
}