import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getDashboardStats() {
  const response =
    await fetch(
      `${API_URL}/Dashboard/stats`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading dashboard"
    );
  }

  return await response.json();
}




