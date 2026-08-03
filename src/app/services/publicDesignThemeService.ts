import { API_URL } from "../config/api";

export type PublicDesignTheme = {
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
};

export async function getActiveDesignTheme() {
  const response =
    await fetch(
      `${API_URL}/DesignThemes/active`
    );

  if (!response.ok) {
    throw new Error(
      "Error loading active design theme"
    );
  }

  return await response.json();
}