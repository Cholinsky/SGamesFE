import { API_URL } from "../config/api";

export async function getSocialNetworks() {
  const response = await fetch(
    `${API_URL}/SocialNetworks`
  );

  if (!response.ok) {
    throw new Error(
      "Error loading social networks"
    );
  }

  return await response.json();
}