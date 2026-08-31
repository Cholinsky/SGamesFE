import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type MicrosoftGraphMailStatus = {
  isConfigured: boolean;
  isConnected: boolean;
  microsoftUserId?: string | null;
  userPrincipalName?: string | null;
  mail?: string | null;
  displayName?: string | null;
  scopes: string[];
  expiresAtUtc?: string | null;
  lastValidatedAtUtc?: string | null;
  requiredScopes: string;
  message?: string | null;
};

export type MicrosoftGraphAuthorizationUrl = {
  authorizationUrl: string;
  state: string;
  expiresAtUtc: string;
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

export async function getMicrosoftGraphMailStatus() {
  const response =
    await fetch(
      `${API_URL}/MicrosoftGraphMail/status?t=${Date.now()}`,
      {
        headers: getHeaders(),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo leer el estado de Microsoft Mail"
      )
    );
  }

  return await response.json() as MicrosoftGraphMailStatus;
}

export async function createMicrosoftGraphMailAuthorizationUrl() {
  const response =
    await fetch(
      `${API_URL}/MicrosoftGraphMail/auth-url`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo crear la URL de Microsoft Mail"
      )
    );
  }

  return await response.json() as MicrosoftGraphAuthorizationUrl;
}

export async function disconnectMicrosoftGraphMail() {
  const response =
    await fetch(
      `${API_URL}/MicrosoftGraphMail/disconnect`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo desconectar Microsoft Mail"
      )
    );
  }

  return await response.json() as MicrosoftGraphMailStatus;
}

export async function sendMicrosoftGraphTestEmail(
  toEmail: string
) {
  const response =
    await fetch(
      `${API_URL}/MicrosoftGraphMail/test-send`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          toEmail,
          subject: "Prueba de correo SGames",
          body: "Prueba de envío desde SGames usando Microsoft Graph.",
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudo enviar correo de prueba"
      )
    );
  }

  return await response.json();
}