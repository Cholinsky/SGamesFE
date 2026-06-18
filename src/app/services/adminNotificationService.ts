import { API_URL } from "../config/api";
import { getHeaders } from "./authservice";

export async function getAdminNotificationSummary() {
  const response =
    await fetch(
      `${API_URL}/AdminNotifications/summary`,
      {
        headers: getHeaders(),
      }
    );

  if (!response.ok) {
    throw new Error(
      "Error loading admin notifications"
    );
  }

  return await response.json();
}

