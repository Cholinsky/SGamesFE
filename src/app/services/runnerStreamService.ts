import { API_URL } from "../config/api";

export type RunnerLiveStream = {
  runnerAccountId: string;
  twitchLogin: string;
  twitchDisplayName: string;
  twitchUrl: string;
  streamId?: string | null;
  title?: string | null;
  gameName?: string | null;
  viewerCount: number;
  startedAtUtc?: string | null;
  thumbnailUrl?: string | null;
  language?: string | null;
};

export type RunnerLiveStreamsResponse = {
  isConfigured: boolean;
  checkedAtUtc: string;
  refreshSeconds: number;
  registeredTwitchChannels: number;
  liveCount: number;
  message?: string | null;
  streams: RunnerLiveStream[];
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
    // Respuesta en texto plano.
  }

  return text;
}

export async function getLiveRunnerStreams() {
  const response =
    await fetch(
      `${API_URL}/RunnerStreams/live?t=${Date.now()}`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "No se pudieron consultar los runners en vivo"
      )
    );
  }

  return await response.json() as RunnerLiveStreamsResponse;
}
