import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export type DesignTheme = {
  id: number;
  seasonKey: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  heroGradient?: string | null;
  cardGradient?: string | null;
  isEnabled?: boolean;
};

export async function getDesignThemes() {
  const response =
    await fetch(
      `${API_URL}/DesignThemes`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      error || "Error loading design themes"
    );
  }

  return await response.json();
}