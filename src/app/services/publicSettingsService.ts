import { API_URL } from "../config/api";

export type PublicSettings = {
  eventName?: string | null;
  contactEmail?: string | null;
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  discordUrl?: string | null;
  twitterUrl?: string | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
};

export async function getPublicSettings() {
  const response =
    await fetch(
      `${API_URL}/Settings/public`
    );

  if (!response.ok) {
    throw new Error(
      "Error loading public settings"
    );
  }

  return await response.json();
}