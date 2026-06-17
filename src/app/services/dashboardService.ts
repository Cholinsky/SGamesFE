import { API_URL } from "../config/api";

export async function getDashboardStats() {
  const token =
    localStorage.getItem(
      "sgames_token"
    );

  const response =
    await fetch(
      `${API_URL}/Dashboard/stats`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      });

  if (!response.ok)
  {
    throw new Error(
      "Error loading dashboard"
    );
  }

  return await response.json();
}